import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ROLES = ['Admin', 'Analyst', 'Viewer', 'Auditor']
const STATUS_COLORS = { Active: '#10b981', Suspended: '#f59e0b', Inactive: '#4a6580' }

const INITIAL_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@ransomtrap.local', role: 'Admin', status: 'Active', lastLogin: '2 min ago', joinDate: 'Jan 2025', twoFA: true, alerts: 47, avatar: '#6366f1' },
  { id: 2, name: 'Vivek B', email: 'vivek.b@company.com', role: 'Analyst', status: 'Active', lastLogin: '1 hour ago', joinDate: 'Feb 2025', twoFA: true, alerts: 32, avatar: '#3b82f6' },
  { id: 3, name: 'Security Bot', email: 'bot@ransomtrap.local', role: 'Viewer', status: 'Active', lastLogin: '5 min ago', joinDate: 'Mar 2025', twoFA: false, alerts: 0, avatar: '#10b981' },
  { id: 4, name: 'Audit User', email: 'audit@company.com', role: 'Auditor', status: 'Inactive', lastLogin: '30 days ago', joinDate: 'Jan 2026', twoFA: false, alerts: 5, avatar: '#f59e0b' },
  { id: 5, name: 'Jane Doe', email: 'jane.d@company.com', role: 'Analyst', status: 'Active', lastLogin: '3 hours ago', joinDate: 'Nov 2025', twoFA: true, alerts: 19, avatar: '#ec4899' },
  { id: 6, name: 'Test Account', email: 'test@ransomtrap.local', role: 'Viewer', status: 'Suspended', lastLogin: '15 days ago', joinDate: 'Dec 2025', twoFA: false, alerts: 0, avatar: '#8b5cf6' },
]

