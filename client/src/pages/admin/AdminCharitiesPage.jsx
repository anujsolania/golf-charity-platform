import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCharity, setEditCharity] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', shortDescription: '', imageUrl: '', websiteUrl: '', category: 'General', isFeatured: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCharities(); }, []);

  const fetchCharities = async () => {
    setLoading(true);
    try { const { data } = await api.get('/charities?limit=50'); setCharities(data.charities || []); }
    catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editCharity) { await api.patch(`/charities/${editCharity._id}`, form); toast.success('Charity updated!'); }
      else { await api.post('/charities', form); toast.success('Charity created!'); }
      setShowForm(false); setEditCharity(null); setForm({ name: '', description: '', shortDescription: '', imageUrl: '', websiteUrl: '', category: 'General', isFeatured: false });
      fetchCharities();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this charity?')) return;
    try { await api.delete(`/charities/${id}`); toast.success('Charity deactivated'); fetchCharities(); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (c) => { setForm({ name: c.name, description: c.description, shortDescription: c.shortDescription || '', imageUrl: c.imageUrl || '', websiteUrl: c.websiteUrl || '', category: c.category || 'General', isFeatured: c.isFeatured }); setEditCharity(c); setShowForm(true); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 800, marginBottom: 4 }}>💚 Charities</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Manage all charity partners.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditCharity(null); setForm({ name: '', description: '', shortDescription: '', imageUrl: '', websiteUrl: '', category: 'General', isFeatured: false }); }}>+ Add Charity</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />) :
          charities.map(c => (
            <div key={c._id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ height: 120, background: `url(${c.imageUrl}) center/cover`, position: 'relative' }}>
                {c.isFeatured && <div className="badge badge-gold" style={{ position: 'absolute', top: 10, left: 10 }}>⭐ Featured</div>}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                  <span className="badge badge-primary" style={{ fontSize: 11 }}>{c.category}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{c.shortDescription || c.description?.slice(0, 80) + '…'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>£{c.totalRaised?.toLocaleString()} raised</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{c.donorCount} donors</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(c)}>✏️ Edit</button>
                  <button className="btn btn-sm" style={{ flex: 1, background: 'rgba(255,77,109,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(255,77,109,0.2)' }} onClick={() => handleDelete(c._id)}>🗑️ Remove</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editCharity ? 'Edit Charity' : 'Add Charity'}</h3>
              <button onClick={() => setShowForm(false)} style={{ fontSize: 20, color: 'var(--color-text-secondary)' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Short Description</label><input className="form-input" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Full Description</label><textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical', minHeight: 80 }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{['Environment','Children','Veterans','Hunger','Health','Education','General'].map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />
                Feature on homepage
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
