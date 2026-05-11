import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bed,
  Building2,
  Users,
  Search,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';
import { wardenAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const WardenOccupiedRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await wardenAPI.getOccupiedRooms();
      console.log('Warden occupied rooms response:', response.data);
      
      const rooms = response.data.data || [];
      console.log('Total occupied rooms:', rooms.length);
      
      setRooms(rooms);
      setError('');
    } catch (err) {
      setError('Failed to load occupied rooms. Please try again.');
      console.error('Error fetching occupied rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      (room.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.hostel?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.students && room.students.some(student => 
        (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      ));
    return matchesSearch;
  });

  const getRoomTypeBadge = (type) => {
    const colors = {
      single: 'bg-blue-100 text-blue-800',
      double: 'bg-green-100 text-green-800',
      triple: 'bg-yellow-100 text-yellow-800',
      quad: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || colors.single;
  };

  const getRoomTypeLabel = (type) => {
    const labels = {
      single: 'Single',
      double: 'Double',
      triple: 'Triple',
      quad: 'Quad'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading occupied rooms...</p>
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
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Occupied Rooms</h1>
            </div>
            <p className="text-orange-100">View all occupied rooms with student details</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-xl">
                <Bed className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Occupied Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rooms.reduce((sum, room) => sum + (room.students?.length || 0), 0)}
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
                <p className="text-sm text-gray-600">Fully Occupied</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rooms.filter(room => room.students?.length >= room.capacity).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by room number, hostel, or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>

        {/* Rooms List */}
        <div className="space-y-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Card key={room._id} className="overflow-hidden">
                {/* Room Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Bed className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{room.roomNumber}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{room.hostel?.name || 'Unknown Hostel'}</span>
                          <span>•</span>
                          <span>Floor {room.floor || 1}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="warning" className="mb-1">
                        {getRoomTypeLabel(room.type)}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        {room.students?.length || 0} / {room.capacity} students
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                      <p className="text-lg font-bold text-gray-900">PKR {room.monthlyRent || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Room Features</p>
                      <div className="flex flex-wrap gap-1">
                        {room.features?.ac && <Badge variant="info" size="sm">AC</Badge>}
                        {room.features?.wifi && <Badge variant="info" size="sm">WiFi</Badge>}
                        {room.features?.attachedBathroom && <Badge variant="info" size="sm">Bathroom</Badge>}
                        {room.features?.furnished && <Badge variant="info" size="sm">Furnished</Badge>}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Occupancy Status</p>
                      <Badge 
                        variant={room.students?.length >= room.capacity ? 'danger' : 'warning'}
                        className="text-sm"
                      >
                        {room.students?.length >= room.capacity ? 'Fully Occupied' : 'Partially Occupied'}
                      </Badge>
                    </div>
                  </div>

                  {/* Students in Room */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Students in this Room
                    </h4>
                    {room.students && room.students.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {room.students.map((student, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{student.name}</p>
                                  <p className="text-sm text-gray-600">{student.rollNumber}</p>
                                </div>
                              </div>
                              <Badge variant="success" size="sm">Active</Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{student.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Department: {student.department || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p>No students assigned to this room</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <Bed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No occupied rooms found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'All rooms are currently available'}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardenOccupiedRooms;
