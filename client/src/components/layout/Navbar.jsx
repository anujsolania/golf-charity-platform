import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Charities', to: '/charities' },
    { label: 'Pricing', to: '/pricing' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
      padding: '0 24px', height: 70,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(5,10,26,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#050a1a' }}>G</div>
        <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20 }}>
          Golf<span style={{ color: 'var(--color-primary)' }}>Charity</span>
        </span>
      </Link>

      {/* Desktop nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
        {navLinks.map(l => (
          <Link key={l.to} to={l.to} style={{
            padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 500,
            color: location.pathname === l.to ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            background: location.pathname === l.to ? 'var(--color-primary-glow)' : 'transparent',
            transition: 'var(--transition)',
          }}>{l.label}</Link>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            {isAdmin && <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>}
            <Link to="/dashboard" className="btn btn-outline btn-sm">Dashboard</Link>
            <button onClick={logout} className="btn btn-ghost btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
