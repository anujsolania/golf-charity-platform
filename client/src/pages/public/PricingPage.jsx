import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, subscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/subscriptions/plans').then(r => setPlans(r.data.plans));
  }, []);

  const handleSubscribe = async (planId) => {
    if (!user) return navigate('/signup');
    setLoading(planId);
    try {
      await api.post('/subscriptions/create', { plan: planId });
      await refreshSubscription();
      toast.success('Subscription activated! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100, background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,160,0.06) 0%, var(--color-bg) 60%)' }}>
      <div className="container" style={{ textAlign: 'center', paddingBottom: 80 }}>
        <div className="badge badge-primary" style={{ marginBottom: 20 }}>Simple Pricing</div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, marginBottom: 16 }}>Choose Your Plan</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 18, marginBottom: 64, maxWidth: 500, margin: '0 auto 64px' }}>Both plans include full draw entry, score tracking, and charity contributions.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 800, margin: '0 auto' }}>
          {plans.map((plan, i) => (
            <div key={plan.id} className={`card animate-fadeInUp delay-${i + 1}`} style={{ padding: 36, position: 'relative', border: plan.badge ? '1px solid rgba(245,200,66,0.4)' : '1px solid var(--color-border)', transform: plan.badge ? 'scale(1.02)' : 'none' }}>
              {plan.badge && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '4px 20px', background: 'var(--gradient-gold)', borderRadius: 'var(--radius-full)', color: '#050a1a', fontWeight: 700, fontSize: 12 }}>{plan.badge}</div>}
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 52, color: plan.badge ? 'var(--color-gold)' : 'var(--color-primary)', lineHeight: 1 }}>
                £{plan.price}<span style={{ fontSize: 18, color: 'var(--color-text-secondary)', fontWeight: 400 }}>/{plan.interval}</span>
              </div>
              <div style={{ margin: '20px 0', padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(0,212,160,0.07)', border: '1px solid rgba(0,212,160,0.15)', fontSize: 13, color: 'var(--color-primary)' }}>
                £{plan.prizeContribution} → Prize Pool · {plan.charityMin}%+ → Charity
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, textAlign: 'left' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className={`btn ${plan.badge ? 'btn-gold' : 'btn-primary'} btn-lg`} style={{ width: '100%' }}
                onClick={() => handleSubscribe(plan.id)} disabled={!!loading || subscription?.status === 'active'}>
                {loading === plan.id ? 'Processing…' : subscription?.plan === plan.id && subscription?.status === 'active' ? '✓ Current Plan' : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Cancel anytime', 'Secure payments', 'Instant activation', '5-score tracking'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', fontSize: 14 }}>
              <span style={{ color: 'var(--color-primary)' }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
