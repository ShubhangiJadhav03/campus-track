import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { userAPI } from '../../services/api';
import {
  PageLoader, EmptyState, SearchInput, Avatar,
  Modal, Spinner, ConfirmModal
} from '../../components/shared/UIComponents';
import { formatDate, getErrorMessage } from '../../utils/helpers';

const ROLE_STYLE = {
  ADMIN:   'bg-violet-100 text-violet-700',
  STAFF:   'bg-blue-100 text-blue-700',
  STUDENT: 'bg-emerald-100 text-emerald-700',
};

export default function AdminUsers() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [roleFilter, setRole]   = useState('');
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await userAPI.toggleStatus(confirmToggle.id);
      toast.success(`User ${confirmToggle.isActive ? 'deactivated' : 'activated'} successfully`);
      setUsers(prev => prev.map(u => u.id === confirmToggle.id ? { ...u, isActive: !u.isActive } : u));
      setConfirmToggle(null);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setToggling(false); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.studentId || '').includes(search) ||
      (u.employeeId || '').includes(search);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    ALL: users.length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
    STAFF: users.filter(u => u.role === 'STAFF').length,
    STUDENT: users.filter(u => u.role === 'STUDENT').length,
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">{users.length} total users</p>
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['', 'All Users'], ['ADMIN', 'Admins'], ['STAFF', 'Staff'], ['STUDENT', 'Students']].map(([val, label]) => (
          <button key={val} onClick={() => setRole(val)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              roleFilter === val
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
            }`}>
            {label} <span className="ml-1 opacity-70">({counts[val || 'ALL']})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card py-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or ID…"/>
      </div>

      {/* Users table */}
      <div className="card p-0 overflow-hidden">
        {loading ? <PageLoader/> : filtered.length === 0 ? (
          <EmptyState icon="👥" title="No users found" subtitle="Try adjusting your search or filter"/>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>ID</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} src={u.profilePicture} size="md"/>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${ROLE_STYLE[u.role] || 'bg-slate-100 text-slate-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td><span className="text-sm text-slate-600">{u.department || '—'}</span></td>
                    <td>
                      <span className="font-mono text-xs text-slate-500">
                        {u.studentId || u.employeeId || '—'}
                      </span>
                    </td>
                    <td><span className="text-sm text-slate-500">{u.phone || '—'}</span></td>
                    <td><span className="text-xs text-slate-400">{formatDate(u.createdAt, 'dd MMM yyyy')}</span></td>
                    <td>
                      <span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {u.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setConfirmToggle(u)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          u.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggle}
        title={confirmToggle?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${confirmToggle?.isActive ? 'deactivate' : 'activate'} ${confirmToggle?.name}? ${confirmToggle?.isActive ? 'They will not be able to login.' : 'They will regain access to the system.'}`}
        confirmLabel={toggling ? 'Processing…' : confirmToggle?.isActive ? 'Deactivate' : 'Activate'}
        danger={confirmToggle?.isActive}
      />
    </div>
  );
}
