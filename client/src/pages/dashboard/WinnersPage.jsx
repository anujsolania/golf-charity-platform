import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function WinnersPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/winners/my').then(r => setVerifications(r.data.verifications || [])).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) return toast.error('Please select a file');
    const form = new FormData(e.target);
    setUploading(true);
    try {
      const { data } = await api.post('/winners/submit-proof', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setVerifications(prev => [data.verification, ...prev]);
      toast.success('Proof submitted! Our team will review it. 🏆');
      e.target.reset();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const statusBadge = { pending: 'badge-warning', approved: 'badge-primary', rejected: 'badge-danger', paid: 'badge-gold' };
  const statusColor = { pending: 'var(--color-warning)', approved: 'var(--color-primary)', rejected: 'var(--color-danger)', paid: 'var(--color-gold)' };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>🏆 Winner Verification</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Upload proof to claim your prizes.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card animate-fadeInUp">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Submit Proof</h3>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Draw ID</label>
              <input className="form-input" name="drawId" placeholder="Paste draw ID from results email" required />
            </div>
            <div className="form-group">
              <label className="form-label">Draw Entry ID</label>
              <input className="form-input" name="drawEntryId" placeholder="Your entry ID" required />
            </div>
            <div className="form-group">
              <label className="form-label">Score Card Screenshot</label>
              <div style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: 28, textAlign: 'center', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Click to upload</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>PNG, JPG, PDF — Max 5MB</div>
              </div>
              <input ref={fileRef} type="file" name="proof" accept="image/*,.pdf" style={{ display: 'none' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading…' : '📤 Submit for Review'}</button>
          </form>
        </div>

        <div className="card animate-fadeInUp delay-2">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>My Claims</h3>
          {loading ? <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-md)' }} /> :
            verifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                <div>No claims yet. Win a draw and submit proof!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {verifications.map(v => (
                  <div key={v._id} style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: `1px solid ${statusColor[v.status]}30` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600 }}>{v.tier || 'Prize'} · £{v.prizeAmount}</div>
                      <span className={`badge ${statusBadge[v.status]}`}>{v.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Submitted {new Date(v.submittedAt).toLocaleDateString('en-GB')}</div>
                    {v.adminNotes && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8 }}>Note: {v.adminNotes}</div>}
                    <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                      {['pending','approved','paid'].map((s, i) => (
                        <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: ['pending','approved','paid'].indexOf(v.status) >= i && v.status !== 'rejected' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
