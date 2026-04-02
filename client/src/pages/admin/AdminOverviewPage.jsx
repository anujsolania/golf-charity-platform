import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.stats)).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: 'var(--color-primary)', sub: 'Registered subscribers' },
    { icon: '💳', label: 'Active Subs', value: stats.activeSubscriptions, color: 'var(--color-primary)', sub: 'Currently active' },
    { icon: '💰', label: 'Monthly Revenue', value: `£${stats.monthlyRevenue?.toFixed(2)}`, color: 'var(--color-gold)', sub: 'From active plans' },
    { icon: '💚', label: 'Charity Raised', value: `£${stats.totalCharityRaised?.toLocaleString()}`, color: '#22c55e', sub: `${stats.totalDonors} donors` },
    { icon: '🎰', label: 'Total Draws', value: stats.totalDraws, color: '#0099ff', sub: 'Completed draws' },
    { icon: '⏳', label: 'Pending Claims', value: stats.pendingVerifications, color: 'var(--color-warning)', sub: 'Awaiting review' },
  ] : [];

  const quickLinks = [
    { icon: '🎰', label: 'Run Monthly Draw', to: '/admin/draws', color: 'var(--color-primary)' },
    { icon: '👥', label: 'Manage Users', to: '/admin/users', color: 'var(--color-gold)' },
    { icon: '🏆', label: 'Review Winners', to: '/admin/winners', color: 'var(--color-warning)' },
    { icon: '📈', label: 'View Reports', to: '/admin/reports', color: '#0099ff' },
    { icon: '💚', label: 'Manage Charities', to: '/admin/charities', color: '#22c55e' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>📊 Admin Overview</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Platform health at a glance.</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
          {statCards.map((s, i) => (
            <div key={i} className={`card animate-fadeInUp delay-${i + 1}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card animate-fadeInUp delay-4">
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {quickLinks.map(ql => (
            <Link key={ql.to} to={ql.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', textDecoration: 'none', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ql.color; e.currentTarget.style.background = `${ql.color}15`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
              <div style={{ fontSize: 32 }}>{ql.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', color: 'var(--color-text)' }}>{ql.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
