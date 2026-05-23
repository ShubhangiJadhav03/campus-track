import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { complaintAPI } from '../../services/api';
import { StatCard, PageLoader } from '../../components/shared/UIComponents';

const PIE_COLORS = ['#6366f1','#f97316','#22c55e','#3b82f6','#f59e0b','#ec4899','#8b5cf6','#10b981','#ef4444','#14b8a6'];

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintAPI.getAdminDash()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader/>;

  const statusData = [
    { name: 'Submitted',    value: stats?.submittedComplaints    || 0, color: '#64748b' },
    { name: 'Under Review', value: stats?.underReviewComplaints  || 0, color: '#3b82f6' },
    { name: 'Assigned',     value: stats?.assignedComplaints     || 0, color: '#7c3aed' },
    { name: 'In Progress',  value: stats?.inProgressComplaints   || 0, color: '#f59e0b' },
    { name: 'Resolved',     value: stats?.resolvedComplaints     || 0, color: '#22c55e' },
    { name: 'Closed',       value: stats?.closedComplaints       || 0, color: '#94a3b8' },
  ];

  const categoryData = Object.entries(stats?.categoryWise || {}).map(([name, value]) => ({ name, value }));
  const monthlyData  = Object.entries(stats?.monthlyTrends || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl">Admin Dashboard 🛡️</h2>
          <p className="text-slate-400 text-sm mt-1">System overview and complaint management</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/complaints" className="btn-secondary text-sm py-2">View All Complaints</Link>
          <Link to="/admin/analytics"  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            📊 Analytics
          </Link>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📋" label="Total Complaints" value={stats?.totalComplaints}     color="bg-primary-50" textColor="text-primary-600"/>
        <StatCard icon="⏳" label="Pending"          value={(stats?.submittedComplaints || 0) + (stats?.underReviewComplaints || 0)} color="bg-blue-50"    textColor="text-blue-600"/>
        <StatCard icon="🔧" label="In Progress"      value={stats?.inProgressComplaints} color="bg-amber-50"   textColor="text-amber-600"/>
        <StatCard icon="✅" label="Resolved"          value={stats?.resolvedComplaints}   color="bg-emerald-50" textColor="text-emerald-600"/>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Students"   value={stats?.totalStudents} color="bg-violet-50" textColor="text-violet-600"/>
        <StatCard icon="🔧" label="Staff Members"    value={stats?.totalStaff}    color="bg-sky-50"    textColor="text-sky-600"/>
        <StatCard icon="📌" label="Assigned"         value={stats?.assignedComplaints}  color="bg-indigo-50"  textColor="text-indigo-600"/>
        <StatCard icon="🔒" label="Closed"           value={stats?.closedComplaints}    color="bg-slate-100"  textColor="text-slate-500"/>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status distribution */}
        <div className="card">
          <h3 className="font-display font-bold text-slate-800 mb-4">Status Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="card">
          <h3 className="font-display font-bold text-slate-800 mb-4">Monthly Complaints ({new Date().getFullYear()})</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                <Tooltip cursor={{ fill: '#f1f5f9' }}/>
                <Bar dataKey="value" name="Complaints" fill="#6366f1" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className="card">
          <h3 className="font-display font-bold text-slate-800 mb-4">Complaints by Category</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" barSize={20}>
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} axisLine={false} tickLine={false}/>
                <Tooltip cursor={{ fill: '#f1f5f9' }}/>
                <Bar dataKey="value" name="Complaints" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
