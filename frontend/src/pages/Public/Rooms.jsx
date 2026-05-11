import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bed,
  Users,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Shield,
  MapPin,
  Star,
  Filter,
  Search,
  Heart,
  ArrowRight,
  X,
  ChevronDown,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import { roomAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Rooms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [rooms, setRooms] = useState([]);
  const [occupancyMap, setOccupancyMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting to fetch rooms...');
      
      const roomsRes = await roomAPI.getAll();
      console.log('📥 Raw rooms API response:', roomsRes);
      console.log('📊 Rooms data:', roomsRes.data);
      console.log('🏠 Rooms array:', roomsRes.data.data);
      console.log('📏 Number of rooms received:', roomsRes.data.data?.length || 0);
      
      setRooms(roomsRes.data.data || []);

      // Try to fetch occupancy data, but don't fail if it doesn't work
      try {
        console.log('🔍 Fetching occupancy data...');
        const occupancyRes = await roomAPI.getOccupancy();
        console.log('📈 Occupancy response:', occupancyRes.data);
        setOccupancyMap(occupancyRes.data.data || {});
      } catch (occupancyErr) {
        console.error('Failed to fetch occupancy data, falling back to room.occupiedSeats:', occupancyErr);
        setOccupancyMap({});
      }

      setError('');
    } catch (err) {
      setError('Failed to load rooms. Please try again later.');
      console.error('❌ Error fetching rooms:', err);
      console.error('❌ Error response:', err.response);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (room) => {
    if (!user) {
      // User not logged in, redirect to login with redirect param
      navigate('/login?redirect=/student/application');
      return;
    }

    if (user.role === 'student') {
      // Student logged in, redirect to application page with selected room
      navigate('/student/application', { state: { selectedRoom: room } });
    } else if (user.role === 'admin') {
      // Admin logged in, redirect to admin rooms page
      navigate('/admin/rooms');
    } else if (user.role === 'warden') {
      // Warden logged in, redirect to warden dashboard
      navigate('/warden/dashboard');
    } else {
      // Default fallback
      navigate('/login');
    }
  };

  const handleEditRoom = (roomId) => {
    navigate('/admin/rooms', { state: { editRoomId: roomId } });
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await roomAPI.delete(roomId);
      setRooms(rooms.filter(room => room._id !== roomId));
      setDeleteLoading(false);
    } catch (err) {
      console.error('Error deleting room:', err);
      setDeleteLoading(false);
    }
  };

  // Calculate actual occupancy based on occupancyMap from public API, fall back to room.occupiedSeats
  const getRoomOccupancy = (room) => {
    // If occupancyMap has data for this room, use it
    if (Object.keys(occupancyMap).length > 0 && occupancyMap[room.roomNumber] !== undefined) {
      return occupancyMap[room.roomNumber];
    }
    // Otherwise fall back to room.occupiedSeats
    return room.occupiedSeats || 0;
  };

  const isRoomOccupied = (room) => {
    const actualOccupancy = getRoomOccupancy(room);
    return actualOccupancy >= room.capacity;
  };

  const roomTypes = [
    { id: 'all', name: 'All Rooms' },
    { id: 'single', name: 'Single Room' },
    { id: 'double', name: 'Double Room' },
    { id: 'triple', name: 'Triple Room' },
    { id: 'quad', name: 'Quad Room' }
  ];

  const amenities = {
    wifi: { icon: Wifi, name: 'Free WiFi' },
    parking: { icon: Car, name: 'Parking' },
    kitchen: { icon: Coffee, name: 'Kitchen' },
    tv: { icon: Tv, name: 'TV' },
    ac: { icon: Wind, name: 'Air Conditioning' },
    security: { icon: Shield, name: '24/7 Security' }
  };

  const filteredRooms = rooms;
  
  console.log('📊 Total rooms:', rooms.length);
  console.log('🏠 All rooms shown:', rooms.map(r => r.roomNumber || r.name));

  const RoomCard = ({ room }) => {
    const [isLiked, setIsLiked] = useState(false);

    const roomId = room._id || room.id;
    const roomName = room.roomNumber || room.name || 'Room';
    const roomType = room.type || 'standard';
    const roomCapacity = room.capacity || 1;
    const roomTotal = room.capacity || 1;
    const actualOccupancy = getRoomOccupancy(room);
    const roomAvailable = roomCapacity - actualOccupancy;
    const isOccupied = actualOccupancy >= roomCapacity;
    const roomPrice = room.price || room.rentPerMonth || 0;
    const roomLocation = `Floor ${room.floor || 1}`;
    const roomDescription = room.description || 'Comfortable and well-maintained room with modern amenities.';

    // Convert features object to amenities array
    const roomAmenities = [];
    if (room.features?.ac) roomAmenities.push('AC');
    if (room.features?.wifi) roomAmenities.push('WiFi');
    if (room.features?.attachedBathroom) roomAmenities.push('Attached Bathroom');
    if (room.features?.furnished) roomAmenities.push('Furnished');

    return (
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
        {/* Room Image */}
        <div
          className="relative h-52 overflow-hidden cursor-pointer"
          onClick={() => navigate(`/rooms/${roomId}`)}
        >
          {room.images && room.images.length > 0 ? (
            <img
              src={`http://localhost:5000${room.images[0]}`}
              alt={roomName}
              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <Bed className="h-16 w-16 text-blue-400" />
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
              {roomType}
            </div>
            {roomType === 'double' && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </div>

          {/* Like Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all duration-200"
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>

          {/* Availability Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            {roomAvailable > 0 ? (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                {roomAvailable} Available
              </div>
            ) : (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                Occupied
              </div>
            )}
          </div>
        </div>

        {/* Room Details */}
        <div className="p-5 flex flex-col flex-1">
          {/* Header */}
          <div
            className="mb-3 cursor-pointer"
            onClick={() => navigate(`/rooms/${roomId}`)}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">{roomName}</h3>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1 text-blue-500" />
              <span>{roomLocation}</span>
            </div>
          </div>

          {/* Description */}
          <p
            className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2 flex-shrink-0 cursor-pointer"
            onClick={() => navigate(`/rooms/${roomId}`)}
          >{roomDescription}</p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-gray-900">Capacity</div>
                <div className="text-xs text-gray-500">{roomCapacity} Persons</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
              <Bed className="h-4 w-4 text-green-500 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-gray-900">Available</div>
                <div className="text-xs text-gray-500">{roomAvailable}/{roomTotal} Beds</div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {roomAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4 flex-shrink-0">
              {roomAmenities.map((amenity, index) => {
                const amenityKey = typeof amenity === 'string' ? amenity.toLowerCase() : 'wifi';
                const IconComponent = amenities[amenityKey]?.icon || Wifi;
                const amenityName = amenities[amenityKey]?.name || amenity;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                  >
                    <IconComponent className="h-3 w-3" />
                    <span>{amenityName}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-shrink-0">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">PKR {roomPrice}</span>
                <span className="text-xs text-gray-500">/mo</span>
              </div>
            </div>
            <div className="flex gap-2">
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => handleEditRoom(roomId)}
                    className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Edit Room"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(roomId)}
                    disabled={deleteLoading}
                    className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Delete Room"
                  >
                    {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </>
              )}
              {isOccupied ? (
                <button
                  disabled
                  className="px-5 py-2.5 bg-red-500 text-white rounded-lg cursor-not-allowed font-medium text-sm"
                >
                  Already Booked
                </button>
              ) : user?.role === 'student' ? (
                <button
                  onClick={() => navigate(`/rooms/${roomId}`)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                View Details
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/rooms/${roomId}`)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Available Rooms</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Find your perfect accommodation from our wide range of comfortable rooms
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Room Type Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto">
              {roomTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tags & Results */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredRooms.length}</span> rooms
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Price Range Display */}
            <span className="text-sm text-gray-600">
              PKR {priceRange[0]} - PKR {priceRange[1]}
            </span>
            
            {/* Clear Filters */}
            {(selectedType !== 'all' || searchTerm || priceRange[1] !== 50000) && (
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSearchTerm('');
                  setPriceRange([0, 50000]);
                }}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Quick Price Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setPriceRange([0, 2500])}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              priceRange[1] === 2500 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Budget
          </button>
          <button
            onClick={() => setPriceRange([2500, 5000])}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              priceRange[0] === 2500 && priceRange[1] === 5000 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mid-range
          </button>
          <button
            onClick={() => setPriceRange([5000, 50000])}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              priceRange[0] === 5000 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Premium
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading rooms...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchRooms}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {!loading && !error && (
          <>
            {filteredRooms.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRooms.map((room) => (
                  <RoomCard key={room._id || room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Bed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Rooms;
