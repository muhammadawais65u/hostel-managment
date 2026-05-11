import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Clock,
  UserCheck,
  Wrench,
  TrendingUp,
  TrendingDown,
  Loader2,
  Send,
  Bell
} from 'lucide-react';
import { wardenAPI, complaintAPI } from '../../services/api';
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
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  const { recentComplaints, recentAllocations, stats } = data || {};

  return (
    <div className=" mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Warden Dashboard</h1>
            <p className="text-gray-600">Manage students and handle complaints</p>
          </div>
          <Button
            variant="ghost"
            leftIcon={Bell}
            onClick={() => navigate('/warden/notifications')}
            className="text-gray-600 hover:bg-gray-100"
          >
            Notifications
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm mb-2">Students</p>
          <p className="text-gray-800 text-2xl font-bold">{stats?.students || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <MessageSquare className="h-6 w-6 text-red-600" />
            </div>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-gray-600 text-sm mb-2">Pending Complaints</p>
          <p className="text-gray-800 text-2xl font-bold">{stats?.pendingComplaints || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm mb-2">Resolved Today</p>
          <p className="text-gray-800 text-2xl font-bold">{stats?.resolvedToday || 0}</p>
        </div>
      </div>

      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-xl">
                <MessageSquare className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Recent Complaints</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/warden/complaints')}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentComplaints?.length > 0 ? (
              recentComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/warden/complaints/${complaint._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        complaint.priority === 'urgent' ? 'bg-red-50' :
                        complaint.priority === 'high' ? 'bg-orange-50' :
                        'bg-blue-50'
                      }`}>
                        <AlertCircle className={`h-5 w-5 ${
                          complaint.priority === 'urgent' ? 'text-red-600' :
                          complaint.priority === 'high' ? 'text-orange-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{complaint.title}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {complaint.category}
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
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending complaints!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Allocations */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Recent Allocations</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/warden/students')}
              className="text-green-600 hover:text-green-800 hover:bg-green-50"
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentAllocations?.length > 0 ? (
              recentAllocations.map((student) => (
                <div
                  key={student._id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {student.user?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {student.rollNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        {student.rollNumber}
                      </p>
                      <p className="text-xs text-gray-600">
                        {student.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent allocations</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="justify-center border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            leftIcon={Users}
            onClick={() => navigate('/warden/students')}
          >
            View Students
          </Button>
          <Button
            variant="outline"
            className="justify-center border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            leftIcon={Wrench}
            onClick={() => navigate('/warden/complaints')}
          >
            Handle Complaints
          </Button>
          <Button
            variant="outline"
            className="justify-center border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            leftIcon={Bell}
            onClick={() => navigate('/warden/notifications')}
          >
            Notifications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
