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
  Loader2
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
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="error" title="Error">{error}</Alert>
      </div>
    );
  }

  const { student, stats, notifications } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Student Dashboard</h1>
          <p className="text-secondary-600 mt-1">
            Welcome back, {student?.user?.name || 'Student'}
          </p>
        </div>
        {student?.applicationStatus === 'none' && (
          <Button
            onClick={() => navigate('/student/application')}
            rightIcon={ArrowRight}
          >
            Apply for Hostel
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="normal" className="border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Application Status</p>
              <div className="mt-2">{getStatusBadge(student?.applicationStatus)}</div>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Complaints</p>
              <p className="mt-2 text-2xl font-bold text-secondary-900">{stats?.complaintCount || 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Fee Status</p>
              <div className="mt-2">{getStatusBadge(student?.feeStatus)}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Room</p>
              <p className="mt-2 text-lg font-semibold text-secondary-900">
                {student?.room?.roomNumber || 'Not Allocated'}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Bed className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Room & Hostel Info */}
        <div className="lg:col-span-2 space-y-6">
          {student?.hostel && (
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">Current Allocation</h3>
                  <p className="text-sm text-secondary-500">Your hostel and room details</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <p className="text-sm text-secondary-500 mb-1">Hostel</p>
                  <p className="font-semibold text-secondary-900">{student.hostel.name}</p>
                  <p className="text-sm text-secondary-600">{student.hostel.code}</p>
                </div>

                <div className="p-4 bg-secondary-50 rounded-lg">
                  <p className="text-sm text-secondary-500 mb-1">Room</p>
                  <p className="font-semibold text-secondary-900">{student.room?.roomNumber || 'N/A'}</p>
                  <p className="text-sm text-secondary-600 capitalize">
                    {student.room?.type || 'Not allocated'} Room
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Fee Summary */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">Fee Summary</h3>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/student/fees')}
              >
                View All
              </Button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Paid</p>
                <p className="text-2xl font-bold text-green-700">₹{stats?.paidFees?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-red-700">₹{stats?.pendingFees?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-700">₹{stats?.totalFees?.toLocaleString() || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Notifications */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-secondary-500" />
                <h3 className="font-semibold text-secondary-900">Notifications</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/student/notifications')}
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {notifications?.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg border ${
                      notification.isRead ? 'bg-white border-secondary-100' : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notification.isRead ? 'bg-secondary-300' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-900 line-clamp-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-secondary-500 line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-secondary-400 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-secondary-500 py-4">No notifications</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="font-semibold text-secondary-900 mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="justify-start"
            leftIcon={FileText}
            onClick={() => navigate('/student/application')}
          >
            My Application
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            leftIcon={MessageSquare}
            onClick={() => navigate('/student/complaints')}
          >
            Submit Complaint
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            leftIcon={CreditCard}
            onClick={() => navigate('/student/fees')}
          >
            Pay Fees
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            leftIcon={Building2}
            onClick={() => navigate('/student/profile')}
          >
            Edit Profile
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;
