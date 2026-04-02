import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const navItems = [
  { icon: '🏠', label: 'Dashboard', to: '/dashboard' },
  { icon: '⛳', label: 'My Scores', to: '/dashboard/scores' },
  { icon: '🎰', label: 'Draws', to: '/dashboard/draws' },
  { icon: '💚', label: 'My Charity', to: '/dashboard/charity' },
  { icon: '🏆', label: 'Winners', to: '/dashboard/winners' },
  { icon: '⚙️', label: 'Settings', to: '/dashboard/settings' },
];

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* silent */ }
  };

  const typeIcon = { draw_result: '🎰', winner: '🏆', subscription: '💳', charity: '💚', system: '📢' };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        id="notification-bell-btn"
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          padding: '8px 10px', cursor: 'pointer', color: 'var(--color-text)',
          fontSize: 18, transition: 'var(--transition)', display: 'flex', alignItems: 'center',
        }}
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--color-danger)', color: '#fff',
            borderRadius: '50%', width: 18, height: 18, fontSize: 10,
            fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--color-bg)',
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, width: 340,
          background: '#0c1528', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          zIndex: 1000, overflow: 'hidden', animation: 'fadeInUp 0.2s ease',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16 }}>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--color-primary)', cursor: 'pointer', background: 'none', border: 'none' }}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} style={{
                  padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: n.isRead ? 'transparent' : 'rgba(0,212,160,0.04)',
                  cursor: 'pointer', transition: 'var(--transition)',
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 20, marginTop: 2 }}>{typeIcon[n.type] || '📢'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: n.isRead ? 'var(--color-text-secondary)' : 'var(--color-text)' }}>
                        {n.title}
                        {!n.isRead && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', marginLeft: 6, verticalAlign: 'middle' }} />}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{n.body}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
export default function DashboardLayout() {
  const { user, subscription, logout } = useAuth();
  const location = useLocation();

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
          {subscription?.status !== 'active' && <Link to="/dashboard/subscribe" style={{ color: 'var(--color-primary)', fontSize: 12 }}>Upgrade →</Link>}
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

        {/* User + Notification Bell */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#050a1a', fontSize: 14 }}>
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.fullName?.split(' ')[0]}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{user?.email?.slice(0, 18)}…</div>
              </div>
            </div>
            <NotificationBell />
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
