import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bed,
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Users,
  IndianRupee,
  DoorOpen
} from 'lucide-react';
import { roomAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

const AdminRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'single',
    capacity: 1,
    price: '',
    floor: 1,
    status: 'available',
    features: {
      ac: false,
      wifi: false,
      attachedBathroom: false,
      furnished: false
    },
    description: '',
    images: [],
    isActive: true
  });

  const roomTypes = [
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'triple', label: 'Triple' },
    { value: 'quad', label: 'Quad' }
  ];

  const amenitiesList = [
    { value: 'wifi', label: 'WiFi' },
    { value: 'ac', label: 'AC' },
    { value: 'tv', label: 'TV' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'parking', label: 'Parking' },
    { value: 'security', label: 'Security' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'gym', label: 'Gym' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const roomsRes = await roomAPI.getAll();
      setRooms(roomsRes.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields except images
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          if (key === 'features') {
            formDataToSend.append('features', JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      
      // Add image files
      formData.images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      await roomAPI.create(formDataToSend);
      setSuccess('Room added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields except images
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          if (key === 'features') {
            formDataToSend.append('features', JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      
      // Add image files (only new ones)
      formData.images.forEach(image => {
        if (image instanceof File) {
          formDataToSend.append('images', image);
        }
      });
      
      await roomAPI.update(selectedRoom._id, formDataToSend);
      setSuccess('Room updated successfully!');
      setShowEditModal(false);
      setSelectedRoom(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      setLoading(true);
      await roomAPI.delete(selectedRoom._id);
      setSuccess('Room deleted successfully!');
      setShowDeleteModal(false);
      setSelectedRoom(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber || '',
      type: room.type || 'single',
      capacity: room.capacity || 1,
      price: room.price || room.monthlyRent || '',
      floor: room.floor || 1,
      status: room.status || 'available',
      features: {
        ac: room.features?.ac || false,
        wifi: room.features?.wifi || false,
        attachedBathroom: room.features?.attachedBathroom || false,
        furnished: room.features?.furnished || false
      },
      description: room.description || '',
      images: room.images || [],
      isActive: room.isActive !== false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (room) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      type: 'single',
      capacity: 1,
      price: '',
      floor: 1,
      status: 'available',
      features: {
        ac: false,
        wifi: false,
        attachedBathroom: false,
        furnished: false
      },
      description: '',
      images: [],
      isActive: true
    });
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = (room.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getRoomTypeBadge = (type) => {
    const colors = {
      single: 'bg-blue-100 text-blue-800',
      double: 'bg-green-100 text-green-800',
      triple: 'bg-yellow-100 text-yellow-800',
      suite: 'bg-purple-100 text-purple-800',
      dormitory: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.single;
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading rooms...</p>
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
              <h1 className="text-3xl font-bold">Room Management</h1>
            </div>
            <p className="text-blue-100">Manage hostel rooms - Add, Edit, or Remove rooms</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            leftIcon={Plus}
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
          >
            Add New Room
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
              <Bed className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(r => (r.available || r.vacant || 0) > 0).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(r => (r.occupied || 0) > 0).length}
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
              placeholder="Search rooms by number or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
                  </div>
      </Card>

      {/* Rooms Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Room</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Capacity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Available</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Bed className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{room.roomNumber}</p>
                          <p className="text-sm text-gray-500">Floor {room.floor || 1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoomTypeBadge(room.type)}`}>
                        {roomTypes.find(t => t.value === room.type)?.label || room.type}
                      </span>
                    </td>
                                        <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{room.capacity || 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${(room.available || room.vacant || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {room.available || room.vacant || 0}
                      </span>
                      <span className="text-gray-400 text-sm"> / {room.capacity || 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-900 font-medium">
                        <span>PKR</span>
                        {room.price || room.monthlyRent || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={room.isActive !== false ? 'success' : 'secondary'}>
                        {room.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(room)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Room"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(room)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Room"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Bed className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">No rooms found</p>
                    <p className="text-gray-400 text-sm">Add a new room to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Room</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="p-6 space-y-6">
              {/* 1. Room Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Room Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. A-101"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                    <div className="space-y-2">
                      {roomTypes.map(type => (
                        <label key={type.value} className="flex items-center">
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={formData.type === type.value}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Number of Students) *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="e.g. 2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (PKR) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="e.g. 5000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Room Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Room Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.ac}
                      onChange={() => handleFeatureToggle('ac')}
                      className="mr-2"
                    />
                    <span>Air Conditioner (AC)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.wifi}
                      onChange={() => handleFeatureToggle('wifi')}
                      className="mr-2"
                    />
                    <span>WiFi Available</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.attachedBathroom}
                      onChange={() => handleFeatureToggle('attachedBathroom')}
                      className="mr-2"
                    />
                    <span>Attached Bathroom</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.furnished}
                      onChange={() => handleFeatureToggle('furnished')}
                      className="mr-2"
                    />
                    <span>Furnished (Bed, Table, Chair)</span>
                  </label>
                </div>
              </div>

              {/* 3. Additional Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Additional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number *</label>
                    <input
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="e.g. 1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Status *</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="available"
                          checked={formData.status === 'available'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Available</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="occupied"
                          checked={formData.status === 'occupied'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Occupied</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Add room description..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* 4. Room Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Room Images</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Room Images:</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">You can select multiple images</p>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image instanceof File ? URL.createObjectURL(image) : image}
                          alt={`Room image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Spinner size="sm" /> : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Room</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditRoom}>
              {/* 1. Room Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Room Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. A-101"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                    <div className="space-y-2">
                      {roomTypes.map(type => (
                        <label key={type.value} className="flex items-center">
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={formData.type === type.value}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Number of Students) *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="e.g. 2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (PKR) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="e.g. 5000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Room Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Room Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.ac}
                      onChange={() => handleFeatureToggle('ac')}
                      className="mr-2"
                    />
                    <span>Air Conditioner (AC)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.wifi}
                      onChange={() => handleFeatureToggle('wifi')}
                      className="mr-2"
                    />
                    <span>WiFi Available</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.attachedBathroom}
                      onChange={() => handleFeatureToggle('attachedBathroom')}
                      className="mr-2"
                    />
                    <span>Attached Bathroom</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.furnished}
                      onChange={() => handleFeatureToggle('furnished')}
                      className="mr-2"
                    />
                    <span>Furnished (Bed, Table, Chair)</span>
                  </label>
                </div>
              </div>

              {/* 3. Additional Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Additional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number *</label>
                    <input
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="e.g. 1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Status *</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="available"
                          checked={formData.status === 'available'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Available</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="occupied"
                          checked={formData.status === 'occupied'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Occupied</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Add room description..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* 4. Room Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Room Images</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Room Images:</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">You can select multiple images</p>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image instanceof File ? URL.createObjectURL(image) : `http://localhost:5000${image}`}
                          alt={`Room image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Room</h2>
              <p className="text-gray-600">
                Are you sure you want to delete room <span className="font-semibold">{selectedRoom.roomNumber}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Spinner size="sm" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;
