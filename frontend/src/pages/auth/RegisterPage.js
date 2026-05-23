import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import { Spinner } from '../../components/shared/UIComponents';

const DEPARTMENTS = ['Computer Science','Electronics','Mechanical','Civil','Chemical','Biotechnology','Physics','Mathematics','Management','Arts'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', department:'', studentId:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2)     e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = 'Must contain uppercase, lowercase, and digit';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Invalid Indian phone number';
    if (!form.department) e.department = 'Department is required';
    if (!form.studentId)  e.studentId  = 'Student ID is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully! 🎉');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  const Field = ({ field, label, type='text', placeholder, children }) => (
    <div>
      <label className="form-label text-slate-200">{label}</label>
      {children || (
        <input type={type} className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${errors[field] ? 'border-red-400' : 'border-white/20'}`}
          placeholder={placeholder} value={form[field]} onChange={e => set(field, e.target.value)}/>
      )}
      {errors[field] && <p className="form-error text-red-300">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"/>
      </div>

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-glow">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Create Account</h1>
          <p className="text-primary-300 text-sm mt-1">Register as a student to submit complaints</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field field="name" label="Full Name" placeholder="Aarav Patel"/>
              <Field field="studentId" label="Student ID" placeholder="STU2024001"/>
            </div>
            <Field field="email" label="Email Address" type="email" placeholder="you@student.college.edu"/>

            <div>
              <label className="form-label text-slate-200">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'}
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${errors.password ? 'border-red-400' : 'border-white/20'}`}
                  placeholder="Min 8 chars, uppercase + digit"
                  value={form.password} onChange={e => set('password', e.target.value)}/>
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" onClick={() => setShowPw(v=>!v)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="form-error text-red-300">{errors.password}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field field="phone" label="Phone (optional)" placeholder="9876543210"/>
              <div>
                <label className="form-label text-slate-200">Department</label>
                <select className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${errors.department ? 'border-red-400' : 'border-white/20'}`}
                  value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="" className="bg-slate-800">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-800">{d}</option>)}
                </select>
                {errors.department && <p className="form-error text-red-300">{errors.department}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Spinner size="sm"/> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-300 hover:text-primary-200 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
