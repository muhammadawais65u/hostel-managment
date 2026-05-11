import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Bed,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  RefreshCw,
  Eye,
  Download,
  CreditCard,
  ExternalLink,
  X
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const ApplicationStatus = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getApplications();
      setApplications(response.data.data || []);
    } catch (err) {
      console.error('Applications fetch error:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { variant: 'warning', label: 'Pending', icon: Clock },
      approved: { variant: 'success', label: 'Approved', icon: CheckCircle },
      assigned: { variant: 'info', label: 'Assigned', icon: CheckCircle },
      rejected: { variant: 'danger', label: 'Rejected', icon: XCircle },
      verified: { variant: 'info', label: 'Verified', icon: CheckCircle }
    };
    return badges[status] || badges.pending;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      approved: 'text-green-600 bg-green-50',
      assigned: 'text-blue-600 bg-blue-50',
      rejected: 'text-red-600 bg-red-50',
      verified: 'text-blue-600 bg-blue-50'
    };
    return colors[status] || colors.pending;
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };

  const handleRefresh = () => {
    fetchApplications();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading application status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Status</h1>
                <p className="text-sm text-gray-600">Track your hostel application progress</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
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

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-500 mb-6">You haven't submitted any hostel applications yet.</p>
              <Button
                onClick={() => navigate('/student/application')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Apply for Room
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map((application) => {
                const { variant, label, icon: StatusIcon } = getStatusBadge(application.status);
                
                return (
                  <div
                    key={application._id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Left Column - Status and Basic Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${getStatusColor(application.status)}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <Badge variant={variant} size="sm">
                              {label}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Applied: {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {application.roomInfo?.roomNumber && (
                            <div className="flex items-center gap-2">
                              <Bed className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Room Type</p>
                                <p className="font-medium">{application.roomInfo.roomType}</p>
                              </div>
                            </div>
                          )}
                          
                          { (application.status === 'approved' || application.status === 'assigned') && application.roomInfo?.roomNumber && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className={`h-4 w-4 ${application.status === 'assigned' ? 'text-blue-600' : 'text-green-600'}`} />
                              <div>
                                <p className="text-xs text-gray-500">{application.status === 'assigned' ? 'Assigned Room' : 'Allocated Room'}</p>
                                <p className={`font-medium ${application.status === 'assigned' ? 'text-blue-600' : 'text-green-600'}`}>{application.roomInfo.roomNumber}</p>
                              </div>
                            </div>
                          )}
                          
                          {application.personalInfo?.department && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Department</p>
                                <p className="font-medium">{application.personalInfo.department}</p>
                              </div>
                            </div>
                          )}

                          {application.personalInfo?.semester && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Semester</p>
                                <p className="font-medium">{application.personalInfo.semester}</p>
                              </div>
                            </div>
                          )}

                          {application.roomInfo?.price && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="font-medium">{application.roomInfo.price}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column - Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        
                        {application.status === 'rejected' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate('/student/application')}
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Apply Again
                          </Button>
                        )}
                        {application.status === 'approved' && application.paymentStatus !== 'paid' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => navigate('/student/payment')}
                            className="flex items-center gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            Make Payment
                          </Button>
                        )}
                        {application.status === 'assigned' && (
                          <Badge variant="info" size="sm" className="py-2">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Section */}
                <div className={`p-4 rounded-lg ${getStatusColor(selectedApplication.status)}`}>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const { icon: StatusIcon } = getStatusBadge(selectedApplication.status);
                      return <StatusIcon className="h-6 w-6" />;
                    })()}
                    <div>
                      <h3 className="font-bold text-lg">
                        {getStatusBadge(selectedApplication.status).label}
                      </h3>
                      <p className="text-sm opacity-80">
                        Applied on {new Date(selectedApplication.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                {selectedApplication.personalInfo && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium">{selectedApplication.personalInfo.name || user?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">{selectedApplication.personalInfo.email || user?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium">{selectedApplication.personalInfo.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="font-medium">{selectedApplication.personalInfo.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Semester</p>
                        <p className="font-medium">{selectedApplication.personalInfo.semester}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Roll Number</p>
                        <p className="font-medium">{selectedApplication.personalInfo.rollNumber}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Room Information */}
                {selectedApplication.roomInfo && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Bed className="h-5 w-5 text-blue-600" />
                      Room Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Room Type</p>
                        <p className="font-medium">{selectedApplication.roomInfo.roomType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Room Number</p>
                        <p className="font-medium">{selectedApplication.roomInfo.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Floor</p>
                        <p className="font-medium">{selectedApplication.roomInfo.floor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Capacity</p>
                        <p className="font-medium">{selectedApplication.roomInfo.capacity}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents */}
                {selectedApplication.documents && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                      {selectedApplication.documents.idProof && (
                        <div>
                          <p className="text-sm text-gray-500">ID Proof</p>
                          {selectedApplication.documents.idProof.url ? (
                            <a
                              href={selectedApplication.documents.idProof.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Document
                            </a>
                          ) : (
                            <p className="text-gray-400 text-sm">No document uploaded</p>
                          )}
                        </div>
                      )}
                      {selectedApplication.documents.addressProof && (
                        <div>
                          <p className="text-sm text-gray-500">Address Proof</p>
                          {selectedApplication.documents.addressProof.url ? (
                            <a
                              href={selectedApplication.documents.addressProof.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Document
                            </a>
                          ) : (
                            <p className="text-gray-400 text-sm">No document uploaded</p>
                          )}
                        </div>
                      )}
                      {selectedApplication.documents.previousMarks && (
                        <div>
                          <p className="text-sm text-gray-500">Previous Marks</p>
                          {selectedApplication.documents.previousMarks.url ? (
                            <a
                              href={selectedApplication.documents.previousMarks.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Document
                            </a>
                          ) : (
                            <p className="text-gray-400 text-sm">No document uploaded</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Remarks */}
                {selectedApplication.adminRemarks && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Admin Remarks</h4>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-gray-800">{selectedApplication.adminRemarks}</p>
                    </div>
                  </div>
                )}

                {/* Processing Information */}
                {selectedApplication.processedAt && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Processing Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Processed Date</p>
                        <p className="font-medium">
                          {new Date(selectedApplication.processedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedApplication.processedBy && (
                        <div>
                          <p className="text-xs text-gray-500">Processed By</p>
                          <p className="font-medium">
                            {selectedApplication.processedBy.name || 'Admin'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </Button>
                  {selectedApplication.status === 'rejected' && (
                    <Button
                      onClick={() => {
                        setShowDetails(false);
                        navigate('/student/application');
                      }}
                    >
                      Apply Again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatus;
