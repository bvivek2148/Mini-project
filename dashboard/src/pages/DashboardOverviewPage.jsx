import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'
import { fetchAgentStatus, agentStart, agentStop } from '../api.js'

/* ═══════════════════════════════════════════════
   THEME CONTEXT — shared across all sub-components
═══════════════════════════════════════════════ */
const ThemeCtx = createContext({ dark: true, T: {} })
const useTheme = () => useContext(ThemeCtx)

function mkTheme(dark) {
  return dark ? {
    dark,
    pageBg: '#060b13',
    sidebarBg: '#070d18',
    sidebarBorder: 'rgba(255,255,255,0.06)',
    headerBg: 'rgba(6,11,19,0.95)',
    headerBorder: 'rgba(255,255,255,0.06)',
    cardBg: '#07101c',
    cardBorder: 'rgba(255,255,255,0.07)',
    dropdownBg: '#0c1525',
    dropdownBorder: 'rgba(255,255,255,0.1)',
    dropdownShadow: '0 20px 60px rgba(0,0,0,0.8)',
    text: '#f1f5f9',
    sub: '#4a6580',
    muted: '#1e3348',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.09)',
    rowHover: 'rgba(255,255,255,0.025)',
    divider: 'rgba(255,255,255,0.06)',
    btnHoverBg: 'rgba(255,255,255,0.07)',
  } : {
    dark,
    pageBg: '#eef2f7',
    sidebarBg: '#ffffff',
    sidebarBorder: 'rgba(15,23,42,0.1)',
    headerBg: 'rgba(255,255,255,0.97)',
    headerBorder: 'rgba(15,23,42,0.09)',
    cardBg: '#ffffff',
    cardBorder: 'rgba(15,23,42,0.09)',
    dropdownBg: '#ffffff',
    dropdownBorder: 'rgba(15,23,42,0.12)',
    dropdownShadow: '0 8px 40px rgba(15,23,42,0.15)',
    text: '#0f172a',
    sub: '#475569',
    muted: '#94a3b8',
    inputBg: 'rgba(15,23,42,0.05)',
    inputBorder: 'rgba(15,23,42,0.12)',
    rowHover: 'rgba(15,23,42,0.03)',
    divider: 'rgba(15,23,42,0.08)',
    btnHoverBg: 'rgba(15,23,42,0.06)',
  }
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function formatTs(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function LiveClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span style={{ fontFamily: 'monospace' }}>{t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
}

/* ═══════════════════════════════════════════════
   LOGO SVG
═══════════════════════════════════════════════ */
function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rtLogo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <path d="M20 3L5 9.5V19C5 27.5 11.8 35.3 20 37C28.2 35.3 35 27.5 35 19V9.5L20 3Z"
        fill="url(#rtLogo)" fillOpacity="0.18" stroke="url(#rtLogo)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 13.5L24.3 15.9V20.9L20 23.3L15.7 20.9V15.9L20 13.5Z"
        fill="url(#rtLogo)" fillOpacity="0.3" stroke="url(#rtLogo)" strokeWidth="1.2" />
      <line x1="20" y1="9" x2="20" y2="12.5" stroke="url(#rtLogo)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="20" y1="23.5" x2="20" y2="27" stroke="url(#rtLogo)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="13" y1="17.7" x2="16.5" y2="17.7" stroke="url(#rtLogo)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="23.5" y1="17.7" x2="27" y2="17.7" stroke="url(#rtLogo)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════════ */
function KpiCard({ icon, iconColor, accentColor, label, value, valueColor, badge }) {
  const { T } = useTheme()
  const bord = T.dark ? `${accentColor}22` : `${accentColor}35`
  const bg = T.dark
    ? `linear-gradient(135deg,${accentColor}10,rgba(8,16,30,0.95))`
    : `linear-gradient(135deg,${accentColor}08,#ffffff)`
  return (
    <div
      style={{ borderRadius: 14, padding: '18px 20px', background: bg, border: `1px solid ${bord}`, transition: 'all .25s', cursor: 'default', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${accentColor}50`; e.currentTarget.style.boxShadow = `0 0 28px ${accentColor}14` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = bord; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accentColor}18`, border: `1px solid ${accentColor}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: iconColor }}>{icon}</span>
        </div>
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: badge.bg, color: badge.color, display: 'flex', alignItems: 'center', gap: 4 }}>
            {badge.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: badge.color, animation: 'rtPulse 1.5s infinite', display: 'block' }} />}
            {badge.text}
          </span>
        )}
      </div>
      <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1.5px', color: valueColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 5 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.sub }}>{label}</div>
      <div style={{ marginTop: 12, height: 1, background: `linear-gradient(90deg,${accentColor}40,transparent)` }} />
    </div>
  )
}

/* ═══════════════════════════════════════════════
   NAVIGATION CONSTANTS
═══════════════════════════════════════════════ */
const NAV = [
  { to: '/', icon: 'dashboard', label: 'Overview' },
  { to: '/scan', icon: 'document_scanner', label: 'Manual Scan' },
  { to: '/Incidents', icon: 'warning', label: 'Incidents' },
  { to: '/entropy', icon: 'ssid_chart', label: 'Entropy Analysis' },
  { to: '/network', icon: 'hub', label: 'Network Topology' },
  { to: '/honeytokens', icon: 'bug_report', label: 'Honeytokens' },
  { to: '/reports', icon: 'description', label: 'Reports' },
]

const QUICK = [
  { to: '/scan', icon: 'document_scanner', label: 'Run Scan', c: '#60a5fa' },
  { to: '/Incidents', icon: 'warning', label: 'Incidents', c: '#f87171' },
  { to: '/entropy', icon: 'ssid_chart', label: 'Entropy', c: '#818cf8' },
  { to: '/network', icon: 'hub', label: 'Network', c: '#22d3ee' },
  { to: '/honeytokens', icon: 'bug_report', label: 'Honeytokens', c: '#fbbf24' },
  { to: '/reports', icon: 'description', label: 'Reports', c: '#34d399' },
]

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function DashboardOverviewPage() {
  const navigate = useNavigate()

  /* ── theme ── */
  const [dark, setDark] = useState(true)
  const T = mkTheme(dark)
  const theme = { dark, T }

  /* ── desktop detection ── */
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  /* ── sidebar ── */
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  /* ── data ── */
  const { alerts, loading } = useAlerts(5000)
  const [agentRunning, setAgentRunning] = useState(false)
  const [agentToggling, setAgentToggling] = useState(false)

  /* ── panel states ── */
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showRestart, setShowRestart] = useState(false)
  const [chartRange,  setChartRange]  = useState('24H')

  /* ── refs ── */
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const searchRef = useRef(null)

  /* ── outside click closes dropdowns ── */
  useEffect(() => {
    function onDown(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  /* ── agent polling ── */
  useEffect(() => {
    let dead = false
    const run = async () => {
      try { const s = await fetchAgentStatus(); if (!dead) setAgentRunning(s.running) } catch { }
    }
    run()
    const id = setInterval(run, 5000)
    return () => { dead = true; clearInterval(id) }
  }, [])

  async function toggleAgent() {
    if (agentToggling) return
    setAgentToggling(true)
    try {
      if (agentRunning) { await agentStop(); setAgentRunning(false) }
      else { await agentStart(); setAgentRunning(true) }
    } catch (e) { console.error(e) }
    finally { setAgentToggling(false) }
  }

  /* ── derived data ── */
  const ransomAlerts = alerts.filter(a => a.alert_type === 'ransomware_suspected')
  const honeyAlerts = alerts.filter(a => a.alert_type === 'honeytoken_access')
  const recentAlerts = [...alerts].reverse().slice(0, 6)

  const buckets = React.useMemo(() => {
    const now = Math.floor(Date.now() / 1000)
    let count = 12
    let step = 300 // default 1H (5m buckets, 12 count = 60m)
    let unit = 'm'

    if (chartRange === '1H')  { step = 300;   unit = 'm'; }
    if (chartRange === '6H')  { step = 1800;  unit = 'h'; }
    if (chartRange === '24H') { step = 7200;  unit = 'h'; }
    if (chartRange === '7D')  { step = 43200; unit = 'd'; count = 14 }

    const b = Array.from({ length: count }, (_, i) => {
      const sAgo = (count - 1 - i) * step
      let label = ''
      if (unit === 'm') label = `${Math.floor(sAgo/60)}m`
      else if (unit === 'h') {
        const h = sAgo/3600
        label = h === 0 ? 'NOW' : (h < 1 ? '<1h' : `${Math.floor(h)}h`)
      }
      else label = `${Math.floor(sAgo/86400)}d`

      return {
        label: i === count - 1 ? 'NOW' : label,
        count: 0,
        start: now - (count - i) * step,
        end:   now - (count - 1 - i) * step,
      }
    })

    alerts.forEach(a => {
      const ts = a.timestamp || 0
      const bk = b.find(x => ts >= x.start && ts < x.end)
      if (bk) {
        bk.count++
        if (a.alert_type === 'ransomware_suspected') bk.crit++
      }
    })
    return b
  }, [alerts, chartRange])
  const maxB = Math.max(1, ...buckets.map(b => b.count))
  const avgB = Math.round(buckets.reduce((a, b) => a + b.count, 0) / buckets.length)

  // helper to generate smooth SVG path from bucket counts
  const genPath = (data, w, h, isFill = false) => {
    if (!data.length) return ''
    const maxVal = Math.max(1, ...data.map(d => d.count))
    const pts = data.map((d, i) => ({
      x: (i / (data.length - 1)) * w,
      y: h - (d.count / maxVal) * (h * 0.8) - 10
    }))
    let d = `M ${pts[0].x},${pts[0].y} `
    for (let i = 0; i < pts.length - 1; i++) {
      const cp1x = pts[i].x + (pts[i+1].x - pts[i].x) / 2
      d += `C ${cp1x},${pts[i].y} ${cp1x},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y} `
    }
    if (isFill) d += `V ${h} H 0 Z`
    return d
  }
  const chartPath = genPath(buckets, 500, 100)
  const chartFill = genPath(buckets, 500, 100, true)

  const hostMap = React.useMemo(() => {
    const m = {}
    alerts.forEach(a => {
      const h = a.host || 'Unknown'
      if (!m[h]) m[h] = { host: h, total: 0, ransom: 0, honey: 0 }
      m[h].total++
      if (a.alert_type === 'ransomware_suspected') m[h].ransom++; else m[h].honey++
    })
    return Object.values(m).sort((a, b) => b.total - a.total)
  }, [alerts])

  const secScore = ransomAlerts.length > 0 ? 62 : agentRunning ? 94 : 28
  const sColor = ransomAlerts.length > 0 ? '#f59e0b' : agentRunning ? '#10b981' : '#ef4444'
  const sColorB = ransomAlerts.length > 0 ? '#f97316' : agentRunning ? '#06b6d4' : '#dc2626'
  const sLabel = ransomAlerts.length > 0 ? 'Elevated Risk' : agentRunning ? 'Protected' : 'Unprotected'

  /* ── search focus helpers ── */
  function onSearchFocus() {
    if (searchRef.current) {
      searchRef.current.style.borderColor = 'rgba(96,165,250,0.5)'
      searchRef.current.style.background = dark ? 'rgba(96,165,250,0.07)' : 'rgba(59,130,246,0.06)'
    }
  }
  function onSearchBlur() {
    if (searchRef.current) {
      searchRef.current.style.borderColor = T.inputBorder
      searchRef.current.style.background = T.inputBg
    }
  }

  /* ── icon button style helper ── */
  function iconBtn(active = false) {
    return {
      width: 36, height: 36, borderRadius: 9,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: active ? T.btnHoverBg : 'transparent',
      border: `1px solid ${active ? T.inputBorder : 'transparent'}`,
      color: T.sub, cursor: 'pointer', transition: 'all .18s',
    }
  }

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <ThemeCtx.Provider value={theme}>
      <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: T.pageBg, fontFamily: 'Inter,-apple-system,sans-serif' }}>

        {/* ── CSS keyframes ── */}
        <style>{`
          @keyframes rtPing  { 75%,100%{transform:scale(2.2);opacity:0} }
          @keyframes rtSpin  { from{transform:rotate(0)} to{transform:rotate(360deg)} }
          @keyframes rtPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
          @keyframes rtFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(6px,-8px)} }
          @keyframes rtFadeIn{ from{opacity:0;transform:translateY(-6px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
          .rt-ping   { animation: rtPing   1.2s cubic-bezier(0,0,.2,1) infinite }
          .rt-spin   { animation: rtSpin   1s linear infinite }
          .rt-pulse  { animation: rtPulse  2s ease-in-out infinite }
          .rt-float  { animation: rtFloat  7s ease-in-out infinite }
          .rt-fadein { animation: rtFadeIn .18s ease-out forwards }
          /* scrollbar */
          ::-webkit-scrollbar{width:4px;height:4px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:rgba(128,128,128,.15);border-radius:99px}
        `}</style>

        {/* ── mobile overlay ── */}
        {!isDesktop && sidebarOpen && (
          <div
            onClick={closeSidebar}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100 }}
          />
        )}

        {/* ════════════════ SIDEBAR ════════════════ */}
        <aside style={{
          width: isDesktop ? (sidebarOpen ? 256 : 0) : 256,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: T.sidebarBg,
          borderRight: sidebarOpen ? `1px solid ${T.sidebarBorder}` : '0 solid transparent',
          height: '100vh',
          overflow: 'hidden',
          position: isDesktop ? 'relative' : 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: isDesktop ? 'auto' : 200,
          transform: isDesktop ? 'none' : (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'),
          transition: 'transform .3s cubic-bezier(.4,0,.2,1), width .3s cubic-bezier(.4,0,.2,1), background .2s, border-color .2s',
          boxShadow: (!isDesktop && sidebarOpen) ? '4px 0 40px rgba(0,0,0,0.3)' : 'none',
          opacity: isDesktop && !sidebarOpen ? 0 : 1,
          visibility: isDesktop && !sidebarOpen ? 'hidden' : 'visible',
        }}>
          {/* brand */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 14px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ background: 'linear-gradient(135deg,rgba(96,165,250,0.18),rgba(129,140,248,0.12))', border: '1px solid rgba(96,165,250,0.28)', borderRadius: 11, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Logo size={24} />
              </div>
              <div>
                <p style={{ color: T.text, fontSize: 15, fontWeight: 800, lineHeight: 1.2, margin: 0 }}>Ransom Trap</p>
                <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 600, margin: 0 }}>SOC Dashboard</p>
              </div>
            </div>
            {!isDesktop && (
              <button
                onClick={closeSidebar}
                style={{ width: 28, height: 28, borderRadius: 7, background: T.inputBg, border: `1px solid ${T.sidebarBorder}`, color: T.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = T.inputBg; e.currentTarget.style.color = T.sub; e.currentTarget.style.borderColor = T.sidebarBorder }}
                title="Close sidebar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
              </button>
            )}
          </div>

          {/* divider */}
          <div style={{ height: 1, background: T.divider, margin: '0 14px 10px' }} />

          {/* agent toggle */}
          <div style={{ padding: '0 10px 10px' }}>
            <button
              onClick={toggleAgent}
              disabled={agentToggling}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 11, cursor: 'pointer',
                background: agentRunning ? (dark ? 'rgba(16,185,129,0.09)' : 'rgba(16,185,129,0.08)') : (dark ? 'rgba(239,68,68,0.09)' : 'rgba(239,68,68,0.07)'),
                border: agentRunning ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)',
                transition: 'all .2s', opacity: agentToggling ? 0.6 : 1,
              }}
            >
              <span style={{ position: 'relative', display: 'flex', width: 8, height: 8, flexShrink: 0 }}>
                {agentRunning && <span className="rt-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', opacity: 0.5 }} />}
                <span style={{ position: 'relative', display: 'block', width: 8, height: 8, borderRadius: '50%', background: agentRunning ? '#10b981' : '#ef4444' }} />
              </span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: agentRunning ? '#34d399' : '#f87171', lineHeight: 1.3 }}>
                  Agent {agentToggling ? 'Switching…' : agentRunning ? 'Online' : 'Offline'}
                </p>
                <p style={{ margin: 0, fontSize: 10, marginTop: 1, color: agentRunning ? 'rgba(52,211,153,.55)' : 'rgba(248,113,113,.5)' }}>
                  {agentRunning ? 'Click to stop' : 'Click to start'}
                </p>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: agentRunning ? '#34d399' : '#f87171' }}>
                {agentRunning ? 'stop_circle' : 'play_circle'}
              </span>
            </button>
          </div>

          {/* scrollable section */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 20 }}>
            {/* nav label */}
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: T.muted, padding: '0 18px 6px', margin: 0 }}>Main Menu</p>

            {/* nav links */}
            <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {NAV.map(item => {
                const active = item.to === '/'
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 11,
                      padding: '10px 12px', borderRadius: 10,
                      fontSize: 14, fontWeight: active ? 600 : 500,
                      color: active ? T.text : T.sub,
                      background: active
                        ? (dark ? 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(99,102,241,0.1))' : 'rgba(59,130,246,0.09)')
                        : 'transparent',
                      border: active ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                      textDecoration: 'none', transition: 'all .16s',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.inputBg } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = T.sub; e.currentTarget.style.background = 'transparent' } }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: active ? '#60a5fa' : 'inherit', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', flexShrink: 0, display: 'block' }} />}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* fixed bottom links */}
          <div style={{ padding: '10px 8px', borderTop: `1px solid ${T.divider}`, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Link
              to="/settings"
              onClick={closeSidebar}
              style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: T.sub, textDecoration: 'none', border: '1px solid transparent', transition: 'all .16s' }}
              onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.inputBg }}
              onMouseLeave={e => { e.currentTarget.style.color = T.sub; e.currentTarget.style.background = 'transparent' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
              Settings
            </Link>
            <button
              type="button"
              onClick={() => { closeSidebar(); navigate('/login', { replace: true }) }}
              style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: T.sub, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', textAlign: 'left', transition: 'all .16s', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.color = T.sub; e.currentTarget.style.background = 'transparent' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
              Logout
            </button>
          </div>
        </aside>

        {/* ════════════════ MAIN ════════════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>

          {/* ── TOPBAR ── */}
          <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', height: 56, flexShrink: 0,
            background: T.headerBg, backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${T.headerBorder}`,
            gap: 12,
            position: 'relative',
            zIndex: 50,
          }}>

            {/* left: hamburger + search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <button
                onClick={() => setSidebarOpen(v => !v)}
                style={{
                  width: 36, height: 36, borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: sidebarOpen && isDesktop ? T.btnHoverBg : 'transparent',
                  border: `1px solid ${sidebarOpen && isDesktop ? T.inputBorder : 'transparent'}`,
                  color: sidebarOpen && isDesktop ? T.text : T.sub,
                  cursor: 'pointer', transition: 'all .18s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = T.inputBg; e.currentTarget.style.color = T.text }}
                onMouseLeave={e => { if (!(sidebarOpen && isDesktop)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sub } }}
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  {sidebarOpen ? 'menu_open' : 'menu'}
                </span>
              </button>

              <div
                ref={searchRef}
                style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', borderRadius: 10, background: T.inputBg, border: `1px solid ${T.inputBorder}`, maxWidth: 280, flex: 1, transition: 'all .2s' }}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: T.muted, flexShrink: 0 }}>search</span>
                <input
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: T.text, minWidth: 0 }}
                  placeholder="Search alerts, hosts, hashes…"
                />
                <kbd style={{ fontSize: 10, padding: '1px 5px', borderRadius: 5, background: T.inputBg, color: T.muted, border: `1px solid ${T.inputBorder}`, flexShrink: 0 }}>⌘K</kbd>
              </div>
            </div>

            {/* right: clock · theme · restart · notif · refresh · profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

              {/* live clock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: T.inputBg, border: `1px solid ${T.inputBorder}` }}>
                <span className="rt-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0, display: 'block' }} />
                <span style={{ fontSize: 12, color: T.sub, userSelect: 'none' }}><LiveClock /></span>
              </div>

              {/* theme toggle */}
              <button
                onClick={() => setDark(v => !v)}
                title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.1)', border: `1px solid ${dark ? 'rgba(251,191,36,0.25)' : 'rgba(99,102,241,0.25)'}`, color: dark ? '#fbbf24' : '#6366f1', cursor: 'pointer', transition: 'all .2s', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{dark ? 'light_mode' : 'dark_mode'}</span>
              </button>

              {/* restart */}
              <button
                onClick={() => setShowRestart(true)}
                title="Restart agent"
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, background: 'rgba(249,115,22,0.09)', border: '1px solid rgba(249,115,22,0.25)', color: '#fb923c', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.18)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.09)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>restart_alt</span>
                Restart
              </button>

              {/* notifications */}
              <div ref={notifRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => { setShowNotif(v => !v); setShowProfile(false) }}
                  style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: showNotif ? T.btnHoverBg : 'transparent', border: `1px solid ${showNotif ? T.inputBorder : 'transparent'}`, color: T.sub, cursor: 'pointer', transition: 'all .18s' }}
                  onMouseEnter={e => { if (!showNotif) { e.currentTarget.style.background = T.inputBg; e.currentTarget.style.color = T.text } }}
                  onMouseLeave={e => { if (!showNotif) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sub } }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
                  {recentAlerts.length > 0 && (
                    <span style={{ position: 'absolute', top: 5, right: 5, minWidth: 15, height: 15, borderRadius: 99, background: '#ef4444', fontSize: 9, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxShadow: '0 0 6px rgba(239,68,68,0.6)', lineHeight: 1 }}>
                      {recentAlerts.length > 9 ? '9+' : recentAlerts.length}
                    </span>
                  )}
                </button>

                {/* notification dropdown */}
                {showNotif && (
                  <div className="rt-fadein" style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                    width: 380, borderRadius: 16,
                    background: T.dropdownBg,
                    border: `1px solid ${T.divider}`,
                    boxShadow: T.dropdownShadow,
                    zIndex: 10000,
                    overflow: 'hidden',
                  }}>
                    {/* header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px 11px', borderBottom: `1px solid ${T.divider}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#60a5fa' }}>notifications_active</span>
                        <span style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>Notifications</span>
                        {recentAlerts.length > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                            {recentAlerts.length} NEW
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setShowNotif(false)}
                        style={{ width: 26, height: 26, borderRadius: 7, background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.inputBg; e.currentTarget.style.color = T.sub }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                      </button>
                    </div>

                    {/* list */}
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {recentAlerts.length === 0 ? (
                        <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 30, color: T.muted, display: 'block', marginBottom: 8 }}>notifications_off</span>
                          <p style={{ color: T.sub, fontSize: 12, margin: 0 }}>No recent alerts</p>
                        </div>
                      ) : recentAlerts.map((alert, i) => {
                        const isR = alert.alert_type === 'ransomware_suspected'
                        return (
                          <Link
                            key={i}
                            to="/alerts"
                            onClick={() => setShowNotif(false)}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 15px', borderBottom: `1px solid ${T.divider}`, borderLeft: `3px solid ${isR ? '#ef4444' : '#f59e0b'}`, textDecoration: 'none', transition: 'background .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = T.rowHover}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: isR ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14, color: isR ? '#f87171' : '#fbbf24' }}>{isR ? 'shield' : 'key'}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                                <span style={{ color: T.text, fontSize: 12, fontWeight: 600 }}>{isR ? 'Ransomware Detected' : 'Honeytoken Accessed'}</span>
                                <span style={{ color: T.muted, fontSize: 10, fontFamily: 'monospace', flexShrink: 0 }}>{formatTs(alert.timestamp)}</span>
                              </div>
                              <p style={{ color: T.sub, fontSize: 11, margin: '2px 0 0', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {alert.host || '—'}{alert.process_name && ` · ${alert.process_name}`}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>

                    {/* footer */}
                    <Link
                      to="/alerts"
                      onClick={() => setShowNotif(false)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '11px', borderTop: `1px solid ${T.divider}`, color: '#60a5fa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.rowHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      View All Alerts <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* refresh */}
              <button
                onClick={() => window.location.reload()}
                title="Refresh"
                style={iconBtn()}
                onMouseEnter={e => { e.currentTarget.style.background = T.inputBg; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.inputBorder }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sub; e.currentTarget.style.borderColor = 'transparent' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 19 }}>refresh</span>
              </button>

              {/* profile */}
              <div ref={profileRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => { setShowProfile(v => !v); setShowNotif(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 10px 4px 4px', borderRadius: 10, background: showProfile ? T.btnHoverBg : T.inputBg, border: `1px solid ${showProfile ? 'rgba(96,165,250,0.4)' : T.inputBorder}`, cursor: 'pointer', transition: 'all .18s' }}
                  onMouseEnter={e => { if (!showProfile) { e.currentTarget.style.background = T.btnHoverBg; e.currentTarget.style.borderColor = T.inputBorder } }}
                  onMouseLeave={e => { if (!showProfile) { e.currentTarget.style.background = T.inputBg; e.currentTarget.style.borderColor = T.inputBorder } }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#1e40af,#3730a3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#93c5fd' }}>person</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ color: T.text, fontSize: 12, fontWeight: 600, lineHeight: 1.3, margin: 0 }}>Admin</p>
                    <p style={{ color: T.sub, fontSize: 10, margin: 0 }}>SOC Lead</p>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: T.sub, transition: 'transform .2s', transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                </button>

                {/* profile dropdown */}
                {showProfile && (
                  <div className="rt-fadein" style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                    width: 240, borderRadius: 16,
                    background: T.dropdownBg,
                    border: `1px solid ${T.divider}`,
                    boxShadow: T.dropdownShadow,
                    zIndex: 10000,
                    overflow: 'hidden',
                  }}>
                    {/* user info */}
                    <div style={{ padding: '13px 15px 11px', borderBottom: `1px solid ${T.divider}` }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#1e40af,#3730a3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 19, color: '#93c5fd' }}>person</span>
                      </div>
                      <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>Admin Console</p>
                      <p style={{ color: T.sub, fontSize: 11, margin: 0 }}>admin@ransomtrap.local</p>
                    </div>

                    {/* menu items */}
                    {[
                      { icon: 'manage_accounts', label: 'My Profile', fn: () => setShowProfile(false) },
                      { icon: 'group', label: 'User Management', fn: () => { setShowProfile(false); navigate('/users') } },
                      { icon: 'settings', label: 'Settings', fn: () => { setShowProfile(false); navigate('/settings') } },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={item.fn}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 15px', background: 'transparent', border: 'none', color: T.sub, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', textAlign: 'left' }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.rowHover; e.currentTarget.style.color = T.text }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sub }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}

                    <div style={{ height: 1, background: T.divider }} />

                    <button
                      onClick={() => { setShowProfile(false); navigate('/login', { replace: true }) }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 15px', background: 'transparent', border: 'none', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 17 }}>logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── BODY ── */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

            {/* ambient blobs */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
              <div className="rt-float" style={{ position: 'absolute', top: '-10%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle,${dark ? 'rgba(59,130,246,0.04)' : 'rgba(59,130,246,0.06)'} 0%,transparent 70%)` }} />
              <div className="rt-float" style={{ position: 'absolute', bottom: '5%', right: '-5%', width: 450, height: 450, borderRadius: '50%', background: `radial-gradient(circle,${dark ? 'rgba(99,102,241,0.03)' : 'rgba(99,102,241,0.05)'} 0%,transparent 70%)`, animationDelay: '3s' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, padding: '24px 24px 40px', maxWidth: 1260, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* ── PAGE HEADER ── */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ height: 1, width: 28, background: 'linear-gradient(90deg,#3b82f6,transparent)' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(96,165,250,0.8)' }}>Security Operations Center</span>
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.5rem)', fontWeight: 900, letterSpacing: '-0.4px', margin: '0 0 10px', background: dark ? 'linear-gradient(135deg,#e2e8f0 0%,#93c5fd 55%,#818cf8 100%)' : 'linear-gradient(135deg,#0f172a 0%,#1e40af 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.1 }}>
                    Dashboard Overview
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: T.sub }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#60a5fa' }}>computer</span>
                      <strong style={{ color: T.text }}>{hostMap.length}</strong> endpoint{hostMap.length !== 1 ? 's' : ''}
                    </span>
                    <span style={{ color: T.muted }}>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: T.sub }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: alerts.length > 0 ? '#f87171' : '#60a5fa' }}>notifications</span>
                      <strong style={{ color: T.text }}>{alerts.length}</strong> alert{alerts.length !== 1 ? 's' : ''} today
                    </span>
                    <span style={{ color: T.muted }}>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: sColor }}>
                      <span className="rt-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: sColor, display: 'block' }} />
                      {sLabel}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.sub, cursor: 'pointer', transition: 'all .18s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.btnHoverBg; e.currentTarget.style.color = T.text }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.inputBg; e.currentTarget.style.color = T.sub }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>download</span>Export
                  </button>
                  <Link
                    to="/scan"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 16px rgba(59,130,246,0.3)', transition: 'box-shadow .2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 22px rgba(59,130,246,0.5)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>document_scanner</span>Run Scan
                  </Link>
                </div>
              </div>

              {/* ── KPI CARDS ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
                <KpiCard
                  icon="gpp_bad" iconColor="#f87171" accentColor="#ef4444"
                  label="Active Threats"
                  value={loading ? '—' : ransomAlerts.length}
                  valueColor={ransomAlerts.length > 0 ? '#f87171' : T.text}
                  badge={ransomAlerts.length > 0 ? { text: 'LIVE', dot: true, bg: 'rgba(239,68,68,0.14)', color: '#f87171' } : null}
                />
                <KpiCard
                  icon="pest_control" iconColor="#fbbf24" accentColor="#f59e0b"
                  label="Honeytoken Hits"
                  value={loading ? '—' : honeyAlerts.length}
                  valueColor={honeyAlerts.length > 0 ? '#fbbf24' : T.text}
                  badge={honeyAlerts.length > 0 ? { text: `+${honeyAlerts.length}`, bg: 'transparent', color: '#fbbf24' } : null}
                />
                <KpiCard
                  icon="monitoring" iconColor="#60a5fa" accentColor="#3b82f6"
                  label="Total Alerts"
                  value={loading ? '—' : alerts.length}
                  valueColor={alerts.length > 0 ? '#93c5fd' : T.text}
                />
                {/* security score card */}
                <div
                  style={{ borderRadius: 14, padding: '18px 20px', background: dark ? `linear-gradient(135deg,${sColor}10,rgba(8,16,30,0.95))` : `linear-gradient(135deg,${sColor}08,#ffffff)`, border: `1px solid ${sColor}25`, transition: 'all .25s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${sColor}50`; e.currentTarget.style.boxShadow = `0 0 28px ${sColor}14` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${sColor}25`; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${sColor}18`, border: `1px solid ${sColor}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: sColor }}>verified_user</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: `${sColor}18`, color: sColor }}>{sLabel}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginBottom: 5 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1.5px', color: sColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{secScore}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, marginBottom: 5, color: `${sColor}80` }}>/100</span>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.sub, marginBottom: 10 }}>Security Score</div>
                  <div style={{ height: 4, borderRadius: 99, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${secScore}%`, background: `linear-gradient(90deg,${sColor},${sColorB})`, boxShadow: `0 0 8px ${sColor}50`, transition: 'width 1s ease' }} />
                  </div>
                </div>
              </div>

              {/* ── QUICK ACTIONS ── */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: T.muted, margin: '0 0 10px' }}>Quick Actions</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {QUICK.map(a => (
                    <Link
                      key={a.to}
                      to={a.to}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, color: T.sub, background: T.inputBg, border: `1px solid ${T.inputBorder}`, textDecoration: 'none', transition: 'all .18s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.btnHoverBg; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.16)'; e.currentTarget.style.color = T.text }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.inputBg; e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.color = T.sub }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15, color: a.c }}>{a.icon}</span>
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── CHART + LIVE FEED ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

                {/* chart */}
                <div style={{ borderRadius: 14, background: T.cardBg, border: `1px solid ${T.cardBorder}`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: `1px solid ${T.divider}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#60a5fa' }}>trending_up</span>
                      </div>
                      <div>
                        <p style={{ color: T.text, fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1.3 }}>Threat Detection Velocity</p>
                        <p style={{ color: T.sub, fontSize: 11, margin: 0 }}>24-hour event timeline</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 8, background: T.inputBg, border: `1px solid ${T.inputBorder}` }}>
                      {['1H', '6H', '24H', '7D'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setChartRange(t)}
                          style={{
                            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all .18s',
                            background: chartRange === t ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'transparent',
                            color: chartRange === t ? '#fff' : T.sub,
                            boxShadow: chartRange === t ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
                          }}
                        >{t}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '10px 18px', borderBottom: `1px solid ${T.divider}` }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.sub }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', display: 'block' }} />Events</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.sub }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'block' }} />Critical</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: T.sub }}>Peak: <strong style={{ color: T.text }}>{maxB}</strong></span>
                    <span style={{ fontSize: 11, color: T.sub }}>Avg: <strong style={{ color: '#60a5fa' }}>{avgB}</strong></span>
                  </div>
                  <div style={{ position: 'relative', height: 190, padding: '14px 18px 0' }}>
                    <div style={{ position: 'absolute', left: 44, right: 18, top: 14, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                      {[100, 75, 50, 25, 0].map(v => (
                        <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, height: 0 }}>
                          <span style={{ fontSize: 9, fontFamily: 'monospace', color: T.muted, width: 18, textAlign: 'right', flexShrink: 0 }}>{v}</span>
                          <div style={{ flex: 1, borderBottom: `1px solid ${T.divider}` }} />
                        </div>
                      ))}
                    </div>
                    <svg style={{ position: 'absolute', left: 44, right: 18, top: 14, bottom: 0, width: 'calc(100% - 62px)', height: 'calc(100% - 14px)' }} preserveAspectRatio="none" viewBox="0 0 500 100">
                      <defs>
                        <linearGradient id="chAG" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="chLG" x1="0" x2="1" y1="0" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <filter id="chGW">
                          <feGaussianBlur stdDeviation="2" result="b" />
                          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      <path d={chartFill} fill="url(#chAG)" />
                      <path d={chartPath} fill="none" stroke="url(#chLG)" strokeWidth="2" strokeLinecap="round" filter="url(#chGW)" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 44px 14px' }}>
                    {buckets.filter((_, i) => i % (chartRange === '7D' ? 3 : 2) === 0 || i === buckets.length - 1).map(b => (
                      <span key={b.label} style={{ fontSize: 9, fontFamily: 'monospace', color: b.label === 'NOW' ? '#60a5fa' : T.muted, fontWeight: b.label === 'NOW' ? 700 : 400 }}>{b.label}</span>
                    ))}
                  </div>
                </div>

                {/* live feed */}
                <div style={{ borderRadius: 14, background: T.cardBg, border: `1px solid ${T.cardBorder}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', borderBottom: `1px solid ${T.divider}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#f87171' }}>cell_tower</span>
                      </div>
                      <div>
                        <p style={{ color: T.text, fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1.3 }}>Live Feed</p>
                        <p style={{ color: T.sub, fontSize: 11, margin: 0 }}>Real-time events</p>
                      </div>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#f87171' }}>
                      <span style={{ position: 'relative', display: 'flex', width: 7, height: 7, flexShrink: 0 }}>
                        <span className="rt-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ef4444', opacity: 0.7 }} />
                        <span style={{ position: 'relative', display: 'block', width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                      </span>
                      Live
                    </span>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', maxHeight: 290 }}>
                    {loading && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '44px 20px', gap: 10 }}>
                        <span className="material-symbols-outlined rt-spin" style={{ fontSize: 22, color: '#60a5fa' }}>progress_activity</span>
                        <p style={{ color: T.sub, fontSize: 12, margin: 0 }}>Connecting…</p>
                      </div>
                    )}
                    {!loading && recentAlerts.length === 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '44px 20px', gap: 10 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'rgba(16,185,129,0.65)' }}>verified_user</span>
                        </div>
                        <p style={{ color: T.sub, fontSize: 13, fontWeight: 600, margin: 0 }}>All Clear</p>
                      </div>
                    )}
                    {recentAlerts.map((alert, i) => {
                      const isR = alert.alert_type === 'ransomware_suspected'
                      return (
                        <div
                          key={i}
                          style={{ display: 'flex', gap: 10, padding: '11px 15px', borderBottom: `1px solid ${T.divider}`, borderLeft: `3px solid ${isR ? '#ef4444' : '#f59e0b'}`, transition: 'background .15s', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = T.rowHover}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isR ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 15, color: isR ? '#f87171' : '#fbbf24' }}>{isR ? 'bug_report' : 'key'}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: isR ? '#f87171' : '#fbbf24' }}>{isR ? 'Critical' : 'Warning'}</span>
                              <span style={{ fontSize: 10, fontFamily: 'monospace', color: T.muted }}>{formatTs(alert.timestamp)}</span>
                            </div>
                            <p style={{ color: T.text, fontSize: 12, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isR ? 'Ransomware Suspected' : 'Honeytoken Accessed'}</p>
                            <p style={{ color: T.sub, fontSize: 11, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.host || '—'}{alert.process_name && ` · ${alert.process_name}`}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <Link
                    to="/Incidents"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '11px', borderTop: `1px solid ${T.divider}`, color: '#60a5fa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', textDecoration: 'none', transition: 'background .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.rowHover; e.currentTarget.style.color = '#93c5fd' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#60a5fa' }}
                  >
                    View All Incidents <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* ── ALERT ACTIVITY TIMELINE ── */}
              <div style={{ borderRadius: 14, background: T.cardBg, border: `1px solid ${T.cardBorder}`, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: `1px solid ${T.divider}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#818cf8' }}>bar_chart</span>
                    </div>
                    <div>
                      <p style={{ color: T.text, fontWeight: 700, fontSize: 14, margin: 0 }}>Alert Activity</p>
                      <p style={{ color: T.sub, fontSize: 11, margin: 0 }}>
                        {chartRange === '1H'  && 'Last 60 min · 5-min buckets'}
                        {chartRange === '6H'  && 'Last 6 hours · 30-min buckets'}
                        {chartRange === '24H' && 'Last 24 hours · 2-hour buckets'}
                        {chartRange === '7D'  && 'Last 7 days · 12-hour buckets'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <span style={{ fontSize: 12, color: T.sub }}>Total: <strong style={{ color: '#818cf8' }}>{alerts.length}</strong></span>
                    <span style={{ fontSize: 12, color: T.sub }}>Peak: <strong style={{ color: T.text }}>{maxB}</strong></span>
                  </div>
                </div>
                <div style={{ padding: '18px 18px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 72 }}>
                    {buckets.map((b, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={`${b.count} alert(s) — ${b.label} ago`}>
                        <div
                          style={{ width: '100%', borderRadius: '3px 3px 0 0', height: Math.max(4, (b.count / maxB) * 60) + 'px', background: b.count > 0 ? 'linear-gradient(to top,rgba(59,130,246,0.8),rgba(99,102,241,0.55))' : T.inputBg, boxShadow: b.count > 0 ? '0 0 8px rgba(59,130,246,0.25)' : 'none', transition: 'all .4s', cursor: b.count > 0 ? 'pointer' : 'default' }}
                          onMouseEnter={e => { if (b.count > 0) e.currentTarget.style.background = 'linear-gradient(to top,rgba(99,102,241,0.95),rgba(139,92,246,0.75))' }}
                          onMouseLeave={e => { if (b.count > 0) e.currentTarget.style.background = 'linear-gradient(to top,rgba(59,130,246,0.8),rgba(99,102,241,0.55))' }}
                        />
                        {i % 3 === 0 && <span style={{ fontSize: 9, fontFamily: 'monospace', color: T.muted }}>{b.label}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── RECENT ALERTS TABLE ── */}
              <div style={{ borderRadius: 14, background: T.cardBg, border: `1px solid ${T.cardBorder}`, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: `1px solid ${T.divider}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#60a5fa' }}>security</span>
                    </div>
                    <p style={{ color: T.text, fontWeight: 700, fontSize: 14, margin: 0 }}>Recent Security Alerts</p>
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, background: T.inputBg, color: T.sub, border: `1px solid ${T.inputBorder}`, fontFamily: 'monospace' }}>{alerts.length}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={{ height: 32, padding: '0 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.sub, cursor: 'pointer', transition: 'all .18s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.btnHoverBg; e.currentTarget.style.color = T.text }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.inputBg; e.currentTarget.style.color = T.sub }}
                    >Export</button>
                    <Link
                      to="/alerts"
                      style={{ height: 32, padding: '0 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'linear-gradient(135deg,rgba(59,130,246,0.85),rgba(99,102,241,0.85))', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'box-shadow .18s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.38)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >View All</Link>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.divider}` }}>
                        {['Severity', 'Timestamp', 'Hostname', 'Threat Type', 'Status', 'Action'].map((h, i) => (
                          <th key={h} style={{ padding: '10px 18px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.muted, textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.slice(0, 6).map((a, i) => {
                        const isR = a.alert_type === 'ransomware_suspected'
                        return (
                          <tr
                            key={i}
                            style={{ borderBottom: `1px solid ${T.divider}`, transition: 'background .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = T.rowHover}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '12px 18px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 7, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', background: isR ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: isR ? '#f87171' : '#fbbf24', border: `1px solid ${isR ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isR ? '#ef4444' : '#f59e0b', display: 'block' }} />
                                {isR ? 'Critical' : 'Warning'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 18px', fontSize: 12, fontFamily: 'monospace', color: T.sub }}>{formatTs(a.timestamp)}</td>
                            <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 600, color: T.text, fontFamily: 'monospace' }}>{a.host || '—'}</td>
                            <td style={{ padding: '12px 18px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13, color: isR ? '#f87171' : '#fbbf24' }}>{isR ? 'bug_report' : 'key'}</span>
                                <span style={{ fontSize: 12, color: T.sub }}>{isR ? 'Ransomware' : 'Honeytoken'}</span>
                              </span>
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              {a.process_killed
                                ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#34d399' }}><span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>Blocked</span>
                                : <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#fbbf24' }}><span className="material-symbols-outlined" style={{ fontSize: 13 }}>visibility</span>Detected</span>
                              }
                            </td>
                            <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                              <Link
                                to="/Incidents"
                                style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', borderRadius: 7, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', textDecoration: 'none', transition: 'all .15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.22)'; e.currentTarget.style.color = '#93c5fd' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#60a5fa' }}
                              >Investigate</Link>
                            </td>
                          </tr>
                        )
                      })}
                      {alerts.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: '44px 18px', textAlign: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 30, color: T.muted, display: 'block', marginBottom: 8 }}>security</span>
                            <p style={{ color: T.sub, fontSize: 13, margin: 0 }}>No security alerts at this time</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── ACTIVE HOSTS ── */}
              {hostMap.length > 0 && (
                <div style={{ borderRadius: 14, background: T.cardBg, border: `1px solid ${T.cardBorder}`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: `1px solid ${T.divider}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#22d3ee' }}>dns</span>
                      </div>
                      <p style={{ color: T.text, fontWeight: 700, fontSize: 14, margin: 0 }}>Active Hosts</p>
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, background: T.inputBg, color: T.sub, border: `1px solid ${T.inputBorder}`, fontFamily: 'monospace' }}>{hostMap.length}</span>
                    </div>
                    <Link
                      to="/network"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#22d3ee', textDecoration: 'none', transition: 'color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#67e8f9'}
                      onMouseLeave={e => e.currentTarget.style.color = '#22d3ee'}
                    >
                      Network View <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
                    </Link>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${T.divider}` }}>
                          {['Hostname', 'Total', 'Ransomware', 'Honeytoken', 'Risk', 'Action'].map((h, i) => (
                            <th key={h} style={{ padding: '10px 18px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.muted, textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {hostMap.map(h => {
                          const risk = h.ransom > 2 ? 'Critical' : h.ransom > 0 ? 'High' : h.honey > 0 ? 'Medium' : 'Low'
                          const rClr = risk === 'Critical' ? '#f87171' : risk === 'High' ? '#fb923c' : risk === 'Medium' ? '#fbbf24' : '#34d399'
                          const rBg = risk === 'Critical' ? 'rgba(239,68,68,0.1)' : risk === 'High' ? 'rgba(249,115,22,0.1)' : risk === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'
                          return (
                            <tr
                              key={h.host}
                              style={{ borderBottom: `1px solid ${T.divider}`, transition: 'background .15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = T.rowHover}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '12px 18px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ position: 'relative', display: 'flex', width: 8, height: 8, flexShrink: 0 }}>
                                    {h.ransom > 0 && <span className="rt-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ef4444', opacity: 0.6 }} />}
                                    <span style={{ position: 'relative', display: 'block', width: 8, height: 8, borderRadius: '50%', background: h.ransom > 0 ? '#ef4444' : '#f59e0b' }} />
                                  </span>
                                  <span style={{ color: T.text, fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{h.host}</span>
                                </span>
                              </td>
                              <td style={{ padding: '12px 18px', fontSize: 15, fontWeight: 800, color: h.total > 3 ? '#f87171' : h.total > 1 ? '#fbbf24' : T.sub, fontVariantNumeric: 'tabular-nums' }}>{h.total}</td>
                              <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 700, color: h.ransom > 0 ? '#f87171' : T.muted }}>{h.ransom > 0 ? h.ransom : '—'}</td>
                              <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 700, color: h.honey > 0 ? '#fbbf24' : T.muted }}>{h.honey > 0 ? h.honey : '—'}</td>
                              <td style={{ padding: '12px 18px' }}>
                                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 9px', borderRadius: 8, background: rBg, color: rClr }}>{risk}</span>
                              </td>
                              <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                                <Link
                                  to="/Incidents"
                                  style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', borderRadius: 7, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', textDecoration: 'none', transition: 'all .15s' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.22)'; e.currentTarget.style.color = '#93c5fd' }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#60a5fa' }}
                                >Investigate</Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── FOOTER ── */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${T.divider}`, fontSize: 11, color: T.muted }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Logo size={14} />
                  <span>Ransom Trap SOC · v1.0.0</span>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: agentRunning ? '#10b981' : '#ef4444', display: 'block' }} />
                  Agent {agentRunning ? 'Online' : 'Offline'}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* ════════════════ RESTART MODAL ════════════════ */}
        {showRestart && (
          <div
            onClick={e => { if (e.target === e.currentTarget) setShowRestart(false) }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          >
            <div
              className="rt-fadein"
              style={{ width: '100%', maxWidth: 420, borderRadius: 20, background: T.dropdownBg, border: `1px solid ${T.dropdownBorder}`, boxShadow: T.dropdownShadow, overflow: 'hidden' }}
            >
              <div style={{ padding: '22px 22px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#fb923c' }}>restart_alt</span>
                  </div>
                  <div>
                    <h3 style={{ color: T.text, fontSize: 17, fontWeight: 800, margin: 0 }}>Restart Agent?</h3>
                    <p style={{ color: T.sub, fontSize: 12, margin: '3px 0 0' }}>This will restart the monitoring agent</p>
                  </div>
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 11, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', gap: 10, marginBottom: 18, alignItems: 'flex-start' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#fb923c', flexShrink: 0, marginTop: 1 }}>warning</span>
                  <p style={{ color: dark ? '#fdba74' : '#9a3412', fontSize: 12, fontWeight: 500, lineHeight: 1.55, margin: 0 }}>
                    This will temporarily interrupt real-time monitoring and threat detection. Active detections may be missed during the restart window.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9 }}>
                  <button
                    onClick={() => setShowRestart(false)}
                    style={{ padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.sub, cursor: 'pointer', transition: 'all .18s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.btnHoverBg; e.currentTarget.style.color = T.text }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.inputBg; e.currentTarget.style.color = T.sub }}
                  >Cancel</button>
                  <button
                    onClick={() => { setShowRestart(false); toggleAgent() }}
                    style={{ padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#ea580c,#dc2626)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(234,88,12,0.35)', transition: 'box-shadow .18s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 22px rgba(234,88,12,0.55)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(234,88,12,0.35)'}
                  >Confirm Restart</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </ThemeCtx.Provider>
  )
}
