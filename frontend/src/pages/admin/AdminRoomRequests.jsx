import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  Bed,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { applicationAPI, roomAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

const AdminRoomRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, roomsRes] = await Promise.all([
        applicationAPI.getAll(),
        roomAPI.getAll()
      ]);
      setRequests(requestsRes.data.data || []);
      setRooms(roomsRes.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load room requests. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, action) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const updateData = {
        status: action,
        remarks: action === 'approved' ? 'Room request approved by admin' : 'Room request rejected by admin'
      };

      await applicationAPI.approve(requestId, updateData);
      setSuccess(`Room request ${action} successfully!`);
      
      // Refresh data
      fetchData();
      setShowDetailsModal(false);
      setSelectedRequest(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} room request`);
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
      submitted: { variant: 'info', label: 'New' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoomInfo = (roomId) => {
    const room = rooms.find(r => r._id === roomId);
    return room ? {
      number: room.roomNumber || `Room ${room._id}`,
      type: room.type || 'standard',
      price: room.price || room.monthlyRent || 0,
      hostel: room.hostel?.name || 'N/A'
    } : { number: 'N/A', type: 'N/A', price: 0, hostel: 'N/A' };
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      (request.student?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.student?.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.student?.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading room requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-3xl font-bold">Room Requests</h1>
            </div>
            <p className="text-blue-100">Manage student room allocation requests</p>
          </div>
          <Button
            onClick={fetchData}
            leftIcon={RefreshCw}
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500 rounded-xl">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500 rounded-xl">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="submitted">New</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Room Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Applied Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => {
                  const roomInfo = getRoomInfo(request.selectedRoom);
                  return (
                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.student?.user?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.student?.rollNumber || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {request.student?.user?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{roomInfo.number}</span>
                            <span className="text-sm text-gray-500">({roomInfo.type})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{roomInfo.hostel}</span>
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            PKR {roomInfo.price}/month
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailsModal(request)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(request._id, 'approved')}
                                disabled={actionLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(request._id, 'rejected')}
                                disabled={actionLoading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">No room requests found</p>
                    <p className="text-gray-400 text-sm">No applications match your current filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Room Request Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Student Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRequest.student?.user?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Roll Number</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRequest.student?.rollNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRequest.student?.user?.email || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRequest.student?.user?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Department</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRequest.student?.department || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">semester</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRequest.student?.semester || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Room Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Room Number</p>
                    <p className="font-semibold text-gray-900">
                      {getRoomInfo(selectedRequest.selectedRoom).number}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Room Type</p>
                    <p className="font-semibold text-gray-900">
                      {getRoomInfo(selectedRequest.selectedRoom).type}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                    <p className="font-semibold text-green-600">
                      PKR {getRoomInfo(selectedRequest.selectedRoom).price}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Hostel</p>
                    <p className="font-semibold text-gray-900">
                      {getRoomInfo(selectedRequest.selectedRoom).hostel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Applied Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRequest.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>
                
                {selectedRequest.specialRequirements && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-2">Special Requirements</p>
                    <p className="text-gray-900">{selectedRequest.specialRequirements}</p>
                  </div>
                )}

                {selectedRequest.emergencyContact && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-2">Emergency Contact</p>
                    <div className="space-y-1">
                      <p className="text-gray-900">
                        <span className="font-medium">Name:</span> {selectedRequest.emergencyContact.name}
                      </p>
                      <p className="text-gray-900">
                        <span className="font-medium">Relationship:</span> {selectedRequest.emergencyContact.relationship}
                      </p>
                      <p className="text-gray-900">
                        <span className="font-medium">Phone:</span> {selectedRequest.emergencyContact.phone}
                      </p>
                    </div>
                  </div>
                )}

                {selectedRequest.documents && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-2">Documents</p>
                    <div className="space-y-2">
                      {selectedRequest.documents.idProof && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">ID Proof</span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            <Download className="h-4 w-4 inline mr-1" />
                            Download
                          </button>
                        </div>
                      )}
                      {selectedRequest.documents.addressProof && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">Address Proof</span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            <Download className="h-4 w-4 inline mr-1" />
                            Download
                          </button>
                        </div>
                      )}
                      {selectedRequest.documents.previousMarks && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">Academic Records</span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            <Download className="h-4 w-4 inline mr-1" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest._id, 'approved')}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Spinner size="sm" /> : 'Approve Request'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest._id, 'rejected')}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Spinner size="sm" /> : 'Reject Request'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoomRequests;
