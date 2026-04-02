import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['Environment', 'Children', 'Veterans', 'Hunger', 'Health', 'Education'];

  useEffect(() => {
    fetchCharities();
  }, [search, category, page]);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      const { data } = await api.get(`/charities?${params}`);
      setCharities(data.charities);
      setTotalPages(data.pages);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100 }}>
      <div className="container" style={{ paddingBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>💚 Making a Difference</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, marginBottom: 16 }}>Our Charity Partners</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>Every subscription contributes. Choose the cause that matters to you.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" style={{ maxWidth: 280 }} placeholder="🔍 Search charities…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => { setCategory(''); setPage(1); }} className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-ghost'}`}>All</button>
            {categories.map(c => (
              <button key={c} onClick={() => { setCategory(c); setPage(1); }} className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-ghost'}`}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {charities.map((c, i) => (
              <Link key={c._id} to={`/charities/${c.slug}`} className={`card animate-fadeInUp delay-${(i % 3) + 1}`} style={{ textDecoration: 'none', overflow: 'hidden', padding: 0 }}>
                <div style={{ height: 180, background: `url(${c.imageUrl}) center/cover`, position: 'relative' }}>
                  {c.isFeatured && <div className="badge badge-gold" style={{ position: 'absolute', top: 12, left: 12 }}>⭐ Featured</div>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(5,10,26,0.95))' }} />
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 17 }}>{c.name}</h3>
                    <span className="badge badge-primary" style={{ fontSize: 11, flexShrink: 0 }}>{c.category}</span>
                  </div>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{c.shortDescription}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>£{c.totalRaised?.toLocaleString()} raised</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{c.donorCount} donors</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span style={{ color: 'var(--color-text-secondary)', alignSelf: 'center', fontSize: 14 }}>{page} / {totalPages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
