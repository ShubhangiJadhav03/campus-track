import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
  RadialBarChart, RadialBar
} from 'recharts';
import { complaintAPI } from '../../services/api';
import { PageLoader, StatCard } from '../../components/shared/UIComponents';

const COLORS = ['#6366f1','#f97316','#22c55e','#3b82f6','#f59e0b','#ec4899','#8b5cf6','#10b981','#ef4444','#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
};

export default function AdminAnalytics() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintAPI.getAdminDash()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader/>;

  const total = stats?.totalComplaints || 1;
  const resolved = stats?.resolvedComplaints || 0;
  const resolutionRate = Math.round((resolved / total) * 100);

  const statusData = [
    { name: 'Submitted',    value: stats?.submittedComplaints    || 0, fill: '#64748b' },
    { name: 'Under Review', value: stats?.underReviewComplaints  || 0, fill: '#3b82f6' },
    { name: 'Assigned',     value: stats?.assignedComplaints     || 0, fill: '#7c3aed' },
    { name: 'In Progress',  value: stats?.inProgressComplaints   || 0, fill: '#f59e0b' },
    { name: 'Resolved',     value: stats?.resolvedComplaints     || 0, fill: '#22c55e' },
    { name: 'Closed',       value: stats?.closedComplaints       || 0, fill: '#94a3b8' },
  ];

  const categoryData = Object.entries(stats?.categoryWise || {}).map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }));
  const monthlyData  = Object.entries(stats?.monthlyTrends || {}).map(([name, value]) => ({ name, value }));
  const staffData    = Object.entries(stats?.staffPerformance || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Comprehensive complaint system insights</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📊" label="Total Complaints"   value={stats?.totalComplaints}    color="bg-primary-50" textColor="text-primary-600"/>
        <StatCard icon="✅" label="Resolved"            value={stats?.resolvedComplaints}  color="bg-emerald-50" textColor="text-emerald-600" trend={`${resolutionRate}% resolution rate`}/>
        <StatCard icon="👥" label="Students Registered" value={stats?.totalStudents}       color="bg-violet-50"  textColor="text-violet-600"/>
        <StatCard icon="🔧" label="Active Staff"        value={stats?.totalStaff}          color="bg-blue-50"    textColor="text-blue-600"/>
      </div>

      {/* Resolution rate radial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card flex flex-col items-center justify-center">
          <h3 className="font-display font-bold text-slate-800 mb-2">Resolution Rate</h3>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="12"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#22c55e" strokeWidth="12"
                strokeDasharray={`${resolutionRate * 3.14} 314`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-bold text-slate-900">{resolutionRate}%</span>
              <span className="text-xs text-slate-500">Resolved</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-3">{resolved} of {total} complaints resolved</p>
        </div>

        {/* Status pie */}
        <div className="card lg:col-span-2">
          <h3 className="font-display font-bold text-slate-800 mb-4">Complaints by Status</h3>
          <div className="flex items-center gap-4">
            <div className="h-48 w-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.fill}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {statusData.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }}/>
                    <span className="text-sm text-slate-600">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(s.value/total)*100}%`, background: s.fill }}/>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-6 text-right">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="card">
        <h3 className="font-display font-bold text-slate-800 mb-4">Monthly Complaint Trend ({new Date().getFullYear()})</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="value" name="Complaints" stroke="#6366f1" strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <div className="card">
          <h3 className="font-display font-bold text-slate-800 mb-4">Category-wise Breakdown</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" barSize={18}>
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="value" name="Complaints" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff performance */}
        {staffData.length > 0 && (
          <div className="card">
            <h3 className="font-display font-bold text-slate-800 mb-4">Staff Workload</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="value" name="Assigned" fill="#8b5cf6" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
