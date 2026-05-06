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
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      console.error('Dashboard data fetch error:', err);
      // Don't set error message for 401 as it will be handled by interceptor
      if (err.response?.status !== 401) {
        setError('Failed to load dashboard data');
      }
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
    <div className=" mx-auto space-y-6">
              {/* User Details Card */}
              <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user?.name || 'Student'}!</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{user?.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{user?.role || 'Student'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">Application Status</p>
                  <p className="text-gray-800 text-2xl font-bold">{getStatusBadge(student?.applicationStatus)}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">Complaints</p>
                  <p className="text-gray-800 text-2xl font-bold">{stats?.complaintCount || 0}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">Fee Status</p>
                  <div className="text-gray-800 font-semibold">{getStatusBadge(student?.feeStatus)}</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <Bed className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">Room</p>
                  <p className="text-gray-800 text-2xl font-bold">{student?.roomNumber || 'Not Assigned'}</p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Room & Hostel Info */}
                  {student?.hostel && (
                    <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Current Allocation</h3>
                          <p className="text-gray-600 text-sm">Your hostel and room details</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <p className="text-gray-600 text-sm mb-2">Hostel</p>
                          <p className="text-gray-800 font-bold text-lg">{student.hostel.name}</p>
                          <p className="text-gray-500 text-sm">{student.hostel.code}</p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <p className="text-gray-600 text-sm mb-2">Room</p>
                          <p className="text-gray-800 font-bold text-lg">{student.room?.roomNumber || 'N/A'}</p>
                          <p className="text-gray-500 text-sm capitalize">{student.room?.type || 'Not allocated'} Room</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fee Summary */}
                  <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Fee Summary</h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/student/fees')}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        View All
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                        <p className="text-green-600 text-sm font-medium mb-2">Paid</p>
                        <p className="text-gray-800 text-2xl font-bold">₹{stats?.paidFees?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
                        <p className="text-red-600 text-sm font-medium mb-2">Pending</p>
                        <p className="text-gray-800 text-2xl font-bold">₹{stats?.pendingFees?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
                        <p className="text-blue-600 text-sm font-medium mb-2">Total</p>
                        <p className="text-gray-800 text-2xl font-bold">₹{stats?.totalFees?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Notifications */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Notifications</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/student/notifications')}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        View All
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {notifications?.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 rounded-xl border transition-all duration-200 ${
                              notification.isRead 
                                ? 'bg-gray-50 border-gray-200' 
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                notification.isRead ? 'bg-gray-400' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm line-clamp-1 ${
                                  notification.isRead ? 'text-gray-600' : 'text-gray-800'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-gray-500 text-xs line-clamp-2 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-gray-400 text-xs mt-2">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No notifications</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="justify-center border-blue-200 text-blue-600 hover:bg-blue-50 flex flex-col gap-2 py-4 h-auto"
                    leftIcon={FileText}
                    onClick={() => navigate('/student/application')}
                  >
                    <span className="text-sm">Application</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-center border-green-200 text-green-600 hover:bg-green-50 flex flex-col gap-2 py-4 h-auto"
                    leftIcon={MessageSquare}
                    onClick={() => navigate('/student/complaints')}
                  >
                    <span className="text-sm">Complaints</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-center border-purple-200 text-purple-600 hover:bg-purple-50 flex flex-col gap-2 py-4 h-auto"
                    leftIcon={CreditCard}
                    onClick={() => navigate('/student/fees')}
                  >
                    <span className="text-sm">Fees</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-center border-orange-200 text-orange-600 hover:bg-orange-50 flex flex-col gap-2 py-4 h-auto"
                    leftIcon={User}
                    onClick={() => navigate('/student/profile')}
                  >
                    <span className="text-sm">Profile</span>
                  </Button>
                </div>
              </div>
            </div>
  );
};

export default StudentDashboard;
