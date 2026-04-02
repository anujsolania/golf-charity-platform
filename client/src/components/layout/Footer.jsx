import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--color-border)', padding: '60px 0 30px', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#050a1a' }}>G</div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18 }}>Golf<span style={{ color: 'var(--color-primary)' }}>Charity</span></span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.7 }}>Where every swing counts — for you, and for the world.</p>
          </div>
          {[
            { title: 'Platform', links: [{ l: 'How It Works', to: '/how-it-works' }, { l: 'Pricing', to: '/pricing' }, { l: 'Charities', to: '/charities' }] },
            { title: 'Account', links: [{ l: 'Sign Up', to: '/signup' }, { l: 'Login', to: '/login' }, { l: 'Dashboard', to: '/dashboard' }] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-secondary)' }}>{col.title}</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(item => (
                  <li key={item.to}><Link to={item.to} style={{ color: 'var(--color-text-secondary)', fontSize: 14, transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color = 'var(--color-primary)'} onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}>{item.l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>© 2026 GolfCharity Platform. All rights reserved.</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Built with ❤️ by Digital Heroes</p>
        </div>
      </div>
    </footer>
  );
}
