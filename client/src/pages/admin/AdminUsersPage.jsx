import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => { fetchUsers(); }, [search, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users); setTotalPages(data.pages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this user and all their data?')) return;
    try { await api.delete(`/admin/users/${id}`); toast.success('User deleted'); fetchUsers(); }
    catch { toast.error('Delete failed'); }
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/admin/users/${editUser._id}`, { fullName: editUser.fullName, role: editUser.role });
      toast.success('User updated'); setEditUser(null); fetchUsers();
    } catch { toast.error('Update failed'); }
  };

  const statusColor = { active: 'var(--color-primary)', cancelled: 'var(--color-danger)', expired: 'var(--color-warning)', past_due: 'var(--color-warning)' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 800, marginBottom: 4 }}>👥 Users</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Manage all registered users.</p>
        </div>
        <input className="form-input" style={{ maxWidth: 260 }} placeholder="🔍 Search users…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>User</th><th>Plan</th><th>Sub Status</th><th>Joined</th><th>Role</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Loading…</td></tr>
            ) : users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#050a1a', flexShrink: 0 }}>{u.fullName?.[0]}</div>
                    <div><div style={{ fontWeight: 600, fontSize: 13 }}>{u.fullName}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{u.email}</div></div>
                  </div>
                </td>
                <td><span style={{ fontSize: 13, textTransform: 'capitalize' }}>{u.subscription?.plan || '—'}</span></td>
                <td>
                  {u.subscription ? (
                    <span className="badge" style={{ background: `${statusColor[u.subscription.status]}20`, color: statusColor[u.subscription.status], border: `1px solid ${statusColor[u.subscription.status]}40`, fontSize: 11 }}>{u.subscription.status}</span>
                  ) : <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>None</span>}
                </td>
                <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-primary'}`} style={{ fontSize: 11 }}>{u.role}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(u)}>Edit</button>
                    <button className="btn btn-sm" style={{ background: 'rgba(255,77,109,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(255,77,109,0.2)' }} onClick={() => handleDelete(u._id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ color: 'var(--color-text-secondary)', alignSelf: 'center', fontSize: 14 }}>{page}/{totalPages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit User</h3>
              <button onClick={() => setEditUser(null)} style={{ color: 'var(--color-text-secondary)', fontSize: 20 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={editUser.fullName} onChange={e => setEditUser(p => ({ ...p, fullName: e.target.value }))} /></div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={editUser.role} onChange={e => setEditUser(p => ({ ...p, role: e.target.value }))}>
                  <option value="subscriber">Subscriber</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpdate}>Save</button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditUser(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
