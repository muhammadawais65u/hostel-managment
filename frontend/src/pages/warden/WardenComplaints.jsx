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
  Filter,
  Search,
  Reply,
  User,
  Calendar,
  Flag,
  MessageCircle
} from 'lucide-react';
import { complaintAPI, wardenAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const WardenComplaints = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportText, setReportText] = useState('');
  const [replyTo, setReplyTo] = useState('student'); // 'student' or 'admin'

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
    { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
    { value: 'urgent', label: 'Urgent', color: 'bg-purple-500/20 text-purple-700 border-purple-500/30' }
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getAll();
      setComplaints(response.data.data || []);
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await complaintAPI.addComment(selectedComplaint._id, {
        message: replyText,
        replyTo: replyTo
      });
      setSuccess(`Reply sent to ${replyTo} successfully!`);
      setReplyText('');
      setShowReplyForm(false);
      setReplyTo('student');
      fetchComplaints();
      const updatedComplaints = await complaintAPI.getAll();
      const updated = updatedComplaints.data.data.find(c => c._id === selectedComplaint._id);
      setSelectedComplaint(updated);
    } catch (err) {
      setError('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSolve = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await complaintAPI.updateStatus(selectedComplaint._id, {
        status: 'resolved'
      });
      setSuccess('Complaint marked as resolved!');
      fetchComplaints();
      if (selectedComplaint) {
        const updatedComplaints = await complaintAPI.getAll();
        const updated = updatedComplaints.data.data.find(c => c._id === selectedComplaint._id);
        setSelectedComplaint(updated);
      }
    } catch (err) {
      setError('Failed to resolve complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportToAdmin = async () => {
    if (!reportText.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      console.log('Sending report to admin:', {
        complaintId: selectedComplaint._id,
        message: reportText,
        priority: selectedComplaint.priority
      });
      
      const response = await wardenAPI.reportIssue({
        complaintId: selectedComplaint._id,
        message: reportText,
        priority: selectedComplaint.priority
      });
      
      console.log('Report response:', response);
      setSuccess('Report sent to admin successfully!');
      setReportText('');
      setShowReportForm(false);
    } catch (err) {
      console.error('Error sending report to admin:', err);
      setError(err.response?.data?.message || 'Failed to send report to admin');
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await complaintAPI.updateStatus(complaintId, { status: newStatus });
      setSuccess('Status updated successfully!');
      fetchComplaints();
      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update status');
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
    const matchesSearch = complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || complaint.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/warden/dashboard')}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaint Management</h1>
          <p className="text-gray-600">View and respond to student complaints</p>
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

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search complaints..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

            {/* Complaints List */}
            <div className="space-y-4">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all ${
                      selectedComplaint?._id === complaint._id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedComplaint(complaint)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                          {getPriorityBadge(complaint.priority)}
                          <Badge variant={getStatusBadge(complaint.status).variant}>
                            {getStatusBadge(complaint.status).label}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{complaint.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {complaint.student?.user?.name || complaint.assignedTo?.name || complaint.name || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                          {complaint.email && <span>{complaint.email}</span>}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={Reply}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaint(complaint);
                              setShowReplyForm(true);
                            }}
                          >
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={AlertCircle}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaint(complaint);
                              setShowReportForm(true);
                            }}
                          >
                            Report
                          </Button>
                                                  </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Complaints Found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No complaints match your search criteria' 
                      : 'No complaints have been submitted yet'}
                  </p>
                </div>
              )}
            </div>
          </div>

      
    {/* Reply Form Modal */}
    {showReplyForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Reply to Complaint</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reply To</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={replyTo === 'student' ? 'default' : 'outline'}
                onClick={() => setReplyTo('student')}
              >
                <User className="h-3 w-3 mr-1" />
                Student
              </Button>
              <Button
                size="sm"
                variant={replyTo === 'admin' ? 'default' : 'outline'}
                onClick={() => setReplyTo('admin')}
              >
                <Flag className="h-3 w-3 mr-1" />
                Admin
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reply Message</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Type your reply to ${replyTo === 'student' ? 'student' : 'admin'}...`}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowReplyForm(false);
                setReplyText('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              isLoading={submitting}
            >
              <Send className="h-3 w-3 mr-1" />
              Send Reply
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Report Form Modal */}
    {showReportForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Report to Admin</h3>
          <p className="text-gray-600 mb-4">
            This will report the complaint to admin for further review. Please provide details for the report.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Details</label>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Please provide detailed information about why this complaint needs admin attention..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowReportForm(false);
                setReportText('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReportToAdmin}
              isLoading={submitting}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Report to Admin
            </Button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default WardenComplaints;
