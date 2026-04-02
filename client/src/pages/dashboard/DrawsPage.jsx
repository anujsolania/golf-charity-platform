import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function DrawsPage() {
  const [upcoming, setUpcoming] = useState(null);
  const [history, setHistory] = useState([]);
  const [scores, setScores] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/draws/upcoming'),
      api.get('/draws/my-history'),
      api.get('/scores'),
    ]).then(([u, h, s]) => {
      setUpcoming(u.data);
      setHistory(h.data.entries || []);
      setScores(s.data.scores || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const target = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), mins: Math.floor((diff % 3600000) / 60000), secs: Math.floor((diff % 60000) / 1000) });
    };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="animate-spin" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', margin: '0 auto' }} /></div>;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>🎰 Draws</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Monthly draws from your golf scores. Match numbers, win prizes.</p>
      </div>

      {/* Upcoming Draw */}
      <div className="card animate-fadeInUp" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(0,212,160,0.08), rgba(0,153,255,0.04))', border: '1px solid rgba(0,212,160,0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <div className="badge badge-gold" style={{ marginBottom: 12 }}>🎰 Next Draw</div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
              Prize Pool: <span className="text-gradient">£{(upcoming?.totalPool || 5000).toLocaleString()}</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>Draw on 1st of next month · {upcoming?.activeSubscribers || 0} active players</p>
            {scores.length >= 3 ? (
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 10 }}>Your Entry Numbers:</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {scores.map((s, i) => (
                    <div key={s._id} className="lottery-ball" style={{ animationDelay: `${i * 0.1}s` }}>{s.score}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-warning)', fontSize: 14 }}>⚠️ Add at least 3 scores to enter the draw</div>
            )}
          </div>
          {/* Countdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['days','D'],['hours','H'],['mins','M'],['secs','S']].map(([k, l]) => (
              <div key={k} style={{ textAlign: 'center', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', minWidth: 64 }}>
                <div style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{String(timeLeft[k] || 0).padStart(2, '0')}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prize breakdown */}
      <div className="card animate-fadeInUp delay-2" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Prize Distribution</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[['👑', '5 Match', '40%', 'Jackpot', 'var(--color-gold)'], ['🏆', '4 Match', '35%', 'Big Prize', 'var(--color-primary)'], ['⭐', '3 Match', '25%', 'Prize', '#0099ff']].map(([icon, label, pct, name, color]) => (
            <div key={label} style={{ textAlign: 'center', padding: 20, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color }}>{pct}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Past draws */}
      <div className="card animate-fadeInUp delay-3">
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>My Draw History</h3>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '32px 0' }}>No draw history yet. Your first draw is coming next month!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map(entry => {
              const draw = entry.drawId;
              const winSet = new Set(draw?.winningNumbers || []);
              return (
                <div key={entry._id} style={{ padding: 20, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: `1px solid ${entry.tier ? 'rgba(245,200,66,0.3)' : 'var(--color-border)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{draw ? new Date(draw.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Draw'}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{entry.matchCount} number{entry.matchCount !== 1 ? 's' : ''} matched</div>
                    </div>
                    {entry.tier ? <span className="badge badge-gold">{entry.tier} Winner! 🏆</span> : <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No win this month</span>}
                  </div>
                  {draw?.winningNumbers?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', alignSelf: 'center', marginRight: 4 }}>Winning:</div>
                      {draw.winningNumbers.map(n => (
                        <div key={n} style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, background: entry.entryNumbers?.includes(n) ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.08)', color: entry.entryNumbers?.includes(n) ? '#050a1a' : 'var(--color-text-secondary)' }}>{n}</div>
                      ))}
                    </div>
                  )}
                  {entry.prizePayout > 0 && <div style={{ marginTop: 10, color: 'var(--color-gold)', fontWeight: 700 }}>Prize: £{entry.prizePayout.toFixed(2)}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