export default function UserManagementPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Analyst' })

  function showToast(msg, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    if (roleFilter !== 'All' && u.role !== roleFilter) return false
    if (statusFilter !== 'All' && u.status !== statusFilter) return false
    return true
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    admins: users.filter(u => u.role === 'Admin').length,
    twoFA: users.filter(u => u.twoFA).length,
  }

  function handleAddUser() {
    if (!newUser.name || !newUser.email) { showToast('Please fill all required fields', 'error'); return }
    const u = { id: Date.now(), ...newUser, status: 'Active', lastLogin: 'Never', joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), twoFA: false, alerts: 0, avatar: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 6)] }
    setUsers(prev => [u, ...prev])
    setNewUser({ name: '', email: '', role: 'Analyst' })
    setShowAddModal(false)
    showToast(`User ${u.name} added successfully`)
  }

  function toggleStatus(id) {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u
      const next = u.status === 'Active' ? 'Suspended' : 'Active'
      showToast(`${u.name} ${next === 'Active' ? 'activated' : 'suspended'}`)
      return { ...u, status: next }
    }))
  }

  function removeUser(id) {
    const u = users.find(x => x.id === id)
    setUsers(prev => prev.filter(x => x.id !== id))
    if (selectedUser?.id === id) setSelectedUser(null)
    showToast(`${u?.name} removed`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060b13', color: '#f1f5f9', fontFamily: 'Inter,-apple-system,sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:99px}
        *{box-sizing:border-box}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, animation: 'toastIn .2s ease', display: 'flex', alignItems: 'center', gap: 10, background: toast.type === 'error' ? '#1a0808' : '#071a10', border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`, borderRadius: 12, padding: '12px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: toast.type === 'error' ? '#f87171' : '#34d399' }}>{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: toast.type === 'error' ? '#f87171' : '#34d399' }}>{toast.msg}</span>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowAddModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />
          <div style={{ position: 'relative', width: 440, background: '#0a1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 28, animation: 'modalIn .2s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800 }}>Add New User</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#3a5472', marginBottom: 6, display: 'block' }}>Full Name *</label>
                <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 13px', fontSize: 13, color: '#e2e8f0', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#3a5472', marginBottom: 6, display: 'block' }}>Email *</label>
                <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@company.com" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 13px', fontSize: 13, color: '#e2e8f0', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#3a5472', marginBottom: 6, display: 'block' }}>Role</label>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={{ width: '100%', background: '#0d1828', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 13px', fontSize: 13, color: '#e2e8f0', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
                  {ROLES.map(r => <option key={r} value={r} style={{ background: '#0d1828' }}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a6580', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddUser} style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>person_add</span> Add User</span>
              </button>
            </div>
          </div>
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
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#60a5fa' }}>manage_accounts</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.2px' }}>User Management</p>
              <p style={{ margin: 0, fontSize: 11, color: '#2a3f56', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Roles & Access Control</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#3b82f6)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', transition: 'all .15s' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
          Add User
        </button>
      </header>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px 60px' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24, animation: 'fadeUp .2s ease-out' }}>
            {[
              { label: 'Total Users', value: stats.total, icon: 'group', color: '#60a5fa' },
              { label: 'Active', value: stats.active, icon: 'check_circle', color: '#10b981' },
              { label: 'Administrators', value: stats.admins, icon: 'admin_panel_settings', color: '#f59e0b' },
              { label: '2FA Enabled', value: stats.twoFA, icon: 'verified_user', color: '#818cf8' },
            ].map(s => (
              <div key={s.label} style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}14`, border: `1px solid ${s.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: '#3a5472', fontWeight: 600 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, animation: 'fadeUp .22s ease-out', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: '#3a5472' }}>search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 13px 10px 38px', fontSize: 13, color: '#e2e8f0', outline: 'none', transition: 'border-color .15s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'} />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ background: '#0d1828', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 30px 10px 13px', fontSize: 13, color: '#e2e8f0', outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 140 }}>
              <option value="All" style={{ background: '#0d1828' }}>All Roles</option>
              {ROLES.map(r => <option key={r} value={r} style={{ background: '#0d1828' }}>{r}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ background: '#0d1828', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 30px 10px 13px', fontSize: 13, color: '#e2e8f0', outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 140 }}>
              <option value="All" style={{ background: '#0d1828' }}>All Status</option>
              {['Active', 'Suspended', 'Inactive'].map(s => <option key={s} value={s} style={{ background: '#0d1828' }}>{s}</option>)}
            </select>
          </div>

          {/* User grid */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 360px' : '1fr', gap: 18, animation: 'fadeUp .24s ease-out' }}>
            {/* Table */}
            <div style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['User', 'Role', 'Status', '2FA', 'Last Login', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '14px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#3a5472', textAlign: h === 'Actions' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', fontSize: 13, color: '#3a5472' }}>No users match your filters</td></tr>
                    ) : filtered.map(u => (
                      <tr key={u.id} onClick={() => setSelectedUser(u)} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selectedUser?.id === u.id ? 'rgba(99,102,241,0.06)' : 'transparent', transition: 'background .12s' }}
                        onMouseEnter={e => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'transparent' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: u.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{u.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{u.name}</p>
                              <p style={{ margin: '1px 0 0', fontSize: 11, color: '#3a5472' }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: u.role === 'Admin' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.1)', color: u.role === 'Admin' ? '#f59e0b' : '#818cf8', border: `1px solid ${u.role === 'Admin' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.18)'}` }}>{u.role}</span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[u.status] || '#4a6580', display: 'block', boxShadow: u.status === 'Active' ? `0 0 6px ${STATUS_COLORS[u.status]}80` : 'none' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[u.status] || '#4a6580' }}>{u.status}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 17, color: u.twoFA ? '#34d399' : '#2a3f56' }}>{u.twoFA ? 'verified_user' : 'no_encryption'}</span>
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: 12, color: '#4a6580' }}>{u.lastLogin}</td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => toggleStatus(u.id)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#4a6580', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s' }} title={u.status === 'Active' ? 'Suspend' : 'Activate'}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.color = '#fbbf24' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#4a6580' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{u.status === 'Active' ? 'pause_circle' : 'play_circle'}</span>
                            </button>
                            <button onClick={() => removeUser(u.id)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#4a6580', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s' }} title="Remove"
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#4a6580' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail panel */}
            {selectedUser && (
              <div style={{ background: '#07101c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp .15s ease-out', alignSelf: 'start', position: 'sticky', top: 130 }}>
                <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>User Detail</h3>
                  <button onClick={() => setSelectedUser(null)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#4a6580', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                  </button>
                </div>
                <div style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: selectedUser.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff', boxShadow: `0 0 24px ${selectedUser.avatar}40` }}>
                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{selectedUser.name}</p>
                    <p style={{ margin: '3px 0', fontSize: 12, color: '#4a6580' }}>{selectedUser.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.18)' }}>{selectedUser.role}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${STATUS_COLORS[selectedUser.status]}14`, color: STATUS_COLORS[selectedUser.status], border: `1px solid ${STATUS_COLORS[selectedUser.status]}28` }}>{selectedUser.status}</span>
                  </div>
                </div>
                <div style={{ padding: '0 22px 22px' }}>
                  {[
                    { label: 'Joined', value: selectedUser.joinDate, icon: 'calendar_today' },
                    { label: 'Last Login', value: selectedUser.lastLogin, icon: 'schedule' },
                    { label: 'Alerts Handled', value: String(selectedUser.alerts), icon: 'notifications' },
                    { label: '2FA', value: selectedUser.twoFA ? 'Enabled' : 'Disabled', icon: 'shield' },
                  ].map(f => (
                    <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#3a5472' }}>{f.icon}</span>
                        <span style={{ fontSize: 12, color: '#4a6580' }}>{f.label}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#c5d9f0' }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
