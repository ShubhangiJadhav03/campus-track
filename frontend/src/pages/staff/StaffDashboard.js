import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard, PageLoader, StatusBadge, PriorityBadge } from '../../components/shared/UIComponents';
import { timeAgo } from '../../utils/helpers';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      complaintAPI.getStaffDash(),
      complaintAPI.getAssigned({ page: 0, size: 5 }),
    ])
      .then(([statsRes, listRes]) => {
        setStats(statsRes.data.data);
        setRecent(listRes.data.data.content || []);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader/>;

  const statCards = [
    { icon: '📋', label: 'Total Assigned',  value: stats?.totalComplaints,    color: 'bg-primary-50', textColor: 'text-primary-600' },
    { icon: '🔔', label: 'Newly Assigned',  value: stats?.assignedComplaints,  color: 'bg-violet-50',  textColor: 'text-violet-600' },
    { icon: '🔧', label: 'In Progress',     value: stats?.inProgressComplaints, color: 'bg-amber-50',  textColor: 'text-amber-600' },
    { icon: '✅', label: 'Resolved',         value: stats?.resolvedComplaints,  color: 'bg-emerald-50', textColor: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl">Welcome, {user?.name?.split(' ')[0]}! 👷</h2>
          <p className="text-blue-200 text-sm mt-1">{user?.department} · Staff Member</p>
        </div>
        <Link to="/staff/complaints" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
          📋 View My Tasks
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} textColor={s.textColor}/>
        ))}
      </div>

      {/* Recent assigned complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-slate-900">Recent Tasks</h3>
          <Link to="/staff/complaints" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all →</Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl">🎉</span>
            <p className="text-slate-500 mt-3 font-medium">No tasks assigned yet</p>
            <p className="text-sm text-slate-400 mt-1">Check back later for new assignments</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map(c => (
              <Link key={c.id} to={`/complaints/${c.id}`}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all group">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  c.status === 'IN_PROGRESS' ? 'bg-amber-400 animate-pulse' :
                  c.status === 'ASSIGNED' ? 'bg-violet-400' : 'bg-slate-300'
                }`}/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-700">{c.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-slate-400">{c.ticketNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{c.student?.name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={c.priority}/>
                  <StatusBadge status={c.status}/>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Staff guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '🔍', title: 'Investigate', desc: 'Check the complaint details and location before taking action' },
          { icon: '💬', title: 'Add Remarks', desc: 'Always add remarks when updating status to keep students informed' },
          { icon: '✅', title: 'Resolve Promptly', desc: 'Add clear resolution notes when marking a complaint as resolved' },
        ].map((tip, i) => (
          <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <span className="text-2xl">{tip.icon}</span>
            <p className="font-semibold text-blue-800 mt-2 text-sm">{tip.title}</p>
            <p className="text-xs text-blue-600 mt-1">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
