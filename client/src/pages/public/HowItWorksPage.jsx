import { Link } from 'react-router-dom';

const steps = [
  { icon: '👤', title: 'Create Your Account', desc: 'Sign up in under 2 minutes. No card required to start.' },
  { icon: '💳', title: 'Choose a Subscription', desc: 'Monthly at £9.99 or yearly at £99 (2 months free). £5–£50 goes to the prize pool.' },
  { icon: '💚', title: 'Pick Your Charity', desc: 'Browse 20+ verified charities. At least 10% of your sub goes to your chosen cause.' },
  { icon: '⛳', title: 'Enter Your Golf Scores', desc: 'Add your last 5 Stableford scores (1–45). Only the 5 most recent are kept.' },
  { icon: '🎰', title: 'Your Scores = Your Numbers', desc: 'On draw day, your 5 scores become your 5 lottery numbers. The more you play, the more you optimize.' },
  { icon: '🏆', title: 'Win Prizes', desc: 'Match 3, 4, or 5 numbers to win 25%, 35%, or 40% of the prize pool. Jackpot rolls over!' },
  { icon: '📸', title: 'Verify & Claim', desc: 'Winners upload a score card screenshot. Our admin team verifies and pays within 5 business days.' },
];

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 100 }}>
      <div className="container" style={{ paddingBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>Full Transparency</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, marginBottom: 16 }}>How It Works</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 18, maxWidth: 520, margin: '0 auto' }}>Everything explained. No small print. Golf meets lottery meets charity.</p>
        </div>

        {/* Steps */}
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 27, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, var(--color-primary), transparent)', opacity: 0.3 }} />
          {steps.map((step, i) => (
            <div key={i} className={`animate-fadeInUp delay-${(i % 5) + 1}`} style={{ display: 'flex', gap: 24, marginBottom: 40, position: 'relative' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, zIndex: 1, boxShadow: '0 0 0 6px var(--color-bg), 0 0 20px rgba(0,212,160,0.3)' }}>{step.icon}</div>
              <div className="card" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Step {String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Prize breakdown */}
        <div style={{ marginTop: 60, maxWidth: 720, margin: '60px auto 0' }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 32, textAlign: 'center', marginBottom: 32 }}>Prize Pool Distribution</h2>
          <div className="card">
            {[['5 Numbers Matched', '40% of pool', 'Jackpot — rolls over if unclaimed!', 'var(--color-gold)', '👑'],
              ['4 Numbers Matched', '35% of pool', 'Split equally among all 4-match winners', 'var(--color-primary)', '🏆'],
              ['3 Numbers Matched', '25% of pool', 'Split equally among all 3-match winners', '#0099ff', '⭐'],
            ].map(([tier, pct, desc, color, icon]) => (
              <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{tier}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{desc}</div>
                </div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color }}>{pct}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <Link to="/signup" className="btn btn-primary btn-lg">Start Playing Now →</Link>
        </div>
      </div>
    </div>
  );
}
