import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminWinnersPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => { fetchVerifications(); }, [statusFilter]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/winners${statusFilter ? `?status=${statusFilter}` : ''}`);
      setVerifications(data.verifications || []);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  const handleReview = async (status) => {
    try {
      await api.patch(`/winners/${reviewModal._id}/review`, { status, adminNotes: notes });
      toast.success(`Claim ${status}!`);
      setReviewModal(null); setNotes('');
      fetchVerifications();
    } catch { toast.error('Failed'); }
  };

  const handlePaid = async (id) => {
    if (!confirm('Mark as paid?')) return;
    try { await api.patch(`/winners/${id}/paid`); toast.success('Marked as paid! 💰'); fetchVerifications(); }
    catch { toast.error('Failed'); }
  };

  const statusBadge = { pending: 'badge-warning', approved: 'badge-primary', rejected: 'badge-danger', paid: 'badge-gold' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 800, marginBottom: 4 }}>🏆 Winner Verification</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Review and approve winner claims.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['', 'pending', 'approved', 'paid', 'rejected'].map(s => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatusFilter(s)}>{s || 'All'}</button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Winner</th><th>Draw</th><th>Tier</th><th>Prize</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Loading…</td></tr> :
              verifications.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No claims found.</td></tr> :
              verifications.map(v => (
                <tr key={v._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v.userId?.fullName}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{v.userId?.email}</div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{v.drawId ? new Date(v.drawId.drawMonth).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}</td>
                  <td><span className="badge badge-gold" style={{ fontSize: 11 }}>{v.tier || '—'}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--color-gold)' }}>£{v.prizeAmount || 0}</td>
                  <td><span className={`badge ${statusBadge[v.status]}`} style={{ fontSize: 11 }}>{v.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{new Date(v.submittedAt).toLocaleDateString('en-GB')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {v.proofUrl && <a href={v.proofUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">📸</a>}
                      {v.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => { setReviewModal(v); setNotes(''); }}>Review</button>}
                      {v.status === 'approved' && <button className="btn btn-gold btn-sm" onClick={() => handlePaid(v._id)}>💰 Pay</button>}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Review Claim — {reviewModal.userId?.fullName}</h3>
              <button onClick={() => setReviewModal(null)} style={{ fontSize: 24, color: 'var(--color-text-secondary)' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', fontSize: 14 }}>
                {reviewModal.tier} · £{reviewModal.prizeAmount}
              </div>
              {reviewModal.proofUrl && <a href={reviewModal.proofUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ textAlign: 'center' }}>📸 View Proof ↗</a>}
              <div className="form-group">
                <label className="form-label">Admin Notes</label>
                <textarea className="form-textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason for approval/rejection…" style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleReview('approved')}>✅ Approve</button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleReview('rejected')}>❌ Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
