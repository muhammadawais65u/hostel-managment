import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ArrowLeft,
  Loader2,
  MessageSquare,
  DoorOpen,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Trash2
} from 'lucide-react';
import { wardenAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const WardenNotifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await wardenAPI.getNotifications();
      setNotifications(response.data.data || []);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationIds) => {
    try {
      await wardenAPI.markNotificationsRead({ ids: notificationIds });
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark notifications as read');
    }
  };

  const handleDeleteNotifications = async (notificationIds) => {
    try {
      await wardenAPI.deleteNotifications(notificationIds);
      fetchNotifications();
    } catch (err) {
      setError('Failed to delete notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'complaint':
        return <MessageSquare className="h-5 w-5 text-red-600" />;
      case 'room_allocation':
        return <DoorOpen className="h-5 w-5 text-blue-600" />;
      case 'student_assignment':
        return <UserPlus className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'complaint':
        return 'bg-red-50 border-red-200';
      case 'room_allocation':
        return 'bg-blue-50 border-blue-200';
      case 'student_assignment':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/warden/dashboard')}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  onClick={() => handleMarkAsRead(notifications.filter(n => !n.read).map(n => n._id))}
                >
                  Mark All as Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteNotifications(notifications.map(n => n._id))}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-xl shadow-sm p-6 border transition-all hover:shadow-md ${
                  notification.read ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          {notification.relatedTo && (
                            <Badge variant={notification.read ? 'secondary' : 'info'}>
                              {notification.read ? 'Read' : 'New'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead([notification._id])}
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteNotifications([notification._id])}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Action buttons based on notification type */}
                    {notification.type === 'complaint' && notification.relatedTo?.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                          size="sm"
                          onClick={() => navigate('/warden/complaints')}
                        >
                          View Complaint
                        </Button>
                      </div>
                    )}

                    {notification.type === 'room_allocation' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                          size="sm"
                          onClick={() => navigate('/warden/students')}
                        >
                          View Students
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-500">You don't have any notifications at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardenNotifications;
