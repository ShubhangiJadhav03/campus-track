import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintAPI } from '../../services/api';
import { StatusBadge, PriorityBadge, PageLoader, EmptyState, Pagination, SearchInput } from '../../components/shared/UIComponents';
import { timeAgo, formatDate } from '../../utils/helpers';

const STATUSES = ['','SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'];

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotal]   = useState(0);
  const [status, setStatus]         = useState('');
  const [search, setSearch]         = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getMyComplaints({
        page, size: 10,
        ...(status ? { status } : {}),
      });
      const data = res.data.data;
      setComplaints(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotal(data.totalElements || 0);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const filtered = search
    ? complaints.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.ticketNumber.includes(search))
    : complaints;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">My Complaints</h1>
          <p className="page-subtitle">{totalElements} total</p>
        </div>
        <Link to="/student/new-complaint" className="btn-primary">➕ New Complaint</Link>
      </div>

      {/* Filters */}
      <div className="card py-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <SearchInput value={search} onChange={setSearch} placeholder="Search complaints or ticket #"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                status === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? <PageLoader/> : filtered.length === 0 ? (
          <EmptyState icon="📭" title="No complaints found" subtitle="Try adjusting filters or submit a new complaint"/>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{c.ticketNumber}</span></td>
                      <td>
                        <p className="font-medium text-slate-800 max-w-[200px] truncate">{c.title}</p>
                        {c.location && <p className="text-xs text-slate-400 mt-0.5">📍 {c.location}</p>}
                      </td>
                      <td><span className="text-xs text-slate-600">{c.category?.name}</span></td>
                      <td><PriorityBadge priority={c.priority}/></td>
                      <td><StatusBadge status={c.status}/></td>
                      <td><span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span></td>
                      <td>
                        <Link to={`/complaints/${c.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">View →</Link>
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
    </div>
  );
}
