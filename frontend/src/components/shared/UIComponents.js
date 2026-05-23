import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStatusBadge, getPriorityBadge } from '../../utils/helpers';

// ── Status Badge ───────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const cfg = getStatusBadge(status);
  return <span className={cfg.cls}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`}/>{cfg.label}</span>;
};

// ── Priority Badge ─────────────────────────────────────────────
export const PriorityBadge = ({ priority }) => {
  const cfg = getPriorityBadge(priority);
  return <span className={cfg.cls}>{cfg.icon} {cfg.label}</span>;
};

// ── Loading Spinner ────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin w-full h-full text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-3" />
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  </div>
);

// ── Empty State ────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title = 'Nothing here yet', subtitle = '' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-5xl mb-4">{icon}</span>
    <h3 className="font-semibold text-slate-700 text-lg mb-1">{title}</h3>
    {subtitle && <p className="text-sm text-slate-500 max-w-xs">{subtitle}</p>}
  </div>
);

// ── Stat Card ──────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color = 'bg-primary-100', textColor = 'text-primary-600', trend }) => (
  <div className="stat-card animate-fade-in">
    <div className={`stat-icon ${color}`}>
      <span className={`text-2xl ${textColor}`}>{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5">{value ?? '—'}</p>
      {trend && <p className="text-xs text-slate-400 mt-0.5">{trend}</p>}
    </div>
  </div>
);

// ── Pagination ─────────────────────────────────────────────────
export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <p className="text-sm text-slate-500">Page {page + 1} of {totalPages}</p>
      <div className="flex gap-1">
        <button className="btn-secondary py-1.5 px-3 text-xs" disabled={page === 0} onClick={() => onPageChange(page - 1)}>← Prev</button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
          return (
            <button key={p} onClick={() => onPageChange(p)}
              className={`py-1.5 px-3 text-xs rounded-lg font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>
              {p + 1}
            </button>
          );
        })}
        <button className="btn-secondary py-1.5 px-3 text-xs" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>Next →</button>
      </div>
    </div>
  );
};

// ── Modal ──────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-auto animate-slide-up`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-display font-bold text-lg text-slate-900">{title}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ── Confirm Modal ──────────────────────────────────────────────
export const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-sm text-slate-600 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button className="btn-secondary" onClick={onClose}>Cancel</button>
      <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
    </div>
  </Modal>
);

// ── Search Input ───────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
    <input className="form-input pl-9" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/>
  </div>
);

// ── Avatar ─────────────────────────────────────────────────────
export const Avatar = ({ name, src, size = 'md' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}/>;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold flex items-center justify-center ring-2 ring-white`}>
      {initials}
    </div>
  );
};

// ── Topbar ─────────────────────────────────────────────────────
export const Topbar = ({ title, onMenuToggle, unreadCount = 0, onNotifClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button className="btn-icon lg:hidden" onClick={onMenuToggle}>☰</button>
        <h1 className="font-display font-bold text-slate-800 text-lg hidden sm:block">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative btn-icon" onClick={onNotifClick}>
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {/* User menu */}
        <div className="relative">
          <button className="flex items-center gap-2 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors" onClick={() => setShowMenu(v => !v)}>
            <Avatar name={user?.name} src={user?.profilePicture} size="sm"/>
            <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">{user?.name}</span>
            <span className="text-slate-400 text-xs">▾</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 w-44 z-50 animate-slide-up">
              <div className="px-3 py-2 border-b border-slate-50">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => { setShowMenu(false); navigate('/profile'); }}>
                👤 Profile
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors" onClick={() => { logout(); navigate('/login'); }}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ── Sidebar ────────────────────────────────────────────────────
const NAV_ITEMS = {
  STUDENT: [
    { to: '/student/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/student/complaints', icon: '📋', label: 'My Complaints' },
    { to: '/student/new-complaint', icon: '➕', label: 'New Complaint' },
    { to: '/student/notifications', icon: '🔔', label: 'Notifications' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ],
  ADMIN: [
    { to: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/admin/complaints', icon: '📋', label: 'All Complaints' },
    { to: '/admin/analytics', icon: '📊', label: 'Analytics' },
    { to: '/admin/users', icon: '👥', label: 'User Management' },
    { to: '/admin/categories', icon: '🏷️', label: 'Categories' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ],
  STAFF: [
    { to: '/staff/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/staff/complaints', icon: '📋', label: 'My Tasks' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ],
};

export const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV_ITEMS[user?.role] || [];

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose}/>}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white text-lg">🎓</span>
          </div>
          <div>
            <p className="font-display font-bold text-slate-900 text-sm leading-tight">CampusTrack</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Complaint System</p>
          </div>
          <button className="ml-auto btn-icon lg:hidden" onClick={onClose}>✕</button>
        </div>

        {/* Role chip */}
        <div className="px-4 py-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            user?.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' :
            user?.role === 'STAFF' ? 'bg-blue-100 text-blue-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {user?.role}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={onClose}
              className={({ isActive }) => isActive ? 'sidebar-link-active mb-0.5 flex' : 'sidebar-link mb-0.5 flex'}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={user?.name} src={user?.profilePicture} size="md"/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button className="w-full btn-ghost text-sm py-2 justify-start" onClick={() => { logout(); navigate('/login'); }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
