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
  Activity
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

  const { stats, recentApplications, recentComplaints, hostelStats } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
          <p className="text-secondary-600 mt-1">
            Overview of hostel management system
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/users')}
          leftIcon={UserPlus}
        >
          Manage Users
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="normal" className="border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Total Students</p>
              <p className="mt-2 text-2xl font-bold text-secondary-900">{stats?.totalStudents || 0}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Hostels</p>
              <p className="mt-2 text-2xl font-bold text-secondary-900">{stats?.totalHostels || 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Total Rooms</p>
              <p className="mt-2 text-2xl font-bold text-secondary-900">{stats?.totalRooms || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DoorOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Occupancy</p>
              <p className="mt-2 text-2xl font-bold text-secondary-900">{stats?.occupancyRate || 0}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/applications')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Pending Applications</p>
              <p className="mt-1 text-2xl font-bold text-secondary-900">{stats?.pendingApplications || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card
          className="border-l-4 border-l-red-500 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/complaints')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Pending Complaints</p>
              <p className="mt-1 text-2xl font-bold text-secondary-900">{stats?.pendingComplaints || 0}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card
          className="border-l-4 border-l-orange-500 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/fees')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Pending Fees</p>
              <p className="mt-1 text-2xl font-bold text-secondary-900">{stats?.pendingFees || 0}</p>
            </div>
            <CreditCard className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-secondary-500" />
              <h3 className="font-semibold text-secondary-900">Recent Applications</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/admin/applications')}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentApplications?.length > 0 ? (
              recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/applications/${app._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">
                        {app.student?.user?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {app.hostel?.name || 'Unknown Hostel'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(app.status)}
                    <span className="text-xs text-secondary-400">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-secondary-500 py-4">No recent applications</p>
            )}
          </div>
        </Card>

        {/* Recent Complaints */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-secondary-500" />
              <h3 className="font-semibold text-secondary-900">Recent Complaints</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/admin/complaints')}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentComplaints?.length > 0 ? (
              recentComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/complaints/${complaint._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      complaint.priority === 'urgent' ? 'bg-red-100' :
                      complaint.priority === 'high' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      <AlertCircle className={`h-5 w-5 ${
                        complaint.priority === 'urgent' ? 'text-red-600' :
                        complaint.priority === 'high' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-secondary-900 truncate">{complaint.title}</p>
                      <p className="text-sm text-secondary-500 capitalize">
                        {complaint.category} • {complaint.hostel?.name}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(complaint.status)}
                </div>
              ))
            ) : (
              <p className="text-center text-secondary-500 py-4">No recent complaints</p>
            )}
          </div>
        </Card>
      </div>

      {/* Hostel Stats */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-secondary-500" />
            <h3 className="font-semibold text-secondary-900">Hostel Occupancy Overview</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/hostels')}
          >
            Manage Hostels
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Hostel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Occupied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Occupancy Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {hostelStats?.map((hostel) => (
                <tr key={hostel.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-secondary-900">{hostel.name}</p>
                    <p className="text-sm text-secondary-500">{hostel.code}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary" className="capitalize">
                      {hostel.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-secondary-700">
                    {hostel.capacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-secondary-700">
                    {hostel.occupied}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-secondary-700">
                    {hostel.available}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            hostel.occupancyRate > 90 ? 'bg-red-500' :
                            hostel.occupancyRate > 70 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${hostel.occupancyRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-secondary-700">
                        {hostel.occupancyRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
