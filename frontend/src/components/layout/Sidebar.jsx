import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  DoorOpen,
  FileText,
  MessageSquare,
  CreditCard,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { user, isAdmin, isWarden, isStudent, logout } = useAuth();

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Hostels', href: '/admin/hostels', icon: Building2 },
        { name: 'Rooms', href: '/admin/rooms', icon: DoorOpen },
        { name: 'Applications', href: '/admin/applications', icon: FileText },
        { name: 'Complaints', href: '/admin/complaints', icon: MessageSquare },
        { name: 'Fees', href: '/admin/fees', icon: CreditCard },
        { name: 'Analytics', href: '/admin/analytics', icon: LayoutDashboard },
      ];
    }

    if (isWarden) {
      return [
        { name: 'Dashboard', href: '/warden/dashboard', icon: LayoutDashboard },
        { name: 'My Hostels', href: '/warden/hostels', icon: Building2 },
        { name: 'Rooms', href: '/warden/rooms', icon: DoorOpen },
        { name: 'Students', href: '/warden/students', icon: Users },
        { name: 'Complaints', href: '/warden/complaints', icon: MessageSquare },
      ];
    }

    if (isStudent) {
      return [
        { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { name: 'My Application', href: '/student/application', icon: FileText },
        { name: 'Complaints', href: '/student/complaints', icon: MessageSquare },
        { name: 'Fees', href: '/student/fees', icon: CreditCard },
        { name: 'Notifications', href: '/student/notifications', icon: Bell },
        { name: 'Profile', href: '/student/profile', icon: User },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside
      className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-secondary-200
        transition-all duration-300 z-30
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border border-secondary-200 rounded-full p-1 shadow-sm hover:shadow-md transition-all"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-secondary-500" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-secondary-500" />
        )}
      </button>

      <div className="flex flex-col h-full py-6">
        {/* User Info */}
        {!isCollapsed && (
          <div className="px-6 pb-6 border-b border-secondary-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">{user?.name}</p>
                <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${active
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : ''}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-primary-600' : ''}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-secondary-100">
          <button
            onClick={logout}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
