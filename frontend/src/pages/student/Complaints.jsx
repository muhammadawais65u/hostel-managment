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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });

  const categories = [
    'Room Maintenance',
    'Mess/Food Issues',
    'Water Supply',
    'Electricity Issues',
    'Internet/WiFi',
    'Security',
    'Cleanliness',
    'Noise Complaint',
    'Other'
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              leftIcon={ArrowLeft}
              onClick={() => navigate('/student/dashboard')}
              className="text-white hover:text-purple-200 mb-4"
            >
              Back to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Complaints</h1>
                <p className="text-purple-200">Submit and track your complaints</p>
              </div>
              <Button
                leftIcon={Plus}
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                New Complaint
              </Button>
            </div>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 backdrop-blur-sm text-green-200 px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 backdrop-blur-sm text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* New Complaint Form */}
          {showForm && (
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Submit New Complaint</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="text-white hover:text-purple-200"
                >
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <label className="block text-purple-200 text-sm font-medium mb-2">Priority</label>
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
                            : 'bg-white/10 border-white/20 text-purple-200 hover:bg-white/20'
                        }`}>
                          {priority.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Detailed description of the issue..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={submitting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </form>
            </div>
          )}

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/10 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/30 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search complaints..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="bg-gray-800">All Status</option>
                  <option value="pending" className="bg-gray-800">Pending</option>
                  <option value="in_progress" className="bg-gray-800">In Progress</option>
                  <option value="resolved" className="bg-gray-800">Resolved</option>
                  <option value="rejected" className="bg-gray-800">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <div key={complaint._id} className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{complaint.title}</h3>
                        {getPriorityBadge(complaint.priority)}
                        <Badge variant={getStatusBadge(complaint.status).variant}>
                          {getStatusBadge(complaint.status).label}
                        </Badge>
                      </div>
                      <p className="text-purple-200 mb-3">{complaint.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-purple-300">
                          <strong>Category:</strong> {complaint.category}
                        </span>
                        <span className="text-purple-300">
                          <strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                        {complaint.resolvedAt && (
                          <span className="text-green-300">
                            <strong>Resolved:</strong> {new Date(complaint.resolvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {complaint.status === 'pending' && (
                        <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-lg rounded-2xl p-12 border border-purple-500/30 text-center">
                <MessageSquare className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Complaints Found</h3>
                <p className="text-purple-200 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'No complaints match your search criteria' 
                    : 'You haven\'t submitted any complaints yet'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
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
