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
  Wrench
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Warden Dashboard</h1>
        <p className="text-secondary-600 mt-1">
          Manage your assigned hostels and students
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="normal" className="border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">My Hostels</p>
              <p className="mt-2 text-2xl font-bold text-secondary-900">{hostels?.length || 0}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Students</p>
              <p className="mt-2 text-2xl font-bold text-secondary-900">{totalStats.students || 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Total Rooms</p>
              <p className="mt-2 text-2xl font-bold text-secondary-900">{totalStats.totalRooms || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DoorOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card padding="normal" className="border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-500">Pending Complaints</p>
              <p className="mt-2 text-2xl font-bold text-secondary-900">{totalStats.pendingComplaints || 0}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <MessageSquare className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Hostel Summary */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hostels?.map((hostel) => (
          <Card key={hostel.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">{hostel.name}</h3>
                  <p className="text-sm text-secondary-500">{hostel.code}</p>
                </div>
              </div>
              <Badge variant="secondary" className="capitalize">{hostel.type}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-secondary-50 rounded-lg text-center">
                <p className="text-sm text-secondary-500">Occupancy</p>
                <p className="text-lg font-bold text-secondary-900">{hostel.stats.occupancyRate}%</p>
              </div>
              <div className="p-3 bg-secondary-50 rounded-lg text-center">
                <p className="text-sm text-secondary-500">Available</p>
                <p className="text-lg font-bold text-green-600">{hostel.stats.availableSeats}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-600">
                {hostel.stats.occupiedSeats} / {hostel.stats.totalCapacity} occupied
              </span>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={ArrowRight}
                onClick={() => navigate('/warden/rooms')}
              >
                Manage Rooms
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
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
              onClick={() => navigate('/warden/complaints')}
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
                  onClick={() => navigate(`/warden/complaints/${complaint._id}`)}
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
                        {complaint.category} • Room {complaint.room?.roomNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(complaint.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-secondary-600">No pending complaints!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Allocations */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-secondary-500" />
              <h3 className="font-semibold text-secondary-900">Recent Allocations</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/warden/students')}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentAllocations?.length > 0 ? (
              recentAllocations.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">
                        {student.user?.name}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {student.rollNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-secondary-900">
                      Room {student.room?.roomNumber}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {student.hostel?.name}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-secondary-500 py-4">No recent allocations</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="font-semibold text-secondary-900 mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="justify-start"
            leftIcon={Building2}
            onClick={() => navigate('/warden/hostels')}
          >
            View Hostels
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            leftIcon={DoorOpen}
            onClick={() => navigate('/warden/rooms')}
          >
            Manage Rooms
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            leftIcon={Users}
            onClick={() => navigate('/warden/students')}
          >
            View Students
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            leftIcon={Wrench}
            onClick={() => navigate('/warden/complaints')}
          >
            Handle Complaints
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WardenDashboard;
