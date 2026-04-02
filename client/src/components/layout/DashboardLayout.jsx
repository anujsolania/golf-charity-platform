import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: '🏠', label: 'Dashboard', to: '/dashboard' },
  { icon: '⛳', label: 'My Scores', to: '/dashboard/scores' },
  { icon: '🎰', label: 'Draws', to: '/dashboard/draws' },
  { icon: '💚', label: 'My Charity', to: '/dashboard/charity' },
  { icon: '🏆', label: 'Winners', to: '/dashboard/winners' },
  { icon: '⚙️', label: 'Settings', to: '/dashboard/settings' },
];

export default function DashboardLayout() {
  const { user, subscription, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, background: 'rgba(8,15,34,0.95)',
        borderRight: '1px solid var(--color-border)', display: 'flex',
        flexDirection: 'column', padding: '24px 16px', position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 100, overflowY: 'auto',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#050a1a' }}>G</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17 }}>Golf<span style={{ color: 'var(--color-primary)' }}>Charity</span></span>
        </Link>

        {/* Subscription badge */}
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 24, background: subscription?.status === 'active' ? 'rgba(0,212,160,0.1)' : 'rgba(255,77,109,0.1)', border: `1px solid ${subscription?.status === 'active' ? 'rgba(0,212,160,0.3)' : 'rgba(255,77,109,0.3)'}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: subscription?.status === 'active' ? 'var(--color-primary)' : 'var(--color-danger)', marginBottom: 2 }}>Subscription</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{subscription?.status === 'active' ? `${subscription.plan} Plan ✓` : 'Not Subscribed'}</div>
          {!subscription?.status === 'active' && <Link to="/dashboard/subscribe" style={{ color: 'var(--color-primary)', fontSize: 12 }}>Upgrade →</Link>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const active = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            return (
              <Link key={item.to} to={item.to} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: active ? 600 : 400,
                color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: active ? 'var(--color-primary-glow)' : 'transparent',
                border: active ? '1px solid rgba(0,212,160,0.2)' : '1px solid transparent',
                transition: 'var(--transition)',
              }}>{item.icon} {item.label}</Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#050a1a', fontSize: 14 }}>
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.fullName}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(255,77,109,0.1)', color: 'var(--color-danger)', fontSize: 13, fontWeight: 500, border: '1px solid rgba(255,77,109,0.2)', cursor: 'pointer', transition: 'var(--transition)' }}>Sign Out</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 260, flex: 1, padding: '32px', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
