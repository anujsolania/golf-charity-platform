import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { icon: '📊', label: 'Overview', to: '/admin' },
  { icon: '👥', label: 'Users', to: '/admin/users' },
  { icon: '🎰', label: 'Draws', to: '/admin/draws' },
  { icon: '💚', label: 'Charities', to: '/admin/charities' },
  { icon: '🏆', label: 'Winners', to: '/admin/winners' },
  { icon: '📈', label: 'Reports', to: '/admin/reports' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, background: 'rgba(5,5,15,0.98)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0, bottom: 0, overflowY: 'auto', zIndex: 100 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#050a1a' }}>A</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>Admin <span style={{ color: 'var(--color-gold)' }}>Panel</span></span>
        </Link>
        <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-gold-glow)', border: '1px solid rgba(245,200,66,0.3)', fontSize: 11, fontWeight: 600, color: 'var(--color-gold)', marginBottom: 28, width: 'fit-content' }}>ADMINISTRATOR</div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {adminNav.map(item => {
            const active = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: active ? 600 : 400, color: active ? 'var(--color-gold)' : 'var(--color-text-secondary)', background: active ? 'var(--color-gold-glow)' : 'transparent', border: active ? '1px solid rgba(245,200,66,0.2)' : '1px solid transparent', transition: 'var(--transition)' }}>{item.icon} {item.label}</Link>
            );
          })}
        </nav>
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>{user?.email}</div>
          <Link to="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 8 }}>← User View</Link>
          <button onClick={logout} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(255,77,109,0.1)', color: 'var(--color-danger)', fontSize: 13, border: '1px solid rgba(255,77,109,0.2)', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </aside>
      <main style={{ marginLeft: 240, flex: 1, padding: '32px', minHeight: '100vh' }}><Outlet /></main>
    </div>
  );
}
