import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const Complaints = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedComplaint, setExpandedComplaint] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });

  const categories = [
    'maintenance',
    'cleanliness',
    'security',
    'noise',
    'facilities',
    'food',
    'internet',
    'electrical',
    'plumbing',
    'other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    { value: 'urgent', label: 'Urgent', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await studentAPI.getComplaints();
      setComplaints(response.data.data || []);
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await studentAPI.createComplaint(formData);
      setSuccess('Complaint submitted successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
      fetchComplaints();
    } catch (err) {
      setError('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'warning', label: 'Pending' },
      in_progress: { variant: 'info', label: 'In Progress' },
      resolved: { variant: 'success', label: 'Resolved' },
      rejected: { variant: 'danger', label: 'Rejected' }
    };
    return variants[status] || variants.pending;
  };

  const getPriorityBadge = (priority) => {
    const config = priorities.find(p => p.value === priority) || priorities[1];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || complaint.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              leftIcon={ArrowLeft}
              onClick={() => navigate('/student/dashboard')}
              className="text-gray-600 hover:text-gray-800 mb-4"
            >
              Back to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Complaints</h1>
                <p className="text-gray-600">Submit and track your complaints</p>
              </div>
              <Button
                leftIcon={Plus}
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                New Complaint
              </Button>
            </div>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* New Complaint Form */}
          {showForm && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Submit New Complaint</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" className="bg-gray-800">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category} className="bg-gray-800">
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Priority</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {priorities.map(priority => (
                      <label key={priority.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          className="sr-only"
                        />
                        <div className={`p-3 rounded-xl border text-center transition-all ${
                          formData.priority === priority.value
                            ? priority.color
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                        }`}>
                          {priority.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description of the issue..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </form>
            </div>
          )}

          {/* Search and Filter */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search complaints..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all" className="bg-white">All Status</option>
                  <option value="pending" className="bg-white">Pending</option>
                  <option value="in_progress" className="bg-white">In Progress</option>
                  <option value="resolved" className="bg-white">Resolved</option>
                  <option value="rejected" className="bg-white">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <div key={complaint._id} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{complaint.title}</h3>
                        {getPriorityBadge(complaint.priority)}
                        <Badge variant={getStatusBadge(complaint.status).variant}>
                          {getStatusBadge(complaint.status).label}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{complaint.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          <strong>Category:</strong> {complaint.category}
                        </span>
                        <span className="text-gray-500">
                          <strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                        {complaint.resolvedAt && (
                          <span className="text-green-600">
                            <strong>Resolved:</strong> {new Date(complaint.resolvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Admin Replies */}
                      {complaint.comments && complaint.comments.length > 0 && (
                        <div className="mt-4">
                          <button
                            onClick={() => setExpandedComplaint(expandedComplaint === complaint._id ? null : complaint._id)}
                            className="text-gray-500 text-sm hover:text-gray-700 flex items-center gap-1"
                          >
                            <MessageSquare className="h-4 w-4" />
                            {complaint.comments.length} {complaint.comments.length === 1 ? 'Reply' : 'Replies'} from Admin
                            {expandedComplaint === complaint._id ? (
                              <span className="ml-1">▼</span>
                            ) : (
                              <span className="ml-1">▶</span>
                            )}
                          </button>
                          {expandedComplaint === complaint._id && (
                            <div className="mt-3 space-y-2">
                              {complaint.comments.map((comment, index) => (
                                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-blue-700">{comment.author || 'Admin'}</span>
                                    <span className="text-xs text-blue-600">
                                      {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-blue-800">{comment.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {complaint.status === 'pending' && (
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-50">
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Complaints Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'No complaints match your search criteria' 
                    : 'You haven\'t submitted any complaints yet'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    Submit Your First Complaint
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;
