import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintAPI, userAPI, categoryAPI } from '../../services/api';
import { StatusBadge, PriorityBadge, PageLoader, EmptyState, Pagination, SearchInput, Modal, Spinner } from '../../components/shared/UIComponents';
import { timeAgo, getErrorMessage } from '../../utils/helpers';

const STATUSES   = ['','SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'];
const PRIORITIES = ['','LOW','MEDIUM','HIGH','CRITICAL'];
const ALL_STATUSES = ['SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'];

export default function AdminComplaints() {
  const [complaints,  setComplaints]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [totalElements, setTotal]     = useState(0);
  const [filters, setFilters]         = useState({ status:'', priority:'', categoryId:'', keyword:'' });
  const [staffList, setStaffList]     = useState([]);
  const [categories, setCategories]   = useState([]);

  // Modals
  const [assignModal, setAssignModal]   = useState(null); // complaint
  const [statusModal, setStatusModal]   = useState(null); // complaint
  const [assignForm, setAssignForm]     = useState({ staffId:'', remarks:'' });
  const [statusForm, setStatusForm]     = useState({ status:'', remarks:'', resolutionNotes:'' });
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    Promise.all([userAPI.getAllStaff(), categoryAPI.getActive()])
      .then(([s, c]) => { setStaffList(s.data.data || []); setCategories(c.data.data || []); })
      .catch(() => {});
  }, []);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
      const res = await complaintAPI.getAll(params);
      const d = res.data.data;
      setComplaints(d.content || []);
      setTotalPages(d.totalPages || 0);
      setTotal(d.totalElements || 0);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const setFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(0); };

  const handleAssign = async () => {
    if (!assignForm.staffId) { toast.error('Select a staff member'); return; }
    setSubmitting(true);
    try {
      await complaintAPI.assign(assignModal.id, { staffId: Number(assignForm.staffId), remarks: assignForm.remarks });
      toast.success('Complaint assigned!');
      setAssignModal(null);
      fetchComplaints();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async () => {
    if (!statusForm.status) { toast.error('Select a status'); return; }
    setSubmitting(true);
    try {
      await complaintAPI.updateStatus(statusModal.id, statusForm);
      toast.success('Status updated!');
      setStatusModal(null);
      fetchComplaints();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">All Complaints</h1>
          <p className="page-subtitle">{totalElements} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card py-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <SearchInput value={filters.keyword} onChange={v => setFilter('keyword', v)} placeholder="Search title or ticket #"/>
          </div>
          <select className="form-select w-40" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.slice(1).map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
          <select className="form-select w-36" value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="form-select w-44" value={filters.categoryId} onChange={e => setFilter('categoryId', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? <PageLoader/> : complaints.length === 0 ? (
          <EmptyState icon="📭" title="No complaints found" subtitle="Try adjusting the filters"/>
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
                    <th>Assigned To</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{c.ticketNumber}</span></td>
                      <td>
                        <p className="font-medium text-slate-800 max-w-[160px] truncate">{c.title}</p>
                        {c.location && <p className="text-xs text-slate-400">📍 {c.location}</p>}
                      </td>
                      <td><span className="text-sm text-slate-600">{c.student?.name}</span></td>
                      <td><span className="text-xs text-slate-500">{c.category?.name}</span></td>
                      <td><PriorityBadge priority={c.priority}/></td>
                      <td><StatusBadge status={c.status}/></td>
                      <td>
                        {c.assignedTo
                          ? <span className="text-xs text-slate-600">{c.assignedTo.name}</span>
                          : <span className="text-xs text-slate-400 italic">Unassigned</span>
                        }
                      </td>
                      <td><span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link to={`/complaints/${c.id}`} className="btn-icon text-xs" title="View">👁️</Link>
                          <button className="btn-icon text-xs" title="Assign" onClick={() => { setAssignModal(c); setAssignForm({ staffId:'', remarks:'' }); }}>👤</button>
                          <button className="btn-icon text-xs" title="Update Status" onClick={() => { setStatusModal(c); setStatusForm({ status: c.status, remarks:'', resolutionNotes: c.resolutionNotes || '' }); }}>🔄</button>
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

      {/* Assign Modal */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Complaint" size="sm">
        {assignModal && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <p className="font-semibold text-slate-700">{assignModal.title}</p>
              <p className="text-xs text-slate-400 mt-1">{assignModal.ticketNumber}</p>
            </div>
            <div>
              <label className="form-label">Assign to Staff *</label>
              <select className="form-select" value={assignForm.staffId} onChange={e => setAssignForm(f => ({ ...f, staffId: e.target.value }))}>
                <option value="">Select staff member...</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Remarks (optional)</label>
              <textarea className="form-textarea h-20" placeholder="Any instructions..."
                value={assignForm.remarks} onChange={e => setAssignForm(f => ({ ...f, remarks: e.target.value }))}/>
            </div>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleAssign} disabled={submitting}>
                {submitting ? <><Spinner size="sm"/> Assigning...</> : 'Assign'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="Update Status" size="sm">
        {statusModal && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <p className="font-semibold text-slate-700">{statusModal.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={statusModal.status}/>
                <span className="text-xs text-slate-400">{statusModal.ticketNumber}</span>
              </div>
            </div>
            <div>
              <label className="form-label">New Status *</label>
              <select className="form-select" value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Remarks</label>
              <textarea className="form-textarea h-20" placeholder="Remarks or notes..."
                value={statusForm.remarks} onChange={e => setStatusForm(f => ({ ...f, remarks: e.target.value }))}/>
            </div>
            {(statusForm.status === 'RESOLVED' || statusForm.status === 'CLOSED') && (
              <div>
                <label className="form-label">Resolution Notes</label>
                <textarea className="form-textarea h-20" placeholder="Describe how this was resolved..."
                  value={statusForm.resolutionNotes} onChange={e => setStatusForm(f => ({ ...f, resolutionNotes: e.target.value }))}/>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setStatusModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleStatusUpdate} disabled={submitting}>
                {submitting ? <><Spinner size="sm"/> Updating...</> : 'Update Status'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
