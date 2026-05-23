import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import { Spinner } from '../../components/shared/UIComponents';

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      if (user.role === 'ADMIN')   navigate('/admin/dashboard');
      else if (user.role === 'STAFF')   navigate('/staff/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email, password) => {
    setForm({ email, password });
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Logged in as ${user.role} 🎉`);
      if (user.role === 'ADMIN')  navigate('/admin/dashboard');
      else if (user.role === 'STAFF') navigate('/staff/dashboard');
      else navigate('/student/dashboard');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"/>
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">CampusTrack</h1>
          <p className="text-primary-300 text-sm">College Complaint & Issue Tracking System</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="font-display font-bold text-xl text-white mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label text-slate-200">Email Address</label>
              <input
                type="email"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${errors.email ? 'border-red-400' : 'border-white/20'}`}
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <p className="form-error text-red-300">{errors.email}</p>}
            </div>

            <div>
              <label className="form-label text-slate-200">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${errors.password ? 'border-red-400' : 'border-white/20'}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" onClick={() => setShowPw(v => !v)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="form-error text-red-300">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary-300 hover:text-primary-200 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60">
              {loading ? <><Spinner size="sm"/> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-400">
              New student?{' '}
              <Link to="/register" className="text-primary-300 hover:text-primary-200 font-medium">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'Admin', email: 'admin@college.edu', pass: 'Admin@123', color: 'text-violet-300' },
              { role: 'Staff', email: 'rajesh@college.edu', pass: 'Staff@123', color: 'text-blue-300' },
              { role: 'Student', email: 'aarav@student.college.edu', pass: 'Student@123', color: 'text-emerald-300' },
            ].map(({ role, email, pass, color }) => (
              <button key={role} onClick={() => demoLogin(email, pass)} disabled={loading}
                className="text-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer">
                <p className={`text-xs font-semibold ${color}`}>{role}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Click to login</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
