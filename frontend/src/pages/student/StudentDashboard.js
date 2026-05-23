import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard, PageLoader, StatusBadge, PriorityBadge } from '../../components/shared/UIComponents';
import { timeAgo } from '../../utils/helpers';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats]         = useState(null);
  const [recent, setRecent]       = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          complaintAPI.getStudentDash(),
          complaintAPI.getMyComplaints({ page: 0, size: 5 }),
        ]);
        setStats(statsRes.data.data);
        setRecent(complaintsRes.data.data.content || []);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoadingStats(false); }
    };
    fetchData();
  }, []);

  if (loadingStats) return <PageLoader/>;

  const statCards = [
    { icon: '📋', label: 'Total Complaints',  value: stats?.totalComplaints,    color: 'bg-slate-100',    textColor: 'text-slate-600' },
    { icon: '⏳', label: 'Under Review',      value: stats?.underReviewComplaints, color: 'bg-blue-50',   textColor: 'text-blue-600' },
    { icon: '🔧', label: 'In Progress',       value: stats?.inProgressComplaints, color: 'bg-amber-50',  textColor: 'text-amber-600' },
    { icon: '✅', label: 'Resolved',          value: stats?.resolvedComplaints,  color: 'bg-emerald-50', textColor: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-primary-200 text-sm mt-1">{user?.department} · {user?.studentId}</p>
        </div>
        <Link to="/student/new-complaint" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
          ➕ New Complaint
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} textColor={s.textColor}/>
        ))}
      </div>

      {/* Recent complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-slate-900">Recent Complaints</h3>
          <Link to="/student/complaints" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all →</Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl">📭</span>
            <p className="text-slate-500 mt-3 font-medium">No complaints yet</p>
            <p className="text-sm text-slate-400 mt-1">Submit your first complaint to get started</p>
            <Link to="/student/new-complaint" className="btn-primary mt-4 inline-flex">Submit Complaint</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map(c => (
              <Link key={c.id} to={`/complaints/${c.id}`}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/40 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                  📋
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-primary-700">{c.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 font-mono">{c.ticketNumber}</span>
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

      {/* Quick tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '📸', title: 'Add Photos', desc: 'Attach images to help staff understand the issue faster' },
          { icon: '📍', title: 'Specify Location', desc: 'Always mention the exact block, floor, and room number' },
          { icon: '🏷️', title: 'Set Priority Right', desc: 'Mark Critical only for urgent safety or health issues' },
        ].map((tip, i) => (
          <div key={i} className="bg-primary-50 border border-primary-100 rounded-xl p-4">
            <span className="text-2xl">{tip.icon}</span>
            <p className="font-semibold text-primary-800 mt-2 text-sm">{tip.title}</p>
            <p className="text-xs text-primary-600 mt-1">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
