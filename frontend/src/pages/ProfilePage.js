import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, Spinner } from '../components/shared/UIComponents';
import { formatDate, getErrorMessage } from '../utils/helpers';

const ROLE_STYLE = {
  ADMIN:   'bg-violet-100 text-violet-700 border-violet-200',
  STAFF:   'bg-blue-100 text-blue-700 border-blue-200',
  STUDENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const DEPARTMENTS = ['Computer Science','Electronics','Mechanical','Civil','Chemical','Biotechnology','Physics','Mathematics','Management','Arts','Administration','IT Department','Infrastructure','Housekeeping'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({
    name:           user?.name || '',
    phone:          user?.phone || '',
    department:     user?.department || '',
    profilePicture: user?.profilePicture || '',
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Invalid phone number';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data.data);
      setEditing(false);
      toast.success('Profile updated successfully! ✅');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm({
      name:           user?.name || '',
      phone:          user?.phone || '',
      department:     user?.department || '',
      profilePicture: user?.profilePicture || '',
    });
    setErrors({});
    setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">View and manage your account information</p>
      </div>

      {/* Profile header card */}
      <div className="card">
        <div className="flex items-center gap-5 flex-wrap">
          <Avatar name={user?.name} src={user?.profilePicture} size="lg"/>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-xl text-slate-900">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`badge border ${ROLE_STYLE[user?.role] || 'bg-slate-100 text-slate-600'}`}>
                {user?.role}
              </span>
              {user?.department && (
                <span className="badge bg-slate-100 text-slate-600">{user?.department}</span>
              )}
              {(user?.studentId || user?.employeeId) && (
                <span className="badge bg-slate-100 text-slate-600 font-mono">
                  {user?.studentId || user?.employeeId}
                </span>
              )}
            </div>
          </div>
          {!editing && (
            <button className="btn-secondary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
          )}
        </div>
      </div>

      {/* Profile details */}
      <div className="card space-y-5">
        <h3 className="font-display font-bold text-slate-800">Account Information</h3>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input className={errors.name ? 'form-input-error' : 'form-input'}
                value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Your full name"/>
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <input className={errors.phone ? 'form-input-error' : 'form-input'}
                value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="10-digit mobile number" maxLength={10}/>
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            <div>
              <label className="form-label">Department</label>
              <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">Profile Picture URL (optional)</label>
              <input className="form-input" value={form.profilePicture}
                onChange={e => set('profilePicture', e.target.value)}
                placeholder="https://example.com/photo.jpg"/>
              <p className="text-xs text-slate-400 mt-1">Paste a direct image URL</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="btn-secondary flex-1" onClick={handleCancel}>Cancel</button>
              <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <><Spinner size="sm"/> Saving…</> : '💾 Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {[
              { label: 'Full Name',    value: user?.name },
              { label: 'Email',        value: user?.email },
              { label: 'Phone',        value: user?.phone || '—' },
              { label: 'Department',   value: user?.department || '—' },
              { label: 'Role',         value: user?.role },
              { label: user?.studentId ? 'Student ID' : 'Employee ID',
                value: user?.studentId || user?.employeeId || '—' },
              { label: 'Account Status', value: user?.isActive ? '✅ Active' : '❌ Inactive' },
              { label: 'Member Since',   value: formatDate(user?.createdAt, 'dd MMM yyyy') },
            ].map(({ label, value }) => (
              <div key={label} className="border-b border-slate-50 pb-4 last:border-0">
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</dt>
                <dd className="text-sm font-medium text-slate-800 mt-1">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Security notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">🔒 Security Notice</p>
        <p className="text-xs text-amber-700">
          To change your password, use the Forgot Password feature on the login page.
          Never share your password with anyone.
        </p>
      </div>
    </div>
  );
}
