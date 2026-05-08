import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Mail,
  Settings,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  X,
  Check,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const Notifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getNotifications();
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error('Notifications fetch error:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n._id));
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleMarkAsRead = async (ids) => {
    try {
      await studentAPI.markNotificationRead(ids);
      setNotifications(prev => 
        prev.map(n => 
          ids.includes(n._id) ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error('Mark as read error:', err);
      setError('Failed to mark notifications as read');
    }
  };

  const handleDelete = async (ids) => {
    try {
      await studentAPI.deleteNotifications(ids);
      setNotifications(prev => prev.filter(n => !ids.includes(n._id)));
      setSelectedNotifications([]);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete notifications');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      application: { icon: Mail, color: 'text-blue-600' },
      complaint: { icon: AlertTriangle, color: 'text-orange-600' },
      fee: { icon: CheckCircle, color: 'text-green-600' },
      payment: { icon: CheckCircle, color: 'text-green-600' },
      room: { icon: CheckCircle, color: 'text-green-600' },
      system: { icon: Settings, color: 'text-gray-600' },
      emergency: { icon: AlertTriangle, color: 'text-red-600' }
    };
    return icons[type] || icons.system;
  };

  const getNotificationBadge = (type) => {
    const badges = {
      application: { variant: 'info', label: 'Application' },
      complaint: { variant: 'warning', label: 'Complaint' },
      fee: { variant: 'success', label: 'Fee' },
      payment: { variant: 'success', label: 'Payment' },
      room: { variant: 'success', label: 'Room' },
      system: { variant: 'secondary', label: 'System' },
      emergency: { variant: 'danger', label: 'Emergency' }
    };
    return badges[type] || badges.system;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Notifications</h1>
                <p className="text-sm text-gray-600">View your notifications and updates</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Total: <span className="font-bold">{notifications.length}</span>
                </p>
              </div>
              <div className="bg-red-50 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium text-red-900">
                  Unread: <span className="font-bold">{notifications.filter(n => !n.isRead).length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="application">Applications</option>
                <option value="complaint">Complaints</option>
                <option value="fee">Fees</option>
                <option value="payment">Payments</option>
                <option value="room">Room</option>
                <option value="system">System</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-700"
              >
                {selectedNotifications.length === notifications.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedNotifications.length > 0 && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleMarkAsRead(selectedNotifications)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Read
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(selectedNotifications)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {filteredNotifications.length} of {notifications.length} notifications
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No notifications available'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const { icon: Icon, color } = getNotificationIcon(notification.type);
                const { variant, label } = getNotificationBadge(notification.type);
                
                return (
                  <div
                    key={notification._id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      notification.isRead ? 'bg-white' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => handleSelectNotification(notification._id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={variant} size="sm">
                              {label}
                            </Badge>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          {notification.isRead ? (
                            <span className="text-xs text-gray-500">Read</span>
                          ) : (
                            <span className="text-xs text-blue-600 font-medium">Unread</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        {notification.relatedTo && (
                          <div className="mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => 
                                notification.relatedTo.model === 'Application' 
                                  ? navigate('/student/application-status')
                                  : notification.relatedTo.model === 'Complaint'
                                  ? navigate('/student/complaints')
                                  : null
                              }
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
