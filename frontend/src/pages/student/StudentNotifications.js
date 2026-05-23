import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { notificationAPI } from '../../services/api';
import { PageLoader, EmptyState } from '../../components/shared/UIComponents';
import { timeAgo } from '../../utils/helpers';

const TYPE_STYLE = {
  SUCCESS: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  INFO:    'bg-blue-50 border-blue-200 text-blue-700',
  WARNING: 'bg-amber-50 border-amber-200 text-amber-700',
  ERROR:   'bg-red-50 border-red-200 text-red-700',
};
const TYPE_ICON = { SUCCESS: '✅', INFO: 'ℹ️', WARNING: '⚠️', ERROR: '❌' };

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  const fetch = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data || []);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
    } catch {}
  };

  const unread = notifications.filter(n => !n.isRead).length;

  if (loading) return <PageLoader/>;

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button className="btn-secondary text-sm" onClick={markAllRead}>✓ Mark all read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" subtitle="You'll be notified when your complaint status changes"/>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id}
              className={`rounded-xl border p-4 transition-all cursor-pointer ${
                n.isRead ? 'bg-white border-slate-100' : `${TYPE_STYLE[n.type] || TYPE_STYLE.INFO} font-medium`
              }`}
              onClick={() => !n.isRead && markRead(n.id)}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{TYPE_ICON[n.type] || 'ℹ️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-dot"/>}
                      <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                  {n.complaintId && (
                    <Link to={`/complaints/${n.complaintId}`}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1.5 inline-block"
                      onClick={e => e.stopPropagation()}>
                      View complaint {n.ticketNumber} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
