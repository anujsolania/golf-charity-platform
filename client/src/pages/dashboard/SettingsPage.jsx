import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, subscription, fetchMe, refreshSubscription } = useAuth();
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', country: user?.country || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault(); setSavingProfile(true);
    try { await api.patch('/auth/profile', profile); await fetchMe(); toast.success('Profile updated!'); }
    catch (err) { toast.error('Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    setSavingPw(true);
    try { await api.post('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }); toast.success('Password changed!'); setPasswords({ currentPassword: '', newPassword: '', confirm: '' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  const cancelSub = async () => {
    if (!confirm('Cancel your subscription? You keep access until the period ends.')) return;
    setCancelling(true);
    try { await api.post('/subscriptions/cancel'); await refreshSubscription(); toast.success('Subscription cancelled.'); }
    catch { toast.error('Failed to cancel'); }
    finally { setCancelling(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>⚙️ Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Manage your account, billing, and preferences.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
        {/* Profile */}
        <div className="card animate-fadeInUp">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Profile</h3>
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label className="form-label">Country</label><input className="form-input" value={profile.country} onChange={e => setProfile(p => ({ ...p, country: e.target.value }))} placeholder="UK" /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+44..." /></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save Profile'}</button>
          </form>
        </div>

        {/* Subscription */}
        <div className="card animate-fadeInUp delay-2">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Billing</h3>
          {subscription ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[['Plan', subscription.plan], ['Status', subscription.status], ['Amount', `£${subscription.amount}/mo`], ['Renews', new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB')]].map(([l, v]) => (
                  <div key={l} style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{v}</div>
                  </div>
                ))}
              </div>
              {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                <button className="btn btn-danger btn-sm" onClick={cancelSub} disabled={cancelling}>{cancelling ? 'Cancelling…' : 'Cancel Subscription'}</button>
              )}
              {subscription.cancelAtPeriodEnd && <div style={{ color: 'var(--color-warning)', fontSize: 13 }}>⚠️ Cancels at period end.</div>}
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-secondary)' }}>No active subscription. <a href="/dashboard/subscribe" style={{ color: 'var(--color-primary)' }}>Subscribe →</a></div>
          )}
        </div>

        {/* Password */}
        <div className="card animate-fadeInUp delay-3">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Change Password</h3>
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Confirm</label><input className="form-input" type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} required /></div>
            </div>
            <button type="submit" className="btn btn-outline" disabled={savingPw}>{savingPw ? 'Changing…' : 'Change Password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
