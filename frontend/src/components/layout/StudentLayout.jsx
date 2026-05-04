import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Home,
  FileText,
  Bed,
  CreditCard,
  MessageSquare,
  Bell,
  BookOpen,
  Users,
  Shield,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/student/dashboard', active: location.pathname === '/student/dashboard' },
    { icon: FileText, label: 'Apply for Room', path: '/student/application' },
    { icon: CreditCard, label: 'Payment', path: '/student/payment' },
    { icon: MessageSquare, label: 'Complaints', path: '/student/complaints' },
    { icon: Bell, label: 'Notifications', path: '/student/notifications' },
    { icon: BookOpen, label: 'Study Materials', path: '/student/materials' },
    { icon: Users, label: 'Roommates', path: '/student/roommates' },
    { icon: Shield, label: 'Leave Request', path: '/student/leave' },
    { icon: HelpCircle, label: 'Help & Support', path: '/student/help' },
    { icon: Settings, label: 'Profile Settings', path: '/student/settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="flex relative z-10 layout-container">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-900/90 to-indigo-900/90 backdrop-blur-lg border-r border-purple-500/30 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">UHMS</h1>
                  <p className="text-purple-200 text-xs">Student Portal</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white hover:text-purple-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Profile */}
            <div className="p-6 border-b border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Student</p>
                  <p className="text-purple-200 text-sm">Roll Number</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      item.active
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-purple-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.active && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-purple-500/30">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Top Header */}
          <header className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-lg border-b border-purple-500/30">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white hover:text-purple-200 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex items-center gap-4">
                <button className="relative p-2 text-white hover:text-purple-200 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Student</p>
                    <p className="text-purple-200 text-xs">Student</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6 main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
