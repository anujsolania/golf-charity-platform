import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

export default function CharityProfilePage() {
  const { slug } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/charities/${slug}`).then(r => setCharity(r.data.charity)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="animate-spin" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)' }} /></div>;
  if (!charity) return <div style={{ textAlign: 'center', paddingTop: 120, color: 'var(--color-text-secondary)' }}>Charity not found</div>;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 70 }}>
      {/* Banner */}
      <div style={{ height: 340, background: `url(${charity.bannerUrl || charity.imageUrl}) center/cover`, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(5,10,26,0.95) 100%)' }} />
        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: 40 }}>
          <div>
            {charity.isFeatured && <div className="badge badge-gold" style={{ marginBottom: 12 }}>⭐ Featured Charity</div>}
            <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, marginBottom: 8 }}>{charity.name}</h1>
            <div className="badge badge-primary">{charity.category}</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 24, marginBottom: 16 }}>About {charity.name}</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: 16, marginBottom: 40 }}>{charity.description}</p>

            {/* Events */}
            {charity.events?.length > 0 && (
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Events & Updates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {charity.events.map((e, i) => (
                    <div key={i} className="card card-sm" style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
                      {e.imageUrl && <img src={e.imageUrl} alt={e.title} style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />}
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{e.title}</div>
                        {e.eventDate && <div style={{ fontSize: 12, color: 'var(--color-primary)', marginBottom: 6 }}>{new Date(e.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{e.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit', fontSize: 40, fontWeight: 800, color: 'var(--color-primary)' }}>£{charity.totalRaised?.toLocaleString()}</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 16 }}>Total Raised</div>
              <div style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 700 }}>{charity.donorCount}</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Donors</div>
            </div>

            <Link to="/signup" className="btn btn-primary" style={{ textAlign: 'center' }}>Support This Charity</Link>
            {charity.websiteUrl && <a href={charity.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ textAlign: 'center' }}>Visit Website ↗</a>}
            <Link to="/charities" className="btn btn-ghost" style={{ textAlign: 'center' }}>← All Charities</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
