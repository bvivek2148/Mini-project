import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function AnalystsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const [analysts] = useState([
    {
      name: 'Sarah Johnson', role: 'Senior Analyst', status: 'Online',
      alerts: 12, avatar: 'SJ', color: 'from-blue-500 to-cyan-400',
      email: 's.johnson@soc.local', expertise: ['Ransomware', 'APT'],
      resolved: 48, avgResponse: '12m',
    },
    {
      name: 'Marcus Chen', role: 'Threat Analyst', status: 'Online',
      alerts: 8, avatar: 'MC', color: 'from-emerald-500 to-teal-400',
      email: 'm.chen@soc.local', expertise: ['Malware', 'DFIR'],
      resolved: 36, avgResponse: '18m',
    },
    {
      name: 'Priya Nair', role: 'SOC Analyst', status: 'Away',
      alerts: 5, avatar: 'PN', color: 'from-amber-500 to-orange-400',
      email: 'p.nair@soc.local', expertise: ['Network', 'Phishing'],
      resolved: 22, avgResponse: '25m',
    },
    {
      name: 'Daniel Reyes', role: 'Incident Responder', status: 'Offline',
      alerts: 0, avatar: 'DR', color: 'from-slate-500 to-slate-400',
      email: 'd.reyes@soc.local', expertise: ['IR', 'Forensics'],
      resolved: 67, avgResponse: '8m',
    },
  ])

  const statusDot = { Online: 'bg-emerald-500', Away: 'bg-amber-500', Offline: 'bg-slate-500' }
  const statusBg = { Online: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', Away: 'bg-amber-500/10 text-amber-400 border-amber-500/20', Offline: 'bg-white/5 text-slate-400 border-white/5' }

  const onlineCount = analysts.filter(a => a.status === 'Online').length
  const totalAlerts = analysts.reduce((s, a) => s + a.alerts, 0)
  const totalResolved = analysts.reduce((s, a) => s + a.resolved, 0)

  const filteredAnalysts = analysts.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background-dark font-display text-white">

      {/* ── TOP NAVIGATION BAR ── */}
      <header className="flex items-center justify-between border-b border-surface-dark bg-background-dark/95 backdrop-blur-md px-6 lg:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="size-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 flex items-center justify-center text-text-secondary hover:text-white transition-all group"
            title="Go back"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-px transition-transform">arrow_back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary/30 to-cyan-500/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[20px]">group</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">SOC Analyst Team</h1>
              <p className="text-[11px] text-text-secondary">Team management · Assignment · Performance</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link to="/Incidents" className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span className="hidden md:inline">Incidents</span>
          </Link>
          <Link to="/Incidents/terminationlog" className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span className="hidden md:inline">Logs</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8">

        {/* ── STATS OVERVIEW ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">group</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Total</span>
            </div>
            <p className="text-3xl font-black">{analysts.length}</p>
            <p className="text-xs text-text-secondary mt-0.5">Analysts</p>
            <div className="absolute -bottom-3 -right-3 size-20 rounded-full bg-primary/5 blur-2xl" />
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-emerald-500/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">radio_button_checked</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Active</span>
            </div>
            <p className="text-3xl font-black text-emerald-400">{onlineCount}</p>
            <p className="text-xs text-text-secondary mt-0.5">Online Now</p>
            <div className="absolute -bottom-3 -right-3 size-20 rounded-full bg-emerald-500/5 blur-2xl" />
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-amber-500/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-400 text-[20px]">notifications_active</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Active</span>
            </div>
            <p className="text-3xl font-black text-amber-400">{totalAlerts}</p>
            <p className="text-xs text-text-secondary mt-0.5">Open Alerts</p>
            <div className="absolute -bottom-3 -right-3 size-20 rounded-full bg-amber-500/5 blur-2xl" />
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">verified_user</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Lifetime</span>
            </div>
            <p className="text-3xl font-black">{totalResolved}</p>
            <p className="text-xs text-text-secondary mt-0.5">Resolved</p>
            <div className="absolute -bottom-3 -right-3 size-20 rounded-full bg-white/5 blur-2xl" />
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="bg-surface-dark/50 border border-white/5 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50 text-[18px]">search</span>
              <input
                className="w-full bg-background-dark border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-text-secondary/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                placeholder="Search analysts by name or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Add Analyst
            </button>
          </div>
        </div>

        {/* ── ANALYST CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAnalysts.map((analyst) => (
            <div key={analyst.name} className="group bg-surface-dark/50 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.06)]">

              {/* Card Header with gradient bar */}
              <div className={`h-1 bg-gradient-to-r ${analyst.color}`} />

              <div className="p-6">
                {/* Top Row: Avatar + Info + Status */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`size-14 rounded-2xl bg-gradient-to-br ${analyst.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {analyst.avatar}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-surface-dark ${statusDot[analyst.status]} ${analyst.status === 'Online' ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">{analyst.name}</h3>
                      <p className="text-text-secondary text-sm">{analyst.role}</p>
                      <p className="text-text-secondary/50 text-xs mt-0.5">{analyst.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusBg[analyst.status]}`}>
                    <span className={`size-1.5 rounded-full ${statusDot[analyst.status]}`} />
                    {analyst.status}
                  </span>
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {analyst.expertise.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-background-dark/60 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-amber-400">{analyst.alerts}</p>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">Open</p>
                  </div>
                  <div className="bg-background-dark/60 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-emerald-400">{analyst.resolved}</p>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">Resolved</p>
                  </div>
                  <div className="bg-background-dark/60 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-primary">{analyst.avgResponse}</p>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">Avg Time</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <button className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-text-secondary hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined text-[16px]">assignment</span>
                    Assign Alert
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-text-secondary hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    Message
                  </button>
                  <button className="flex items-center justify-center text-text-secondary hover:text-red-400 px-3 py-2.5 rounded-xl hover:bg-red-500/5 transition-all" title="Remove analyst">
                    <span className="material-symbols-outlined text-[16px]">person_remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state when search has no results */}
        {filteredAnalysts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-text-secondary text-[32px]">person_search</span>
            </div>
            <p className="text-white font-semibold">No analysts found</p>
            <p className="text-text-secondary text-sm mt-1">Try a different search term</p>
          </div>
        )}

      </main>
    </div>
  )
}
