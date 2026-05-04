import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  UserCog
} from 'lucide-react';
import { adminAPI, authAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const UserManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    if (!selectedUser) return;

    setRoleChangeLoading(true);
    try {
      const response = await authAPI.changeRole({
        userId: selectedUser._id,
        newRole
      });

      if (response.data.success) {
        // Update users list
        setUsers(users.map(user => 
          user._id === selectedUser._id 
            ? { ...user, role: newRole }
            : user
        ));
        
        setShowRoleModal(false);
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Failed to change role:', err);
    } finally {
      setRoleChangeLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'danger', label: 'Inactive' },
      pending: { variant: 'warning', label: 'Pending' },
      suspended: { variant: 'secondary', label: 'Suspended' }
    };
    return variants[status] || variants.pending;
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: { variant: 'danger', label: 'Admin' },
      warden: { variant: 'warning', label: 'Warden' },
      student: { variant: 'info', label: 'Student' },
      staff: { variant: 'secondary', label: 'Staff' }
    };
    return variants[role] || variants.student;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-blue-200">Manage all system users and their permissions</p>
          </div>
          <Button
            leftIcon={UserPlus}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg"
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 backdrop-blur-lg rounded-2xl p-4 border border-blue-500/30">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email, or roll number..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-gray-800">All Roles</option>
              <option value="admin" className="bg-gray-800">Admin</option>
              <option value="warden" className="bg-gray-800">Warden</option>
              <option value="student" className="bg-gray-800">Student</option>
              <option value="staff" className="bg-gray-800">Staff</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-gray-800">All Status</option>
              <option value="active" className="bg-gray-800">Active</option>
              <option value="inactive" className="bg-gray-800">Inactive</option>
              <option value="pending" className="bg-gray-800">Pending</option>
              <option value="suspended" className="bg-gray-800">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
        <div className="table-container">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/20">
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          {user.rollNumber && (
                            <p className="text-sm text-blue-200">{user.rollNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRoleBadge(user.role).variant}>
                        {getRoleBadge(user.role).label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadge(user.status).variant}>
                        {getStatusBadge(user.status).label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-blue-200">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-blue-300">{user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-200">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-300 hover:text-white hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-300 hover:text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-300 hover:text-white hover:bg-white/10"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-300 hover:text-white hover:bg-white/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-16 w-16 text-blue-300 mb-4" />
                      <p className="text-blue-200 text-lg">No users found</p>
                      <p className="text-blue-300 text-sm mt-2">
                        {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Start by adding your first user'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Change User Role</h3>
            <div className="mb-6">
              <p className="text-blue-200 mb-2">User: <span className="text-white font-medium">{selectedUser.name}</span></p>
              <p className="text-blue-200 mb-2">Email: <span className="text-white">{selectedUser.email}</span></p>
              <p className="text-blue-200">Current Role: <Badge variant={getRoleBadge(selectedUser.role).variant}>{getRoleBadge(selectedUser.role).label}</Badge></p>
            </div>
            
            <div className="space-y-3">
              <p className="text-blue-200 text-sm mb-3">Select New Role:</p>
              <Button
                onClick={() => handleRoleChange('student')}
                disabled={roleChangeLoading || selectedUser.role === 'student'}
                className="w-full justify-start bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Student
              </Button>
              <Button
                onClick={() => handleRoleChange('warden')}
                disabled={roleChangeLoading || selectedUser.role === 'warden'}
                className="w-full justify-start bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Warden
              </Button>
              <Button
                onClick={() => handleRoleChange('admin')}
                disabled={roleChangeLoading || selectedUser.role === 'admin'}
                className="w-full justify-start bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                disabled={roleChangeLoading}
                className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
