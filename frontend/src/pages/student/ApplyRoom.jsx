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
  MapPin,
  Wifi,
  Shield,
  Car,
  Tv,
  Wind
} from 'lucide-react';
import { studentAPI, roomAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';

const Application = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    preferredHostel: '',
    roomType: '',
    selectedRoom: '',
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
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAll({ available: true });
      setRooms(response.data.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

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

  const handleRoomSelection = (room) => {
    setSelectedRoom(room);
    setFormData({
      ...formData,
      selectedRoom: room._id,
      preferredHostel: room.hostel?._id || room.hostel,
      roomType: room.type || 'single'
    });
  };

  const getRoomAmenities = (room) => {
    const amenities = room.amenities || room.facilities || [];
    const amenityIcons = {
      wifi: { icon: Wifi, name: 'WiFi' },
      ac: { icon: Wind, name: 'AC' },
      tv: { icon: Tv, name: 'TV' },
      parking: { icon: Car, name: 'Parking' },
      security: { icon: Shield, name: 'Security' }
    };
    
    return amenities.slice(0, 4).map((amenity, index) => {
      const amenityKey = typeof amenity === 'string' ? amenity.toLowerCase() : 'wifi';
      const IconComponent = amenityIcons[amenityKey]?.icon || Wifi;
      const amenityName = amenityIcons[amenityKey]?.name || amenity;
      return (
        <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
          <IconComponent className="h-3 w-3" />
          <span>{amenityName}</span>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-800 text-lg">Loading Application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Simple Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full opacity-10"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              leftIcon={ArrowLeft}
              onClick={() => navigate('/student/dashboard')}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Apply for Room</h1>
            <p className="text-gray-600">Submit your hostel room application</p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* User Information Display */}
          {user && (
            <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Information</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-gray-600 text-sm mb-2">Name</p>
                  <p className="text-gray-800 font-semibold">{user.name}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-gray-600 text-sm mb-2">Email</p>
                  <p className="text-gray-800 font-semibold">{user.email}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-gray-600 text-sm mb-2">Phone</p>
                  <p className="text-gray-800 font-semibold">{user.phone || 'Not provided'}</p>
                </div>
                {user.studentInfo && (
                  <>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-gray-600 text-sm mb-2">Roll Number</p>
                      <p className="text-gray-800 font-semibold">{user.studentInfo.rollNumber}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-gray-600 text-sm mb-2">Department</p>
                      <p className="text-gray-800 font-semibold">{user.studentInfo.department}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-gray-600 text-sm mb-2">Course</p>
                      <p className="text-gray-800 font-semibold">{user.studentInfo.course}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Existing Application */}
          {applicationData && !showForm && (
            <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Application</h2>
                <Badge variant={getStatusBadge(applicationData.status).variant}>
                  {getStatusBadge(applicationData.status).label}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-gray-600 text-sm mb-2">Application Date</p>
                    <p className="text-gray-800 font-semibold">
                      {new Date(applicationData.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-gray-600 text-sm mb-2">Preferred Hostel</p>
                    <p className="text-gray-800 font-semibold">{applicationData.preferredHostel?.name || 'N/A'}</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-gray-600 text-sm mb-2">Room Type</p>
                    <p className="text-gray-800 font-semibold capitalize">{applicationData.roomType || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-gray-600 text-sm mb-2">Emergency Contact</p>
                    <p className="text-gray-800 font-semibold">{applicationData.emergencyContact?.name || 'N/A'}</p>
                    <p className="text-gray-500 text-sm">{applicationData.emergencyContact?.phone || 'N/A'}</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-gray-600 text-sm mb-2">Special Requirements</p>
                    <p className="text-gray-800">{applicationData.specialRequirements || 'None'}</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-gray-600 text-sm mb-2">Documents</p>
                    <p className="text-gray-800">
                      {applicationData.documents?.idProof ? 'ID Proof ✓' : 'ID Proof ✗'}
                    </p>
                  </div>
                </div>
              </div>

              {applicationData.status === 'rejected' && (
                <div className="mt-6">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    Apply Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* New Application Form */}
          {(!applicationData || showForm) && (
            <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {applicationData ? 'Update Application' : 'New Application'}
                </h2>
                {applicationData && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Room Selection Section */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-4">Select a Room</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                      <label key={room._id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="selectedRoom"
                          value={room._id}
                          checked={formData.selectedRoom === room._id}
                          onChange={() => handleRoomSelection(room)}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          formData.selectedRoom === room._id
                            ? 'bg-blue-50 border-blue-500 shadow-md'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Bed className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-800">{room.roomNumber || `Room ${room._id}`}</span>
                            </div>
                            <span className="text-green-600 font-bold">₹{room.price || room.monthlyRent || 0}/mo</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <p>Type: {roomTypes.find(t => t.value === room.type)?.label || room.type}</p>
                            <p>Capacity: {room.capacity || 1} person(s)</p>
                            <p>Available: {(room.available || room.vacant || 0)}/{room.capacity || 1}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {getRoomAmenities(room)}
                          </div>
                          {room.hostel?.name && (
                            <p className="text-xs text-gray-500">{room.hostel.name}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {rooms.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Bed className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No available rooms found</p>
                    </div>
                  )}
                </div>

                {/* Selected Room Details */}
                {selectedRoom && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Selected Room Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Room Number</p>
                        <p className="font-semibold">{selectedRoom.roomNumber || `Room ${selectedRoom._id}`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                        <p className="font-semibold text-green-600">₹{selectedRoom.price || selectedRoom.monthlyRent || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Capacity</p>
                        <p className="font-semibold">{selectedRoom.capacity || 1} person(s)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Available Beds</p>
                        <p className="font-semibold">{selectedRoom.available || selectedRoom.vacant || 0}</p>
                      </div>
                    </div>
                    {selectedRoom.description && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-gray-800">{selectedRoom.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Hostel Selection (Auto-filled from room selection) */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Preferred Hostel</label>
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
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}>
                          <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-gray-800 font-semibold">{hostel.name}</p>
                          <p className="text-gray-600 text-sm">{hostel.code}</p>
                          <p className="text-gray-500 text-xs mt-1">{hostel.address}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Room Type Selection (Auto-filled from room selection) */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Room Type</label>
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
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}>
                          <Bed className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-gray-800 font-semibold">{room.label}</p>
                          <p className="text-green-600 text-sm">₹{room.price}/month</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Emergency Contact</label>
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
                      className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Special Requirements (Optional)</label>
                  <textarea
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                    rows={3}
                    placeholder="Any special requirements or medical conditions..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Required Documents</label>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Upload className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-gray-800 font-medium">ID Proof</p>
                            <p className="text-gray-600 text-sm">Aadhar Card, Passport, etc.</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload('idProof', e.target.files[0])}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm">
                          {formData.documents.idProof ? 'Uploaded' : 'Choose File'}
                        </span>
                      </label>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Upload className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-gray-800 font-medium">Address Proof</p>
                            <p className="text-gray-600 text-sm">Utility Bill, Ration Card, etc.</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload('addressProof', e.target.files[0])}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm">
                          {formData.documents.addressProof ? 'Uploaded' : 'Choose File'}
                        </span>
                      </label>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Upload className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-gray-800 font-medium">Previous Academic Records</p>
                            <p className="text-gray-600 text-sm">Marksheets, Certificates</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload('previousMarks', e.target.files[0])}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm">
                          {formData.documents.previousMarks ? 'Uploaded' : 'Choose File'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </div>
          )}

          {/* No Application and Not Showing Form */}
          {!applicationData && !showForm && (
            <div className="bg-white rounded-2xl p-12 border border-blue-200 shadow-sm text-center">
              <FileText className="h-20 w-20 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Apply for Hostel Room</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Start your hostel application process by filling out the form below. 
                Make sure you have all required documents ready.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
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
