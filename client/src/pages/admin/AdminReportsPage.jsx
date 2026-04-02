import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';

const COLORS = ['#00d4a0', '#f5c842', '#0099ff', '#ff4d6d', '#ff9f43'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1528', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: 'var(--color-text-secondary)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' && p.value > 100 ? `£${p.value.toFixed(0)}` : p.value}</div>)}
    </div>
  );
};

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const userGrowthFormatted = data?.userGrowth?.map(d => ({
    name: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`, users: d.count
  })) || [];

  const prizeHistoryFormatted = data?.prizeHistory?.map(d => ({
    name: new Date(d.drawMonth).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
    pool: d.totalPool, '5M': d.fiveMatchPayout, '4M': d.fourMatchPayout, '3M': d.threeMatchPayout
  })).reverse() || [];

  const charityFormatted = data?.charityBreakdown?.map(d => ({ name: d.name, value: Math.round(d.total) })) || [];

  if (loading) return (
    <div>
      <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 800, marginBottom: 32 }}>📈 Reports</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)' }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 800, marginBottom: 4 }}>📈 Reports & Analytics</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Platform performance overview.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* User Growth */}
        <div className="card animate-fadeInUp">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>👥 User Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={userGrowthFormatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="users" stroke="#00d4a0" strokeWidth={2} dot={{ fill: '#00d4a0', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Prize Pool History */}
        <div className="card animate-fadeInUp delay-2">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>🎰 Prize Pool History</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={prizeHistoryFormatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pool" fill="#00d4a0" radius={[4,4,0,0]} name="Total Pool" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Charity Contributions */}
        <div className="card animate-fadeInUp delay-3">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>💚 Charity Contributions</h3>
          {charityFormatted.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={charityFormatted} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {charityFormatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `£${v}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px 0' }}>No contribution data yet</div>}
        </div>

        {/* Draw Statistics */}
        <div className="card animate-fadeInUp delay-4">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>🎯 Draw Winners per Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(data?.drawStats || []).map(d => ({
              name: new Date(d.drawMonth).toLocaleDateString('en-GB', { month: 'short' }),
              '5M': d.fiveMatchWinners, '4M': d.fourMatchWinners, '3M': d.threeMatchWinners
            })).reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
              <Bar dataKey="5M" fill="#f5c842" name="5 Match" radius={[4,4,0,0]} />
              <Bar dataKey="4M" fill="#00d4a0" name="4 Match" radius={[4,4,0,0]} />
              <Bar dataKey="3M" fill="#0099ff" name="3 Match" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
