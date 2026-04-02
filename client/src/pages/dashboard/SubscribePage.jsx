import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SubscribePage() {
  const [plans, setPlans] = useState([]);
  const [charities, setCharities] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedCharity, setSelectedCharity] = useState('');
  const [pct, setPct] = useState(10);
  const [loading, setLoading] = useState(false);
  const { subscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/subscriptions/plans'), api.get('/charities?limit=20')])
      .then(([p, c]) => { setPlans(p.data.plans); setCharities(c.data.charities || []); });
  }, []);

  if (subscription?.status === 'active') {
    navigate('/dashboard'); return null;
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await api.post('/subscriptions/create', { plan: selectedPlan, charityId: selectedCharity || undefined, charityContributionPct: pct });
      await refreshSubscription();
      toast.success('🎉 Welcome to GolfCharity! You\'re all set.');
      navigate('/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Subscription failed'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>💳 Subscribe</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Choose your plan and start playing.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Plan selection */}
          <div className="card animate-fadeInUp">
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>1. Choose Plan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {plans.map(plan => (
                <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} style={{ padding: 20, borderRadius: 'var(--radius-md)', cursor: 'pointer', border: `2px solid ${selectedPlan === plan.id ? 'var(--color-primary)' : 'var(--color-border)'}`, background: selectedPlan === plan.id ? 'rgba(0,212,160,0.08)' : 'rgba(255,255,255,0.02)', transition: 'var(--transition)', position: 'relative' }}>
                  {plan.badge && <div style={{ position: 'absolute', top: -10, right: 12, padding: '3px 12px', background: 'var(--gradient-gold)', borderRadius: 'var(--radius-full)', color: '#050a1a', fontWeight: 700, fontSize: 11 }}>{plan.badge}</div>}
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 36, color: selectedPlan === plan.id ? 'var(--color-primary)' : 'var(--color-text)', marginBottom: 12 }}>£{plan.price}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-secondary)' }}>/{plan.interval}</span></div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>£{plan.prizeContribution} → Prize Pool</div>
                </div>
              ))}
            </div>
          </div>

          {/* Charity */}
          <div className="card animate-fadeInUp delay-2">
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>2. Pick a Charity (optional)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {charities.slice(0, 6).map(c => (
                <div key={c._id} onClick={() => setSelectedCharity(c._id)} style={{ padding: 12, borderRadius: 'var(--radius-md)', cursor: 'pointer', border: `2px solid ${selectedCharity === c._id ? 'var(--color-primary)' : 'var(--color-border)'}`, background: selectedCharity === c._id ? 'rgba(0,212,160,0.08)' : 'rgba(255,255,255,0.02)', transition: 'var(--transition)', textAlign: 'center' }}>
                  <div style={{ width: '100%', height: 60, borderRadius: 'var(--radius-sm)', background: `url(${c.imageUrl}) center/cover`, marginBottom: 8 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{c.name}</div>
                  {selectedCharity === c._id && <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 4 }}>✓ Selected</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Contribution */}
          <div className="card animate-fadeInUp delay-3">
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>3. Charity Contribution</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Minimum 10%</span>
              <span style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 800, color: 'var(--color-primary)' }}>{pct}%</span>
            </div>
            <input type="range" min="10" max="100" value={pct} onChange={e => setPct(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
            {selectedPlanData && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 10 }}>= £{(selectedPlanData.price * pct / 100).toFixed(2)} per {selectedPlanData.interval} to charity</div>}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="card animate-fadeInUp delay-4" style={{ position: 'sticky', top: 24 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Order Summary</h3>
            {selectedPlanData ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {[
                    ['Plan', `${selectedPlanData.name} — £${selectedPlanData.price}/${selectedPlanData.interval}`],
                    ['Prize Pool', `£${selectedPlanData.prizeContribution}/${selectedPlanData.interval}`],
                    ['Charity', `${pct}% = £${(selectedPlanData.price * pct / 100).toFixed(2)}`],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{l}</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: 'var(--color-primary)' }}>£{selectedPlanData.price}/{selectedPlanData.interval}</span>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubscribe} disabled={loading}>
                  {loading ? 'Processing…' : `Subscribe — £${selectedPlanData.price}`}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                  {['Cancel anytime', 'Instant draw entry', 'Secure checkout'].map(f => (
                    <div key={f} style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--color-primary)' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="skeleton" style={{ height: 200 }} />}
          </div>
        </div>
      </div>
    </div>
  );
}
