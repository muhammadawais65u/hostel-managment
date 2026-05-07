import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Upload,
  Bed,
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
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Get pre-selected room from navigation state
  const preSelectedRoom = location.state?.selectedRoom;
  const preSelectedRoomId = location.state?.selectedRoomId;

  const [formData, setFormData] = useState({
    roomType: '',
    selectedRoom: '',
    purposeOfStay: '',
    semester: '',
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
    },
    roomInfo: {
      roomNumber: '',
      roomType: '',
      floor: '',
      capacity: '',
      price: ''
    },
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      rollNumber: '',
      department: '',
      semester: ''
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
    fetchRooms();
  }, []);

  // Pre-select room if passed from Rooms page or RoomDetail page
  useEffect(() => {
    if (rooms.length > 0) {
      if (preSelectedRoom) {
        handleRoomSelection(preSelectedRoom);
        setShowForm(true);
      } else if (preSelectedRoomId) {
        const room = rooms.find(r => r._id === preSelectedRoomId);
        if (room) {
          handleRoomSelection(room);
          setShowForm(true);
        }
      }
    }
  }, [preSelectedRoom, preSelectedRoomId, rooms]);

  // Pre-populate personalInfo from user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          rollNumber: user.studentInfo?.rollNumber || '',
          department: user.studentInfo?.department || '',
          semester: user.studentInfo?.semester || ''
        }
      }));
    }
  }, [user]);

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
      const response = await studentAPI.getApplications();
      setApplicationData(response.data.data);
    } catch (err) {
      // No application exists yet
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form Data:', JSON.stringify(formData, null, 2));
    console.log('User Auth:', localStorage.getItem('token') ? 'Authenticated' : 'Not Authenticated');

    try {
      const response = await studentAPI.submitApplication(formData);
      console.log('API Response:', response);
      setSuccess('Application submitted successfully!');
      setShowForm(false);
      fetchApplicationData();
    } catch (err) {
      console.error('=== FULL ERROR DETAILS ===');
      console.error('Error object:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', JSON.stringify(err.response?.data, null, 2));
      console.error('Response text:', err.response?.statusText);
      console.error('Error message:', err.message);
      console.error('==========================');
      
      let errorMsg = 'Failed to submit application';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors?.[0]?.msg) {
        errorMsg = err.response.data.errors[0].msg;
      } else if (err.response?.status === 400 && !err.response?.data) {
        errorMsg = 'Bad Request - Check backend console for details';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
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
      roomType: room.type || 'single',
      roomInfo: {
        roomNumber: room.roomNumber || '',
        roomType: room.type || '',
        floor: String(room.floor || ''),
        capacity: String(room.capacity || ''),
        price: String(room.price || room.rentPerMonth || '')
      }
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
            <p className="text-gray-600">Submit your room application</p>
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

          {/* Pre-selected Room Banner */}
          {preSelectedRoom && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Bed className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Applying for</p>
                  <p className="font-semibold text-gray-900">
                    Room {preSelectedRoom.roomNumber || preSelectedRoom.name} — Floor {preSelectedRoom.floor || 1} — PKR {preSelectedRoom.price || preSelectedRoom.rentPerMonth || 0}/mo
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Existing Application - only show if valid application exists */}
          {applicationData?._id && !showForm && (
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

              <form onSubmit={handleSubmit} className="space-y-8">

                {/* ============ SECTION 1: ROOM INFORMATION ============ */}
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Bed className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800">1. Room Information</h3>
                  </div>
                  {selectedRoom || preSelectedRoom ? (
                    <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Room Number</label>
                          <select
                            value={formData.roomInfo.roomNumber}
                            onChange={(e) => {
                              const selectedRoomId = e.target.value;
                              const room = rooms.find(r => String(r.roomNumber || r._id) === selectedRoomId);
                              if (room) {
                                setFormData({
                                  ...formData,
                                  selectedRoom: room._id,
                                  roomType: room.type || 'single',
                                  roomInfo: {
                                    roomNumber: String(room.roomNumber || room._id),
                                    roomType: room.type || '',
                                    floor: String(room.floor || ''),
                                    capacity: String(room.capacity || ''),
                                    price: String(room.price || room.rentPerMonth || '')
                                  }
                                });
                                setSelectedRoom(room);
                              }
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Room</option>
                            {rooms.map((room) => (
                              <option key={room._id} value={String(room.roomNumber || room._id)}>
                                Room {room.roomNumber || room._id} — {room.type || 'Standard'} — PKR {room.price || room.rentPerMonth || 0}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Room Type</label>
                          <input
                            type="text"
                            value={formData.roomInfo.roomType}
                            onChange={(e) => setFormData({
                              ...formData,
                              roomInfo: { ...formData.roomInfo, roomType: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Monthly Rent (PKR)</label>
                          <input
                            type="text"
                            value={formData.roomInfo.price}
                            onChange={(e) => setFormData({
                              ...formData,
                              roomInfo: { ...formData.roomInfo, price: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Floor</label>
                          <input
                            type="text"
                            value={formData.roomInfo.floor}
                            onChange={(e) => setFormData({
                              ...formData,
                              roomInfo: { ...formData.roomInfo, floor: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Capacity</label>
                          <input
                            type="text"
                            value={formData.roomInfo.capacity}
                            onChange={(e) => setFormData({
                              ...formData,
                              roomInfo: { ...formData.roomInfo, capacity: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 border border-blue-200 text-center">
                      <Bed className="h-10 w-10 text-blue-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">No room selected</p>
                      <button
                        type="button"
                        onClick={() => navigate('/rooms')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Select Room
                      </button>
                    </div>
                  )}
                </div>

                {/* ============ SECTION 2: PERSONAL INFORMATION ============ */}
                {user && (
                  <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-bold text-gray-800">2. Personal Information</h3>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={formData.personalInfo.name}
                            onChange={(e) => setFormData({
                              ...formData,
                              personalInfo: { ...formData.personalInfo, name: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                          <input
                            type="email"
                            value={formData.personalInfo.email}
                            onChange={(e) => setFormData({
                              ...formData,
                              personalInfo: { ...formData.personalInfo, email: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={formData.personalInfo.phone}
                            onChange={(e) => setFormData({
                              ...formData,
                              personalInfo: { ...formData.personalInfo, phone: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Roll Number</label>
                          <input
                            type="text"
                            value={formData.personalInfo.rollNumber}
                            onChange={(e) => setFormData({
                              ...formData,
                              personalInfo: { ...formData.personalInfo, rollNumber: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Department</label>
                          <input
                            type="text"
                            value={formData.personalInfo.department}
                            onChange={(e) => setFormData({
                              ...formData,
                              personalInfo: { ...formData.personalInfo, department: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Semester</label>
                          <select
                            value={formData.personalInfo.semester}
                            onChange={(e) => setFormData({
                              ...formData,
                              personalInfo: { ...formData.personalInfo, semester: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Semester</option>
                            {[1,2,3,4,5,6,7,8].map(n => (
                              <option key={n} value={String(n)}>Semester {n}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============ SECTION 3: ADDITIONAL INFORMATION ============ */}
                <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-800">3. Additional Information</h3>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-orange-200 shadow-sm space-y-5">

                    {/* Emergency Contact */}
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-3">
                        Emergency Contact <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Contact Name</p>
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
                            placeholder="e.g. Father, Mother"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Relationship</p>
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
                            placeholder="e.g. Parent, Sibling"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Phone Number</p>
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
                            placeholder="03XX-XXXXXXX"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                 
                    {/* Purpose of Stay */}
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-3">
                        Purpose of Stay <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.purposeOfStay}
                        onChange={(e) => setFormData({...formData, purposeOfStay: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">-- Select Purpose --</option>
                        <option value="education">Education / Study</option>
                        <option value="job">Job / Work</option>
                        <option value="internship">Internship</option>
                        <option value="training">Training Program</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Special Requirements */}
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-3">
                        Special Requirements <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        value={formData.specialRequirements}
                        onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                        rows={3}
                        placeholder="Any special requirements, medical conditions, or dietary needs..."
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Documents */}
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-3">
                        Required Documents
                      </label>
                      <div className="space-y-3">
                        {/* ID Proof */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Upload className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-gray-800 font-medium">ID Proof <span className="text-red-500">*</span></p>
                                <p className="text-gray-500 text-sm">CNIC, Passport, Student ID</p>
                              </div>
                            </div>
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload('idProof', e.target.files[0])}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              required
                            />
                            <span className={`px-3 py-1 rounded-lg text-sm ${formData.documents.idProof ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                              {formData.documents.idProof ? 'Uploaded' : 'Choose File'}
                            </span>
                          </label>
                        </div>

                        {/* Address Proof */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Upload className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-gray-800 font-medium">Address Proof</p>
                                <p className="text-gray-500 text-sm">Utility Bill, Ration Card</p>
                              </div>
                            </div>
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload('addressProof', e.target.files[0])}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <span className={`px-3 py-1 rounded-lg text-sm ${formData.documents.addressProof ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                              {formData.documents.addressProof ? 'Uploaded' : 'Choose File'}
                            </span>
                          </label>
                        </div>

                        {/* Academic Records */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Upload className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-gray-800 font-medium">Previous Academic Records</p>
                                <p className="text-gray-500 text-sm">Marksheets, Certificates</p>
                              </div>
                            </div>
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload('previousMarks', e.target.files[0])}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <span className={`px-3 py-1 rounded-lg text-sm ${formData.documents.previousMarks ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                              {formData.documents.previousMarks ? 'Uploaded' : 'Choose File'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  isLoading={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 py-3 text-lg font-semibold"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </div>
          )}

          {/* No Application and Not Showing Form */}
          {!applicationData?._id && !showForm && (
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
