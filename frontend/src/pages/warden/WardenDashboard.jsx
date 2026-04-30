import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  DoorOpen,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Bed,
  Clock,
  UserCheck,
  Wrench,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { wardenAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

const WardenDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await wardenAPI.getDashboard();
      setData(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      submitted: { variant: 'info', label: 'New' },
      under_review: { variant: 'warning', label: 'Review' },
      in_progress: { variant: 'warning', label: 'In Progress' },
      resolved: { variant: 'success', label: 'Resolved' },
      closed: { variant: 'secondary', label: 'Closed' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500/20 border border-red-500/30 backdrop-blur-sm text-red-200 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  const { hostels, recentComplaints, recentAllocations } = data || {};

  // Calculate totals
  const totalStats = hostels?.reduce((acc, hostel) => ({
    totalRooms: acc.totalRooms + hostel.stats.totalRooms,
    totalCapacity: acc.totalCapacity + hostel.stats.totalCapacity,
    occupiedSeats: acc.occupiedSeats + hostel.stats.occupiedSeats,
    availableSeats: acc.availableSeats + hostel.stats.availableSeats,
    students: acc.students + hostel.stats.students,
    pendingComplaints: acc.pendingComplaints + hostel.stats.pendingComplaints,
  }), {
    totalRooms: 0,
    totalCapacity: 0,
    occupiedSeats: 0,
    availableSeats: 0,
    students: 0,
    pendingComplaints: 0,
  }) || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-lg rounded-2xl p-6 border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Warden Dashboard</h1>
            <p className="text-emerald-200">Manage your assigned hostels and students</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-500/10 backdrop-blur-lg rounded-2xl p-6 border border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Building2 className="h-6 w-6 text-emerald-300" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-emerald-200 text-sm mb-2">My Hostels</p>
          <p className="text-white text-2xl font-bold">{hostels?.length || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Users className="h-6 w-6 text-green-300" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-green-200 text-sm mb-2">Students</p>
          <p className="text-white text-2xl font-bold">{totalStats.students || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <DoorOpen className="h-6 w-6 text-blue-300" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-blue-200 text-sm mb-2">Total Rooms</p>
          <p className="text-white text-2xl font-bold">{totalStats.totalRooms || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-orange-500/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30 hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <MessageSquare className="h-6 w-6 text-red-300" />
            </div>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-red-200 text-sm mb-2">Pending Complaints</p>
          <p className="text-white text-2xl font-bold">{totalStats.pendingComplaints || 0}</p>
        </div>
      </div>

      {/* Hostel Summary */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostels?.map((hostel) => (
          <div key={hostel.id} className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 backdrop-blur-lg rounded-2xl p-6 border border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <Building2 className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{hostel.name}</h3>
                  <p className="text-emerald-200 text-sm">{hostel.code}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium capitalize">
                {hostel.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-emerald-200 text-sm mb-1">Occupancy</p>
                <p className="text-white text-lg font-bold">{hostel.stats.occupancyRate}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-emerald-200 text-sm mb-1">Available</p>
                <p className="text-green-300 text-lg font-bold">{hostel.stats.availableSeats}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-200 text-sm">Occupied Seats</span>
                <span className="text-white font-semibold">
                  {hostel.stats.occupiedSeats} / {hostel.stats.totalCapacity}
                </span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  style={{ width: `${hostel.stats.occupancyRate}%` }}
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/warden/rooms')}
              className="w-full text-emerald-300 hover:text-white hover:bg-white/10"
            >
              Manage Rooms
            </Button>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-gradient-to-br from-red-600/10 to-orange-600/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <MessageSquare className="h-6 w-6 text-red-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Recent Complaints</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/warden/complaints')}
              className="text-red-300 hover:text-white hover:bg-white/10"
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentComplaints?.length > 0 ? (
              recentComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/warden/complaints/${complaint._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        complaint.priority === 'urgent' ? 'bg-red-500/20' :
                        complaint.priority === 'high' ? 'bg-orange-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        <AlertCircle className={`h-5 w-5 ${
                          complaint.priority === 'urgent' ? 'text-red-300' :
                          complaint.priority === 'high' ? 'text-orange-300' :
                          'text-blue-300'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{complaint.title}</p>
                        <p className="text-sm text-red-200 capitalize">
                          {complaint.category} • Room {complaint.room?.roomNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(complaint.status)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
                <p className="text-red-200 text-lg">No pending complaints!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Allocations */}
        <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <UserCheck className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Recent Allocations</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/warden/students')}
              className="text-green-300 hover:text-white hover:bg-white/10"
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentAllocations?.length > 0 ? (
              recentAllocations.map((student) => (
                <div
                  key={student._id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {student.user?.name}
                        </p>
                        <p className="text-sm text-green-200">
                          {student.rollNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        Room {student.room?.roomNumber}
                      </p>
                      <p className="text-xs text-green-200">
                        {student.hostel?.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-green-200 py-8">No recent allocations</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 backdrop-blur-lg rounded-2xl p-6 border border-emerald-500/30">
        <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="justify-center bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            leftIcon={Building2}
            onClick={() => navigate('/warden/hostels')}
          >
            View Hostels
          </Button>
          <Button
            variant="outline"
            className="justify-center bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            leftIcon={DoorOpen}
            onClick={() => navigate('/warden/rooms')}
          >
            Manage Rooms
          </Button>
          <Button
            variant="outline"
            className="justify-center bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            leftIcon={Users}
            onClick={() => navigate('/warden/students')}
          >
            View Students
          </Button>
          <Button
            variant="outline"
            className="justify-center bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            leftIcon={Wrench}
            onClick={() => navigate('/warden/complaints')}
          >
            Handle Complaints
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
