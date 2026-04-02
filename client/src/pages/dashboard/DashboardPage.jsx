import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function DashboardPage() {
  const { user, subscription } = useAuth();
  const [scores, setScores] = useState([]);
  const [upcomingDraw, setUpcomingDraw] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      subscription?.status === 'active' ? api.get('/scores') : Promise.resolve({ data: { scores: [] } }),
      api.get('/draws/upcoming'),
      subscription?.status === 'active' ? api.get('/draws/my-history') : Promise.resolve({ data: { entries: [] } }),
    ]).then(([s, d, h]) => {
      setScores(s.data.scores || []);
      setUpcomingDraw(d.data);
      setMyHistory(h.data.entries || []);
    }).finally(() => setLoading(false));
  }, [subscription]);

  const totalWon = myHistory.filter(e => e.tier).reduce((sum, e) => sum + (e.prizePayout || 0), 0);
  const lastDraw = myHistory[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
      {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)' }} />)}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{greeting}, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Here's your platform overview</p>
      </div>

      {/* Subscription alert */}
      {(!subscription || subscription.status !== 'active') && (
        <div className="animate-fadeInUp" style={{ padding: 20, borderRadius: 'var(--radius-lg)', background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.3)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-gold)', marginBottom: 4 }}>⚠️ No Active Subscription</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Subscribe to enter draws and track scores.</div>
          </div>
          <Link to="/dashboard/subscribe" className="btn btn-gold btn-sm">Subscribe Now →</Link>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Subscription', value: subscription?.status === 'active' ? subscription.plan : 'Inactive', sub: subscription?.status === 'active' ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB')}` : 'Not subscribed', color: subscription?.status === 'active' ? 'var(--color-primary)' : 'var(--color-danger)', icon: '💳' },
          { label: 'My Scores', value: `${scores.length}/5`, sub: scores[0] ? `Last: ${scores[0].score} pts` : 'No scores yet', color: 'var(--color-primary)', icon: '⛳' },
          { label: 'Draws Entered', value: myHistory.length, sub: lastDraw?.tier ? `Last: ${lastDraw.tier} win!` : 'Keep playing!', color: 'var(--color-gold)', icon: '🎰' },
          { label: 'Total Won', value: `£${totalWon.toFixed(2)}`, sub: `${myHistory.filter(e => e.tier).length} prize${myHistory.filter(e => e.tier).length !== 1 ? 's' : ''}`, color: 'var(--color-gold)', icon: '🏆' },
        ].map((s, i) => (
          <div key={i} className={`card animate-fadeInUp delay-${i + 1}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Scores widget */}
        <div className="card animate-fadeInUp delay-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18 }}>⛳ My Scores</h3>
            <Link to="/dashboard/scores" className="btn btn-ghost btn-sm">Manage</Link>
          </div>
          {scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>⛳</div>
              <div>No scores yet. Add your first score!</div>
              <Link to="/dashboard/scores" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Add Score</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scores.map((s, i) => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#050a1a' }}>{s.score}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{new Date(s.scoreDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                      {i === 0 && <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>Latest</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Stableford</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Draw widget */}
        <div className="card animate-fadeInUp delay-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18 }}>🎰 Next Draw</h3>
            <Link to="/dashboard/draws" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontFamily: 'Outfit', fontSize: 42, fontWeight: 800, color: 'var(--color-gold)', marginBottom: 4 }}>
              £{(upcomingDraw?.totalPool || 5000).toLocaleString()}
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 20 }}>Current Prize Pool</div>
            <div style={{ padding: '12px 16px', background: 'rgba(0,212,160,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,212,160,0.2)', fontSize: 13 }}>
              {scores.length >= 3 ? (
                <>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>Your Entry Numbers</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {scores.map(s => (
                      <div key={s._id} className="lottery-ball" style={{ width: 36, height: 36, fontSize: 14 }}>{s.score}</div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--color-text-secondary)' }}>Add at least 3 scores to enter the draw</div>
              )}
            </div>
          </div>
        </div>

        {/* Charity widget */}
        <div className="card animate-fadeInUp delay-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18 }}>💚 My Charity</h3>
            <Link to="/dashboard/charity" className="btn btn-ghost btn-sm">Change</Link>
          </div>
          {subscription?.charityId ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: `url(${subscription.charityId.imageUrl}) center/cover`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{subscription.charityId.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{subscription.charityId.category}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,212,160,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,212,160,0.15)' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Your contribution</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{subscription.charityContributionPct}%</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💚</div>
              <Link to="/dashboard/charity" className="btn btn-primary btn-sm">Select a Charity</Link>
            </div>
          )}
        </div>

        {/* Recent results */}
        <div className="card animate-fadeInUp delay-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18 }}>📋 Recent Results</h3>
            <Link to="/dashboard/draws" className="btn btn-ghost btn-sm">All</Link>
          </div>
          {myHistory.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '20px 0', fontSize: 14 }}>No draw history yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myHistory.slice(0, 3).map(e => (
                <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{new Date(e.drawId?.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{e.matchCount} match{e.matchCount !== 1 ? 'es' : ''}</div>
                  </div>
                  {e.tier ? <span className="badge badge-gold">{e.tier} 🏆</span> : <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No win</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
