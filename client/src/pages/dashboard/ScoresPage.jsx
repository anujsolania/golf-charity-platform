import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ score: '', scoreDate: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { fetchScores(); }, []);

  const fetchScores = async () => {
    try { const { data } = await api.get('/scores'); setScores(data.scores); }
    catch (e) { toast.error('Failed to load scores'); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.score || !form.scoreDate) return toast.error('Score and date are required');
    setSubmitting(true);
    try {
      const { data } = await api.post('/scores', { score: parseInt(form.score), scoreDate: form.scoreDate, notes: form.notes });
      setScores(data.scores);
      setForm({ score: '', scoreDate: '', notes: '' });
      toast.success('Score added! 🏌️');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add score'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (id) => {
    try {
      const { data } = await api.patch(`/scores/${id}`, { score: parseInt(editForm.score), scoreDate: editForm.scoreDate, notes: editForm.notes });
      setScores(prev => prev.map(s => s._id === id ? data.score : s));
      setEditId(null);
      toast.success('Score updated!');
    } catch (e) { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this score?')) return;
    try {
      const { data } = await api.delete(`/scores/${id}`);
      setScores(data.scores);
      toast.success('Score deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const scoreColor = (s) => s >= 35 ? 'var(--color-gold)' : s >= 25 ? 'var(--color-primary)' : '#0099ff';

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>⛳ My Scores</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Track your last 5 Stableford scores. New scores replace the oldest.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Add score form */}
        <div className="card animate-fadeInUp">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Add New Score</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Stableford Score (1–45)</label>
              <input className="form-input" type="number" min="1" max="45" placeholder="e.g. 32" value={form.score} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} required />
              {form.score && (
                <div style={{ marginTop: 8 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(parseInt(form.score) / 45) * 100}%`, background: `${scoreColor(parseInt(form.score))}` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    <span>1</span><span style={{ color: scoreColor(parseInt(form.score)), fontWeight: 600 }}>{form.score} pts</span><span>45</span>
                  </div>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Date Played</label>
              <input className="form-input" type="date" max={new Date().toISOString().split('T')[0]} value={form.scoreDate} onChange={e => setForm(p => ({ ...p, scoreDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <input className="form-input" type="text" placeholder="e.g. Local course, windy day" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} maxLength={200} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding…' : '+ Add Score'}
            </button>
          </form>
        </div>

        {/* Score history */}
        <div className="card animate-fadeInUp delay-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20 }}>My Last 5 Scores</h3>
            <span className="badge badge-primary">{scores.length}/5</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 'var(--radius-md)' }} />)}
            </div>
          ) : scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>⛳</div>
              <div>No scores yet. Add your first!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {scores.map((s, i) => (
                <div key={s._id} style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}>
                  {editId === s._id ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input className="form-input" type="number" min="1" max="45" style={{ width: 80 }} value={editForm.score} onChange={e => setEditForm(p => ({ ...p, score: e.target.value }))} />
                      <input className="form-input" type="date" style={{ flex: 1 }} value={editForm.scoreDate?.split('T')[0] || ''} onChange={e => setEditForm(p => ({ ...p, scoreDate: e.target.value }))} />
                      <button className="btn btn-primary btn-sm" onClick={() => handleEdit(s._id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `radial-gradient(circle, ${scoreColor(s.score)}, ${scoreColor(s.score)}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: '#050a1a' }}>{s.score}</div>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {s.score} pts {i === 0 && <span className="badge badge-primary" style={{ fontSize: 10 }}>Latest</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(s.scoreDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                          {s.notes && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{s.notes}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => { setEditId(s._id); setEditForm({ score: s.score, scoreDate: s.scoreDate, notes: s.notes }); }} title="Edit">✏️</button>
                        <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(s._id)} title="Delete" style={{ color: 'var(--color-danger)' }}>🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {scores.length > 0 && (
            <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(0,212,160,0.06)', border: '1px solid rgba(0,212,160,0.15)', fontSize: 13, color: 'var(--color-text-secondary)' }}>
              💡 These <strong>{scores.length}</strong> scores are your draw entry numbers: <strong style={{ color: 'var(--color-primary)' }}>{scores.map(s => s.score).join(', ')}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
