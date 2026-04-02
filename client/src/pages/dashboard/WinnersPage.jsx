import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function WinnersPage() {
  const [verifications, setVerifications] = useState([]);
  const [wonEntries, setWonEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    Promise.all([
      api.get('/winners/my'),
      api.get('/draws/my-history').catch(() => ({ data: { entries: [] } })),
    ]).then(([v, h]) => {
      setVerifications(v.data.verifications || []);
      // Only show draw entries where user won a tier
      const wins = (h.data.entries || []).filter(e => e.tier && e.prizePayout > 0);
      setWonEntries(wins);
    }).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedEntry) return toast.error('Please select a draw you won');
    const file = fileRef.current?.files[0];
    if (!file) return toast.error('Please select a score card screenshot');
    if (file.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB');

    const form = new FormData();
    form.append('drawId', selectedEntry.drawId._id);
    form.append('drawEntryId', selectedEntry._id);
    form.append('prizeAmount', selectedEntry.prizePayout);
    form.append('tier', selectedEntry.tier);
    form.append('proof', file);

    setUploading(true);
    try {
      const { data } = await api.post('/winners/submit-proof', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVerifications(prev => [data.verification, ...prev]);
      toast.success('Proof submitted! Our team will review it. 🏆');
      setSelectedEntry(null);
      setFileName('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const statusBadge = { pending: 'badge-warning', approved: 'badge-primary', rejected: 'badge-danger', paid: 'badge-gold' };
  const statusColor = { pending: 'var(--color-warning)', approved: 'var(--color-primary)', rejected: 'var(--color-danger)', paid: 'var(--color-gold)' };
  const statusIcon = { pending: '⏳', approved: '✅', rejected: '❌', paid: '💰' };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>🏆 Winner Verification</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Won a draw? Select it below, upload your score card proof, and claim your prize.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Submit Proof */}
        <div className="card animate-fadeInUp">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Claim Your Prize</h3>

          {wonEntries.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎰</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>No wins to claim yet</div>
              <div style={{ fontSize: 13 }}>Keep adding scores and entering draws each month!</div>
            </div>
          ) : (
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Win selector */}
              <div className="form-group">
                <label className="form-label">Select Your Winning Draw</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {loading ? (
                    <div className="skeleton" style={{ height: 70, borderRadius: 'var(--radius-md)' }} />
                  ) : (
                    wonEntries.map(entry => {
                      const alreadyClaimed = verifications.some(v =>
                        v.drawId?._id === entry.drawId?._id || v.drawId === entry.drawId?._id
                      );
                      const isSelected = selectedEntry?._id === entry._id;
                      return (
                        <div
                          key={entry._id}
                          onClick={() => !alreadyClaimed && setSelectedEntry(isSelected ? null : entry)}
                          style={{
                            padding: '14px 16px', borderRadius: 'var(--radius-md)',
                            border: `2px solid ${isSelected ? 'var(--color-gold)' : alreadyClaimed ? 'rgba(255,255,255,0.05)' : 'var(--color-border)'}`,
                            background: isSelected ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.03)',
                            cursor: alreadyClaimed ? 'not-allowed' : 'pointer',
                            opacity: alreadyClaimed ? 0.5 : 1,
                            transition: 'var(--transition)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>
                                {entry.drawId ? new Date(entry.drawId.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Draw'}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                                {entry.tier} · {entry.matchCount} matches
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: 'var(--color-gold)' }}>
                                £{(entry.prizePayout || 0).toFixed(2)}
                              </div>
                              {alreadyClaimed && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Already claimed</div>}
                              {isSelected && <div style={{ fontSize: 11, color: 'var(--color-gold)' }}>✓ Selected</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* File upload */}
              <div className="form-group">
                <label className="form-label">Score Card Screenshot</label>
                <div
                  style={{
                    border: `2px dashed ${fileName ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)', padding: 28, textAlign: 'center', cursor: 'pointer',
                    background: fileName ? 'rgba(0,212,160,0.04)' : 'transparent', transition: 'var(--transition)',
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{fileName ? '✅' : '📸'}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{fileName || 'Click to upload'}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>PNG, JPG, PDF — Max 5MB</div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={e => setFileName(e.target.files?.[0]?.name || '')}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading || !selectedEntry || !fileName}
              >
                {uploading ? 'Uploading…' : '📤 Submit for Review'}
              </button>
            </form>
          )}
        </div>

        {/* My Claims */}
        <div className="card animate-fadeInUp delay-2">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>My Claims</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-md)' }} />
          ) : verifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
              <div>No claims yet. Win a draw and submit proof!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {verifications.map(v => (
                <div key={v._id} style={{
                  padding: 16, borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${statusColor[v.status]}30`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{v.tier || 'Prize'}</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: 'var(--color-gold)' }}>
                        £{(v.prizeAmount || 0).toFixed(2)}
                      </div>
                    </div>
                    <span className={`badge ${statusBadge[v.status]}`}>
                      {statusIcon[v.status]} {v.status}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    {['pending', 'approved', 'paid'].map((s, i) => (
                      <div key={s} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: ['pending', 'approved', 'paid'].indexOf(v.status) >= i && v.status !== 'rejected'
                          ? statusColor[v.status]
                          : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.5s ease',
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Submitted {new Date(v.submittedAt || v.createdAt).toLocaleDateString('en-GB')}
                  </div>
                  {v.adminNotes && (
                    <div style={{
                      fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8,
                      padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
                      borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${statusColor[v.status]}`,
                    }}>
                      Admin note: {v.adminNotes}
                    </div>
                  )}
                  {v.proofUrl && (
                    <a href={v.proofUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--color-primary)' }}>
                      📸 View submitted proof ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
