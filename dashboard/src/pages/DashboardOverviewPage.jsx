import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'
import { fetchAgentStatus, agentStart, agentStop } from '../api.js'

function formatTs(ts) {
  if (!ts) return '—'
  const d = new Date(ts * 1000)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="font-mono tabular-nums">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

const NAV_ITEMS = [
  { to: '/',                         icon: 'dashboard',        label: 'Overview'         },
  { to: '/scan',                     icon: 'document_scanner', label: 'Manual Scan'      },
  { to: '/Incidents',                icon: 'warning',          label: 'Incidents'        },
  { to: '/entropy',                  icon: 'ssid_chart',       label: 'Entropy Analysis' },
  { to: '/network',                  icon: 'hub',              label: 'Network Topology' },
  { to: '/honeytokens',              icon: 'bug_report',       label: 'Honeytokens'      },
  { to: '/reports',                  icon: 'description',      label: 'Reports'          },
]

const QUICK_ACTIONS = [
  { to: '/scan',        icon: 'document_scanner', label: 'Run Scan',    color: 'blue'    },
  { to: '/Incidents',   icon: 'warning',          label: 'Incidents',   color: 'red'     },
  { to: '/entropy',     icon: 'ssid_chart',       label: 'Entropy',     color: 'indigo'  },
  { to: '/network',     icon: 'hub',              label: 'Network',     color: 'cyan'    },
  { to: '/honeytokens', icon: 'bug_report',       label: 'Honeytokens', color: 'amber'   },
  { to: '/reports',     icon: 'description',      label: 'Reports',     color: 'emerald' },
]

const COLOR_MAP = {
  blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400'    },
  red:     { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400'     },
  indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  text: 'text-indigo-400'  },
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400'    },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400'   },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
}

