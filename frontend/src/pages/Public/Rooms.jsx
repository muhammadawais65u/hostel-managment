import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ChevronDown
} from 'lucide-react';

const Rooms = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const roomTypes = [
    { id: 'all', name: 'All Rooms' },
    { id: 'single', name: 'Single Room' },
    { id: 'double', name: 'Double Room' },
    { id: 'triple', name: 'Triple Room' },
    { id: 'suite', name: 'Suite' }
  ];

  const amenities = {
    wifi: { icon: Wifi, name: 'Free WiFi' },
    parking: { icon: Car, name: 'Parking' },
    kitchen: { icon: Coffee, name: 'Kitchen' },
    tv: { icon: Tv, name: 'TV' },
    ac: { icon: Wind, name: 'Air Conditioning' },
    security: { icon: Shield, name: '24/7 Security' }
  };

  const rooms = [
    {
      id: 1,
      name: 'Deluxe Single Room',
      type: 'single',
      price: 3500,
      originalPrice: 4000,
      capacity: 1,
      available: 5,
      total: 20,
      rating: 4.8,
      reviews: 124,
      image: 'single-room',
      location: 'Block A, Floor 1',
      amenities: ['wifi', 'ac', 'tv', 'security'],
      featured: true,
      description: 'Comfortable single room with modern amenities and study area'
    },
    {
      id: 2,
      name: 'Standard Double Room',
      type: 'double',
      price: 2500,
      originalPrice: 3000,
      capacity: 2,
      available: 8,
      total: 30,
      rating: 4.6,
      reviews: 89,
      image: 'double-room',
      location: 'Block B, Floor 2',
      amenities: ['wifi', 'ac', 'security'],
      featured: false,
      description: 'Spacious double room perfect for sharing with study desk and wardrobe'
    },
    {
      id: 3,
      name: 'Premium Triple Room',
      type: 'triple',
      price: 2000,
      originalPrice: 2400,
      capacity: 3,
      available: 3,
      total: 25,
      rating: 4.5,
      reviews: 67,
      image: 'triple-room',
      location: 'Block C, Floor 1',
      amenities: ['wifi', 'ac', 'kitchen', 'security'],
      featured: false,
      description: 'Economical triple sharing room with kitchenette and common area'
    },
    {
      id: 4,
      name: 'Executive Suite',
      type: 'suite',
      price: 8000,
      originalPrice: 10000,
      capacity: 2,
      available: 2,
      total: 10,
      rating: 4.9,
      reviews: 45,
      image: 'suite-room',
      location: 'Block D, Floor 3',
      amenities: ['wifi', 'ac', 'tv', 'kitchen', 'parking', 'security'],
      featured: true,
      description: 'Luxury suite with separate living area, kitchen, and premium amenities'
    },
    {
      id: 5,
      name: 'Budget Single Room',
      type: 'single',
      price: 2000,
      originalPrice: 2500,
      capacity: 1,
      available: 12,
      total: 40,
      rating: 4.2,
      reviews: 156,
      image: 'budget-single',
      location: 'Block E, Floor 1',
      amenities: ['wifi', 'security'],
      featured: false,
      description: 'Affordable single room with basic amenities and shared bathroom'
    },
    {
      id: 6,
      name: 'Comfort Double Room',
      type: 'double',
      price: 3000,
      originalPrice: 3500,
      capacity: 2,
      available: 6,
      total: 35,
      rating: 4.7,
      reviews: 98,
      image: 'comfort-double',
      location: 'Block A, Floor 3',
      amenities: ['wifi', 'ac', 'tv', 'security'],
      featured: false,
      description: 'Well-ventilated double room with balcony and study area'
    }
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesType = selectedType === 'all' || room.type === selectedType;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = room.price >= priceRange[0] && room.price <= priceRange[1];
    return matchesType && matchesSearch && matchesPrice;
  });

  const RoomCard = ({ room }) => {
    const [isLiked, setIsLiked] = useState(false);

    return (
      <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Room Image */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <Bed className="h-16 w-16 text-primary-400" />
          </div>
          
          {/* Featured Badge */}
          {room.featured && (
            <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
          
          {/* Like Button */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <Heart 
              className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-secondary-400'}`} 
            />
          </button>

          {/* Availability Badge */}
          <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-medium">
            {room.available > 0 ? (
              <span className="text-green-600">{room.available} Available</span>
            ) : (
              <span className="text-red-600">Fully Booked</span>
            )}
          </div>
        </div>

        {/* Room Details */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-1">{room.name}</h3>
              <div className="flex items-center text-secondary-500 text-sm mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {room.location}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-semibold text-secondary-900">{room.rating}</span>
              </div>
              <div className="text-xs text-secondary-500">({room.reviews} reviews)</div>
            </div>
          </div>

          <p className="text-secondary-600 text-sm mb-4 line-clamp-2">{room.description}</p>

          {/* Capacity & Availability */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-secondary-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{room.capacity} Person</span>
              </div>
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{room.available}/{room.total} Available</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {room.amenities.map((amenity, index) => {
              const IconComponent = amenities[amenity].icon;
              return (
                <div 
                  key={index}
                  className="flex items-center gap-1 text-xs text-secondary-600 bg-secondary-50 px-2 py-1 rounded"
                >
                  <IconComponent className="h-3 w-3" />
                  <span>{amenities[amenity].name}</span>
                </div>
              );
            })}
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-secondary-900">₹{room.price}</span>
                <span className="text-sm text-secondary-500 line-through">₹{room.originalPrice}</span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Save ₹{room.originalPrice - room.price}</span>
              </div>
              <div className="text-xs text-secondary-500">per month</div>
            </div>
            <Link 
              to={`/contact?room=${room.id}`}
              className="btn-primary flex items-center gap-2"
            >
              Book Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Available Rooms</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Find your perfect accommodation from our wide range of comfortable and affordable rooms
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left Sidebar Filters */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-secondary-900">Filters</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSearchTerm('');
                  setPriceRange([0, 10000]);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear All
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <label className="form-label">Search Rooms</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 pr-4"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Room Type Filter */}
            <div className="mb-6">
              <label className="form-label">Room Type</label>
              <div className="space-y-2">
                {roomTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === type.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="form-label">Max Price</label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-secondary-600">
                  <span>₹0</span>
                  <span className="font-semibold text-primary-600">₹{priceRange[1]}</span>
                  <span>₹10,000</span>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mb-6">
              <label className="form-label">Quick Filters</label>
              <div className="space-y-2">
                <button
                  onClick={() => setPriceRange([0, 2500])}
                  className="w-full text-left px-4 py-2 text-sm bg-secondary-100 text-secondary-700 hover:bg-secondary-200 rounded-lg transition-colors"
                >
                  Budget (₹0-2.5k)
                </button>
                <button
                  onClick={() => setPriceRange([2500, 5000])}
                  className="w-full text-left px-4 py-2 text-sm bg-secondary-100 text-secondary-700 hover:bg-secondary-200 rounded-lg transition-colors"
                >
                  Mid-range (₹2.5-5k)
                </button>
                <button
                  onClick={() => setPriceRange([5000, 10000])}
                  className="w-full text-left px-4 py-2 text-sm bg-secondary-100 text-secondary-700 hover:bg-secondary-200 rounded-lg transition-colors"
                >
                  Premium (₹5-10k)
                </button>
                <button
                  onClick={() => {
                    setSelectedType('all');
                    setPriceRange([0, 10000]);
                  }}
                  className="w-full text-left px-4 py-2 text-sm bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg transition-colors"
                >
                  Available Only
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Room Cards */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-secondary-600">
              Showing <span className="font-semibold text-secondary-900">{filteredRooms.length}</span> rooms
            </p>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-secondary-400" />
              <span className="text-sm text-secondary-600">Filters applied</span>
            </div>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bed className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">No rooms found</h3>
              <p className="text-secondary-600">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms;
