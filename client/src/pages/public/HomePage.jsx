import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const CountUp = ({ end, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = end / 60;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, end);
      setCount(Math.floor(current));
      if (current >= end) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [end]);
  return <>{prefix}{count.toLocaleString()}{suffix}</>;
};

export default function HomePage() {
  const [charityStats, setCharityStats] = useState({ totalRaised: 244900, totalDonors: 1840 });
  const [featuredCharities, setFeaturedCharities] = useState([]);
  const [upcomingDraw, setUpcomingDraw] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    api.get('/charities/stats').then(r => setCharityStats(r.data)).catch(() => {});
    api.get('/charities/featured').then(r => setFeaturedCharities(r.data.charities || [])).catch(() => {});
    api.get('/draws/upcoming').then(r => { setUpcomingDraw(r.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    const target = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), mins: Math.floor((diff % 3600000) / 60000), secs: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { icon: '💳', num: '01', title: 'Subscribe', desc: 'Choose monthly or yearly. A portion goes to prizes, a portion to charity — you choose both.' },
    { icon: '⛳', num: '02', title: 'Enter Scores', desc: 'Log your last 5 golf scores in Stableford format. Your scores become your draw numbers.' },
    { icon: '🎰', num: '03', title: 'Win & Give', desc: 'Monthly draw matches your numbers. Win prizes, contribute to charity — every month.' },
  ];

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', background: 'radial-gradient(ellipse at 50% -20%, rgba(0,212,160,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(0,153,255,0.08) 0%, transparent 50%), var(--color-bg)', position: 'relative', overflow: 'hidden' }}>
        {/* Animated background grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,160,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,160,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 760 }}>
          <div className="badge badge-primary animate-fadeInUp" style={{ marginBottom: 24, fontSize: 13, padding: '6px 16px' }}>⛳ Golf · Draw · Charity · Every Month</div>
          <h1 className="animate-fadeInUp delay-1" style={{ fontFamily: 'Outfit', fontSize: 'clamp(44px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 28 }}>
            Play Golf.<br />
            <span className="text-gradient">Win Prizes.</span><br />
            Change Lives.
          </h1>
          <p className="animate-fadeInUp delay-2" style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--color-text-secondary)', marginBottom: 48, maxWidth: 520, margin: '0 auto 48px' }}>
            The world's first golf subscription that turns your scores into lottery numbers — and turns every subscription into charity impact.
          </p>
          <div className="animate-fadeInUp delay-3" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary btn-lg animate-glow-pulse">Start Playing →</Link>
            <Link to="/how-it-works" className="btn btn-ghost btn-lg">How It Works</Link>
          </div>
          {/* Floating stats */}
          <div className="animate-fadeInUp delay-4" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 64 }}>
            {[
              { label: 'Active Players', value: '2,400+' },
              { label: 'Charity Raised', value: '£244K+' },
              { label: 'Monthly Jackpot', value: '£5,000+' },
            ].map(s => (
              <div key={s.label} style={{ padding: '14px 28px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 800, color: 'var(--color-primary)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16 }}>Simple 3-Step Process</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>No complexity. Just golf, prizes, and purpose.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {steps.map((step, i) => (
              <div key={i} className={`card animate-fadeInUp delay-${i + 1}`} style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: 'Outfit', fontSize: 60, fontWeight: 800, color: 'rgba(255,255,255,0.04)', lineHeight: 1 }}>{step.num}</div>
                <div style={{ fontSize: 42, marginBottom: 16 }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--color-primary)' }}>{step.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JACKPOT COUNTDOWN */}
      <section className="section">
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, rgba(0,212,160,0.1), rgba(0,153,255,0.05))', border: '1px solid rgba(0,212,160,0.2)', borderRadius: 'var(--radius-xl)', padding: 'clamp(40px, 5vw, 80px)', textAlign: 'center' }}>
            <div className="badge badge-gold" style={{ marginBottom: 20 }}>🎰 Next Draw</div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, marginBottom: 12 }}>
              This Month's Jackpot: <span className="text-gradient">£5,000+</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 40 }}>Draw happens on the 1st of every month. Rollover enabled!</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
              {[['days', 'Days'], ['hours', 'Hours'], ['mins', 'Mins'], ['secs', 'Secs']].map(([key, label]) => (
                <div key={key} style={{ padding: '20px 28px', borderRadius: 'var(--radius-lg)', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border)', minWidth: 90 }}>
                  <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{String(timeLeft[key] || 0).padStart(2, '0')}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
                </div>
              ))}
            </div>
            <Link to="/signup" className="btn btn-primary btn-lg">Enter Draw — From £9.99/mo</Link>
          </div>
        </div>
      </section>

      {/* CHARITY IMPACT */}
      <section className="section" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div className="badge badge-primary" style={{ marginBottom: 20 }}>💚 Real Impact</div>
              <h2 className="section-title">Your Subscription Funds Real Causes</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
                Minimum 10% of every subscription goes to your chosen charity. You can increase it. You can donate extra. Every stroke you play creates real-world change.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                <div className="stat-card">
                  <div className="stat-value text-gradient">£<CountUp end={Math.floor(charityStats.totalRaised)} /></div>
                  <div className="stat-label">Total Raised</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value text-gradient"><CountUp end={charityStats.totalDonors} />+</div>
                  <div className="stat-label">Donors</div>
                </div>
              </div>
              <Link to="/charities" className="btn btn-outline">Browse Charities →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {featuredCharities.slice(0, 4).map((c, i) => (
                <Link key={c._id} to={`/charities/${c.slug}`} className={`card animate-fadeInUp delay-${i + 1}`} style={{ textDecoration: 'none' }}>
                  <div style={{ width: '100%', height: 100, borderRadius: 'var(--radius-md)', background: `url(${c.imageUrl}) center/cover`, marginBottom: 12 }} />
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-primary)' }}>£{c.totalRaised?.toLocaleString()} raised</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRIZE BREAKDOWN */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="badge badge-gold" style={{ marginBottom: 20 }}>🏆 Prize Structure</div>
          <h2 className="section-title">Three Ways to Win</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 50px' }}>Match 3, 4, or 5 of your golf score numbers to the draw numbers.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { match: '5 Numbers', pct: '40%', label: 'Jackpot', color: 'var(--color-gold)', icon: '👑', desc: 'Rolls over if unclaimed!' },
              { match: '4 Numbers', pct: '35%', label: 'Big Prize', color: 'var(--color-primary)', icon: '🏆', desc: 'Split equally among winners' },
              { match: '3 Numbers', pct: '25%', label: 'Prize', color: '#0099ff', icon: '⭐', desc: 'Split equally among winners' },
            ].map((p, i) => (
              <div key={i} className={`card animate-fadeInUp delay-${i + 1}`} style={{ borderColor: `rgba(${p.color === 'var(--color-gold)' ? '245,200,66' : p.color === 'var(--color-primary)' ? '0,212,160' : '0,153,255'},0.3)` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: 42, fontWeight: 800, color: p.color, marginBottom: 4 }}>{p.pct}</div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Match {p.match}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', padding: 'clamp(60px, 8vw, 100px) 40px', background: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,160,0.1) 0%, transparent 70%)', border: '1px solid rgba(0,212,160,0.15)', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, marginBottom: 20 }}>
              Ready to <span className="text-gradient">Make Every Stroke Count?</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 18, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
              Join 2,400+ golfers. Win prizes. Fund causes. From £9.99/month.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free →</Link>
              <Link to="/pricing" className="btn btn-ghost btn-lg">View Pricing</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
