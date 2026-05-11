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
  UserPlus,
  Edit,
  X
} from 'lucide-react';
import { complaintAPI, adminAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const ComplaintManagement = () => {
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
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedWarden, setSelectedWarden] = useState('');
  const [wardens, setWardens] = useState([]);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [showReports, setShowReports] = useState(false);

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
    { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
    { value: 'urgent', label: 'Urgent', color: 'bg-purple-500/20 text-purple-700 border-purple-500/30' }
  ];

  useEffect(() => {
    fetchComplaints();
    fetchWardens();
    fetchReports();
  }, []);

  const fetchWardens = async () => {
    try {
      const response = await adminAPI.getUsers();
      const wardenUsers = response.data.data.filter(user => user.role === 'warden');
      setWardens(wardenUsers);
    } catch (err) {
      console.error('Failed to fetch wardens:', err);
    }
  };

  const fetchReports = async () => {
    try {
      console.log('Fetching admin notifications...');
      // Get notifications with type 'complaint' that contain reports from wardens
      const response = await adminAPI.getNotifications();
      console.log('Notifications response:', response);
      
      const allNotifications = response.data.data || [];
      console.log('All notifications:', allNotifications);
      
      const reportNotifications = allNotifications.filter(notification => 
        notification.title === 'Issue Reported by Warden' && notification.type === 'complaint'
      );
      console.log('Filtered report notifications:', reportNotifications);
      
      // Fetch complaint details for each report
      const reportsWithComplaintDetails = await Promise.all(
        reportNotifications.map(async (report) => {
          if (report.relatedTo && report.relatedTo.id) {
            try {
              const complaintResponse = await complaintAPI.getById(report.relatedTo.id);
              return {
                ...report,
                complaint: complaintResponse.data.data
              };
            } catch (err) {
              console.error('Failed to fetch complaint details:', err);
              return report;
            }
          }
          return report;
        })
      );
      
      console.log('Reports with complaint details:', reportsWithComplaintDetails);
      setReports(reportsWithComplaintDetails);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

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
        message: replyText
      });
      setSuccess('Reply sent successfully!');
      setReplyText('');
      setShowReplyForm(false);
      fetchComplaints();
      // Refresh selected complaint to show the new reply
      const updatedComplaints = await complaintAPI.getAll();
      const updated = updatedComplaints.data.data.find(c => c._id === selectedComplaint._id);
      setSelectedComplaint(updated);
    } catch (err) {
      setError('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedWarden || !selectedComplaint) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await complaintAPI.updateStatus(selectedComplaint._id, {
        status: 'assigned',
        assignedTo: selectedWarden
      });
      setSuccess('Complaint assigned to warden successfully!');
      setShowAssignForm(false);
      setSelectedWarden('');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      setError('Failed to assign complaint');
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

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !selectedComplaint) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await complaintAPI.updateStatus(selectedComplaint._id, {
        status: selectedStatus
      });
      setSuccess('Complaint status updated successfully!');
      setShowStatusUpdate(false);
      setSelectedStatus('');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      setError('Failed to update status');
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
    <div className="min-h-screen bg-white">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <Button
            variant="ghost"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/admin/dashboard')}
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

        {/* Reports Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Warden Reports</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReports(!showReports)}
                >
                  {showReports ? 'Hide' : 'Show'} Reports ({reports.length})
                </Button>
              </div>
            </div>
            
            {showReports && (
              <div className="p-4">
                {reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">Report from Warden</span>
                              <span className="text-xs text-yellow-600">
                                {new Date(report.createdAt).toLocaleString()}
                              </span>
                            </div>
                            
                            {/* Complaint Details */}
                            {report.complaint && (
                              <div className="bg-white rounded-md p-3 mb-3 border border-yellow-300">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">Complaint:</h4>
                                  <Badge variant="outline" size="sm">
                                    {report.complaint.priority}
                                  </Badge>
                                  <Badge variant="outline" size="sm">
                                    {report.complaint.status}
                                  </Badge>
                                </div>
                                <h5 className="font-medium text-gray-800 mb-1">{report.complaint.title}</h5>
                                <p className="text-sm text-gray-600">{report.complaint.description}</p>
                              </div>
                            )}
                            
                            {/* Report Message */}
                            <div className="mb-2">
                              <h4 className="font-medium text-yellow-800 mb-1">Warden's Report:</h4>
                              <p className="text-yellow-900 text-sm">{report.message}</p>
                            </div>
                            
                          
                          </div>
                          <Badge variant="warning" size="sm">
                            {report.priority || 'medium'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No reports from wardens yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full">
          {/* Complaints List */}
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search complaints..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                      <div className="flex-1 cursor-pointer" onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowDetailsModal(true);
                      }}>
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
                          {(complaint.student?.user?.email || complaint.assignedTo?.email || complaint.email) && (
                            <span>{complaint.student?.user?.email || complaint.assignedTo?.email || complaint.email}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={Edit}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(complaint);
                            setShowStatusUpdate(true);
                            setSelectedStatus(complaint.status);
                          }}
                        >
                          Update Status
                        </Button>
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
        </div>
      

        {/* Comprehensive Complaint Details Modal */}
        {showDetailsModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Complaint Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedComplaint(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Title</label>
                    <p className="text-gray-900 font-medium">{selectedComplaint.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <Badge variant={getStatusBadge(selectedComplaint.status).variant}>
                      {getStatusBadge(selectedComplaint.status).label}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Category</label>
                    <p className="text-gray-900">{selectedComplaint.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Priority</label>
                    {getPriorityBadge(selectedComplaint.priority)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-700">{selectedComplaint.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Submitted By</label>
                    <p className="text-gray-900">{selectedComplaint.student?.user?.name || selectedComplaint.assignedTo?.name || selectedComplaint.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedComplaint.student?.user?.email || selectedComplaint.assignedTo?.email || selectedComplaint.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Submitted Date</label>
                    <p className="text-gray-900">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedComplaint.resolvedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Resolved Date</label>
                      <p className="text-gray-900">{new Date(selectedComplaint.resolvedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Status Change */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change Status</label>
                  <select
                    value={selectedComplaint.status}
                    onChange={(e) => handleStatusChange(selectedComplaint._id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Admin Comments */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Admin Replies</h3>
                    <div className="flex gap-2">
                      {!showReplyForm && (
                        <Button
                          size="sm"
                          leftIcon={Reply}
                          onClick={() => setShowReplyForm(true)}
                        >
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Comments/Replies */}
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {selectedComplaint.comments && selectedComplaint.comments.length > 0 ? (
                      selectedComplaint.comments.map((comment, index) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-blue-900">{comment.author || 'Admin'}</span>
                            <span className="text-xs text-blue-600">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-blue-800">{comment.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No replies yet</p>
                    )}
                  </div>

                  {/* Reply Form */}
                  {showReplyForm && (
                    <div className="border-t pt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        placeholder="Type your reply..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          leftIcon={Send}
                          onClick={handleReply}
                          isLoading={submitting}
                        >
                          Send Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowReplyForm(false);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Assign Form */}
                                  </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowStatusUpdate(true);
                      setSelectedStatus(selectedComplaint.status);
                    }}
                    className="flex-1"
                  >
                    Quick Update Status
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailsModal(false);
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Update Complaint Status</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleStatusUpdate}
                  isLoading={submitting}
                  className="flex-1"
                >
                  Update Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStatusUpdate(false);
                    setSelectedStatus('');
                    setSelectedComplaint(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
  )
};

export default ComplaintManagement;
