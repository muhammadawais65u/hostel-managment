import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  CreditCard,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Bed,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Loader2,
  User
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await studentAPI.getDashboard();
      setData(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      none: { variant: 'secondary', label: 'Not Applied' },
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
      paid: { variant: 'success', label: 'Paid' },
      unpaid: { variant: 'danger', label: 'Unpaid' },
      partial: { variant: 'warning', label: 'Partial' },
    };
    const config = variants[status] || variants.none;
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

  const { student, stats, notifications } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {student?.user?.name || 'Student'}!</h1>
                    <p className="text-purple-200">Here's what's happening with your hostel accommodation today.</p>
                  </div>
                  {student?.applicationStatus === 'none' && (
                    <Button
                      onClick={() => navigate('/student/application')}
                      rightIcon={ArrowRight}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg"
                    >
                      Apply for Hostel
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <FileText className="h-6 w-6 text-purple-300" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-purple-200 text-sm mb-2">Application Status</p>
                  <div className="text-white font-semibold">{getStatusBadge(student?.applicationStatus)}</div>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <MessageSquare className="h-6 w-6 text-green-300" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-green-200 text-sm mb-2">Complaints</p>
                  <p className="text-white text-2xl font-bold">{stats?.complaintCount || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <CreditCard className="h-6 w-6 text-blue-300" />
                    </div>
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  </div>
                  <p className="text-blue-200 text-sm mb-2">Fee Status</p>
                  <div className="text-white font-semibold">{getStatusBadge(student?.feeStatus)}</div>
                </div>

                <div className="bg-gradient-to-br from-pink-600/20 to-rose-500/10 backdrop-blur-lg rounded-2xl p-6 border border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-pink-500/20 rounded-xl">
                      <Bed className="h-6 w-6 text-pink-300" />
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-pink-200 text-sm mb-2">Room</p>
                  <p className="text-white text-xl font-bold">{student?.room?.roomNumber || 'Not Allocated'}</p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Room & Hostel Info */}
                  {student?.hostel && (
                    <div className="bg-gradient-to-br from-purple-600/10 to-indigo-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                          <Building2 className="h-6 w-6 text-purple-300" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Current Allocation</h3>
                          <p className="text-purple-200 text-sm">Your hostel and room details</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <p className="text-purple-200 text-sm mb-2">Hostel</p>
                          <p className="text-white font-bold text-lg">{student.hostel.name}</p>
                          <p className="text-purple-300 text-sm">{student.hostel.code}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <p className="text-purple-200 text-sm mb-2">Room</p>
                          <p className="text-white font-bold text-lg">{student.room?.roomNumber || 'N/A'}</p>
                          <p className="text-purple-300 text-sm capitalize">{student.room?.type || 'Not allocated'} Room</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fee Summary */}
                  <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                          <CreditCard className="h-6 w-6 text-blue-300" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Fee Summary</h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/student/fees')}
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                      >
                        View All
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30 text-center">
                        <p className="text-green-300 text-sm font-medium mb-2">Paid</p>
                        <p className="text-white text-2xl font-bold">₹{stats?.paidFees?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30 text-center">
                        <p className="text-red-300 text-sm font-medium mb-2">Pending</p>
                        <p className="text-white text-2xl font-bold">₹{stats?.pendingFees?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 text-center">
                        <p className="text-blue-300 text-sm font-medium mb-2">Total</p>
                        <p className="text-white text-2xl font-bold">₹{stats?.totalFees?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Notifications */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-purple-300" />
                        <h3 className="text-xl font-bold text-white">Notifications</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/student/notifications')}
                        className="text-purple-300 hover:text-white hover:bg-white/10"
                      >
                        View All
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {notifications?.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 ${
                              notification.isRead 
                                ? 'bg-white/10 border-white/20' 
                                : 'bg-purple-500/20 border-purple-500/30'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                notification.isRead ? 'bg-purple-400' : 'bg-purple-300'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm line-clamp-1">
                                  {notification.title}
                                </p>
                                <p className="text-purple-200 text-xs line-clamp-2 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-purple-300 text-xs mt-2">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-purple-200 py-8">No notifications</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-purple-600/10 to-indigo-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="justify-center bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                    leftIcon={FileText}
                    onClick={() => navigate('/student/application')}
                  >
                    Application
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-center bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                    leftIcon={MessageSquare}
                    onClick={() => navigate('/student/complaints')}
                  >
                    Complaints
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-center bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                    leftIcon={CreditCard}
                    onClick={() => navigate('/student/fees')}
                  >
                    Fees
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-center bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                    leftIcon={User}
                    onClick={() => navigate('/student/profile')}
                  >
                    Profile
                  </Button>
                </div>
              </div>
            </div>
  );
};

export default StudentDashboard;