export default function DashboardOverviewPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { alerts, loading, error } = useAlerts(5000)

  const [agentRunning, setAgentRunning]   = useState(false)
  const [agentToggling, setAgentToggling] = useState(false)
  const [showNotif, setShowNotif]         = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const s = await fetchAgentStatus()
        if (!cancelled) setAgentRunning(s.running)
      } catch { /* server may not be up yet */ }
    }
    poll()
    const id = setInterval(poll, 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  async function handleAgentToggle() {
    if (agentToggling) return
    setAgentToggling(true)
    try {
      if (agentRunning) { await agentStop(); setAgentRunning(false) }
      else              { await agentStart(); setAgentRunning(true)  }
    } catch (e) { console.error('Agent toggle failed:', e) }
    finally { setAgentToggling(false) }
  }

  const ransomwareAlerts = alerts.filter(a => a.alert_type === 'ransomware_suspected')
  const honeytokenAlerts = alerts.filter(a => a.alert_type === 'honeytoken_access')
  const recentAlerts     = [...alerts].reverse().slice(0, 5)

  const timelineBuckets = React.useMemo(() => {
    const now = Date.now() / 1000
    const buckets = Array.from({ length: 12 }, (_, i) => ({
      label: `${(11 - i) * 5}m`, count: 0,
      start: now - (12 - i) * 300, end: now - (11 - i) * 300,
    }))
    alerts.forEach(a => {
      const b = buckets.find(b => (a.timestamp || 0) >= b.start && (a.timestamp || 0) < b.end)
      if (b) b.count++
    })
    return buckets
  }, [alerts])
  const maxBucket = Math.max(1, ...timelineBuckets.map(b => b.count))

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

  const securityScore  = ransomwareAlerts.length > 0 ? 62 : agentRunning ? 94 : 28
  const scoreColor     = ransomwareAlerts.length > 0 ? '#f59e0b' : agentRunning ? '#10b981' : '#ef4444'
  const scoreColorAlt  = ransomwareAlerts.length > 0 ? '#f97316' : agentRunning ? '#06b6d4' : '#dc2626'
  const scoreLabel     = ransomwareAlerts.length > 0 ? 'Elevated Risk' : agentRunning ? 'Protected' : 'Unprotected'
  const scoreLabelCls  = ransomwareAlerts.length > 0 ? 'text-amber-400' : agentRunning ? 'text-emerald-400' : 'text-red-400'
  const scoreDash      = securityScore * 3.39

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#05080f' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════ */}
      <aside className={`w-[256px] flex-col bg-[#070c15] flex fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>

        <div className="flex h-full flex-col px-3 py-4">

          {/* Brand */}
          <div className="flex items-center gap-3 px-3 py-2 mb-5">
            <div className="size-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.25),rgba(99,102,241,0.15))', border: '1px solid rgba(59,130,246,0.2)' }}>
              <svg className="size-5" fill="none" viewBox="0 0 48 48" style={{ color: '#60a5fa' }}>
                <path d="M24 4L6 12V22C6 33.5 13.7 44.1 24 46C34.3 44.1 42 33.5 42 22V12L24 4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5"/>
                <path d="M16 24l5 5 11-10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-[14px] font-black tracking-tight leading-tight">Ransom Trap</p>
              <p className="text-[10px] font-semibold" style={{ color: '#3b82f6' }}>SOC Dashboard</p>
            </div>
          </div>

          {/* Agent status pill */}
          <button onClick={handleAgentToggle} disabled={agentToggling}
            className="flex items-center gap-2.5 mx-0 mb-4 px-3 py-2.5 rounded-xl transition-all disabled:opacity-50"
            style={{
              background: agentRunning ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: agentRunning ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(239,68,68,0.18)',
            }}>
            <span className="relative flex size-2">
              {agentRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#10b981' }} />}
              <span className="relative inline-flex rounded-full size-2" style={{ background: agentRunning ? '#10b981' : '#ef4444' }} />
            </span>
            <div className="flex-1 text-left">
              <p className="text-[11px] font-bold" style={{ color: agentRunning ? '#34d399' : '#f87171' }}>
                Agent {agentToggling ? 'Switching…' : agentRunning ? 'Online' : 'Offline'}
              </p>
              <p className="text-[9px]" style={{ color: agentRunning ? 'rgba(52,211,153,0.55)' : 'rgba(248,113,113,0.55)' }}>
                {agentRunning ? 'Click to stop' : 'Click to start'}
              </p>
            </div>
            <span className="material-symbols-outlined text-[14px]" style={{ color: agentRunning ? '#34d399' : '#f87171' }}>
              {agentRunning ? 'stop_circle' : 'play_circle'}
            </span>
          </button>

          {/* Nav label */}
          <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: '#1e3048' }}>Main Menu</p>

          {/* Nav items */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {NAV_ITEMS.map(item => {
              const active = item.to === '/'
              return (
                <Link key={item.to} to={item.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                  style={active ? {
                    background: 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(99,102,241,0.1))',
                    border: '1px solid rgba(59,130,246,0.2)',
                    color: '#fff',
                  } : {
                    color: '#4a6580',
                    border: '1px solid transparent',
                  }}
                  onClick={() => setSidebarOpen(false)}>
                  <span className="material-symbols-outlined text-[17px]"
                    style={{ color: active ? '#60a5fa' : undefined }}>{item.icon}</span>
                  {item.label}
                  {active && <span className="ml-auto size-1.5 rounded-full" style={{ background: '#60a5fa' }} />}
                </Link>
              )
            })}
          </nav>

          {/* Bottom nav */}
          <div className="pt-3 flex flex-col gap-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <Link to="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
              style={{ color: '#4a6580' }}
              onClick={() => setSidebarOpen(false)}>
              <span className="material-symbols-outlined text-[17px]">settings</span>
              Settings
            </Link>
            <button type="button"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left"
              style={{ color: '#4a6580' }}
              onClick={() => { setSidebarOpen(false); navigate('/login', { replace: true }) }}>
              <span className="material-symbols-outlined text-[17px]">logout</span>
              Logout
            </button>
          </div>

        </div>
      </aside>

      {/* ════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════ */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden" style={{ background: '#05080f' }}>

        {/* ── TOPBAR ── */}
        <header className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ background: 'rgba(7,12,21,0.85)', borderBottom: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>

          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button className="lg:hidden transition-colors" style={{ color: '#4a6580' }}
              onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl w-72 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="material-symbols-outlined text-[15px]" style={{ color: '#2a3f56' }}>search</span>
              <input className="flex-1 bg-transparent text-[12px] focus:outline-none"
                style={{ color: '#fff' }}
                placeholder="Search alerts, hosts, hashes…"
                onFocus={e => e.target.parentElement.style.borderColor = 'rgba(59,130,246,0.35)'}
                onBlur={e => e.target.parentElement.style.borderColor = 'rgba(255,255,255,0.06)'}
              />
              <kbd className="text-[9px] px-1.5 py-0.5 rounded font-mono hidden xl:inline"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#2a3f56', border: '1px solid rgba(255,255,255,0.06)' }}>⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {/* Live clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="size-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
              <span className="text-[11px]" style={{ color: '#3a5472' }}><LiveClock /></span>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotif(!showNotif)}
                className="relative flex size-9 items-center justify-center rounded-xl transition-all"
                style={{ color: '#4a6580', background: showNotif ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                <span className="material-symbols-outlined text-[19px]">notifications</span>
                {recentAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.7)' }} />
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-[380px] rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{ background: '#0a1120', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeInScale 0.18s ease-out', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
                  <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]" style={{ color: '#60a5fa' }}>notifications_active</span>
                      <span className="text-white font-bold text-[13px]">Notifications</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: recentAlerts.length > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', color: recentAlerts.length > 0 ? '#f87171' : '#3a5472' }}>
                      {recentAlerts.length} NEW
                    </span>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {recentAlerts.length === 0 ? (
                      <div className="py-12 flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-3xl" style={{ color: '#1a2b3c' }}>notifications_off</span>
                        <p className="text-xs" style={{ color: '#2a3f56' }}>No recent alerts</p>
                      </div>
                    ) : recentAlerts.map((alert, i) => {
                      const isR = alert.alert_type === 'ransomware_suspected'
                      return (
                        <div key={i} className="flex items-start gap-3 px-4 py-3 transition-all cursor-pointer"
                          style={{ borderLeft: `2px solid ${isR ? '#ef4444' : '#f59e0b'}`, borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div className="size-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                            style={{ background: isR ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }}>
                            <span className="material-symbols-outlined text-[14px]" style={{ color: isR ? '#f87171' : '#fbbf24' }}>
                              {isR ? 'shield' : 'key'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white text-[12px] font-semibold">{isR ? 'Ransomware Detected' : 'Honeytoken Accessed'}</span>
                              <span className="text-[9px] font-mono shrink-0" style={{ color: '#2a3f56' }}>{formatTs(alert.timestamp)}</span>
                            </div>
                            <p className="text-[10px] mt-0.5 font-mono" style={{ color: '#3a5472' }}>{alert.host || '—'}{alert.process_name && ` · ${alert.process_name}`}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <Link to="/alerts" onClick={() => setShowNotif(false)}
                    className="flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#60a5fa' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    View All Alerts
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Refresh */}
            <button onClick={() => window.location.reload()}
              className="flex size-9 items-center justify-center rounded-xl transition-all"
              style={{ color: '#4a6580' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#4a6580'; e.currentTarget.style.background = 'transparent' }}
              title="Refresh">
              <span className="material-symbols-outlined text-[19px]">refresh</span>
            </button>

            {/* Profile avatar */}
            <div className="size-9 rounded-xl overflow-hidden ml-1 cursor-pointer ring-2 ring-transparent hover:ring-blue-500/40 transition-all"
              style={{ background: 'linear-gradient(135deg,#1e3a5f,#0f2340)' }}>
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]" style={{ color: '#60a5fa' }}>person</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>

          {/* Ambient blobs */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ left: '256px' }}>
            <div className="absolute rounded-full" style={{ top: '-15%', left: '-5%', width: 700, height: 700, background: 'radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 70%)', animation: 'float 22s ease-in-out infinite' }} />
            <div className="absolute rounded-full" style={{ top: '40%', right: '-8%', width: 550, height: 550, background: 'radial-gradient(circle,rgba(99,102,241,0.035) 0%,transparent 70%)', animation: 'float 28s ease-in-out infinite 6s' }} />
            <div className="absolute rounded-full" style={{ bottom: '-10%', left: '35%', width: 450, height: 450, background: 'radial-gradient(circle,rgba(16,185,129,0.025) 0%,transparent 70%)', animation: 'float 24s ease-in-out infinite 12s' }} />
          </div>

          <div className="relative z-10 p-5 md:p-7 lg:p-10 max-w-[1280px] mx-auto flex flex-col gap-7">

            {/* ════ HERO HEADER ════ */}
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="h-px w-10 rounded" style={{ background: 'linear-gradient(90deg,#3b82f6,transparent)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: 'rgba(96,165,250,0.7)' }}>Security Operations Center</span>
                </div>
                <h1 className="font-black tracking-tight leading-none mb-3" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', background: 'linear-gradient(135deg,#e2e8f0 0%,#93c5fd 50%,#818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Dashboard Overview
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[12px]" style={{ color: '#4a6580' }}>
                    <span className="material-symbols-outlined text-[14px]" style={{ color: '#60a5fa' }}>computer</span>
                    <span className="text-white/70 font-semibold">{hostMap.length}</span> endpoint{hostMap.length !== 1 ? 's' : ''} monitored
                  </span>
                  <span style={{ color: '#1e3048' }}>·</span>
                  <span className="flex items-center gap-1.5 text-[12px]" style={{ color: '#4a6580' }}>
                    <span className="material-symbols-outlined text-[14px]" style={{ color: alerts.length > 0 ? '#f87171' : '#60a5fa' }}>notifications</span>
                    <span className="text-white/70 font-semibold">{alerts.length}</span> alert{alerts.length !== 1 ? 's' : ''} today
                  </span>
                  <span style={{ color: '#1e3048' }}>·</span>
                  <span className={`flex items-center gap-1.5 text-[12px] font-medium ${scoreLabelCls}`}>
                    <span className="size-1.5 rounded-full animate-pulse" style={{ background: scoreColor }} />
                    {scoreLabel}
                  </span>
                </div>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button className="flex items-center gap-2 h-9 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#6b8aaa' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#6b8aaa' }}>
                  <span className="material-symbols-outlined text-[15px]">download</span>Export
                </button>
                <Link to="/scan" className="flex items-center gap-2 h-9 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 28px rgba(59,130,246,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.3)'}>
                  <span className="material-symbols-outlined text-[15px]">document_scanner</span>Run Scan
                </Link>
              </div>
            </div>

            {/* ════ KPI CARDS ════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Active Threats */}
              <div className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-500 cursor-default"
                style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(10,17,32,0.9))', border: '1px solid rgba(239,68,68,0.12)' }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(239,68,68,0.3)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(239,68,68,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(239,68,68,0.12)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div className="absolute -right-6 -bottom-6 size-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle,rgba(239,68,68,0.12),transparent)' }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <span className="material-symbols-outlined text-[22px]" style={{ color: '#f87171' }}>gpp_bad</span>
                  </div>
                  {ransomwareAlerts.length > 0 && (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                      <span className="size-1.5 rounded-full animate-pulse" style={{ background: '#ef4444' }} />LIVE
                    </span>
                  )}
                </div>
                <p className="text-[42px] font-black tracking-tighter leading-none mb-1.5 tabular-nums" style={{ color: ransomwareAlerts.length > 0 ? '#f87171' : '#fff' }}>
                  {loading ? '—' : ransomwareAlerts.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#3a5472' }}>Active Threats</p>
                <div className="mt-3 h-px w-full" style={{ background: 'linear-gradient(90deg,rgba(239,68,68,0.3),transparent)' }} />
              </div>

              {/* Honeytoken Hits */}
              <div className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-500 cursor-default"
                style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(10,17,32,0.9))', border: '1px solid rgba(245,158,11,0.12)' }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(245,158,11,0.3)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(245,158,11,0.12)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div className="absolute -right-6 -bottom-6 size-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle,rgba(245,158,11,0.12),transparent)' }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <span className="material-symbols-outlined text-[22px]" style={{ color: '#fbbf24' }}>pest_control</span>
                  </div>
                  {honeytokenAlerts.length > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#fbbf24' }}>
                      <span className="material-symbols-outlined text-[13px]">trending_up</span>+{honeytokenAlerts.length}
                    </span>
                  )}
                </div>
                <p className="text-[42px] font-black tracking-tighter leading-none mb-1.5 tabular-nums" style={{ color: honeytokenAlerts.length > 0 ? '#fbbf24' : '#fff' }}>
                  {loading ? '—' : honeytokenAlerts.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#3a5472' }}>Honeytoken Hits</p>
                <div className="mt-3 h-px w-full" style={{ background: 'linear-gradient(90deg,rgba(245,158,11,0.3),transparent)' }} />
              </div>

              {/* Total Alerts */}
              <div className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-500 cursor-default"
                style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(10,17,32,0.9))', border: '1px solid rgba(59,130,246,0.12)' }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(59,130,246,0.3)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(59,130,246,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(59,130,246,0.12)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div className="absolute -right-6 -bottom-6 size-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.12),transparent)' }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <span className="material-symbols-outlined text-[22px]" style={{ color: '#60a5fa' }}>monitoring</span>
                  </div>
                </div>
                <p className="text-[42px] font-black tracking-tighter leading-none mb-1.5 tabular-nums" style={{ color: alerts.length > 0 ? '#93c5fd' : '#fff' }}>
                  {loading ? '—' : alerts.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#3a5472' }}>Total Alerts</p>
                <div className="mt-3 h-px w-full" style={{ background: 'linear-gradient(90deg,rgba(59,130,246,0.3),transparent)' }} />
              </div>

              {/* Security Score */}
              <div className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-500 cursor-default"
                style={{ background: `linear-gradient(135deg,${scoreColor}14,rgba(10,17,32,0.9))`, border: `1px solid ${scoreColor}20` }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${scoreColor}45`; e.currentTarget.style.boxShadow = `0 0 40px ${scoreColor}12` }}
                onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${scoreColor}20`; e.currentTarget.style.boxShadow = 'none' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="size-11 rounded-xl flex items-center justify-center" style={{ background: `${scoreColor}18`, border: `1px solid ${scoreColor}20` }}>
                    <span className="material-symbols-outlined text-[22px]" style={{ color: scoreColor }}>verified_user</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${scoreColor}18`, color: scoreColor }}>
                    {scoreLabel}
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-1.5">
                  <p className="text-[42px] font-black tracking-tighter leading-none tabular-nums" style={{ color: scoreColor }}>{securityScore}</p>
                  <p className="text-[13px] font-bold mb-2" style={{ color: `${scoreColor}80` }}>/100</p>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#3a5472' }}>Security Score</p>
                <div className="mt-3 h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${securityScore}%`, background: `linear-gradient(90deg,${scoreColor},${scoreColorAlt})`, boxShadow: `0 0 10px ${scoreColor}60` }} />
                </div>
              </div>
            </div>

            {/* ════ QUICK ACTIONS ════ */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: '#2a3f56' }}>Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map(a => {
                  const c = COLOR_MAP[a.color]
                  return (
                    <Link key={a.to} to={a.to}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#5a7a9a' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#5a7a9a' }}>
                      <span className={`material-symbols-outlined text-[15px] ${c.text}`}>{a.icon}</span>
                      {a.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* ════ CHART + LIVE FEED ════ */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

              {/* ── Threat Detection Chart ── */}
              <div className="xl:col-span-2 flex flex-col rounded-2xl overflow-hidden" style={{ background: '#08101d', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      <span className="material-symbols-outlined text-[17px]" style={{ color: '#60a5fa' }}>trending_up</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-[14px] leading-tight">Threat Detection Velocity</h3>
                      <p className="text-[10px]" style={{ color: '#3a5472' }}>24-hour event timeline</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {['1H','6H','24H','7D'].map((t, i) => (
                      <button key={t} className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all"
                        style={ i === 2 ? { background: 'rgba(59,130,246,0.2)', color: '#60a5fa' } : { color: '#3a5472' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-5 px-6 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span className="flex items-center gap-1.5 text-[10px]" style={{ color: '#4a6580' }}>
                    <span className="size-2 rounded-full" style={{ background: '#3b82f6' }} />Events
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px]" style={{ color: '#4a6580' }}>
                    <span className="size-2 rounded-full" style={{ background: '#ef4444' }} />Critical
                  </span>
                  <span className="ml-auto text-[10px]" style={{ color: '#2a3f56' }}>
                    Peak: <span className="font-bold" style={{ color: '#fff' }}>94</span>
                  </span>
                  <span className="text-[10px]" style={{ color: '#2a3f56' }}>
                    Avg: <span className="font-bold" style={{ color: '#60a5fa' }}>47</span>
                  </span>
                </div>

                {/* Chart area */}
                <div className="relative px-6 pt-5 pb-2" style={{ height: 220 }}>
                  {/* Y-axis grid */}
                  <div className="absolute inset-x-6 inset-y-5 flex flex-col justify-between pointer-events-none">
                    {[100,75,50,25,0].map(v => (
                      <div key={v} className="flex items-center gap-2 h-0">
                        <span className="text-[9px] font-mono w-6 text-right shrink-0" style={{ color: '#1e3048' }}>{v}</span>
                        <div className="flex-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.03)' }} />
                      </div>
                    ))}
                  </div>
                  {/* SVG chart */}
                  <svg className="absolute inset-x-12 inset-y-5 w-[calc(100%-4rem)] h-[calc(100%-1.25rem)]" preserveAspectRatio="none" viewBox="0 0 500 100">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    <path d="M0,78 C15,78 25,42 45,38 C65,34 75,68 100,66 C125,64 135,18 155,15 C175,12 185,58 210,56 C235,54 245,82 265,80 C285,78 295,28 320,26 C345,24 355,48 375,46 C395,44 405,8 425,6 C445,4 455,68 475,66 C490,64 495,42 500,40 V100 H0 Z"
                      fill="url(#areaGrad)"/>
                    <path d="M0,78 C15,78 25,42 45,38 C65,34 75,68 100,66 C125,64 135,18 155,15 C175,12 185,58 210,56 C235,54 245,82 265,80 C285,78 295,28 320,26 C345,24 355,48 375,46 C395,44 405,8 425,6 C445,4 455,68 475,66 C490,64 495,42 500,40"
                      fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" filter="url(#glow)"/>
                    <circle cx="155" cy="15" r="4" fill="#ef4444" stroke="#08101d" strokeWidth="2">
                      <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="425" cy="6" r="4" fill="#ef4444" stroke="#08101d" strokeWidth="2">
                      <animate attributeName="r" values="4;6;4" dur="2.4s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between px-12 pb-4 pt-1">
                  {['00:00','04:00','08:00','12:00','16:00','20:00','NOW'].map(t => (
                    <span key={t} className="text-[9px] font-mono" style={{ color: t === 'NOW' ? '#60a5fa' : '#1e3048', fontWeight: t === 'NOW' ? 700 : 400 }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* ── Live Threat Feed ── */}
              <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: '#08101d', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <span className="material-symbols-outlined text-[17px]" style={{ color: '#f87171' }}>cell_tower</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-[14px] leading-tight">Live Feed</h3>
                      <p className="text-[10px]" style={{ color: '#3a5472' }}>Real-time events</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: '#f87171' }}>
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#ef4444' }}/>
                      <span className="relative inline-flex rounded-full size-2" style={{ background: '#ef4444' }}/>
                    </span>
                    Live
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: 280 }}>
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                      <span className="material-symbols-outlined animate-spin text-[24px]" style={{ color: '#60a5fa' }}>progress_activity</span>
                      <p className="text-[11px]" style={{ color: '#3a5472' }}>Connecting to agent…</p>
                    </div>
                  )}
                  {!loading && recentAlerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                      <div className="size-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <span className="material-symbols-outlined text-[24px]" style={{ color: 'rgba(16,185,129,0.6)' }}>verified_user</span>
                      </div>
                      <p className="text-[12px] font-semibold" style={{ color: '#3a5472' }}>All Systems Clear</p>
                      <p className="text-[10px]" style={{ color: '#1e3048' }}>No threats detected</p>
                    </div>
                  )}
                  {recentAlerts.map((alert, i) => {
                    const isR = alert.alert_type === 'ransomware_suspected'
                    return (
                      <div key={i} className="flex gap-3 px-4 py-3.5 transition-all cursor-pointer"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', borderLeft: `3px solid ${isR ? '#ef4444' : '#f59e0b'}` }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div className="size-9 rounded-xl shrink-0 flex items-center justify-center" style={{ background: isR ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }}>
                          <span className="material-symbols-outlined text-[16px]" style={{ color: isR ? '#f87171' : '#fbbf24' }}>
                            {isR ? 'bug_report' : 'key'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isR ? '#f87171' : '#fbbf24' }}>
                              {isR ? 'Critical' : 'Warning'}
                            </span>
                            <span className="text-[9px] font-mono tabular-nums" style={{ color: '#2a3f56' }}>{formatTs(alert.timestamp)}</span>
                          </div>
                          <p className="text-white text-[12px] font-semibold truncate leading-tight">
                            {isR ? 'Ransomware Suspected' : 'Honeytoken Accessed'}
                          </p>
                          <p className="text-[10px] truncate mt-0.5" style={{ color: '#3a5472' }}>
                            {alert.host || '—'}{alert.process_name && ` · ${alert.process_name}`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Link to="/Incidents"
                  className="flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold uppercase tracking-widest transition-all"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#60a5fa' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; e.currentTarget.style.color = '#93c5fd' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#60a5fa' }}>
                  View All Incidents
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* ════ ALERT ACTIVITY TIMELINE ════ */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#08101d', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <span className="material-symbols-outlined text-[17px]" style={{ color: '#818cf8' }}>bar_chart</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[14px] leading-tight">Alert Activity</h3>
                    <p className="text-[10px]" style={{ color: '#3a5472' }}>Last 60 minutes · 5-min buckets</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono" style={{ color: '#3a5472' }}>Total: <span className="font-bold" style={{ color: '#818cf8' }}>{alerts.length}</span></span>
                  <span className="text-[10px] font-mono" style={{ color: '#3a5472' }}>Peak: <span className="font-bold" style={{ color: '#fff' }}>{maxBucket}</span></span>
                </div>
              </div>
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-end gap-1.5 h-24">
                  {timelineBuckets.map((b, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/bar" title={`${b.count} alert(s) — ${b.label} ago`}>
                      <div className="w-full rounded-t-sm transition-all duration-500 relative overflow-hidden"
                        style={{
                          height: `${Math.max(4, (b.count / maxBucket) * 72)}px`,
                          background: b.count > 0 ? 'linear-gradient(to top,rgba(59,130,246,0.7),rgba(99,102,241,0.5))' : 'rgba(255,255,255,0.04)',
                          boxShadow: b.count > 0 ? '0 0 12px rgba(59,130,246,0.25)' : 'none',
                        }}>
                        {b.count > 0 && <div className="absolute inset-0 opacity-0 group-hover/bar:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top,rgba(99,102,241,0.9),rgba(139,92,246,0.7))' }} />}
                      </div>
                      {i % 3 === 0 && <span className="text-[8px] font-mono" style={{ color: '#1e3048' }}>{b.label}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ════ RECENT ALERTS TABLE ════ */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#08101d', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <span className="material-symbols-outlined text-[17px]" style={{ color: '#60a5fa' }}>security</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-white font-bold text-[14px]">Recent Security Alerts</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', color: '#3a5472', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {alerts.length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-8 px-3.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#5a7a9a' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#5a7a9a' }}>
                    Export
                  </button>
                  <Link to="/alerts" className="h-8 px-3.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center"
                    style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.8),rgba(99,102,241,0.8))', color: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.35)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    View All
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {['Severity','Timestamp','Hostname','Threat Type','Status','Action'].map((h, i) => (
                        <th key={h} className={`px-6 py-3 text-[9px] font-bold uppercase tracking-[0.15em] ${i === 5 ? 'text-right' : ''}`} style={{ color: '#2a3f56' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.slice(0, 6).map((a, i) => {
                      const isR = a.alert_type === 'ransomware_suspected'
                      return (
                        <tr key={i} className="transition-colors"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider"
                              style={{ background: isR ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: isR ? '#f87171' : '#fbbf24', border: `1px solid ${isR ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}` }}>
                              <span className="size-1.5 rounded-full" style={{ background: isR ? '#ef4444' : '#f59e0b' }} />
                              {isR ? 'Critical' : 'Warning'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-[11px] font-mono tabular-nums" style={{ color: '#4a6580' }}>{formatTs(a.timestamp)}</td>
                          <td className="px-6 py-3.5">
                            <span className="text-white font-semibold text-[12px] font-mono">{a.host || '—'}</span>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[13px]" style={{ color: isR ? '#f87171' : '#fbbf24' }}>
                                {isR ? 'bug_report' : 'key'}
                              </span>
                              <span className="text-[12px]" style={{ color: '#6b8aaa' }}>{isR ? 'Ransomware' : 'Honeytoken'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            {a.process_killed ? (
                              <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: '#34d399' }}>
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>Blocked
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: '#fbbf24' }}>
                                <span className="material-symbols-outlined text-[14px]">visibility</span>Detected
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <Link to="/Incidents" className="text-[10px] font-bold uppercase tracking-wider transition-all px-2.5 py-1 rounded-lg"
                              style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.08)' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; e.currentTarget.style.color = '#93c5fd' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.color = '#60a5fa' }}>
                              Investigate
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                    {alerts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined text-[32px]" style={{ color: '#1a2b3c' }}>security</span>
                            <p className="text-[13px] font-medium" style={{ color: '#2a3f56' }}>No security alerts at this time</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ════ ACTIVE HOSTS ════ */}
            {hostMap.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: '#08101d', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.15)' }}>
                      <span className="material-symbols-outlined text-[17px]" style={{ color: '#22d3ee' }}>dns</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-white font-bold text-[14px]">Active Hosts</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', color: '#3a5472', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {hostMap.length}
                      </span>
                    </div>
                  </div>
                  <Link to="/network" className="text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                    style={{ color: '#22d3ee' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#67e8f9'}
                    onMouseLeave={e => e.currentTarget.style.color = '#22d3ee'}>
                    Network View <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {['Hostname','Alert Count','Ransomware','Honeytoken','Risk','Action'].map((h, i) => (
                          <th key={h} className={`px-6 py-3 text-[9px] font-bold uppercase tracking-[0.15em] ${i === 5 ? 'text-right' : ''}`} style={{ color: '#2a3f56' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hostMap.map(h => {
                        const risk = h.ransomware > 2 ? 'Critical' : h.ransomware > 0 ? 'High' : h.honeytoken > 0 ? 'Medium' : 'Low'
                        const riskColor = risk === 'Critical' ? '#f87171' : risk === 'High' ? '#fb923c' : risk === 'Medium' ? '#fbbf24' : '#34d399'
                        const riskBg = risk === 'Critical' ? 'rgba(239,68,68,0.1)' : risk === 'High' ? 'rgba(249,115,22,0.1)' : risk === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'
                        return (
                          <tr key={h.host} className="transition-colors"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <span className="relative flex size-2">
                                  {h.ransomware > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#ef4444' }} />}
                                  <span className="relative inline-flex rounded-full size-2" style={{ background: h.ransomware > 0 ? '#ef4444' : '#f59e0b' }} />
                                </span>
                                <span className="text-white font-semibold text-[12px] font-mono">{h.host}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="font-bold text-[15px] tabular-nums" style={{ color: h.total > 3 ? '#f87171' : h.total > 1 ? '#fbbf24' : '#6b8aaa' }}>{h.total}</span>
                            </td>
                            <td className="px-6 py-3.5">
                              {h.ransomware > 0
                                ? <span className="font-bold text-[12px]" style={{ color: '#f87171' }}>{h.ransomware}</span>
                                : <span style={{ color: '#1e3048' }}>—</span>}
                            </td>
                            <td className="px-6 py-3.5">
                              {h.honeytoken > 0
                                ? <span className="font-bold text-[12px]" style={{ color: '#fbbf24' }}>{h.honeytoken}</span>
                                : <span style={{ color: '#1e3048' }}>—</span>}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider"
                                style={{ background: riskBg, color: riskColor }}>
                                {risk}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <Link to="/Incidents" className="text-[10px] font-bold uppercase tracking-wider transition-all px-2.5 py-1 rounded-lg"
                                style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.08)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; e.currentTarget.style.color = '#93c5fd' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.color = '#60a5fa' }}>
                                Investigate
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ════ FOOTER ════ */}
            <div className="flex items-center justify-between py-3 text-[10px]" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#1e3048' }}>
              <span>Ransom Trap SOC Dashboard · v1.0.0</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: agentRunning ? '#10b981' : '#ef4444' }} />
                Agent {agentRunning ? 'Online' : 'Offline'}
              </span>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
