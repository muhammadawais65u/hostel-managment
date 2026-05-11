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
  DollarSign,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Home
} from 'lucide-react';
import { adminAPI, roomAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const OccupiedRooms = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOccupiedRooms();
  }, []);

  const fetchOccupiedRooms = async () => {
    try {
      setLoading(true);
      const [paymentsRes, roomsRes] = await Promise.all([
        adminAPI.getPayments(),
        roomAPI.getAll()
      ]);
      
      console.log('Payments response:', paymentsRes.data);
      console.log('Rooms response:', roomsRes.data);
      
      const payments = paymentsRes.data.data || [];
      const rooms = roomsRes.data.data || [];
      
      console.log('Total payments:', payments.length);
      console.log('Total rooms:', rooms.length);
      console.log('Sample payment:', payments[0]);
      console.log('Sample room:', rooms[0]);
      
      // Filter only successful payments with room assignments
      const successfulPayments = payments.filter(payment => 
        payment.roomNumber && payment.amount
      );
      
      // Group payments by room and combine with room details
      const roomsWithPayments = successfulPayments.reduce((acc, payment) => {
        const roomNumber = payment.roomNumber;
        if (!acc[roomNumber]) {
          const roomDetails = rooms.find(r => r.roomNumber === roomNumber);
          acc[roomNumber] = {
            ...roomDetails,
            roomNumber,
            payments: [],
            totalAmount: 0,
            students: [],
            // Fallback values if room details are missing
            capacity: roomDetails?.capacity || 1,
            type: roomDetails?.type || payment.roomType || 'single',
            monthlyRent: roomDetails?.monthlyRent || payment.amount,
            floor: roomDetails?.floor || 1,
            hostel: roomDetails?.hostel || { name: 'Unknown Hostel' }
          };
        }
        acc[roomNumber].payments.push(payment);
        acc[roomNumber].totalAmount += payment.amount || 0;
        
        // Add student info if not already added
        const studentExists = acc[roomNumber].students.some(s => s.email === payment.studentEmail);
        if (!studentExists) {
          acc[roomNumber].students.push({
            name: payment.studentName,
            email: payment.studentEmail,
            rollNumber: payment.rollNumber,
            department: payment.department,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            transactionId: payment.transactionId
          });
        }
        
        return acc;
      }, {});
      
      const occupiedRoomsList = Object.values(roomsWithPayments);
      console.log('Successful payments count:', successfulPayments.length);
      console.log('Occupied rooms with payments:', occupiedRoomsList);
      console.log('Final rooms list length:', occupiedRoomsList.length);
      setOccupiedRooms(occupiedRoomsList);
      setError('');
    } catch (err) {
      setError('Failed to load occupied rooms. Please try again.');
      console.error('Error fetching occupied rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = occupiedRooms.filter(room => {
    const matchesSearch = 
      (room.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.hostel?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.students.some(student => 
        (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'fully-occupied' && room.students.length >= room.capacity) ||
      (filterStatus === 'partially-occupied' && room.students.length < room.capacity);
    
    return matchesSearch && matchesFilter;
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

  const getTotalRevenue = () => {
    return occupiedRooms.reduce((sum, room) => sum + (room.totalAmount || 0), 0);
  };

  const getTotalStudents = () => {
    return occupiedRooms.reduce((sum, room) => sum + (room.students?.length || 0), 0);
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
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Occupied Rooms</h1>
            </div>
            <p className="text-green-100">View occupied rooms with successful payments and student details</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-xl">
                <Bed className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Occupied Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{occupiedRooms.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{getTotalStudents()}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">PKR {getTotalRevenue().toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Revenue/Room</p>
                <p className="text-2xl font-bold text-gray-900">
                  PKR {occupiedRooms.length > 0 ? Math.round(getTotalRevenue() / occupiedRooms.length).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by room number, hostel, or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Rooms</option>
                <option value="fully-occupied">Fully Occupied</option>
                <option value="partially-occupied">Partially Occupied</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Rooms List */}
        <div className="space-y-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Card key={room.roomNumber} className="overflow-hidden">
                {/* Room Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Bed className="h-6 w-6 text-green-600" />
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
                      <Badge variant="success" className="mb-1">
                        {getRoomTypeLabel(room.type)}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        {room.students?.length || 0} / {room.capacity || 1} students
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
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-lg font-bold text-green-600">PKR {room.totalAmount?.toLocaleString()}</p>
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
                      Students with Payments
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
                              <Badge variant="success" size="sm">Paid</Badge>
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
                              <div className="flex items-center gap-2 text-gray-600">
                                <DollarSign className="h-4 w-4" />
                                <span>Amount: PKR {student.amount?.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <CreditCard className="h-4 w-4" />
                                <span>Payment Date: {new Date(student.paymentDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Home className="h-4 w-4" />
                                <span>Transaction: {student.transactionId}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p>No students with payments found in this room</p>
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
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No rooms have successful payments yet'}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OccupiedRooms;
