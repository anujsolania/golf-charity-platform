import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.fullName}! 👋`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,160,0.08) 0%, var(--color-bg) 70%)' }}>
      {/* Decorative orb */}
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,160,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeInUp 0.6s ease' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#050a1a', fontSize: 20 }}>G</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24 }}>Golf<span style={{ color: 'var(--color-primary)' }}>Charity</span></span>
        </Link>

        <div className="glass" style={{ padding: 40 }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Welcome Back</h1>
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 32, fontSize: 14 }}>Sign in to continue your journey</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#050a1a', borderRadius: '50%' }} /> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-text-secondary)', fontSize: 14 }}>
            No account? <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up free</Link>
          </p>

          <div style={{ marginTop: 20, padding: 16, borderRadius: 'var(--radius-md)', background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', fontSize: 13 }}>
            <div style={{ color: 'var(--color-gold)', fontWeight: 600, marginBottom: 6 }}>Demo Credentials</div>
            <div style={{ color: 'var(--color-text-secondary)' }}>Admin: admin@golfcharity.com / Admin@123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
