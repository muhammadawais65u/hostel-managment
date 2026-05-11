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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
    isActive: true,
    isEmailVerified: false,
    department: '',
    semester: '',
    rollNumber: '',
    gender: '',
    year: ''
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    department: '',
    semester: '',
    rollNumber: '',
    gender: '',
    year: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      console.log('Users API response:', response);
      setUsers(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
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

  const handleCreateUser = async () => {
    setCreateLoading(true);
    setError('');

    try {
      // Use admin API for all user creation
      // Include all student fields
      const userData = {
        ...createForm,
        rollNumber: createForm.role === 'student' && !createForm.rollNumber ? `AUTO-${Date.now()}` : createForm.rollNumber
      };
      
      const response = await adminAPI.createUser(userData);
      
      if (response.data.success) {
        setUsers([response.data.data, ...users]);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          password: '',
          role: 'student',
          phone: '',
          department: '',
          semester: '',
          rollNumber: '',
          gender: '',
          year: ''
        });
        setSuccess('User created successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateFormChange = (e) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEditFormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleViewUser = (user) => {
    setViewUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive !== undefined ? user.isActive : true,
      isEmailVerified: user.isEmailVerified || false,
      department: user.department || '',
      semester: user.semester || '',
      rollNumber: user.rollNumber || '',
      gender: user.gender || '',
      year: user.year || ''
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    setEditLoading(true);
    setError('');

    try {
      // Use admin API for all user updates
      const response = await adminAPI.updateUser(selectedUser._id, editForm);
      
      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === selectedUser._id 
            ? { ...user, ...editForm }
            : user
        ));
        setShowEditModal(false);
        setSelectedUser(null);
        setSuccess('User updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    setError('');

    try {
      const response = await adminAPI.deleteUser(selectedUser._id);
      if (response.data.success) {
        setUsers(users.filter(user => user._id !== selectedUser._id));
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleVerifyEmail = async (user) => {
    try {
      const response = await adminAPI.verifyEmail(user._id);
      if (response.data.success) {
        setUsers(users.map(u => 
          u._id === user._id 
            ? { ...u, isEmailVerified: true }
            : u
        ));
        setSuccess('Email verified successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email');
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
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto space-y-6 bg-white min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage all system users and their permissions</p>
          </div>
          <Button
            leftIcon={UserPlus}
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg"
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
          <Button
            size="sm"
            variant="outline"
            onClick={fetchUsers}
            className="ml-auto"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email, or roll number..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-white">All Roles</option>
              <option value="admin" className="bg-white">Admin</option>
              <option value="warden" className="bg-white">Warden</option>
              <option value="student" className="bg-white">Student</option>
              <option value="staff" className="bg-white">Staff</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-white">All Status</option>
              <option value="active" className="bg-white">Active</option>
              <option value="inactive" className="bg-white">Inactive</option>
              <option value="pending" className="bg-white">Pending</option>
              <option value="suspended" className="bg-white">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="table-container">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Email Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          {user.rollNumber && (
                            <p className="text-sm text-gray-500">{user.rollNumber}</p>
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
                      <span className="text-gray-900">
                        {user.rollNumber || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 capitalize">
                        {user.gender || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-gray-600">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">
                        {user.department || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">
                        {user.semester || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">
                        {user.year || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.isEmailVerified ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-700 font-medium">Not Verified</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-gray-100"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800 hover:bg-gray-100"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!user.isEmailVerified && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-600 hover:text-yellow-800 hover:bg-gray-100"
                            onClick={() => handleVerifyEmail(user)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-gray-100"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-600 text-lg">No users found</p>
                      <p className="text-gray-500 text-sm mt-2">
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
          <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Change User Role</h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">User: <span className="text-gray-900 font-medium">{selectedUser.name}</span></p>
              <p className="text-gray-600 mb-2">Email: <span className="text-gray-900">{selectedUser.email}</span></p>
              <p className="text-gray-600">Current Role: <Badge variant={getRoleBadge(selectedUser.role).variant}>{getRoleBadge(selectedUser.role).label}</Badge></p>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-600 text-sm mb-3">Select New Role:</p>
              <Button
                onClick={() => handleRoleChange('student')}
                disabled={roleChangeLoading || selectedUser.role === 'student'}
                className="w-full justify-start bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 disabled:opacity-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Student
              </Button>
              <Button
                onClick={() => handleRoleChange('warden')}
                disabled={roleChangeLoading || selectedUser.role === 'warden'}
                className="w-full justify-start bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 disabled:opacity-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Warden
              </Button>
              <Button
                onClick={() => handleRoleChange('admin')}
                disabled={roleChangeLoading || selectedUser.role === 'admin'}
                className="w-full justify-start bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 disabled:opacity-50"
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

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Role</label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student" className="bg-white">Student</option>
                  <option value="warden" className="bg-white">Warden</option>
                  <option value="admin" className="bg-white">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Account Status</label>
                <select
                  name="isActive"
                  value={editForm.isActive}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'true'})}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true" className="bg-white">Active</option>
                  <option value="false" className="bg-white">Inactive</option>
                </select>
              </div>
              
              {/* Student-specific fields */}
              {editForm.role === 'student' && (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Roll Number</label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={editForm.rollNumber}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter roll number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Gender</label>
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="bg-white">Select Gender</option>
                      <option value="male" className="bg-white">Male</option>
                      <option value="female" className="bg-white">Female</option>
                      <option value="other" className="bg-white">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={editForm.department}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter department"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Semester</label>
                    <select
                      name="semester"
                      value={editForm.semester}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="bg-white">Select Semester</option>
                      <option value="1st" className="bg-white">1st Semester</option>
                      <option value="2nd" className="bg-white">2nd Semester</option>
                      <option value="3rd" className="bg-white">3rd Semester</option>
                      <option value="4th" className="bg-white">4th Semester</option>
                      <option value="5th" className="bg-white">5th Semester</option>
                      <option value="6th" className="bg-white">6th Semester</option>
                      <option value="7th" className="bg-white">7th Semester</option>
                      <option value="8th" className="bg-white">8th Semester</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Year</label>
                    <select
                      name="year"
                      value={editForm.year}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="bg-white">Select Year</option>
                      <option value="1st" className="bg-white">1st Year</option>
                      <option value="2nd" className="bg-white">2nd Year</option>
                      <option value="3rd" className="bg-white">3rd Year</option>
                      <option value="4th" className="bg-white">4th Year</option>
                      <option value="5th" className="bg-white">5th Year</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleUpdateUser}
                isLoading={editLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                Update User
              </Button>
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                disabled={editLoading}
                className="flex-1 bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-md w-full shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
                <p className="text-red-600 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Are you sure you want to delete this user?</p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-900 font-medium">{selectedUser.name}</p>
                <p className="text-gray-600 text-sm">{selectedUser.email}</p>
                <p className="text-gray-600 text-sm">Role: {getRoleBadge(selectedUser.role).label}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleConfirmDelete}
                isLoading={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
              >
                Delete User
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                disabled={deleteLoading}
                className="flex-1 bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateFormChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={createForm.email}
                  onChange={handleCreateFormChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={createForm.password}
                  onChange={handleCreateFormChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Role</label>
                <select
                  name="role"
                  value={createForm.role}
                  onChange={handleCreateFormChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student" className="bg-white">Student</option>
                  <option value="warden" className="bg-white">Warden</option>
                  <option value="admin" className="bg-white">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={createForm.phone}
                  onChange={handleCreateFormChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              
              {/* Student-specific fields for create form */}
              {createForm.role === 'student' && (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Roll Number *</label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={createForm.rollNumber}
                      onChange={handleCreateFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter roll number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Gender *</label>
                    <select
                      name="gender"
                      value={createForm.gender}
                      onChange={handleCreateFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" className="bg-white">Select Gender</option>
                      <option value="male" className="bg-white">Male</option>
                      <option value="female" className="bg-white">Female</option>
                      <option value="other" className="bg-white">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={createForm.department}
                      onChange={handleCreateFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter department"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Semester</label>
                    <select
                      name="semester"
                      value={createForm.semester}
                      onChange={handleCreateFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="bg-white">Select Semester</option>
                      <option value="1st" className="bg-white">1st Semester</option>
                      <option value="2nd" className="bg-white">2nd Semester</option>
                      <option value="3rd" className="bg-white">3rd Semester</option>
                      <option value="4th" className="bg-white">4th Semester</option>
                      <option value="5th" className="bg-white">5th Semester</option>
                      <option value="6th" className="bg-white">6th Semester</option>
                      <option value="7th" className="bg-white">7th Semester</option>
                      <option value="8th" className="bg-white">8th Semester</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Year *</label>
                    <select
                      name="year"
                      value={createForm.year}
                      onChange={handleCreateFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" className="bg-white">Select Year</option>
                      <option value="1st" className="bg-white">1st Year</option>
                      <option value="2nd" className="bg-white">2nd Year</option>
                      <option value="3rd" className="bg-white">3rd Year</option>
                      <option value="4th" className="bg-white">4th Year</option>
                      <option value="5th" className="bg-white">5th Year</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreateUser}
                isLoading={createLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                Create User
              </Button>
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    name: '',
                    email: '',
                    password: '',
                    role: 'student',
                    phone: '',
                    department: '',
                    semester: '',
                    rollNumber: '',
                    gender: '',
                    year: ''
                  });
                }}
                disabled={createLoading}
                className="flex-1 bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && viewUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-3xl w-full shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewUser(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="font-medium text-gray-900">{viewUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email Address</p>
                    <p className="font-medium text-gray-900">{viewUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-900">{viewUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Role</p>
                    <Badge variant={getRoleBadge(viewUser.role).variant}>
                      {getRoleBadge(viewUser.role).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Status</p>
                    <Badge variant={viewUser.isActive ? 'success' : 'danger'}>
                      {viewUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email Verification</p>
                    <Badge variant={viewUser.isEmailVerified ? 'success' : 'warning'}>
                      {viewUser.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              {viewUser.role === 'student' && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Academic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Roll Number</p>
                      <p className="font-medium text-gray-900">{viewUser.rollNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Gender</p>
                      <p className="font-medium text-gray-900 capitalize">{viewUser.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Department</p>
                      <p className="font-medium text-gray-900">{viewUser.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Semester</p>
                      <p className="font-medium text-gray-900">{viewUser.semester || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Year</p>
                      <p className="font-medium text-gray-900">{viewUser.year || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Actions */}
              <div className="bg-yellow-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewModal(false);
                      setViewUser(null);
                      handleEditUser(viewUser);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit User
                  </Button>
                  {!viewUser.isEmailVerified && (
                    <Button
                      variant="success"
                      onClick={() => {
                        setShowViewModal(false);
                        setViewUser(null);
                        handleVerifyEmail(viewUser);
                      }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Verify Email
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowViewModal(false);
                      setViewUser(null);
                      handleDeleteUser(viewUser);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
