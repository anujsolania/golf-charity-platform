import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CharityPage() {
  const { subscription, refreshSubscription } = useAuth();
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [pct, setPct] = useState(subscription?.charityContributionPct || 10);
  const [selected, setSelected] = useState(subscription?.charityId?._id || null);
  const [donateAmount, setDonateAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [donating, setDonating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/charities?limit=20').then(r => setCharities(r.data.charities || []));
  }, []);

  const filtered = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/subscriptions/charity', { charityId: selected, charityContributionPct: pct });
      await refreshSubscription();
      toast.success('Charity & contribution updated! 💚');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) return toast.error('Enter a valid amount');
    if (!selected) return toast.error('Select a charity first');
    setDonating(true);
    try {
      await api.post('/charities/donate', { charityId: selected, amount: parseFloat(donateAmount) });
      toast.success(`Donated £${donateAmount}! Thank you 💚`);
      setDonateAmount('');
    } catch (e) { toast.error('Donation failed'); }
    finally { setDonating(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>💚 My Charity</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Choose your cause and set your contribution percentage.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Charity browser */}
        <div>
          <input className="form-input" placeholder="🔍 Search charities…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {filtered.map(c => (
              <div key={c._id} onClick={() => setSelected(c._id)} style={{ padding: 16, borderRadius: 'var(--radius-md)', cursor: 'pointer', border: `2px solid ${selected === c._id ? 'var(--color-primary)' : 'var(--color-border)'}`, background: selected === c._id ? 'rgba(0,212,160,0.08)' : 'rgba(255,255,255,0.03)', transition: 'var(--transition)' }}>
                <div style={{ width: '100%', height: 90, borderRadius: 'var(--radius-sm)', background: `url(${c.imageUrl}) center/cover`, marginBottom: 10 }} />
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>£{c.totalRaised?.toLocaleString()} raised</div>
                {selected === c._id && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--color-primary)', fontWeight: 700 }}>✓ Selected</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Settings panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Current charity */}
          {subscription?.charityId && (
            <div className="card" style={{ border: '1px solid rgba(0,212,160,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Current Charity</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `url(${subscription.charityId.imageUrl}) center/cover`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{subscription.charityId.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{subscription.charityId.category}</div>
                </div>
              </div>
            </div>
          )}

          {/* Contribution slider */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Contribution Percentage</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Min 10%</span>
              <span style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, color: 'var(--color-primary)' }}>{pct}%</span>
            </div>
            <input type="range" min="10" max="100" value={pct} onChange={e => setPct(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)', marginBottom: 12 }} />
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '8px 12px', background: 'rgba(0,212,160,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,212,160,0.15)' }}>
              Monthly: £{((subscription?.amount || 9.99) * pct / 100).toFixed(2)} to charity
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>

          {/* One-off donation */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>💝 One-Off Donation</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" type="number" min="0.01" step="0.01" placeholder="£" value={donateAmount} onChange={e => setDonateAmount(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-outline btn-sm" onClick={handleDonate} disabled={donating}>{donating ? '…' : 'Donate'}</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {[5, 10, 25, 50].map(a => (
                <button key={a} className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setDonateAmount(String(a))}>£{a}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
