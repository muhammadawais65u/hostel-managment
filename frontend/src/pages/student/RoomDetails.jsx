import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bed,
  Building2,
  Users,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Home,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const RoomDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  const fetchRoomDetails = async () => {
    try {
      const response = await studentAPI.getRoomDetails();
      setRoomData(response.data.data);
    } catch (err) {
      setError('Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Room Details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/30 backdrop-blur-sm text-red-200 px-6 py-4 rounded-xl">
            {error}
          </div>
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
            <h1 className="text-4xl font-bold text-white mb-2">Room Details</h1>
            <p className="text-purple-200">Your current room allocation and information</p>
          </div>

          {roomData?.room ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Room Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Room Card */}
                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-purple-500/20 rounded-2xl">
                        <Bed className="h-8 w-8 text-purple-300" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Room {roomData.room.roomNumber}</h2>
                        <p className="text-purple-200 capitalize">{roomData.room.type} Room</p>
                      </div>
                    </div>
                    <Badge variant="success">Allocated</Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-purple-200 text-sm mb-2">Floor</p>
                        <p className="text-white text-xl font-semibold">{roomData.room.floor}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-purple-200 text-sm mb-2">Capacity</p>
                        <p className="text-white text-xl font-semibold">{roomData.room.capacity} Students</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-purple-200 text-sm mb-2">Occupied</p>
                        <p className="text-white text-xl font-semibold">{roomData.room.occupied} Students</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-purple-200 text-sm mb-2">Available</p>
                        <p className="text-white text-xl font-semibold">{roomData.room.capacity - roomData.room.occupied} Beds</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hostel Information */}
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-blue-500/20 rounded-2xl">
                      <Building2 className="h-8 w-8 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Hostel Information</h3>
                      <p className="text-blue-200">Your hostel building details</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-blue-200 text-sm mb-2">Hostel Name</p>
                        <p className="text-white text-lg font-semibold">{roomData.hostel.name}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-blue-200 text-sm mb-2">Code</p>
                        <p className="text-white text-lg font-semibold">{roomData.hostel.code}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-blue-200 text-sm mb-2">Warden</p>
                        <p className="text-white text-lg font-semibold">{roomData.hostel.warden?.name || 'N/A'}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-blue-200 text-sm mb-2">Contact</p>
                        <p className="text-white text-lg font-semibold">{roomData.hostel.warden?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roommates */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-green-500/20 rounded-2xl">
                      <Users className="h-8 w-8 text-green-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Roommates</h3>
                      <p className="text-green-200">Your room partners</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {roomData.roommates?.length > 0 ? (
                      roomData.roommates.map((roommate, index) => (
                        <div key={roommate._id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-semibold">{roommate.name}</p>
                                <p className="text-green-200 text-sm">{roommate.rollNumber}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-green-200 text-sm">{roommate.department}</p>
                              <p className="text-green-300 text-xs">{roommate.year} Year</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-green-200 py-8">No roommates assigned yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-red-600/20 to-orange-600/10 backdrop-blur-lg rounded-2xl p-12 border border-red-500/30 text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bed className="h-10 w-10 text-red-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Room Allocated</h3>
              <p className="text-red-200 mb-6">You haven't been allocated a room yet. Please complete your hostel application first.</p>
              <Button
                onClick={() => navigate('/student/application')}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0"
              >
                Apply for Hostel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
