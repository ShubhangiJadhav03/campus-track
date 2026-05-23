import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintAPI } from '../../services/api';
import {
  StatusBadge, PriorityBadge, PageLoader, EmptyState,
  Pagination, SearchInput, Modal, Spinner
} from '../../components/shared/UIComponents';
import { timeAgo, getErrorMessage } from '../../utils/helpers';

const STATUSES = ['', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const UPDATABLE_STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function StaffComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotal]   = useState(0);
  const [status,     setStatus]     = useState('');
  const [search,     setSearch]     = useState('');
  const [statusModal, setStatusModal] = useState(null);
  const [statusForm,  setStatusForm]  = useState({ status: '', remarks: '', resolutionNotes: '' });
  const [submitting,  setSubmitting]  = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10, ...(status ? { status } : {}) };
      const res = await complaintAPI.getAssigned(params);
      const d = res.data.data;
      setComplaints(d.content || []);
      setTotalPages(d.totalPages || 0);
      setTotal(d.totalElements || 0);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const filtered = search
    ? complaints.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.ticketNumber.includes(search))
    : complaints;

  const openStatusModal = (c) => {
    setStatusModal(c);
    setStatusForm({ status: c.status, remarks: '', resolutionNotes: c.resolutionNotes || '' });
  };

  const handleStatusUpdate = async () => {
    if (!statusForm.status) { toast.error('Select a status'); return; }
    setSubmitting(true);
    try {
      await complaintAPI.updateStatusStaff(statusModal.id, statusForm);
      toast.success('Status updated successfully!');
      setStatusModal(null);
      fetchComplaints();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{totalElements} assigned complaints</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card py-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <SearchInput value={search} onChange={setSearch} placeholder="Search title or ticket #"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                status === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}>
              {s ? s.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Task cards (mobile friendly) */}
      <div className="block lg:hidden space-y-3">
        {loading ? <PageLoader/> : filtered.length === 0 ? (
          <EmptyState icon="✅" title="No tasks found" subtitle="All caught up!"/>
        ) : filtered.map(c => (
          <div key={c.id} className="card space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{c.title}</p>
                <span className="font-mono text-xs text-slate-400">{c.ticketNumber}</span>
              </div>
              <PriorityBadge priority={c.priority}/>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>👤 {c.student?.name}</span>
              <span>·</span>
              <span>📁 {c.category?.name}</span>
            </div>
            {c.location && <p className="text-xs text-slate-400">📍 {c.location}</p>}
            <div className="flex items-center justify-between">
              <StatusBadge status={c.status}/>
              <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              <Link to={`/complaints/${c.id}`} className="btn-secondary flex-1 py-1.5 text-xs justify-center">View Details</Link>
              <button className="btn-primary flex-1 py-1.5 text-xs" onClick={() => openStatusModal(c)}>Update Status</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block card p-0 overflow-hidden">
        {loading ? <PageLoader/> : filtered.length === 0 ? (
          <EmptyState icon="✅" title="No tasks found" subtitle="You have no assigned complaints"/>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Title</th>
                    <th>Student</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{c.ticketNumber}</span></td>
                      <td>
                        <p className="font-medium text-slate-800 max-w-[180px] truncate">{c.title}</p>
                        {c.location && <p className="text-xs text-slate-400">📍 {c.location}</p>}
                      </td>
                      <td>
                        <p className="text-sm text-slate-700">{c.student?.name}</p>
                        <p className="text-xs text-slate-400">{c.student?.department}</p>
                      </td>
                      <td><span className="text-xs text-slate-500">{c.category?.name}</span></td>
                      <td><PriorityBadge priority={c.priority}/></td>
                      <td><StatusBadge status={c.status}/></td>
                      <td><span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link to={`/complaints/${c.id}`} className="btn-icon text-xs" title="View">👁️</Link>
                          <button className="btn-icon text-xs" title="Update Status" onClick={() => openStatusModal(c)}>🔄</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage}/>
          </>
        )}
      </div>

      {/* Update Status Modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="Update Complaint Status" size="sm">
        {statusModal && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="font-semibold text-slate-700 text-sm">{statusModal.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge status={statusModal.status}/>
                <span className="text-xs text-slate-400">{statusModal.ticketNumber}</span>
              </div>
            </div>
            <div>
              <label className="form-label">New Status *</label>
              <select className="form-select" value={statusForm.status}
                onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                {UPDATABLE_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Remarks / Progress Update</label>
              <textarea className="form-textarea h-24"
                placeholder="Describe what action was taken, current progress, or next steps…"
                value={statusForm.remarks}
                onChange={e => setStatusForm(f => ({ ...f, remarks: e.target.value }))}/>
            </div>
            {(statusForm.status === 'RESOLVED' || statusForm.status === 'CLOSED') && (
              <div>
                <label className="form-label">Resolution Notes *</label>
                <textarea className="form-textarea h-20"
                  placeholder="Explain how the issue was resolved…"
                  value={statusForm.resolutionNotes}
                  onChange={e => setStatusForm(f => ({ ...f, resolutionNotes: e.target.value }))}/>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button className="btn-secondary flex-1" onClick={() => setStatusModal(null)}>Cancel</button>
              <button className="btn-primary flex-1" onClick={handleStatusUpdate} disabled={submitting}>
                {submitting ? <><Spinner size="sm"/> Updating…</> : 'Update Status'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
