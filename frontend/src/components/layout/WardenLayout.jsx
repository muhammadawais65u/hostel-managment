import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Home,
  Building2,
  DoorOpen,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  BarChart3,
  Calendar,
  HelpCircle,
  User,
  Bed,
  FileCheck,
  Wrench
} from 'lucide-react';

const WardenLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/warden/dashboard', active: location.pathname === '/warden/dashboard' },
    { icon: Building2, label: 'My Hostels', path: '/warden/hostels' },
    { icon: DoorOpen, label: 'Room Management', path: '/warden/rooms' },
    { icon: Users, label: 'Student Management', path: '/warden/students' },
    { icon: MessageSquare, label: 'Complaint Management', path: '/warden/complaints' },
    { icon: FileCheck, label: 'Room Allocations', path: '/warden/allocations' },
    { icon: Calendar, label: 'Attendance', path: '/warden/attendance' },
    { icon: BarChart3, label: 'Reports', path: '/warden/reports' },
    { icon: Settings, label: 'Settings', path: '/warden/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/warden/help' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="flex relative z-10 layout-container">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-900/90 to-teal-900/90 backdrop-blur-lg border-r border-emerald-500/30 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-2 rounded-xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">UHMS</h1>
                  <p className="text-emerald-200 text-xs">Warden Portal</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white hover:text-emerald-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Profile */}
            <div className="p-6 border-b border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Warden</p>
                  <p className="text-emerald-200 text-sm">Hostel Manager</p>
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
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'text-emerald-200 hover:bg-white/10 hover:text-white'
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
            <div className="p-4 border-t border-emerald-500/30">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200">
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
          <header className="bg-gradient-to-r from-emerald-900/80 to-teal-900/80 backdrop-blur-lg border-b border-emerald-500/30">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white hover:text-emerald-200 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex items-center gap-4">
                <button className="relative p-2 text-white hover:text-emerald-200 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Warden</p>
                    <p className="text-emerald-200 text-xs">Hostel Manager</p>
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

export default WardenLayout;
