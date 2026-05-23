import { formatDistanceToNow, format } from 'date-fns';

// ── Status helpers ─────────────────────────────────────────────
export const STATUS_CONFIG = {
  SUBMITTED:    { label: 'Submitted',    cls: 'badge-submitted', color: '#64748b', dot: 'bg-slate-400' },
  UNDER_REVIEW: { label: 'Under Review', cls: 'badge-review',    color: '#3b82f6', dot: 'bg-blue-400' },
  ASSIGNED:     { label: 'Assigned',     cls: 'badge-assigned',  color: '#7c3aed', dot: 'bg-violet-400' },
  IN_PROGRESS:  { label: 'In Progress',  cls: 'badge-progress',  color: '#f59e0b', dot: 'bg-amber-400' },
  RESOLVED:     { label: 'Resolved',     cls: 'badge-resolved',  color: '#22c55e', dot: 'bg-emerald-400' },
  CLOSED:       { label: 'Closed',       cls: 'badge-closed',    color: '#94a3b8', dot: 'bg-slate-300' },
};

export const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      cls: 'badge-low',      icon: '▼' },
  MEDIUM:   { label: 'Medium',   cls: 'badge-medium',   icon: '●' },
  HIGH:     { label: 'High',     cls: 'badge-high',     icon: '▲' },
  CRITICAL: { label: 'Critical', cls: 'badge-critical', icon: '🔴' },
};

export const getStatusBadge = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.SUBMITTED;
export const getPriorityBadge = (priority) => PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;

// ── Date helpers ───────────────────────────────────────────────
export const timeAgo = (date) => {
  if (!date) return '—';
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return date; }
};

export const formatDate = (date, fmt = 'dd MMM yyyy, hh:mm a') => {
  if (!date) return '—';
  try { return format(new Date(date), fmt); }
  catch { return date; }
};

// ── Error extraction ───────────────────────────────────────────
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.data && typeof error.response.data.data === 'object') {
    const msgs = Object.values(error.response.data.data);
    if (msgs.length) return msgs[0];
  }
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
};

// ── Pagination helper ──────────────────────────────────────────
export const buildPaginationPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = [];
  if (current <= 3) {
    pages.push(0,1,2,3,'...',total-1);
  } else if (current >= total - 4) {
    pages.push(0,'...',total-4,total-3,total-2,total-1);
  } else {
    pages.push(0,'...',current-1,current,current+1,'...',total-1);
  }
  return pages;
};

// ── Category icon map ──────────────────────────────────────────
export const CATEGORY_ICONS = {
  wifi:              '📶',
  school:            '🏫',
  computer:          '💻',
  construction:      '🏗️',
  hotel:             '🏨',
  person:            '👤',
  cleaning_services: '🧹',
  bolt:              '⚡',
  water:             '🚿',
  sports:            '⚽',
};

export const getCategoryIcon = (icon) => CATEGORY_ICONS[icon] || '📋';
