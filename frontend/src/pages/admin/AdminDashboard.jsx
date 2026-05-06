import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  DoorOpen,
  FileText,
  MessageSquare,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Loader2
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setData(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
      submitted: { variant: 'info', label: 'New' },
      in_progress: { variant: 'warning', label: 'In Progress' },
      resolved: { variant: 'success', label: 'Resolved' },
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

  const { stats, recentApplications, recentComplaints } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-blue-200">Overview of room management system</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/admin/room-requests')}
              leftIcon={FileText}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg"
            >
              Room Requests
            </Button>
            <Button
              onClick={() => navigate('/admin/rooms')}
              leftIcon={DoorOpen}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg"
            >
              Manage Rooms
            </Button>
            <Button
              onClick={() => navigate('/admin/users')}
              leftIcon={UserPlus}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg"
            >
              Manage Users
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="h-6 w-6 text-blue-300" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-blue-200 text-sm mb-2">Total Students</p>
          <p className="text-white text-2xl font-bold">{stats?.totalStudents || 0}</p>
        </div>

        
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <DoorOpen className="h-6 w-6 text-purple-300" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-purple-200 text-sm mb-2">Total Rooms</p>
          <p className="text-white text-2xl font-bold">{stats?.totalRooms || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-red-500/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Activity className="h-6 w-6 text-orange-300" />
            </div>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-orange-200 text-sm mb-2">Occupancy</p>
          <p className="text-white text-2xl font-bold">{stats?.occupancyRate || 0}%</p>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          className="bg-gradient-to-br from-yellow-600/20 to-amber-500/10 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30 cursor-pointer hover:shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300"
          onClick={() => navigate('/admin/applications')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm mb-2">Pending Applications</p>
              <p className="text-white text-2xl font-bold">{stats?.pendingApplications || 0}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <FileText className="h-8 w-8 text-yellow-300" />
            </div>
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-red-600/20 to-orange-500/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30 cursor-pointer hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300"
          onClick={() => navigate('/admin/complaints')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm mb-2">Pending Complaints</p>
              <p className="text-white text-2xl font-bold">{stats?.pendingComplaints || 0}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <MessageSquare className="h-8 w-8 text-red-300" />
            </div>
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-orange-600/20 to-pink-500/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30 cursor-pointer hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
          onClick={() => navigate('/admin/fees')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm mb-2">Pending Fees</p>
              <p className="text-white text-2xl font-bold">{stats?.pendingFees || 0}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <CreditCard className="h-8 w-8 text-orange-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FileText className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Recent Applications</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/admin/applications')}
              className="text-blue-300 hover:text-white hover:bg-white/10"
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentApplications?.length > 0 ? (
              recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/admin/applications/${app._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {app.student?.user?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-blue-200">
                          Room Application
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(app.status)}
                      <span className="text-xs text-blue-300">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-blue-200 py-8">No recent applications</p>
            )}
          </div>
        </div>

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
              onClick={() => navigate('/admin/complaints')}
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
                  onClick={() => navigate(`/admin/complaints/${complaint._id}`)}
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
                          {complaint.category}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-red-200 py-8">No recent complaints</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
