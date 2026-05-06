import React, { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

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

  ArrowLeft,

  Loader2,

  Heart,

  Share2,

  Check,

  Calendar,

  Home

} from 'lucide-react';

import { roomAPI } from '../../services/api';

import { useAuth } from '../../context/AuthContext';



const RoomDetail = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [room, setRoom] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [selectedImage, setSelectedImage] = useState(0);

  const [isLiked, setIsLiked] = useState(false);



  useEffect(() => {

    fetchRoomDetail();

  }, [id]);



  const fetchRoomDetail = async () => {

    try {

      setLoading(true);

      const response = await roomAPI.getById(id);

      setRoom(response.data.data);

      setError('');

    } catch (err) {

      setError('Failed to load room details. Please try again later.');

      console.error('Error fetching room:', err);

    } finally {

      setLoading(false);

    }

  };



  const handleBookNow = () => {
    if (!user) {
      // Redirect to login with application redirect and current room data
      navigate('/login', { 
        state: { 
          redirect: '/student/application',
          selectedRoom: room,
          selectedRoomId: room._id
        }
      });
      return;
    }

    // If user is logged in, navigate to application with room data
    navigate('/student/application', { 
      state: { 
        selectedRoom: room,
        selectedRoomId: room._id
      }
    });
  };



  const amenities = {

    wifi: { icon: Wifi, name: 'Free WiFi' },

    parking: { icon: Car, name: 'Parking' },

    kitchen: { icon: Coffee, name: 'Kitchen' },

    tv: { icon: Tv, name: 'TV' },

    ac: { icon: Wind, name: 'Air Conditioning' },

    security: { icon: Shield, name: '24/7 Security' }

  };



  const featureList = [

    { key: 'ac', label: 'Air Conditioning', icon: Wind },

    { key: 'wifi', label: 'Free WiFi', icon: Wifi },

    { key: 'attachedBathroom', label: 'Attached Bathroom', icon: Home },

    { key: 'furnished', label: 'Fully Furnished', icon: Bed },

    { key: 'tv', label: 'Television', icon: Tv },

    { key: 'parking', label: 'Parking Available', icon: Car },

    { key: 'kitchen', label: 'Kitchen Access', icon: Coffee },

    { key: 'security', label: '24/7 Security', icon: Shield }

  ];



  if (loading) {

    return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />

          <p className="text-gray-600">Loading room details...</p>

        </div>

      </div>

    );

  }



  if (error || !room) {

    return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

        <div className="text-center max-w-md">

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">

            <p className="text-red-600 mb-4">{error || 'Room not found'}</p>

            <button

              onClick={() => navigate('/rooms')}

              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"

            >

              Back to Rooms

            </button>

          </div>

        </div>

      </div>

    );

  }



  const roomName = room.roomNumber || room.name || 'Room';

  const roomType = room.type || 'standard';

  const roomCapacity = room.capacity || 1;

  const roomTotal = room.capacity || 1;

  const roomAvailable = room.capacity - (room.occupiedSeats || 0);

  const roomPrice = room.price || room.rentPerMonth || 0;

  const roomLocation = `Floor ${room.floor || 1}`;

  const roomDescription = room.description || 'Comfortable and well-maintained room with modern amenities.';

  const images = room.images && room.images.length > 0 ? room.images : [];



  return (

    <div className="min-h-screen bg-gray-50">

      {/* Top Navigation */}

      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

          <button

            onClick={() => navigate('/rooms')}

            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"

          >

            <ArrowLeft className="h-5 w-5" />

            <span className="font-medium">Back to Rooms</span>

          </button>

        </div>

      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>

            <div className="flex items-center gap-3 mb-2">

              <h1 className="text-3xl font-bold text-gray-900">{roomName}</h1>

              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">

                {roomType}

              </span>

            </div>

            <div className="flex items-center text-gray-500">

              <MapPin className="h-4 w-4 mr-1" />

              <span>{roomLocation}</span>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <button

              onClick={() => setIsLiked(!isLiked)}

              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"

            >

              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />

              <span className="text-sm font-medium">Save</span>

            </button>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">

              <Share2 className="h-5 w-5 text-gray-500" />

              <span className="text-sm font-medium">Share</span>

            </button>

          </div>

        </div>



        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column - Images & Details */}

          <div className="lg:col-span-2 space-y-8">

            {/* Image Gallery */}

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">

              {images.length > 0 ? (

                <>

                  <div className="relative h-96">

                    <img

                      src={`http://localhost:5000${images[selectedImage]}`}

                      alt={roomName}

                      className="w-full h-full object-cover"

                    />

                  </div>

                  {images.length > 1 && (

                    <div className="flex gap-2 p-4 overflow-x-auto">

                      {images.map((img, index) => (

                        <button

                          key={index}

                          onClick={() => setSelectedImage(index)}

                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${

                            selectedImage === index ? 'border-blue-500' : 'border-transparent'

                          }`}

                        >

                          <img

                            src={`http://localhost:5000${img}`}

                            alt={`${roomName} ${index + 1}`}

                            className="w-full h-full object-cover"

                          />

                        </button>

                      ))}

                    </div>

                  )}

                </>

              ) : (

                <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">

                  <Bed className="h-24 w-24 text-blue-300" />

                </div>

              )}

            </div>



            {/* Description */}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

              <h2 className="text-xl font-bold text-gray-900 mb-4">About this room</h2>

              <p className="text-gray-600 leading-relaxed">{roomDescription}</p>

            </div>



            {/* Features */}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

              <h2 className="text-xl font-bold text-gray-900 mb-4">Room Features</h2>

              <div className="grid sm:grid-cols-2 gap-4">

                {featureList.map((feature) => {

                  const hasFeature = room.features?.[feature.key];

                  const Icon = feature.icon;

                  return (

                    <div

                      key={feature.key}

                      className={`flex items-center gap-3 p-4 rounded-xl ${

                        hasFeature ? 'bg-green-50' : 'bg-gray-50 opacity-50'

                      }`}

                    >

                      <div className={`p-2 rounded-lg ${hasFeature ? 'bg-green-100' : 'bg-gray-100'}`}>

                        <Icon className={`h-5 w-5 ${hasFeature ? 'text-green-600' : 'text-gray-400'}`} />

                      </div>

                      <div className="flex-1">

                        <span className={`font-medium ${hasFeature ? 'text-gray-900' : 'text-gray-400'}`}>

                          {feature.label}

                        </span>

                      </div>

                      {hasFeature && <Check className="h-5 w-5 text-green-500" />}

                    </div>

                  );

                })}

              </div>

            </div>



            {/* Room Stats */}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

              <h2 className="text-xl font-bold text-gray-900 mb-4">Room Information</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                <div className="text-center p-4 bg-gray-50 rounded-xl">

                  <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />

                  <div className="text-lg font-bold text-gray-900">{roomCapacity}</div>

                  <div className="text-sm text-gray-500">Capacity</div>

                </div>

                <div className="text-center p-4 bg-gray-50 rounded-xl">

                  <Bed className="h-6 w-6 text-green-500 mx-auto mb-2" />

                  <div className="text-lg font-bold text-gray-900">{roomAvailable}</div>

                  <div className="text-sm text-gray-500">Available</div>

                </div>

                <div className="text-center p-4 bg-gray-50 rounded-xl">

                  <Home className="h-6 w-6 text-purple-500 mx-auto mb-2" />

                  <div className="text-lg font-bold text-gray-900">{roomTotal}</div>

                  <div className="text-sm text-gray-500">Total Beds</div>

                </div>

                <div className="text-center p-4 bg-gray-50 rounded-xl">

                  <MapPin className="h-6 w-6 text-orange-500 mx-auto mb-2" />

                  <div className="text-lg font-bold text-gray-900">{room.floor || 1}</div>

                  <div className="text-sm text-gray-500">Floor</div>

                </div>

              </div>

            </div>

          </div>



          {/* Right Column - Pricing & Booking */}

          <div className="lg:col-span-1">

            <div className="sticky top-24 space-y-4">

              {/* Price Card */}

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

                <div className="mb-6">

                  <div className="flex items-baseline gap-2 mb-1">

                    <span className="text-4xl font-bold text-gray-900">PKR {roomPrice}</span>

                    <span className="text-gray-500">/month</span>

                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">

                    <Calendar className="h-4 w-4" />

                    <span>Monthly rental</span>

                  </div>

                </div>



                <div className="space-y-3 mb-6">

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-600">Room Type</span>

                    <span className="font-medium capitalize">{roomType}</span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-600">Floor</span>

                    <span className="font-medium">{room.floor || 1}</span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-600">Available Beds</span>

                    <span className="font-medium text-green-600">{roomAvailable} / {roomTotal}</span>

                  </div>

                </div>



                <button

                  onClick={handleBookNow}

                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"

                >

                  {user ? 'Book Now' : 'Book Now'}

                </button>



                {roomAvailable === 0 && (

                  <p className="text-center text-red-500 text-sm mt-3">This room is fully booked</p>

                )}

              </div>



              {/* Availability Status */}

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

                <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>

                <div className="space-y-3">

                  <div>

                    <div className="flex justify-between text-sm mb-1">

                      <span className="text-gray-600">Occupied</span>

                      <span className="font-medium">{roomTotal - roomAvailable} beds</span>

                    </div>

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

                      <div

                        className="h-full bg-gray-400 rounded-full"

                        style={{ width: `${((roomTotal - roomAvailable) / roomTotal) * 100}%` }}

                      />

                    </div>

                  </div>

                  <div>

                    <div className="flex justify-between text-sm mb-1">

                      <span className="text-gray-600">Available</span>

                      <span className="font-medium text-green-600">{roomAvailable} beds</span>

                    </div>

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

                      <div

                        className="h-full bg-green-500 rounded-full"

                        style={{ width: `${(roomAvailable / roomTotal) * 100}%` }}

                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};



export default RoomDetail;

