import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintAPI, categoryAPI } from '../../services/api';
import { getErrorMessage, getCategoryIcon } from '../../utils/helpers';
import { Spinner, PageLoader } from '../../components/shared/UIComponents';

const PRIORITIES = [
  { value:'LOW',      label:'Low',      desc:'Minor inconvenience',     color:'text-green-600',  bg:'bg-green-50 border-green-200' },
  { value:'MEDIUM',   label:'Medium',   desc:'Moderate issue',          color:'text-yellow-600', bg:'bg-yellow-50 border-yellow-200' },
  { value:'HIGH',     label:'High',     desc:'Significant disruption',  color:'text-orange-600', bg:'bg-orange-50 border-orange-200' },
  { value:'CRITICAL', label:'Critical', desc:'Safety or health risk',   color:'text-red-600',    bg:'bg-red-50 border-red-200' },
];

export default function NewComplaintPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [loadCats, setLoadCats]     = useState(true);
  const [errors, setErrors]         = useState({});
  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', priority: 'MEDIUM', location: '', attachmentUrls: '',
  });

  useEffect(() => {
    categoryAPI.getActive()
      .then(res => setCategories(res.data.data || []))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoadCats(false));
  }, []);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title || form.title.length < 5)      e.title       = 'Title must be at least 5 characters';
    if (!form.description || form.description.length < 10) e.description = 'Description must be at least 10 characters';
    if (!form.categoryId)                           e.categoryId  = 'Please select a category';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await complaintAPI.create({ ...form, categoryId: Number(form.categoryId) });
      toast.success(`Complaint submitted! Ticket: ${res.data.data.ticketNumber} 🎉`);
      navigate('/student/complaints');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  if (loadCats) return <PageLoader/>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Submit New Complaint</h1>
        <p className="page-subtitle">Fill in the details below. We'll track and resolve your issue.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">📝 Complaint Details</h3>
          <div>
            <label className="form-label">Complaint Title *</label>
            <input className={errors.title ? 'form-input-error' : 'form-input'}
              placeholder="Brief title describing the issue" maxLength={255}
              value={form.title} onChange={e => set('title', e.target.value)}/>
            {errors.title && <p className="form-error">{errors.title}</p>}
            <p className="text-xs text-slate-400 mt-1">{form.title.length}/255</p>
          </div>
          <div>
            <label className="form-label">Description *</label>
            <textarea className={`form-textarea h-32 ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Describe the issue in detail. Include when it started, how severe it is, etc."
              value={form.description} onChange={e => set('description', e.target.value)}/>
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>
          <div>
            <label className="form-label">Location</label>
            <input className="form-input" placeholder="e.g. Block A, Room 301, Floor 2"
              value={form.location} onChange={e => set('location', e.target.value)}/>
          </div>
        </div>

        {/* Category */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">🏷️ Category *</h3>
          {errors.categoryId && <p className="form-error mb-2">{errors.categoryId}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map(cat => (
              <button key={cat.id} type="button"
                onClick={() => set('categoryId', cat.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.categoryId == cat.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-100 hover:border-primary-200 hover:bg-slate-50'
                }`}>
                <span className="text-xl block mb-1">{getCategoryIcon(cat.icon)}</span>
                <p className="text-xs font-semibold truncate">{cat.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">⚡ Priority Level</h3>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITIES.map(p => (
              <button key={p.value} type="button"
                onClick={() => set('priority', p.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.priority === p.value ? `${p.bg} border-current` : 'border-slate-100 hover:border-slate-200'
                }`}>
                <p className={`text-sm font-semibold ${form.priority === p.value ? p.color : 'text-slate-700'}`}>{p.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Attachments (URL-based for simplicity) */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3">📎 Attachment URL (optional)</h3>
          <input className="form-input" placeholder="Paste image or file URL (Google Drive, etc.)"
            value={form.attachmentUrls} onChange={e => set('attachmentUrls', e.target.value)}/>
          <p className="text-xs text-slate-400 mt-1.5">Tip: Upload images to Google Drive and paste the shareable link</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <><Spinner size="sm"/> Submitting...</> : '🚀 Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}
