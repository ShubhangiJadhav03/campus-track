import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { categoryAPI } from '../../services/api';
import {
  PageLoader, EmptyState, Modal, Spinner, ConfirmModal
} from '../../components/shared/UIComponents';
import { getCategoryIcon, getErrorMessage } from '../../utils/helpers';

const ICONS = ['wifi','school','computer','construction','hotel','person','cleaning_services','bolt','water','sports'];

const defaultForm = { name: '', description: '', icon: 'bolt', isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [form,       setForm]       = useState(defaultForm);
  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,  setDeleting]    = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.data || []);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditItem(null);
    setForm(defaultForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditItem(cat);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || 'bolt', isActive: cat.isActive });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editItem) {
        await categoryAPI.update(editItem.id, form);
        toast.success('Category updated!');
      } else {
        await categoryAPI.create(form);
        toast.success('Category created!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await categoryAPI.delete(deleteTarget.id);
      toast.success('Category deactivated!');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} complaint categories</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>➕ Add Category</button>
      </div>

      {loading ? <PageLoader/> : categories.length === 0 ? (
        <EmptyState icon="🏷️" title="No categories yet" subtitle="Add your first category to get started"/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className={`card-hover transition-all ${!cat.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`badge ${cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <h3 className="font-display font-bold text-slate-800 mb-1">{cat.name}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{cat.description || 'No description'}</p>
              <div className="flex gap-2">
                <button className="btn-secondary flex-1 py-1.5 text-xs" onClick={() => openEdit(cat)}>✏️ Edit</button>
                {cat.isActive && (
                  <button className="btn-danger flex-1 py-1.5 text-xs" onClick={() => setDeleteTarget(cat)}>🗑️ Deactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Category' : 'Add Category'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="form-label">Category Name *</label>
            <input className={errors.name ? 'form-input-error' : 'form-input'}
              placeholder="e.g. WiFi & Internet"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}/>
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-textarea h-20" placeholder="Brief description of this category"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}/>
          </div>
          <div>
            <label className="form-label">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map(ic => (
                <button key={ic} type="button"
                  onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  className={`p-2 rounded-xl border-2 text-xl flex items-center justify-center transition-all ${
                    form.icon === ic ? 'border-primary-500 bg-primary-50' : 'border-slate-100 hover:border-slate-200'
                  }`}>
                  {getCategoryIcon(ic)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" className="w-4 h-4 accent-primary-600 cursor-pointer"
              checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}/>
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">Active</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? <><Spinner size="sm"/> Saving...</> : editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deactivate Category"
        message={`Deactivate "${deleteTarget?.name}"? Existing complaints will not be affected, but students won't be able to select this category for new complaints.`}
        confirmLabel={deleting ? 'Deactivating…' : 'Deactivate'}
        danger
      />
    </div>
  );
}
