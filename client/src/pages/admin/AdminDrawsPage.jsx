import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [config, setConfig] = useState({ drawMonth: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0], logicType: 'random' });

  useEffect(() => {
    api.get('/draws').then(r => setDraws(r.data.draws || [])).finally(() => setLoading(false));
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const { data } = await api.post('/draws/simulate', config);
      setSimulation(data);
      toast.success('Draw simulated! Review before publishing.');
    } catch (err) { toast.error(err.response?.data?.message || 'Simulation failed'); }
    finally { setSimulating(false); }
  };

  const handlePublish = async () => {
    if (!simulation?.draw?._id) return toast.error('Simulate first');
    if (!confirm(`Publish draw for ${new Date(config.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}? This will notify all subscribers.`)) return;
    setPublishing(true);
    try {
      await api.post('/draws/publish', { drawId: simulation.draw._id, logicType: config.logicType });
      toast.success('Draw published! All subscribers notified. 🎉');
      setSimulation(null);
      const { data } = await api.get('/draws');
      setDraws(data.draws || []);
    } catch (err) { toast.error(err.response?.data?.message || 'Publish failed'); }
    finally { setPublishing(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 800, marginBottom: 4 }}>🎰 Draw Management</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Configure, simulate, and publish monthly draws.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Config */}
        <div className="card animate-fadeInUp">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Draw Configuration</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Draw Month</label>
              <input className="form-input" type="date" value={config.drawMonth} onChange={e => setConfig(p => ({ ...p, drawMonth: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Draw Logic</label>
              <select className="form-select" value={config.logicType} onChange={e => setConfig(p => ({ ...p, logicType: e.target.value }))}>
                <option value="random">🎲 Random (Lottery Style)</option>
                <option value="algorithm">📊 Algorithm (Score Frequency Weighted)</option>
              </select>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(0,212,160,0.06)', border: '1px solid rgba(0,212,160,0.15)', fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {config.logicType === 'random' ? '🎲 Pure random — all numbers 1–45 equally likely' : '📊 Numbers appearing more in user scores are weighted higher'}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleSimulate} disabled={simulating}>{simulating ? 'Simulating…' : '🔍 Simulate'}</button>
              <button className="btn btn-gold" style={{ flex: 1 }} onClick={handlePublish} disabled={publishing || !simulation}>{publishing ? 'Publishing…' : '🚀 Publish'}</button>
            </div>
          </div>
        </div>

        {/* Simulation results */}
        <div className="card animate-fadeInUp delay-2" style={{ border: simulation ? '1px solid rgba(245,200,66,0.3)' : '1px solid var(--color-border)' }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Simulation Preview</h3>
          {!simulation ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
              <div>Run a simulation to preview results before publishing</div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Winning Numbers</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {simulation.draw?.winningNumbers?.map(n => (
                    <div key={n} className="lottery-ball gold">{n}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[['5 Match', simulation.winnerCounts?.fiveMatch, 'var(--color-gold)'], ['4 Match', simulation.winnerCounts?.fourMatch, 'var(--color-primary)'], ['3 Match', simulation.winnerCounts?.threeMatch, '#0099ff']].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: c }}>{v || 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(0,212,160,0.06)', border: '1px solid rgba(0,212,160,0.15)', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Total Pool</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>£{simulation.prizes?.totalPool?.toFixed(2)}</span>
                </div>
                {simulation.prizes?.rolledOver && <div style={{ color: 'var(--color-warning)', fontSize: 12, marginTop: 6 }}>⚡ Jackpot will roll over to next month!</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Past draws */}
      <div className="card animate-fadeInUp delay-3">
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Published Draws</h3>
        {loading ? <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-md)' }} /> : draws.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '24px 0' }}>No published draws yet.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Month</th><th>Logic</th><th>Winning Numbers</th><th>Pool</th><th>5M</th><th>4M</th><th>3M</th><th>Rollover</th></tr></thead>
              <tbody>
                {draws.map(d => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600 }}>{new Date(d.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</td>
                    <td><span className="badge badge-primary" style={{ fontSize: 11 }}>{d.logicType}</span></td>
                    <td><div style={{ display: 'flex', gap: 4 }}>{d.winningNumbers?.map(n => <div key={n} style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#050a1a' }}>{n}</div>)}</div></td>
                    <td style={{ fontWeight: 600, color: 'var(--color-gold)' }}>£{d.totalPool?.toFixed(0)}</td>
                    <td>{d.fiveMatchWinners}</td><td>{d.fourMatchWinners}</td><td>{d.threeMatchWinners}</td>
                    <td>{d.rolledOver ? <span className="badge badge-warning" style={{ fontSize: 11 }}>Yes</span> : <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
