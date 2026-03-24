import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AVATAR_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export default function ProfilePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('general')
  const [toast, setToast] = useState(null)

  /* ── profile state ── */
  const [profile, setProfile] = useState({
    fullName: 'Admin User',
    email: 'admin@ransomtrap.local',
    role: 'Security Administrator',
    department: 'Security Operations Center',
    phone: '+1 (555) 000-0000',
    timezone: 'Asia/Kolkata (IST)',
    bio: 'SOC administrator with oversight of ransomware detection and incident response.',
    joinDate: 'Jan 2025',
    twoFA: true,
    emailNotifs: true,
    pushNotifs: false,
    darkMode: true,
  })

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000) }
  function up(key, val) { setProfile(p => ({ ...p, [key]: val })) }

  const initials = profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()

  const TABS = [
    { id: 'general', icon: 'person', label: 'General' },
    { id: 'security', icon: 'shield', label: 'Security' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
    { id: 'activity', icon: 'history', label: 'Activity Log' },
  ]

  const activityLog = [
    { action: 'Logged in from 192.168.1.105', time: '2 minutes ago', icon: 'login', color: '#10b981' },
    { action: 'Updated entropy threshold to 7.2', time: '1 hour ago', icon: 'tune', color: '#6366f1' },
    { action: 'Launched ransomware simulation', time: '3 hours ago', icon: 'science', color: '#f59e0b' },
    { action: 'Viewed alert #RT-2025-0041', time: '5 hours ago', icon: 'visibility', color: '#3b82f6' },
    { action: 'Exported incident report (PDF)', time: 'Yesterday', icon: 'file_download', color: '#8b5cf6' },
    { action: 'Enabled Telegram notifications', time: '2 days ago', icon: 'send', color: '#14b8a6' },
    { action: 'Added monitored path E:\\TestFiles', time: '3 days ago', icon: 'folder', color: '#f97316' },
    { action: 'Stopped agent process', time: '4 days ago', icon: 'stop_circle', color: '#ef4444' },
  ]

  const sessions = [
    { device: 'Chrome · Windows 11', ip: '192.168.1.105', location: 'Local Network', current: true, time: 'Active now' },
    { device: 'Firefox · Windows 10', ip: '10.0.0.24', location: 'Office Network', current: false, time: '2 days ago' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060b13', color: '#f1f5f9', fontFamily: 'Inter,-apple-system,sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:99px}
        *{box-sizing:border-box}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, animation: 'toastIn .2s ease', display: 'flex', alignItems: 'center', gap: 10, background: '#071a10', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 12, padding: '12px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#34d399' }}>check_circle</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>{toast}</span>
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 58, flexShrink: 0, background: 'rgba(6,11,19,0.96)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a6580', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = '#4a6580' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          </button>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#818cf8' }}>person</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.2px' }}>My Profile</p>
              <p style={{ margin: 0, fontSize: 11, color: '#2a3f56', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Account Settings</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 2, padding: '0 32px', background: 'rgba(6,11,19,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 58, zIndex: 40, flexShrink: 0, overflowX: 'auto' }}>
        {TABS.map(t => {
          const on = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 16px', background: 'transparent', border: 'none', borderBottom: `2.5px solid ${on ? '#818cf8' : 'transparent'}`, color: on ? '#c5d9f0' : '#4a6580', fontSize: 13, fontWeight: on ? 700 : 500, cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap', transition: 'all .15s', marginBottom: -1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '30px 32px 60px' }}>

          {/* ── Profile Card (always visible) ── */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 28, animation: 'fadeUp .2s ease-out' }}>
            <div style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 28, display: 'flex', gap: 24, alignItems: 'center', flex: 1 }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>{profile.fullName}</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4a6580' }}>{profile.email}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>{profile.role}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>Active</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', color: '#4a6580', border: '1px solid rgba(255,255,255,0.06)' }}>Since {profile.joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── GENERAL TAB ── */}
          {tab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, animation: 'fadeUp .2s ease-out' }}>
              <div style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#60a5fa' }}>badge</span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Personal Information</h3>
                </div>
                <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {[
                    { label: 'Full Name', key: 'fullName', icon: 'person' },
                    { label: 'Email', key: 'email', icon: 'mail' },
                    { label: 'Phone', key: 'phone', icon: 'phone' },
                    { label: 'Department', key: 'department', icon: 'corporate_fare' },
                    { label: 'Timezone', key: 'timezone', icon: 'schedule' },
                  ].map(f => (
                    <div key={f.key} style={{ gridColumn: f.key === 'bio' ? '1 / -1' : 'auto' }}>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#3a5472', marginBottom: 6, display: 'block' }}>{f.label}</label>
                      <div style={{ position: 'relative' }}>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#3a5472' }}>{f.icon}</span>
                        <input
                          value={profile[f.key]}
                          onChange={e => up(f.key, e.target.value)}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 13px 10px 38px', fontSize: 13, color: '#e2e8f0', outline: 'none', transition: 'border-color .15s' }}
                          onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,.5)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                        />
                      </div>
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#3a5472', marginBottom: 6, display: 'block' }}>Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={e => up('bio', e.target.value)}
                      rows={3}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 13px', fontSize: 13, color: '#e2e8f0', outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border-color .15s' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                    />
                  </div>
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => showToast('Profile updated successfully')} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', transition: 'all .15s' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Preferences */}
              <div style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#818cf8' }}>palette</span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Preferences</h3>
                </div>
                <div style={{ padding: 24 }}>
                  {[
                    { label: 'Dark Mode', desc: 'Use dark theme across the dashboard', key: 'darkMode', color: '#818cf8' },
                  ].map(s => (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{s.label}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4a6580' }}>{s.desc}</p>
                      </div>
                      <button onClick={() => up(s.key, !profile[s.key])} style={{ width: 44, height: 24, borderRadius: 12, background: profile[s.key] ? s.color : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                        <span style={{ position: 'absolute', top: 2, left: profile[s.key] ? 22 : 2, width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {tab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, animation: 'fadeUp .2s ease-out' }}>
              {/* 2FA */}
              <div style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#10b981' }}>verified_user</span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Two-Factor Authentication</h3>
                </div>
                <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>2FA is {profile.twoFA ? 'enabled' : 'disabled'}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4a6580' }}>Add an extra layer of security to your account using TOTP authenticator.</p>
                  </div>
                  <button onClick={() => { up('twoFA', !profile.twoFA); showToast(`2FA ${!profile.twoFA ? 'enabled' : 'disabled'}`) }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: profile.twoFA ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${profile.twoFA ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`, color: profile.twoFA ? '#f87171' : '#34d399', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{profile.twoFA ? 'lock_open' : 'lock'}</span>
                    {profile.twoFA ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* Change Password */}
              <div style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f59e0b' }}>key</span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Change Password</h3>
                </div>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                    <div key={label}>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#3a5472', marginBottom: 6, display: 'block' }}>{label}</label>
                      <input type="password" placeholder="••••••••" style={{ width: '100%', maxWidth: 400, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 13px', fontSize: 13, color: '#e2e8f0', outline: 'none', transition: 'border-color .15s' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'} />
                    </div>
                  ))}
                  <button onClick={() => showToast('Password updated successfully')} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', marginTop: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                    Update Password
                  </button>
                </div>
              </div>

              {/* Sessions */}
              <div style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#22d3ee' }}>devices</span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Active Sessions</h3>
                </div>
                <div style={{ padding: 24 }}>
                  {sessions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: s.current ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${s.current ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)'}`, marginBottom: i < sessions.length - 1 ? 10 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: s.current ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${s.current ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: s.current ? '#34d399' : '#4a6580' }}>computer</span>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{s.device} {s.current && <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(16,185,129,0.12)', padding: '2px 7px', borderRadius: 99, marginLeft: 6 }}>Current</span>}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#4a6580' }}>{s.ip} · {s.location} · {s.time}</p>
                        </div>
                      </div>
                      {!s.current && (
                        <button onClick={() => showToast('Session revoked')} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {tab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, animation: 'fadeUp .2s ease-out' }}>
              <div style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f59e0b' }}>notifications</span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Notification Preferences</h3>
                </div>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: 'Email Notifications', desc: 'Receive alert summaries and critical incident reports via email', key: 'emailNotifs', color: '#3b82f6' },
                    { label: 'Push Notifications', desc: 'Browser push notifications for real-time ransomware events', key: 'pushNotifs', color: '#f59e0b' },
                  ].map((s, i) => (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{s.label}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4a6580' }}>{s.desc}</p>
                      </div>
                      <button onClick={() => { up(s.key, !profile[s.key]); showToast(`${s.label} ${!profile[s.key] ? 'enabled' : 'disabled'}`) }} style={{ width: 44, height: 24, borderRadius: 12, background: profile[s.key] ? s.color : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                        <span style={{ position: 'absolute', top: 2, left: profile[s.key] ? 22 : 2, width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ACTIVITY TAB ── */}
          {tab === 'activity' && (
            <div style={{ animation: 'fadeUp .2s ease-out' }}>
              <div style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#22d3ee' }}>history</span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Recent Activity</h3>
                </div>
                <div style={{ padding: '8px 24px 24px' }}>
                  {activityLog.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}14`, border: `1px solid ${a.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: a.color }}>{a.icon}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{a.action}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#3a5472' }}>{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
