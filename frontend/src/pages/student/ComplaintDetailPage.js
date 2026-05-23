import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintAPI } from '../../services/api';
import { StatusBadge, PriorityBadge, PageLoader, Avatar } from '../../components/shared/UIComponents';
import { formatDate, timeAgo } from '../../utils/helpers';

const STATUS_STEPS = ['SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'];
const STATUS_LABELS = {
  SUBMITTED:'Submitted', UNDER_REVIEW:'Under Review', ASSIGNED:'Assigned',
  IN_PROGRESS:'In Progress', RESOLVED:'Resolved', CLOSED:'Closed'
};

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    complaintAPI.getById(id)
      .then(res => setComplaint(res.data.data))
      .catch(() => { toast.error('Complaint not found'); navigate(-1); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader/>;
  if (!complaint) return null;

  const currentStepIndex = STATUS_STEPS.indexOf(complaint.status);

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 mb-2 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="page-title">{complaint.title}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-lg">{complaint.ticketNumber}</span>
            <StatusBadge status={complaint.status}/>
            <PriorityBadge priority={complaint.priority}/>
          </div>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>Submitted {formatDate(complaint.createdAt, 'dd MMM yyyy')}</p>
          <p className="text-xs mt-0.5">{timeAgo(complaint.createdAt)}</p>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-5">Progress</h3>
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide pb-2">
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center min-w-[70px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    done ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-300'
                  } ${active ? 'ring-4 ring-primary-100 scale-110' : ''}`}>
                    {done ? (active ? '●' : '✓') : i + 1}
                  </div>
                  <p className={`text-[10px] font-medium mt-1.5 text-center ${done ? 'text-primary-700' : 'text-slate-400'}`}>
                    {STATUS_LABELS[step]}
                  </p>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 min-w-[20px] ${i < currentStepIndex ? 'bg-primary-500' : 'bg-slate-200'}`}/>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main details */}
        <div className="md:col-span-2 space-y-5">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">📋 Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            {complaint.location && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                <span>📍</span> {complaint.location}
              </div>
            )}
            {complaint.attachmentUrls && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-1 font-medium">📎 Attachment</p>
                <a href={complaint.attachmentUrls} target="_blank" rel="noreferrer"
                  className="text-sm text-primary-600 hover:underline break-all">{complaint.attachmentUrls}</a>
              </div>
            )}
          </div>

          {/* Resolution notes */}
          {complaint.resolutionNotes && (
            <div className="card bg-emerald-50 border-emerald-200">
              <h3 className="font-semibold text-emerald-800 mb-2">✅ Resolution Notes</h3>
              <p className="text-sm text-emerald-700">{complaint.resolutionNotes}</p>
              {complaint.resolvedAt && <p className="text-xs text-emerald-600 mt-2">Resolved on {formatDate(complaint.resolvedAt)}</p>}
            </div>
          )}

          {/* Timeline */}
          {complaint.updates && complaint.updates.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-4">🕐 Activity Timeline</h3>
              <div className="space-y-0">
                {complaint.updates.map((u, i) => (
                  <div key={u.id} className="timeline-item">
                    <div className={`timeline-dot ${
                      u.newStatus === 'RESOLVED' ? 'bg-emerald-500' :
                      u.newStatus === 'IN_PROGRESS' ? 'bg-amber-500' :
                      u.newStatus === 'ASSIGNED' ? 'bg-violet-500' : 'bg-primary-500'
                    }`}/>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-semibold text-slate-700 text-sm">{u.updatedByName}</span>
                        <span className="text-xs text-slate-400">{timeAgo(u.createdAt)}</span>
                      </div>
                      {u.oldStatus && u.newStatus && (
                        <p className="text-xs text-slate-500 mt-1">
                          Changed status: <span className="font-medium">{u.oldStatus?.replace('_',' ')}</span> → <span className="font-semibold text-primary-700">{u.newStatus?.replace('_',' ')}</span>
                        </p>
                      )}
                      {u.remarks && <p className="text-sm text-slate-600 mt-1.5 italic">"{u.remarks}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">📁 Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500 text-xs">Category</dt>
                <dd className="font-medium text-slate-700 mt-0.5">{complaint.category?.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs">Submitted by</dt>
                <dd className="flex items-center gap-2 mt-0.5">
                  <Avatar name={complaint.student?.name} size="sm"/>
                  <span className="font-medium text-slate-700">{complaint.student?.name}</span>
                </dd>
              </div>
              {complaint.assignedTo && (
                <div>
                  <dt className="text-slate-500 text-xs">Assigned to</dt>
                  <dd className="flex items-center gap-2 mt-0.5">
                    <Avatar name={complaint.assignedTo.name} size="sm"/>
                    <div>
                      <p className="font-medium text-slate-700">{complaint.assignedTo.name}</p>
                      <p className="text-xs text-slate-400">{complaint.assignedTo.department}</p>
                    </div>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500 text-xs">Last updated</dt>
                <dd className="font-medium text-slate-700 mt-0.5">{timeAgo(complaint.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
