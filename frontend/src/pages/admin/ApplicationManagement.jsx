import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  Phone,
  Mail,
  User,
  Bed,
  DollarSign,
  AlertCircle
} from 'lucide-react';

const ApplicationManagement = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch applications');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle application status change
  const handleStatusChange = async (applicationId, status) => {
    setProcessingId(applicationId);
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchApplications(); // Refresh list
        setShowDetails(false);
        setSelectedApplication(null);
      } else {
        setError(data.message || 'Failed to update application status');
      }
    } catch (err) {
      setError(err.message || 'Failed to update application status');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      app.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student?.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      verified: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Verified' }
    };
    
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${variant.color}`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
                <p className="text-sm text-gray-600">Review and manage student applications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Total: <span className="font-bold">{applications.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, roll number, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-500">No applications match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {application.student?.user?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {application.student?.rollNumber || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {application.student?.department || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {application.roomInfo?.roomNumber || 'N/A'}
                          </p>
                          <p className="text-gray-500">
                            {application.roomInfo?.roomType || 'N/A'} • PKR {application.roomInfo?.price || '0'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {application.purposeOfStay || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {formatDate(application.createdAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowDetails(true);
                            }}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(application._id, 'approved')}
                                disabled={processingId === application._id}
                                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded disabled:opacity-50"
                              >
                                {processingId === application._id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleStatusChange(application._id, 'rejected')}
                                disabled={processingId === application._id}
                                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded disabled:opacity-50"
                              >
                                {processingId === application._id ? 'Processing...' : 'Reject'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Application Details Modal */}
        {showDetails && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Student Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedApplication.personalInfo?.name || selectedApplication.student?.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedApplication.personalInfo?.email || selectedApplication.student?.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedApplication.personalInfo?.phone || selectedApplication.student?.user?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Roll Number</p>
                      <p className="font-medium">{selectedApplication.personalInfo?.rollNumber || selectedApplication.student?.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{selectedApplication.personalInfo?.department || selectedApplication.student?.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Semester</p>
                      <p className="font-medium">{selectedApplication.personalInfo?.semester || selectedApplication.student?.semester}</p>
                    </div>
                  </div>
                </div>

                {/* Room Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Bed className="h-5 w-5 text-blue-600" />
                    Room Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Room Number</p>
                      <p className="font-medium">{selectedApplication.roomInfo?.roomNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Room Type</p>
                      <p className="font-medium">{selectedApplication.roomInfo?.roomType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Floor</p>
                      <p className="font-medium">{selectedApplication.roomInfo?.floor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium">{selectedApplication.roomInfo?.capacity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rent</p>
                      <p className="font-medium">PKR {selectedApplication.roomInfo?.price}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Additional Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Purpose of Stay</p>
                      <p className="font-medium">{selectedApplication.purposeOfStay}</p>
                    </div>
                    {selectedApplication.specialRequirements && (
                      <div>
                        <p className="text-sm text-gray-500">Special Requirements</p>
                        <p className="font-medium">{selectedApplication.specialRequirements}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Emergency Contact</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
                        <div>
                          <p className="text-xs text-gray-400">Name</p>
                          <p className="font-medium">{selectedApplication.emergencyContact?.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Relationship</p>
                          <p className="font-medium">{selectedApplication.emergencyContact?.relationship}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Phone</p>
                          <p className="font-medium">{selectedApplication.emergencyContact?.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {selectedApplication.documents && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedApplication.documents.idProof && (
                        <div>
                          <p className="text-sm text-gray-500">ID Proof</p>
                          <div className="text-xs text-gray-400">
                            Uploaded: {new Date(selectedApplication.documents.idProof.uploadedAt).toLocaleDateString()}
                          </div>
                          {selectedApplication.documents.idProof.url ? (
                            <a 
                              href={selectedApplication.documents.idProof.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                            >
                              View Document
                            </a>
                          ) : (
                            <p className="text-gray-400 text-sm">Document file not available</p>
                          )}
                        </div>
                      )}
                      {selectedApplication.documents.addressProof && (
                        <div>
                          <p className="text-sm text-gray-500">Address Proof</p>
                          <div className="text-xs text-gray-400">
                            Uploaded: {new Date(selectedApplication.documents.addressProof.uploadedAt).toLocaleDateString()}
                          </div>
                          {selectedApplication.documents.addressProof.url ? (
                            <a 
                              href={selectedApplication.documents.addressProof.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                            >
                              View Document
                            </a>
                          ) : (
                            <p className="text-gray-400 text-sm">Document file not available</p>
                          )}
                        </div>
                      )}
                      {selectedApplication.documents.previousMarks && (
                        <div>
                          <p className="text-sm text-gray-500">Previous Marks</p>
                          <div className="text-xs text-gray-400">
                            Uploaded: {new Date(selectedApplication.documents.previousMarks.uploadedAt).toLocaleDateString()}
                          </div>
                          {selectedApplication.documents.previousMarks.url ? (
                            <a 
                              href={selectedApplication.documents.previousMarks.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                            >
                              View Document
                            </a>
                          ) : (
                            <p className="text-gray-400 text-sm">Document file not available</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusChange(selectedApplication._id, 'approved')}
                      disabled={processingId === selectedApplication._id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      {processingId === selectedApplication._id ? 'Processing...' : 'Approve Application'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedApplication._id, 'rejected')}
                      disabled={processingId === selectedApplication._id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                    >
                      {processingId === selectedApplication._id ? 'Processing...' : 'Reject Application'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationManagement;
