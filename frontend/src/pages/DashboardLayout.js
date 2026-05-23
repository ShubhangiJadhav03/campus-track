import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, Topbar } from '../components/shared/UIComponents';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

const PAGE_TITLES = {
  '/student/dashboard':     'Dashboard',
  '/student/complaints':    'My Complaints',
  '/student/new-complaint': 'Submit Complaint',
  '/student/notifications': 'Notifications',
  '/admin/dashboard':       'Dashboard',
  '/admin/complaints':      'All Complaints',
  '/admin/analytics':       'Analytics',
  '/admin/users':           'User Management',
  '/admin/categories':      'Categories',
  '/staff/dashboard':       'Dashboard',
  '/staff/complaints':      'My Tasks',
  '/profile':               'My Profile',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [unreadCount, setUnreadCount]     = useState(0);
  const { user } = useAuth();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'CampusTrack';

  // Poll unread notification count every 30s
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await notificationAPI.getUnreadCount();
        setUnreadCount(res.data.data || 0);
      } catch { /* silent */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Topbar
          title={title}
          onMenuToggle={() => setSidebarOpen(true)}
          unreadCount={unreadCount}
          onNotifClick={() => setShowNotifs(v => !v)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
          <Outlet context={{ unreadCount, setUnreadCount }}/>
        </main>
      </div>
    </div>
  );
}
