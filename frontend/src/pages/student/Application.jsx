import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Upload,
  Bed,
  Building2,
  Users,
  DollarSign,
  Calendar,
  MapPin
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const Application = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    preferredHostel: '',
    roomType: '',
    specialRequirements: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    documents: {
      idProof: null,
      addressProof: null,
      previousMarks: null
    }
  });

  const roomTypes = [
    { value: 'single', label: 'Single Room', price: 8000 },
    { value: 'double', label: 'Double Sharing', price: 5000 },
    { value: 'triple', label: 'Triple Sharing', price: 3500 },
    { value: 'four', label: 'Four Sharing', price: 2500 }
  ];

  useEffect(() => {
    fetchApplicationData();
    fetchHostels();
  }, []);

  const fetchApplicationData = async () => {
    try {
      const response = await studentAPI.getApplication();
      setApplicationData(response.data.data);
    } catch (err) {
      // No application exists yet
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const response = await studentAPI.getHostels();
      setHostels(response.data.data || []);
    } catch (err) {
      setError('Failed to load hostels');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await studentAPI.submitApplication(formData);
      setSuccess('Application submitted successfully!');
      setShowForm(false);
      fetchApplicationData();
    } catch (err) {
      setError('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      none: { variant: 'secondary', label: 'Not Applied' },
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
      verified: { variant: 'info', label: 'Verified' }
    };
    return variants[status] || variants.none;
  };

  const handleFileUpload = (docType, file) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [docType]: file
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Application...</p>
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
            <h1 className="text-4xl font-bold text-white mb-2">Apply for Room</h1>
            <p className="text-purple-200">Submit your hostel room application</p>
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

          {/* Existing Application */}
          {applicationData && !showForm && (
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Your Application</h2>
                <Badge variant={getStatusBadge(applicationData.status).variant}>
                  {getStatusBadge(applicationData.status).label}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-purple-200 text-sm mb-2">Application Date</p>
                    <p className="text-white font-semibold">
                      {new Date(applicationData.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-purple-200 text-sm mb-2">Preferred Hostel</p>
                    <p className="text-white font-semibold">{applicationData.preferredHostel?.name || 'N/A'}</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-purple-200 text-sm mb-2">Room Type</p>
                    <p className="text-white font-semibold capitalize">{applicationData.roomType || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-purple-200 text-sm mb-2">Emergency Contact</p>
                    <p className="text-white font-semibold">{applicationData.emergencyContact?.name || 'N/A'}</p>
                    <p className="text-purple-300 text-sm">{applicationData.emergencyContact?.phone || 'N/A'}</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-purple-200 text-sm mb-2">Special Requirements</p>
                    <p className="text-white">{applicationData.specialRequirements || 'None'}</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-purple-200 text-sm mb-2">Documents</p>
                    <p className="text-white">
                      {applicationData.documents?.idProof ? 'ID Proof ✓' : 'ID Proof ✗'}
                    </p>
                  </div>
                </div>
              </div>

              {applicationData.status === 'rejected' && (
                <div className="mt-6">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                  >
                    Apply Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* New Application Form */}
          {(!applicationData || showForm) && (
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {applicationData ? 'Update Application' : 'New Application'}
                </h2>
                {applicationData && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                    className="text-white hover:text-purple-200"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hostel Selection */}
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Preferred Hostel</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hostels.map((hostel) => (
                      <label key={hostel._id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="hostel"
                          value={hostel._id}
                          checked={formData.preferredHostel === hostel._id}
                          onChange={(e) => setFormData({...formData, preferredHostel: e.target.value})}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl border text-center transition-all ${
                          formData.preferredHostel === hostel._id
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : 'bg-white/10 border-white/20 hover:bg-white/20'
                        }`}>
                          <Building2 className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                          <p className="text-white font-semibold">{hostel.name}</p>
                          <p className="text-purple-300 text-sm">{hostel.code}</p>
                          <p className="text-purple-200 text-xs mt-1">{hostel.address}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Room Type Selection */}
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Room Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {roomTypes.map((room) => (
                      <label key={room.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="roomType"
                          value={room.value}
                          checked={formData.roomType === room.value}
                          onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl border text-center transition-all ${
                          formData.roomType === room.value
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : 'bg-white/10 border-white/20 hover:bg-white/20'
                        }`}>
                          <Bed className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                          <p className="text-white font-semibold">{room.label}</p>
                          <p className="text-green-300 text-sm">₹{room.price}/month</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Emergency Contact</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={formData.emergencyContact.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: {
                          ...formData.emergencyContact,
                          name: e.target.value
                        }
                      })}
                      placeholder="Contact Name"
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <input
                      type="text"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: {
                          ...formData.emergencyContact,
                          relationship: e.target.value
                        }
                      })}
                      placeholder="Relationship"
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <input
                      type="tel"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: {
                          ...formData.emergencyContact,
                          phone: e.target.value
                        }
                      })}
                      placeholder="Phone Number"
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Special Requirements (Optional)</label>
                  <textarea
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                    rows={3}
                    placeholder="Any special requirements or medical conditions..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">Required Documents</label>
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Upload className="h-5 w-5 text-purple-300" />
                          <div>
                            <p className="text-white font-medium">ID Proof</p>
                            <p className="text-purple-300 text-sm">Aadhar Card, Passport, etc.</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload('idProof', e.target.files[0])}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
                          {formData.documents.idProof ? 'Uploaded' : 'Choose File'}
                        </span>
                      </label>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Upload className="h-5 w-5 text-purple-300" />
                          <div>
                            <p className="text-white font-medium">Address Proof</p>
                            <p className="text-purple-300 text-sm">Utility Bill, Ration Card, etc.</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload('addressProof', e.target.files[0])}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
                          {formData.documents.addressProof ? 'Uploaded' : 'Choose File'}
                        </span>
                      </label>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Upload className="h-5 w-5 text-purple-300" />
                          <div>
                            <p className="text-white font-medium">Previous Academic Records</p>
                            <p className="text-purple-300 text-sm">Marksheets, Certificates</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload('previousMarks', e.target.files[0])}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
                          {formData.documents.previousMarks ? 'Uploaded' : 'Choose File'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={submitting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </div>
          )}

          {/* No Application and Not Showing Form */}
          {!applicationData && !showForm && (
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/10 backdrop-blur-lg rounded-2xl p-12 border border-purple-500/30 text-center">
              <FileText className="h-20 w-20 text-purple-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Apply for Hostel Room</h2>
              <p className="text-purple-200 mb-8 max-w-2xl mx-auto">
                Start your hostel application process by filling out the form below. 
                Make sure you have all required documents ready.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                Start Application
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Application;
