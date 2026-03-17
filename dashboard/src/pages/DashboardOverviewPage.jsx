import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'
import { fetchAgentStatus, agentStart, agentStop } from '../api.js'

function formatTs(ts) {
  if (!ts) return '—'
  const d = new Date(ts * 1000)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function DashboardOverviewPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { alerts, loading, error } = useAlerts(5000)

  // Agent start/stop state
  const [agentRunning, setAgentRunning] = useState(false)
  const [agentToggling, setAgentToggling] = useState(false)

  // Header state
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Poll agent status every 5 seconds
  React.useEffect(() => {
    let cancelled = false
    async function pollStatus() {
      try {
        const s = await fetchAgentStatus()
        if (!cancelled) setAgentRunning(s.running)
      } catch { /* server may not be up yet */ }
    }
    pollStatus()
    const id = setInterval(pollStatus, 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  async function handleAgentToggle() {
    if (agentToggling) return
    setAgentToggling(true)
    try {
      if (agentRunning) {
        await agentStop()
        setAgentRunning(false)
      } else {
        await agentStart()
        setAgentRunning(true)
      }
    } catch (e) {
      console.error('Agent toggle failed:', e)
    } finally {
      setAgentToggling(false)
    }
  }

  const ransomwareAlerts = alerts.filter(a => a.alert_type === 'ransomware_suspected')
  const honeytokenAlerts = alerts.filter(a => a.alert_type === 'honeytoken_access')
  const recentAlerts = [...alerts].reverse().slice(0, 3)

  // ── Timeline chart data (last 60 min, 12 x 5-min buckets) ─────────────────
  const timelineBuckets = React.useMemo(() => {
    const now = Date.now() / 1000
    const buckets = Array.from({ length: 12 }, (_, i) => ({ label: `${(11 - i) * 5}m`, count: 0, start: now - (12 - i) * 300, end: now - (11 - i) * 300 }))
    alerts.forEach(a => {
      const ts = a.timestamp || 0
      const b = buckets.find(b => ts >= b.start && ts < b.end)
      if (b) b.count++
    })
    return buckets
  }, [alerts])
  const maxBucket = Math.max(1, ...timelineBuckets.map(b => b.count))

  // ── Per-host breakdown ─────────────────────────────────────────────────────
  const hostMap = React.useMemo(() => {
    const map = {}
    alerts.forEach(a => {
      const h = a.host || 'Unknown'
      if (!map[h]) map[h] = { host: h, total: 0, ransomware: 0, honeytoken: 0, lastTs: 0 }
      map[h].total++
      if (a.alert_type === 'ransomware_suspected') map[h].ransomware++
      else map[h].honeytoken++
      if ((a.timestamp || 0) > map[h].lastTs) map[h].lastTs = a.timestamp
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [alerts])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#060a10]">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`w-[240px] flex-col bg-[#070c14] flex fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:static lg:translate-x-0 border-r border-white/[0.04] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex h-full flex-col p-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-3 py-3 mb-1">
            <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <svg className="size-5 text-primary" fill="none" viewBox="0 0 48 48"><path d="M24 4L6 12V22C6 33.5 13.7 44.1 24 46C34.3 44.1 42 33.5 42 22V12L24 4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"/><path d="M24 14V34" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"/><path d="M14 24H34" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"/></svg>
            </div>
            <span className="text-white text-[15px] font-black tracking-tight">Ransom Trap</span>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-4 rounded-lg bg-white/[0.03] border border-white/[0.04]">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-8 border border-white/10 shrink-0"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDYBVma9FFsfv7iby7buy_M4M5gS_w8bo7i4Bp_owrVhnc6iR8SsMT24-MkJIrQjwi55aiRCKIXI9oqbVfbLCqtoVMWFUpP3xR9_bf23OyYhUJuqglxMebPo_mw9s1soInDNyWsEO4HWV7u-yYuco7mJZ6AaXpK_Do9eXnZQLPha9-ZnhM7IczBs6Ql-rCcCxvLmdHS0MDxspxe-EI9x-7HmEZKzvjjM0O7Eq4-kAvj-zu24C1KIVz2SfMdBF0AtwKklQsiraQfTCY")',
              }}
            />
            <div className="flex flex-col min-w-0">
              <p className="text-white text-[12px] font-semibold truncate">Admin Console</p>
              <p className="text-[#334b63] text-[10px] truncate">Security Ops Lead</p>
            </div>
          </div>

          {/* Nav Label */}
          <p className="text-[#263446] text-[9px] font-bold uppercase tracking-[0.15em] px-3 mb-1.5">Navigation</p>

          {/* Nav Items */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {[
              { to: '/', icon: 'dashboard', label: 'Overview', active: true },
              { to: '/scan', icon: 'document_scanner', label: 'Manual Scan' },
              { to: '/Incidents', icon: 'warning', label: 'Incidents' },
              { to: '/entropy', icon: 'ssid_chart', label: 'Entropy Analysis' },
              { to: '/network', icon: 'hub', label: 'Network Topology' },
              { to: '/honeytokens', icon: 'bug_report', label: 'Honeytokens' },
              { to: '/reports', icon: 'description', label: 'Reports' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${item.active
                  ? 'bg-primary/15 text-white border border-primary/20'
                  : 'text-[#556980] hover:text-white hover:bg-white/[0.04]'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={`material-symbols-outlined text-[18px] ${item.active ? 'text-primary' : ''}`}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom */}
          <div className="flex flex-col gap-0.5 pt-3 mt-auto border-t border-white/[0.04]">
            <Link
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#556980] hover:text-white hover:bg-white/[0.04] transition-all"
              to="/settings"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </Link>
            <button
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#556980] hover:text-red-400 hover:bg-red-500/[0.06] transition-all text-left"
              type="button"
              onClick={() => {
                setSidebarOpen(false)
                navigate('/login', { replace: true })
              }}
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[#060a10] overflow-hidden">
        <header className="flex items-center justify-between border-b border-white/[0.04] bg-[#070c14]/80 backdrop-blur-xl px-5 py-3 shrink-0">
          <div className="flex items-center gap-3 w-full max-w-xl">
            <button
              className="lg:hidden text-[#556980] hover:text-white transition-colors"
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <label className="hidden md:flex flex-1 max-w-md">
              <div className="flex w-full items-center rounded-lg h-9 bg-white/[0.04] border border-white/[0.06] focus-within:border-primary/40 transition-all">
                <span className="material-symbols-outlined text-[16px] text-[#334b63] ml-3 mr-2">search</span>
                <input
                  className="w-full bg-transparent text-white placeholder:text-[#334b63] focus:outline-none text-[12px] pr-3"
                  placeholder="Search IP, Hash, or Hostname..."
                />
              </div>
            </label>
          </div>
          <div className="flex items-center gap-2">
            {/* Agent Status Pill */}
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <button
                onClick={handleAgentToggle}
                disabled={agentToggling}
                className={`flex items-center gap-1.5 h-7 px-3 rounded-full text-[10px] font-bold transition-all disabled:opacity-50 ${agentRunning
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/15 hover:bg-red-500/20'}`}
              >
                <span className={`size-1.5 rounded-full ${agentRunning ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                {agentToggling ? '...' : agentRunning ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 relative">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex size-8 items-center justify-center rounded-lg text-[#556980] hover:text-white hover:bg-white/[0.04] transition-all"
                  title="Notifications"
                >
                  <span className="material-symbols-outlined text-[18px]">notifications</span>
                  {recentAlerts.length > 0 && (
                    <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[400px] bg-[#0a1118] border border-white/[0.06] rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden" style={{ animation: 'fadeInScale 0.2s ease-out' }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">notifications_active</span>
                        <h3 className="text-white font-bold text-[13px]">Notifications</h3>
                      </div>
                      <span className="text-[9px] font-bold text-[#334b63] bg-white/[0.03] px-2 py-0.5 rounded tracking-wider">{recentAlerts.length} NEW</span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                      {recentAlerts.length === 0 ? (
                        <div className="p-8 text-center">
                          <span className="material-symbols-outlined text-3xl text-[#1e2a3a] mb-2 block">notifications_off</span>
                          <p className="text-[#334b63] text-xs">No recent alerts</p>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {recentAlerts.map((alert, i) => {
                            const isRansomware = alert.alert_type === 'ransomware_suspected'
                            return (
                              <div key={i} className={`border-l-2 ${isRansomware ? 'border-l-red-500' : 'border-l-amber-500'} border-b border-b-white/[0.03] hover:bg-white/[0.02] transition-all cursor-pointer`}>
                                <div className="px-4 py-3">
                                  <div className="flex items-start gap-2.5">
                                    <div className={`size-7 rounded-lg shrink-0 flex items-center justify-center ${isRansomware ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                                      <span className={`material-symbols-outlined text-[14px] ${isRansomware ? 'text-red-400' : 'text-amber-400'}`}>
                                        {isRansomware ? 'shield' : 'key'}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-white text-[12px] font-medium truncate">
                                          {isRansomware ? 'Ransomware Detected' : 'Honeytoken Accessed'}
                                        </span>
                                        <span className="text-[#263446] text-[9px] font-mono shrink-0">
                                          {alert.timestamp ? new Date(alert.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#334b63]">
                                        <span className="font-mono">{alert.host || '—'}</span>
                                        {alert.process_name && <><span className="text-[#1e2a3a]">·</span><span className="font-mono">{alert.process_name}</span></>}
                                      </div>
                                      {isRansomware && (
                                        <div className="flex gap-1.5 mt-1.5">
                                          {alert.process_killed !== undefined && (
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${alert.process_killed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                              {alert.process_killed ? 'Killed' : 'Active'}
                                            </span>
                                          )}
                                          {alert.folder_locked !== undefined && (
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${alert.folder_locked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                              {alert.folder_locked ? 'Locked' : 'Open'}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <Link
                      to="/alerts"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-white/[0.04] text-primary text-[10px] font-bold uppercase tracking-wider hover:bg-white/[0.02] transition-colors"
                    >
                      View All <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                    </Link>
                  </div>
                )}
              </div>

              <button onClick={() => window.location.reload()} className="flex size-8 items-center justify-center rounded-lg text-[#556980] hover:text-white hover:bg-white/[0.04] transition-all" title="Refresh">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
              <button className="hidden sm:flex size-8 items-center justify-center rounded-lg text-[#556980] hover:text-white hover:bg-white/[0.04] transition-all" title="Settings">
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto scroll-smooth relative">
          {/* ── Animated Background Mesh ── */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{left: '240px'}}>
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/[0.03] blur-[120px]" style={{animation: 'float 20s ease-in-out infinite'}} />
            <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.03] blur-[120px]" style={{animation: 'float 25s ease-in-out infinite 5s'}} />
            <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.02] blur-[100px]" style={{animation: 'float 22s ease-in-out infinite 10s'}} />
          </div>

          <div className="relative z-10 p-4 md:p-6 lg:p-10">
          <div className="mx-auto flex flex-col max-w-[1200px] gap-6">

            {/* ── PAGE HEADER ── */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-gradient-to-r from-primary to-transparent" />
                  <p className="text-primary/70 text-[10px] font-bold tracking-[0.2em] uppercase">Security Operations Center</p>
                </div>
                <h1 className="text-gradient text-4xl md:text-5xl font-black tracking-tighter leading-[0.95]">Dashboard<br/>Overview</h1>
                <p className="text-[#334b63] text-[13px] mt-1 flex items-center gap-2">
                  Monitoring <span className="text-white/80 font-semibold">{hostMap.length}</span> endpoint{hostMap.length !== 1 ? 's' : ''} · <span className="text-white/80 font-semibold">{alerts.length}</span> alert{alerts.length !== 1 ? 's' : ''} today
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#263446] text-[10px] font-mono bg-white/[0.02] px-3 py-2 rounded-lg border border-white/[0.04] flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}
                </span>
                <button className="flex items-center gap-1.5 rounded-lg h-8 px-3 bg-white/[0.03] text-[#556980] text-[10px] font-bold border border-white/[0.05] hover:bg-white/[0.06] hover:text-white transition-all active:scale-95 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  Export
                </button>
                <button className="flex items-center gap-1.5 rounded-lg h-8 px-3 bg-gradient-to-r from-primary to-indigo-500 text-white text-[10px] font-bold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">play_circle</span>
                  Live
                </button>
              </div>
            </div>

            {/* ── SECURITY SCORE + STAT CARDS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Security Posture Score */}
              <div className="lg:col-span-3 glass-card rounded-2xl bg-gradient-to-br from-[#0c1828]/90 to-[#060d14]/90 border border-white/[0.06] p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden backdrop-blur-xl">
                {/* Radial glow behind score */}
                <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
                  ransomwareAlerts.length > 0 ? 'bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.08),transparent_70%)]'
                  : agentRunning ? 'bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.08),transparent_70%)]'
                  : 'bg-[radial-gradient(circle_at_50%_40%,rgba(239,68,68,0.08),transparent_70%)]'
                }`} />
                <div className="relative">
                  <svg width="130" height="130" viewBox="0 0 130 130" className="transform -rotate-90">
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={ransomwareAlerts.length > 0 ? '#f59e0b' : agentRunning ? '#10b981' : '#ef4444'} />
                        <stop offset="100%" stopColor={ransomwareAlerts.length > 0 ? '#f97316' : agentRunning ? '#06b6d4' : '#dc2626'} />
                      </linearGradient>
                      <filter id="scoreGlow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                    <circle cx="65" cy="65" r="54" fill="none"
                      stroke="url(#scoreGrad)"
                      strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${(ransomwareAlerts.length > 0 ? 72 : agentRunning ? 94 : 30) * 3.39} 339`}
                      className="transition-all duration-1000"
                      filter="url(#scoreGlow)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-black tabular-nums ${ransomwareAlerts.length > 0 ? 'text-amber-400' : agentRunning ? 'text-emerald-400' : 'text-red-400'}`} style={{textShadow: `0 0 20px ${ransomwareAlerts.length > 0 ? 'rgba(245,158,11,0.3)' : agentRunning ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`}}>
                      {ransomwareAlerts.length > 0 ? '72' : agentRunning ? '94' : '30'}
                    </span>
                    <span className="text-[8px] text-[#556980] font-bold uppercase tracking-[0.2em] mt-0.5">Score</span>
                  </div>
                </div>
                <div className="text-center relative z-10">
                  <p className="text-white text-sm font-bold">Security Posture</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1 ${ransomwareAlerts.length > 0 ? 'text-amber-400' : agentRunning ? 'text-emerald-400' : 'text-red-400'}`}>
                    <span className={`size-1.5 rounded-full ${ransomwareAlerts.length > 0 ? 'bg-amber-400' : agentRunning ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {ransomwareAlerts.length > 0 ? 'Elevated Risk' : agentRunning ? 'Protected' : 'Unprotected'}
                  </p>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Active Threats */}
                <div className="glass-card group relative rounded-2xl p-5 bg-[#0a1118]/80 backdrop-blur-xl border border-white/[0.06] hover:border-red-500/30 overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.08)]">
                  <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-red-500/[0.04] blur-2xl group-hover:bg-red-500/[0.1] transition-all duration-500" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center border border-red-500/10">
                      <span className="material-symbols-outlined text-red-400 text-[20px]">gpp_bad</span>
                    </div>
                    {ransomwareAlerts.length > 0 && (
                      <span className="flex items-center gap-1.5 text-red-400 text-[9px] font-bold bg-red-500/10 px-2 py-0.5 rounded-full">
                        <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      {loading ? <p className="text-[#334b63] text-3xl font-bold">—</p> : (
                        <p className="text-white text-4xl font-black tracking-tighter">{ransomwareAlerts.length}</p>
                      )}
                      <p className="text-[#334b63] text-[9px] font-bold uppercase tracking-[0.15em] mt-1">Active Threats</p>
                    </div>
                    <svg width="60" height="30" viewBox="0 0 60 30" className="opacity-30 group-hover:opacity-60 transition-opacity">
                      <path d="M0,24 L8,20 L16,22 L24,16 L32,18 L40,8 L48,12 L56,4" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  {error && <p className="text-[8px] text-red-400/70 truncate mt-2 relative z-10">{error}</p>}
                </div>

                {/* Honeytoken Hits */}
                <div className="glass-card group relative rounded-2xl p-5 bg-[#0a1118]/80 backdrop-blur-xl border border-white/[0.06] hover:border-amber-500/30 overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.08)]">
                  <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-amber-500/[0.04] blur-2xl group-hover:bg-amber-500/[0.1] transition-all duration-500" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/10">
                      <span className="material-symbols-outlined text-amber-400 text-[20px]">pest_control</span>
                    </div>
                    {honeytokenAlerts.length > 0 && (
                      <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
                       <span className="material-symbols-outlined text-[12px]">trending_up</span>+{honeytokenAlerts.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      {loading ? <p className="text-[#334b63] text-3xl font-bold">—</p> : (
                        <p className="text-white text-4xl font-black tracking-tighter">{honeytokenAlerts.length}</p>
                      )}
                      <p className="text-[#334b63] text-[9px] font-bold uppercase tracking-[0.15em] mt-1">Honeytoken Hits</p>
                    </div>
                    <svg width="60" height="30" viewBox="0 0 60 30" className="opacity-30 group-hover:opacity-60 transition-opacity">
                      <path d="M0,20 L8,18 L16,22 L24,14 L32,16 L40,10 L48,14 L56,6" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Total Alerts */}
                <div className="glass-card group relative rounded-2xl p-5 bg-[#0a1118]/80 backdrop-blur-xl border border-white/[0.06] hover:border-blue-500/30 overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.08)]">
                  <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-blue-500/[0.04] blur-2xl group-hover:bg-blue-500/[0.1] transition-all duration-500" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/10">
                      <span className="material-symbols-outlined text-blue-400 text-[20px]">monitoring</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      {loading ? <p className="text-[#334b63] text-3xl font-bold">—</p> : (
                        <p className="text-white text-4xl font-black tracking-tighter">{alerts.length}</p>
                      )}
                      <p className="text-[#334b63] text-[9px] font-bold uppercase tracking-[0.15em] mt-1">Total Alerts</p>
                    </div>
                    <svg width="60" height="30" viewBox="0 0 60 30" className="opacity-30 group-hover:opacity-60 transition-opacity">
                      <path d="M0,14 L8,18 L16,10 L24,20 L32,12 L40,16 L48,8 L56,14" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Agent Status */}
                <div className="glass-card group relative rounded-2xl p-5 bg-[#0a1118]/80 backdrop-blur-xl border border-white/[0.06] hover:border-emerald-500/30 overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.08)]">
                  <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-emerald-500/[0.04] blur-2xl group-hover:bg-emerald-500/[0.1] transition-all duration-500" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/10">
                      <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified_user</span>
                    </div>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold border ${error ? 'bg-red-500/15 text-red-400 border-red-500/15'
                      : agentRunning ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/15' : 'bg-red-500/15 text-red-400 border-red-500/15'}`}>
                      {error ? 'ERR' : agentRunning ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-white text-lg font-bold leading-tight">
                      {error ? 'Unreachable' : agentRunning ? 'Monitoring' : 'Stopped'}
                    </p>
                    <p className="text-[#334b63] text-[9px] font-bold uppercase tracking-[0.15em] mt-1">Agent Status</p>
                    <button onClick={handleAgentToggle} disabled={agentToggling}
                      className={`mt-3 text-[9px] font-bold px-3.5 py-1.5 rounded-lg transition-all disabled:opacity-50 active:scale-95 uppercase tracking-wider ${agentRunning
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10'}`}
                    >
                      {agentToggling ? 'Wait…' : agentRunning ? 'Stop' : 'Start'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { to: '/scan', icon: 'document_scanner', label: 'Scan Files' },
                { to: '/Incidents', icon: 'warning', label: 'Incidents' },
                { to: '/entropy', icon: 'ssid_chart', label: 'Entropy' },
                { to: '/network', icon: 'hub', label: 'Network' },
                { to: '/honeytokens', icon: 'bug_report', label: 'Honeytokens' },
                { to: '/reports', icon: 'description', label: 'Reports' },
              ].map(a => (
                <Link key={a.to} to={a.to}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.02] backdrop-blur border border-white/[0.05] text-[#556980] hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-[11px] font-medium group"
                >
                  <span className="material-symbols-outlined text-[14px] group-hover:text-primary transition-colors">{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>

            {/* ── CHART + LIVE FEED ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Chart */}
              <div className="xl:col-span-2 flex flex-col rounded-2xl bg-[#0a1118] border border-white/[0.06] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[16px]">trending_up</span>
                    </div>
                    <h3 className="text-white text-sm font-bold">Threat Detection Velocity</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.06]">
                    {['1H','6H','24H','7D'].map((t,i) => (
                      <button key={t} className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${i === 2 ? 'bg-primary/20 text-primary' : 'text-[#556980] hover:text-white'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-2 flex items-center gap-6 text-[10px] border-b border-white/[0.03]">
                  <span className="flex items-center gap-1.5 text-[#556980]"><span className="size-2 rounded-full bg-primary" /> Events</span>
                  <span className="flex items-center gap-1.5 text-[#556980]"><span className="size-2 rounded-full bg-red-500" /> Critical</span>
                  <span className="ml-auto text-[#334b63]">Peak: <span className="text-white font-bold">94</span></span>
                  <span className="text-[#334b63]">Avg: <span className="text-[#92adc9] font-bold">47</span></span>
                </div>
                <div className="relative w-full h-[220px] px-6 pt-4 pb-2">
                  <div className="absolute inset-x-6 inset-y-4 flex flex-col justify-between pointer-events-none z-0">
                    {[100,75,50,25,0].map(v => (
                      <div key={v} className="border-b border-white/[0.03] w-full h-0 flex items-end">
                        <span className="text-[9px] text-[#263446] font-mono -ml-1 -mb-1">{v}</span>
                      </div>
                    ))}
                  </div>
                  <svg className="absolute inset-x-6 inset-y-4 w-[calc(100%-3rem)] h-[calc(100%-1.5rem)] z-10" preserveAspectRatio="none" viewBox="0 0 500 100">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <path d="M0,80 C20,80 30,40 50,40 C70,40 80,70 100,70 C120,70 130,20 150,20 C170,20 180,60 200,60 C220,60 230,85 250,85 C270,85 280,30 300,30 C320,30 330,50 350,50 C370,50 380,10 400,10 C420,10 430,70 450,70 C470,70 480,45 500,45 V100 H0 Z" fill="url(#chartGradient)" />
                    <path d="M0,80 C20,80 30,40 50,40 C70,40 80,70 100,70 C120,70 130,20 150,20 C170,20 180,60 200,60 C220,60 230,85 250,85 C270,85 280,30 300,30 C320,30 330,50 350,50 C370,50 380,10 400,10 C420,10 430,70 450,70 C470,70 480,45 500,45" fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="150" cy="20" fill="#ef4444" r="3.5" stroke="#0a1118" strokeWidth="2">
                      <animate attributeName="r" values="3.5;5.5;3.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="400" cy="10" fill="#ef4444" r="3.5" stroke="#0a1118" strokeWidth="2">
                      <animate attributeName="r" values="3.5;5.5;3.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
                <div className="flex justify-between text-[#334b63] text-[9px] font-mono px-7 pb-4">
                  {['00:00','04:00','08:00','12:00','16:00','20:00','NOW'].map(t => (
                    <span key={t} className={t === 'NOW' ? 'text-primary font-bold' : ''}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Live Threat Feed */}
              <div className="flex flex-col rounded-2xl bg-[#0a1118] border border-white/[0.06] overflow-hidden h-full">
                <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-400 text-[16px]">cell_tower</span>
                    </div>
                    <h3 className="text-white text-sm font-bold">Live Feed</h3>
                  </div>
                  <span className="flex items-center gap-1.5 text-red-400 text-[9px] font-bold tracking-wider">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                    </span>
                    LIVE
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loading && (
                    <div className="flex items-center justify-center p-10 text-[#334b63] text-xs">
                      <span className="material-symbols-outlined animate-spin mr-2 text-primary text-[18px]">progress_activity</span>
                      Connecting…
                    </div>
                  )}
                  {!loading && recentAlerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-10 text-[#334b63] text-xs gap-2">
                      <span className="material-symbols-outlined text-2xl text-emerald-500/50">verified_user</span>
                      <p className="font-medium">All clear</p>
                    </div>
                  )}
                  {recentAlerts.map((alert, i) => {
                    const isRansomware = alert.alert_type === 'ransomware_suspected'
                    return (
                      <div key={i} className="group flex gap-3 px-4 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all cursor-pointer">
                        <div className={`flex items-center justify-center size-8 rounded-lg shrink-0 transition-colors ${isRansomware
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-400'}`}>
                          <span className="material-symbols-outlined text-[16px]">
                            {isRansomware ? 'bug_report' : 'key'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isRansomware ? 'text-red-400' : 'text-amber-400'}`}>
                              {isRansomware ? 'Critical' : 'Warning'}
                            </span>
                            <span className="text-[#263446] text-[9px] font-mono tabular-nums">
                              {formatTs(alert.timestamp)}
                            </span>
                          </div>
                          <p className="text-white text-[12px] font-medium truncate leading-tight">
                            {isRansomware ? 'Ransomware Suspected' : 'Honeytoken Accessed'}
                          </p>
                          <p className="text-[#334b63] text-[10px] truncate mt-0.5">
                            {alert.host || '—'}{alert.process_name && ` · ${alert.process_name}`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Link to="/Incidents"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.04] text-[10px] text-primary font-bold hover:text-white transition-colors uppercase tracking-widest"
                >
                  View All <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                </Link>
              </div>
              {/* Endpoint Map */}
              <div className="xl:col-span-3 flex flex-col rounded-2xl bg-[#0a1118] border border-white/[0.06] overflow-hidden h-full">
                <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">public</span>
                    </div>
                    <h3 className="text-white text-sm font-bold">Endpoint Map</h3>
                  </div>
                  <span className="flex items-center gap-1.5 text-emerald-400 text-[9px] font-bold tracking-wider">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                  </span>
                </div>
                <div className="relative flex-1 bg-[#060d14] min-h-[400px] xl:min-h-[450px] group/map">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 grayscale group-hover/map:grayscale-0 group-hover/map:opacity-50 transition-all duration-700"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCbzsu07R3qPI1x9wlzPUj8mZ0EX1EkYbCMu7t8ewGT0q3dS95eRT8alL2Ynj1vonzn-N6ZsjqsqX_3gFb_5fLQFZdy3bbIYoiUhdnrjjXbM9SXFosW8FQmI1D90Nw4brqm4uDfaGED_bymByj_Io9nM3heErzutlxY8zSeli2GcDLvGnCSq5LrWkDid1HMiWN_VO0tj8-DXQaXgUjF5PVj57YtmL1JK1RBXoKJ2goXEq726J8mQHT3GU_ipc5J40JXQ24M5YFW1zE")',
                    }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(19,127,236,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(19,127,236,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060d14] via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-[32%] left-[22%] group">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-20" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-4 ring-emerald-500/20 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                    </div>
                  </div>
                  <div className="absolute top-[35%] left-[49%] group">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-30" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 ring-4 ring-red-500/20 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECURITY ALERTS TABLE ── */}
            <div className="flex flex-col rounded-2xl bg-[#0a1118] border border-white/[0.06] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[16px]">security</span>
                  </div>
                  <h3 className="text-white text-sm font-bold">Recent Security Alerts</h3>
                  <span className="text-[9px] text-[#334b63] bg-white/[0.03] px-2 py-0.5 rounded font-mono border border-white/[0.04]">{alerts.length}</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#556980] bg-white/[0.03] rounded-md hover:bg-white/[0.06] border border-white/[0.06] transition-all active:scale-95">
                    Export
                  </button>
                  <Link to="/alerts" className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white bg-primary/80 rounded-md hover:bg-primary transition-all active:scale-95">
                    View All
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#556980]">
                  <thead className="text-[9px] uppercase font-bold tracking-wider text-[#334b63] border-b border-white/[0.03]">
                    <tr>
                      <th className="px-6 py-3">Severity</th>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Hostname</th>
                      <th className="px-6 py-3">Threat Type</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {alerts.slice(0, 5).map((a, i) => {
                      const isRansomware = a.alert_type === 'ransomware_suspected'
                      return (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${isRansomware
                              ? 'text-red-400 bg-red-500/10'
                              : 'text-amber-400 bg-amber-500/10'}`}>
                              <span className={`size-1.5 rounded-full ${isRansomware ? 'bg-red-400' : 'bg-amber-400'}`} />
                              {isRansomware ? 'Critical' : 'Warning'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-[#556980] font-mono text-[11px] tabular-nums">{formatTs(a.timestamp)}</td>
                          <td className="px-6 py-3.5 text-white font-medium text-[12px]">{a.host || '—'}</td>
                          <td className="px-6 py-3.5 text-[12px]">{isRansomware ? 'Ransomware' : 'Honeytoken'}</td>
                          <td className="px-6 py-3.5">
                            {a.process_killed ? (
                              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-medium">
                                <span className="material-symbols-outlined text-[13px]">check_circle</span> Blocked
                              </span>
                            ) : (
                              <span className="text-amber-400/70 flex items-center gap-1 text-[11px] font-medium">
                                <span className="material-symbols-outlined text-[13px]">visibility</span> Detected
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <Link to="/Incidents" className="text-primary hover:text-white font-bold text-[9px] uppercase tracking-wider transition-colors">Investigate</Link>
                          </td>
                        </tr>
                      )
                    })}
                    {alerts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-[#263446] text-xs">
                          No security alerts at this time
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Alert Activity Timeline ────────────────────── */}
          <div className="px-6 lg:px-10 pb-4 pt-2 max-w-[1200px] mx-auto">
            <div className="bg-[#0a1118] rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-indigo-400 text-[16px]">bar_chart</span>
                  </div>
                  <h3 className="text-white text-sm font-bold">Alert Activity</h3>
                  <span className="text-[9px] text-[#334b63] font-mono">60 min</span>
                </div>
                <span className="text-[9px] bg-white/[0.03] text-[#556980] px-2.5 py-1 rounded font-bold tracking-wider border border-white/[0.04]">{alerts.length} TOTAL</span>
              </div>
              <div className="flex items-end gap-1 h-20 px-6 py-4">
                {timelineBuckets.map((b, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 gap-1" title={`${b.count} alert(s) — ${b.label} ago`}>
                    <div
                      className={`w-full rounded transition-all duration-500 ${b.count > 0 ? 'bg-gradient-to-t from-primary/60 to-indigo-400/40 hover:from-primary hover:to-indigo-400' : 'bg-white/[0.03]'}`}
                      style={{ height: `${Math.max(3, (b.count / maxBucket) * 56)}px` }}
                    />
                    {i % 3 === 0 && <span className="text-[8px] text-[#263446] font-mono">{b.label}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Per-Host Breakdown ─────────────────────────── */}
          {hostMap.length > 0 && (
            <div className="px-6 lg:px-10 pb-8 max-w-[1200px] mx-auto">
              <div className="bg-[#0a1118] rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-cyan-400 text-[16px]">dns</span>
                    </div>
                    <h3 className="text-white text-sm font-bold">Active Hosts</h3>
                    <span className="text-[9px] text-[#334b63] bg-white/[0.03] px-2 py-0.5 rounded font-mono border border-white/[0.04]">{hostMap.length}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-[9px] uppercase font-bold tracking-wider text-[#334b63] border-b border-white/[0.03]">
                      <tr>
                        <th className="px-6 py-3">Hostname</th>
                        <th className="px-6 py-3">Total</th>
                        <th className="px-6 py-3">Ransomware</th>
                        <th className="px-6 py-3">Honeytoken</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {hostMap.map(h => (
                        <tr key={h.host} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`size-2 rounded-full ${h.ransomware > 0 ? 'bg-red-400 animate-pulse' : 'bg-amber-400'}`} />
                              <span className="text-white font-mono font-medium text-[12px]">{h.host}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`font-bold text-[12px] ${h.total > 3 ? 'text-red-400' : h.total > 1 ? 'text-amber-400' : 'text-[#334b63]'}`}>{h.total}</span>
                          </td>
                          <td className="px-6 py-3">
                            {h.ransomware > 0
                              ? <span className="text-red-400 font-bold text-[12px]">{h.ransomware}</span>
                              : <span className="text-[#1e2a3a]">—</span>}
                          </td>
                          <td className="px-6 py-3">
                            {h.honeytoken > 0
                              ? <span className="text-amber-400 font-bold text-[12px]">{h.honeytoken}</span>
                              : <span className="text-[#1e2a3a]">—</span>}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <Link to="/Incidents" className="text-primary hover:text-white text-[9px] font-bold uppercase tracking-wider transition-colors">
                              Investigate →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
        </div>
      </main>
      <div
        id="restart-modal"
        className="fixed inset-0 z-[100] hidden items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-md bg-[#1e293b] rounded-xl shadow-2xl border border-[#334b63] overflow-hidden transform transition-all">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-3xl">restart_alt</span>
              </div>
              <h3 className="text-xl font-bold text-white">Restart System?</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[#92adc9] text-sm leading-relaxed">
                Are you sure you want to restart the Ransom Trap monitoring service?
              </p>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <span className="material-symbols-outlined text-orange-500 text-sm mt-0.5">warning</span>
                <p className="text-orange-400 text-xs font-medium">
                  This action will temporarily interrupt real-time monitoring and threat detection across all
                  connected endpoints.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-8">
              <a className="px-4 py-2 text-sm font-bold text-[#92adc9] hover:text-white transition-colors" href="#">
                Cancel
              </a>
              <a
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                href="#"
              >
                Confirm Restart
              </a>
            </div>
          </div>
          <a className="absolute top-4 right-4 text-[#92adc9] hover:text-white transition-colors" href="#">
            <span className="material-symbols-outlined">close</span>
          </a>
        </div>
      </div>
    </div >
  )
}
