import React, { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'

export default function NetworkTopologyViewPage() {
  const navigate = useNavigate()
  const { alerts, loading } = useAlerts(6000)
  const [selectedNode, setSelectedNode] = useState(null)
  const [filter, setFilter] = useState('all')
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 2000)
    return () => clearInterval(t)
  }, [])

  const activeThreats = useMemo(() => alerts.filter(a => a.alert_type === 'ransomware_suspected').length, [alerts])
  const honeytokenCount = useMemo(() => alerts.filter(a => a.alert_type === 'honeytoken_access').length, [alerts])
  const hostMap = useMemo(() => {
    const map = {}
    alerts.forEach(a => {
      if (!a.host) return
      if (!map[a.host]) map[a.host] = { host: a.host, alerts: [], ransomware: 0, honeytoken: 0, latestTs: 0, processes: new Set(), paths: [] }
      map[a.host].alerts.push(a)
      if (a.alert_type === 'ransomware_suspected') map[a.host].ransomware++
      if (a.alert_type === 'honeytoken_access') map[a.host].honeytoken++
      if (a.timestamp > map[a.host].latestTs) map[a.host].latestTs = a.timestamp
      if (a.process_name) map[a.host].processes.add(a.process_name)
      if (a.path) map[a.host].paths.push(a.path)
    })
    return map
  }, [alerts])
  const hosts = Object.values(hostMap)
  const uniqueHosts = hosts.length
  const systemHealth = uniqueHosts === 0 ? 100 : Math.max(0, Math.round(100 - (activeThreats / Math.max(uniqueHosts, 1)) * 100))
  const selectedDetail = selectedNode ? hostMap[selectedNode] : null
  const panelOpen = !!selectedDetail

  function formatTs(ts) {
    if (!ts) return '—'
    return new Date(ts * 1000).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  function timeAgo(ts) {
    if (!ts) return ''
    const d = Math.floor(now / 1000 - ts)
    if (d < 60) return `${d}s ago`
    if (d < 3600) return `${Math.floor(d / 60)}m ago`
    return `${Math.floor(d / 3600)}h ago`
  }

  // Node positions — shifted slightly right in the canvas (55% center)
  const nodeLayout = useMemo(() => {
    const positions = [
      { x: 55, y: 14 }, { x: 22, y: 46 }, { x: 82, y: 46 },
      { x: 32, y: 78 }, { x: 74, y: 78 }, { x: 14, y: 24 },
      { x: 86, y: 24 }, { x: 55, y: 88 },
    ]
    return hosts.map((h, i) => ({
      ...h, x: positions[i % positions.length].x, y: positions[i % positions.length].y,
      isInfected: h.ransomware > 0, isHoneytoken: h.honeytoken > 0 && h.ransomware === 0,
    }))
  }, [hosts])

  const filteredNodes = nodeLayout.filter(n => {
    if (filter === 'infected') return n.isInfected
    if (filter === 'healthy') return !n.isInfected
    return true
  })

  // Infrastructure nodes — shifted right too (center at 55%)
  const infraNodes = [
    { id: 'fw',  label: 'FIREWALL', icon: 'local_fire_department', x: 55, y: 9,  c: '#3b82f6', ip: '10.0.0.1' },
    { id: 'gw',  label: 'GATEWAY',  icon: 'router',                x: 28, y: 30, c: '#8b5cf6', ip: '10.0.0.2' },
    { id: 'dns', label: 'DNS',       icon: 'dns',                   x: 78, y: 30, c: '#06b6d4', ip: '10.0.0.3' },
  ]

  // Hub center
  const HUB_X = 55, HUB_Y = 50

  const css = `
    @keyframes sweep{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes scan{0%{top:-1px}100%{top:100%}}
    @keyframes flowLine{to{stroke-dashoffset:-24}}
    @keyframes cardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    @keyframes redPulse{0%,100%{box-shadow:0 0 14px rgba(239,68,68,0.1),inset 0 0 14px rgba(239,68,68,0.04)}50%{box-shadow:0 0 28px rgba(239,68,68,0.22),inset 0 0 28px rgba(239,68,68,0.07)}}
    @keyframes ringExpand{0%{transform:scale(1);opacity:0.35}100%{transform:scale(2.2);opacity:0}}
    @keyframes gaugeIn{from{stroke-dasharray:0 100}to{}}
    .sweep{animation:sweep 10s linear infinite;transform-origin:center}
    .scan{animation:scan 5s linear infinite}
    .flowL{animation:flowLine 1.2s linear infinite}
    .cardF{animation:cardFloat 5s ease-in-out infinite}
    .redP{animation:redPulse 2.5s ease-in-out infinite}
    .ringE{animation:ringExpand 2.5s ease-out infinite}
    .gaugeIn{animation:gaugeIn 1s ease-out forwards}
    .glass{backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:2px}
  `

  function sparkline(alertsArr) {
    if (alertsArr.length < 2) return null
    const sorted = [...alertsArr].sort((a, b) => a.timestamp - b.timestamp)
    const min = sorted[0].timestamp, max = sorted[sorted.length - 1].timestamp, range = max - min || 1
    return sorted.map((a, i) => {
      const x = ((a.timestamp - min) / range) * 60
      const y = 12 - (i / sorted.length) * 10
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  }

  const healthColor = systemHealth >= 90 ? '#10b981' : systemHealth >= 50 ? '#f59e0b' : '#ef4444'
  const healthBg    = systemHealth >= 90 ? 'from-emerald-600 to-emerald-400' : systemHealth >= 50 ? 'from-amber-500 to-yellow-400' : 'from-red-600 to-orange-500'
  const healthLabel = systemHealth >= 90 ? 'NOMINAL' : systemHealth >= 50 ? 'DEGRADED' : 'CRITICAL'

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#020408] font-display text-white select-none">
      <style>{css}</style>

      {/* ─── HEADER ─── */}
      <header className="flex-none h-12 px-5 flex items-center justify-between border-b border-white/[0.04] bg-[#060b12]/98 glass z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="size-8 rounded-lg bg-white/[0.02] hover:bg-white/[0.07] border border-white/[0.04] text-white/30 hover:text-white transition-all flex items-center justify-center group">
            <span className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          </button>
          <div className="h-6 w-px bg-white/[0.04]" />
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-cyan-400 opacity-40" />
              <span className="relative rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </div>
            <span className="text-sm font-bold text-white/80 tracking-wide">NETWORK TOPOLOGY</span>
            <span className="text-[8px] text-cyan-400/60 font-mono border border-cyan-500/20 px-2 py-0.5 rounded-md bg-cyan-500/5 tracking-widest">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* quick stats */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] bg-white/[0.015] px-2.5 py-1 rounded-lg border border-white/[0.03]">
              <span className="size-1.5 rounded-full bg-cyan-500" />
              <span className="text-white/20 font-bold">NODES</span>
              <span className="text-cyan-400 font-black">{uniqueHosts + 3}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-white/[0.015] px-2.5 py-1 rounded-lg border border-white/[0.03]">
              <span className={`size-1.5 rounded-full ${activeThreats > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-white/20 font-bold">THREATS</span>
              <span className={`font-black ${activeThreats > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{activeThreats}</span>
            </div>
          </div>
          <div className="h-5 w-px bg-white/[0.04] hidden md:block" />
          <div className="flex gap-0.5 bg-[#060b12] p-0.5 rounded-xl border border-white/[0.03]">
            {[{ to: '/', i: 'dashboard' }, { to: '/alerts', i: 'notifications_active' }, { to: '/Incidents', i: 'security' }, { to: '/entropy', i: 'ssid_chart' }].map(l => (
              <Link key={l.to} to={l.to} className="size-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.05] transition-all">
                <span className="material-symbols-outlined text-[15px]">{l.i}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="flex flex-1 overflow-hidden min-h-0">

        {/* ═══ LEFT SIDEBAR (380px) ═══ */}
        <aside className="w-[380px] shrink-0 bg-[#060b12]/80 border-r border-white/[0.04] flex flex-col overflow-y-auto z-20 glass">
          <div className="p-5 flex flex-col gap-5">

            {/* ── System Status ── */}
            <div className="bg-gradient-to-br from-[#0c1420] to-[#08101a] rounded-2xl border border-white/[0.05] p-6 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-cyan-400">radar</span>
                  </div>
                  <span className="text-[13px] text-white/40 font-bold tracking-widest">SYSTEM STATUS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`size-2.5 rounded-full ${systemHealth >= 90 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-[11px] font-bold" style={{ color: healthColor }}>{healthLabel}</span>
                </div>
              </div>

              {/* Ring gauge + big number */}
                <div className="flex items-center gap-6 mb-5">
                  <div className="relative size-[100px] shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                    <circle cx="32" cy="32" r="26" fill="none" stroke={healthColor}
                      strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${systemHealth * 1.634} 163.4`}
                      className="gaugeIn drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]"
                      style={{ filter: `drop-shadow(0 0 6px ${healthColor}60)` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[36px] font-black leading-none" style={{ color: healthColor }}>{systemHealth}</span>
                    <span className="text-[13px] text-white/25 font-bold">%</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[15px] text-white/35 font-medium">Network Health Score</p>
                  <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden mt-1.5">
                    <div className={`h-full rounded-full bg-gradient-to-r ${healthBg}`} style={{ width: `${systemHealth}%` }} />
                  </div>
                  <p className="text-[11px] text-white/20 mt-1.5">{activeThreats > 0 ? `${activeThreats} active threat${activeThreats > 1 ? 's' : ''} detected` : 'All systems operational'}</p>
                </div>
              </div>

              {/* 3-col stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'HOSTS',   value: uniqueHosts,   color: 'text-cyan-400',  bg: 'bg-cyan-500/5 border-cyan-500/10' },
                  { label: 'EVENTS',  value: alerts.length,  color: 'text-white/60',  bg: 'bg-white/[0.02] border-white/[0.03]' },
                  { label: 'THREATS', value: activeThreats,  color: activeThreats > 0 ? 'text-red-400' : 'text-emerald-400', bg: activeThreats > 0 ? 'bg-red-500/5 border-red-500/10' : 'bg-emerald-500/5 border-emerald-500/10' },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl py-2.5 text-center border ${s.bg}`}>
                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-white/25 font-bold tracking-widest mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Network Activity Chart ── */}
            <div className="bg-gradient-to-br from-[#0c1420] to-[#08101a] rounded-2xl border border-white/[0.05] p-5 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-cyan-400">show_chart</span>
                  </div>
                  <span className="text-[13px] text-white/40 font-bold tracking-widest">NETWORK ACTIVITY</span>
                </div>
                <span className="text-[8px] text-cyan-400/40 font-mono bg-cyan-500/5 border border-cyan-500/10 px-1.5 py-0.5 rounded">60s</span>
              </div>
              <svg className="w-full h-[100px] mt-1" viewBox="0 0 320 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(6,182,212,0.25)" />
                    <stop offset="100%" stopColor="rgba(6,182,212,0)" />
                  </linearGradient>
                  <filter id="lineGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                {/* Horizontal grid */}
                {[25,50,75].map(y => (
                  <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.025)" strokeWidth="0.5"/>
                ))}
                {/* Area fill */}
                <path d="M0,88 L22,80 L44,84 L66,66 L88,72 L110,48 L132,58 L154,36 L176,48 L198,26 L220,38 L242,18 L264,28 L286,12 L320,20 L320,100 L0,100 Z" fill="url(#actGrad)" />
                {/* Line */}
                <path d="M0,88 L22,80 L44,84 L66,66 L88,72 L110,48 L132,58 L154,36 L176,48 L198,26 L220,38 L242,18 L264,28 L286,12 L320,20" fill="none" stroke="rgba(6,182,212,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)"/>
                {/* Data dots */}
                {[[198,26],[242,18],[286,12]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="#06b6d4" opacity="0.9"/>
                ))}
                {/* Threat spike in red if threats exist */}
                {activeThreats > 0 && <>
                  <line x1="110" y1="0" x2="110" y2="100" stroke="rgba(239,68,68,0.12)" strokeWidth="1" strokeDasharray="2,3"/>
                  <circle cx="110" cy="48" r="4" fill="#ef4444" opacity="0.75"/>
                </>}
              </svg>
              <div className="flex justify-between mt-2 text-[9px] text-white/20 font-mono">
                <span>-60s</span><span>-40s</span><span>-20s</span><span>now</span>
              </div>
            </div>

            {/* ── Threat Feed ── */}
            {activeThreats > 0 && (
              <div className="bg-gradient-to-br from-red-950/40 to-[#0c0810]/60 rounded-2xl border border-red-500/10 p-6 shadow-xl shadow-black/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-9 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-red-400 animate-pulse">crisis_alert</span>
                  </div>
                  <span className="text-[13px] text-red-400/60 font-bold tracking-widest">THREAT FEED</span>
                  <span className="ml-auto text-[11px] font-black text-red-400/70 bg-red-500/10 border border-red-500/15 px-2.5 py-0.5 rounded-lg">{activeThreats} active</span>
                </div>
                <div className="space-y-0">
                  {alerts.filter(a => a.alert_type === 'ransomware_suspected').slice(-6).reverse().map((a, i) => {
                    const file = a.path ? (a.path.split('\\').pop() || a.path.split('/').pop()) : a.host
                    return (
                      <div key={i} className="flex items-start gap-2.5 py-2 border-t border-red-500/5 first:border-0">
                        <div className="mt-1.5 size-1.5 rounded-full bg-red-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-red-300/70 font-mono truncate font-medium">{file}</p>
                          <p className="text-[9px] text-red-400/35 mt-0.5">{a.host} · {timeAgo(a.timestamp)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Honeytoken Events ── */}
            {honeytokenCount > 0 && (
              <div className="bg-gradient-to-br from-[#0c1420] to-[#08101a] rounded-2xl border border-orange-500/10 p-6 shadow-xl shadow-black/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-9 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-orange-400">key</span>
                  </div>
                  <span className="text-[13px] text-orange-400/50 font-bold tracking-widest">HONEYTOKENS</span>
                  <span className="ml-auto text-[11px] font-black text-orange-400/60 bg-orange-500/10 border border-orange-500/10 px-2.5 py-0.5 rounded-lg">{honeytokenCount}</span>
                </div>
                {alerts.filter(a => a.alert_type === 'honeytoken_access').slice(-4).reverse().map((a, i) => {
                  const file = a.path ? (a.path.split('\\').pop() || a.path.split('/').pop()) : a.host
                  return (
                    <div key={i} className="flex items-start gap-2.5 py-2 border-t border-orange-500/5 first:border-0">
                      <div className="mt-1.5 size-1.5 rounded-full bg-orange-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-orange-300/60 font-mono truncate">{file}</p>
                        <p className="text-[9px] text-orange-400/30 mt-0.5">{a.host} · {timeAgo(a.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ═══ TOPOLOGY CANVAS ═══ */}
        <div className="flex-1 relative overflow-hidden min-w-0">

          {/* Background */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 55% 50%, rgba(6,182,212,0.04) 0%, rgba(6,182,212,0.01) 40%, transparent 70%)' }} />
            <svg className="absolute inset-0 w-full h-full">
              <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="0.4" fill="rgba(255,255,255,0.04)" />
              </pattern>
              <rect fill="url(#dots)" width="100%" height="100%" />
            </svg>
            {/* Radar sweep centered at 55% */}
            <div className="absolute top-1/2 -translate-y-1/2 w-[700px] h-[700px]" style={{ left: 'calc(55% - 350px)' }}>
              <div className="sweep w-full h-full rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(6,182,212,0.05) 20deg, transparent 40deg)' }} />
            </div>
            {/* Orbit rings */}
            {[80, 150, 240, 330].map((r, i) => (
              <div key={i} className="absolute top-1/2 -translate-y-1/2 rounded-full"
                style={{ width: r*2, height: r*2, left: `calc(55% - ${r}px)`, border: `1px solid rgba(6,182,212,${0.04 - i*0.008})` }} />
            ))}
            {/* Scan line */}
            <div className="absolute left-0 right-0 h-px scan" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.07), transparent)' }} />
          </div>

          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full z-[1] pointer-events-none">
            <defs>
              <filter id="glow1"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {infraNodes.map(n => (
              <line key={`ic-${n.id}`} x1={`${HUB_X}%`} y1={`${HUB_Y}%`} x2={`${n.x}%`} y2={`${n.y}%`} stroke={n.c} strokeWidth="0.5" opacity="0.08" />
            ))}
            {filteredNodes.map(node => {
              const color = node.isInfected ? '#ef4444' : '#06b6d4'
              return (
                <g key={`conn-${node.host}`}>
                  <line x1={`${HUB_X}%`} y1={`${HUB_Y}%`} x2={`${node.x}%`} y2={`${node.y}%`} stroke={color} strokeWidth={node.isInfected ? '1' : '0.5'} opacity={node.isInfected ? '0.22' : '0.07'} />
                  <line x1={`${HUB_X}%`} y1={`${HUB_Y}%`} x2={`${node.x}%`} y2={`${node.y}%`} stroke={color} strokeWidth="1" opacity="0.28" strokeDasharray="2,14" className="flowL" />
                  {node.isInfected && <line x1={`${HUB_X}%`} y1={`${HUB_Y}%`} x2={`${node.x}%`} y2={`${node.y}%`} stroke="#ef4444" strokeWidth="4" opacity="0.05" filter="url(#glow1)" />}
                </g>
              )
            })}
          </svg>

          {/* Central Hub */}
          <div className="absolute z-[5] -translate-x-1/2 -translate-y-1/2" style={{ left: `${HUB_X}%`, top: `${HUB_Y}%` }}>
            <div className="relative">
              <div className="absolute -inset-12 rounded-full bg-cyan-500/[0.025]" />
              <div className="absolute -inset-6 rounded-full border border-cyan-500/10" />
              <div className="w-[76px] h-[76px] rounded-full bg-gradient-to-b from-[#0d1a28] to-[#071018] border-2 border-cyan-500/30 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                <span className="material-symbols-outlined text-[28px] text-cyan-400">hub</span>
                <span className="text-[6px] text-cyan-400/50 font-black tracking-[0.2em]">CORE</span>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                <p className="text-[9px] font-bold text-white/25 tracking-wide">CORE SWITCH</p>
                <p className="text-[7px] font-mono text-white/12">10.0.0.254</p>
              </div>
            </div>
          </div>

          {/* Infrastructure Nodes */}
          {infraNodes.map(n => (
            <div key={n.id} className="absolute z-[5] -translate-x-1/2 -translate-y-1/2" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
              <div className="glass w-14 h-14 rounded-2xl bg-[#070d16]/90 border flex flex-col items-center justify-center shadow-lg" style={{ borderColor: `${n.c}20` }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: n.c }}>{n.icon}</span>
                <span className="text-[5px] font-black tracking-[0.15em] mt-0.5" style={{ color: `${n.c}80` }}>{n.label}</span>
              </div>
              <p className="text-[7px] font-mono text-white/15 text-center mt-1.5">{n.ip}</p>
            </div>
          ))}

          {/* Host Node Cards */}
          {filteredNodes.map(node => {
            const isSelected = selectedNode === node.host
            const spark = sparkline(node.alerts)
            return (
              <div key={node.host} className="absolute z-[10] -translate-x-1/2 -translate-y-1/2 cursor-pointer" style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => setSelectedNode(isSelected ? null : node.host)}>
                {node.isInfected && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-20 rounded-2xl border border-red-500/15 ringE" />}
                <div className={`glass relative rounded-2xl transition-all duration-200 cardF overflow-hidden
                  ${node.isInfected ? 'bg-gradient-to-br from-red-950/55 to-red-950/25 border border-red-500/25 redP' : 'bg-gradient-to-br from-[#0b1422]/95 to-[#070e1a]/95 border border-white/[0.06] hover:border-cyan-500/25 shadow-2xl shadow-black/50'}
                  ${isSelected ? 'ring-2 ring-cyan-400/35 scale-105' : 'hover:scale-105'}`}
                  style={{ animationDelay: `${Math.random() * 3}s` }}>
                  {/* Top line */}
                  <div className={`absolute top-0 inset-x-0 h-[1.5px] ${node.isInfected ? 'bg-gradient-to-r from-transparent via-red-500/70 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent'}`} />
                  <div className="p-3.5 pr-5">
                    <div className="flex items-start gap-3">
                      <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${node.isInfected ? 'bg-red-500/15 border border-red-500/20' : 'bg-white/[0.03] border border-white/[0.05]'}`}>
                        <span className={`material-symbols-outlined text-[20px] ${node.isInfected ? 'text-red-400' : 'text-white/30'}`}>{node.isInfected ? 'gpp_bad' : 'desktop_windows'}</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[12px] font-bold truncate ${node.isInfected ? 'text-red-300' : 'text-white/65'}`}>{node.host}</span>
                          <span className={`size-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0 ${node.isInfected ? 'bg-red-500' : 'bg-cyan-500/70'}`}>{node.alerts.length}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`size-1.5 rounded-full ${node.isInfected ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                          <span className="text-[9px] text-white/25 font-medium">{node.isInfected ? `${node.ransomware} ransomware` : node.isHoneytoken ? `${node.honeytoken} honeytoken` : 'Secure'}</span>
                        </div>
                        {spark && (
                          <svg className="w-[64px] h-[14px] mt-2 opacity-50" viewBox="0 0 60 14">
                            <path d={spark} fill="none" stroke={node.isInfected ? '#ef4444' : '#06b6d4'} strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    {node.isInfected && node.processes.size > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-red-500/10 flex items-center gap-1 flex-wrap">
                        {[...node.processes].slice(0, 2).map(p => (
                          <span key={p} className="text-[7px] font-mono text-red-400/55 bg-red-500/8 px-1.5 py-0.5 rounded-md border border-red-500/10">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Filter Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <div className="glass bg-[#060b12]/95 rounded-xl border border-white/[0.04] p-1 flex items-center gap-0.5 shadow-2xl shadow-black/60">
              {[
                { key: 'all',      label: 'All Nodes', icon: 'device_hub', count: uniqueHosts },
                { key: 'healthy',  label: 'Healthy',   dot: 'bg-emerald-500' },
                { key: 'infected', label: 'Threats',   dot: 'bg-red-500 animate-pulse' },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filter === f.key ? 'bg-white/[0.06] text-white/80 border border-white/[0.06] shadow-sm' : 'text-white/20 hover:text-white/50 border border-transparent'}`}>
                  {f.icon && <span className="material-symbols-outlined text-[13px]">{f.icon}</span>}
                  {f.dot && <span className={`size-1.5 rounded-full ${f.dot}`} />}
                  {f.label}
                  {f.count !== undefined && <span className="text-[8px] text-white/15 bg-white/[0.03] px-1.5 py-0.5 rounded-md">{f.count}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
            {['add', 'remove', 'my_location'].map(i => (
              <button key={i} className="size-8 rounded-xl bg-[#060b12]/90 glass border border-white/[0.04] flex items-center justify-center text-white/15 hover:text-white/50 hover:bg-white/[0.05] transition-all">
                <span className="material-symbols-outlined text-[15px]">{i}</span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#020408]/80 glass z-30">
              <div className="flex flex-col items-center gap-3">
                <div className="size-10 rounded-full border-2 border-cyan-500/15 border-t-cyan-500 animate-spin" />
                <p className="text-white/20 text-[9px] font-bold tracking-[0.25em]">SCANNING NETWORK</p>
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT DETAIL PANEL ═══ */}
        {panelOpen && (
          <aside className="w-[290px] shrink-0 bg-[#060b12]/98 glass border-l border-white/[0.04] flex flex-col z-20 shadow-[-15px_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-5 border-b border-white/[0.04]">
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`size-2.5 rounded-full ${selectedDetail.ransomware > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <h3 className="text-white font-bold text-base tracking-tight">{selectedDetail.host}</h3>
                </div>
                <button onClick={() => setSelectedNode(null)} className="size-7 rounded-lg flex items-center justify-center text-white/15 hover:text-white hover:bg-white/[0.05] transition-all">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {selectedDetail.ransomware > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 font-bold border border-red-500/10 text-[9px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">gpp_bad</span>{selectedDetail.ransomware} Ransomware
                  </span>
                )}
                {selectedDetail.honeytoken > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 font-bold border border-orange-500/10 text-[9px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">key</span>{selectedDetail.honeytoken} Honeytoken
                  </span>
                )}
                <span className="text-[9px] text-white/15 font-mono ml-auto self-center">{selectedDetail.alerts.length} events</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Actions */}
              <div className="grid grid-cols-3 gap-1.5">
                <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/85 hover:bg-red-500 text-white transition-colors col-span-3 text-[10px] font-bold shadow-lg shadow-red-500/15">
                  <span className="material-symbols-outlined text-[15px]">block</span>Isolate Endpoint
                </button>
                {[['terminal', 'Shell', null], ['description', 'Logs', '/Incidents/terminationlog'], ['policy', 'Scan', null]].map(([icon, label, to]) => (
                  to ? (
                    <Link key={label} to={to} className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-white/30 hover:text-white transition-colors border border-white/[0.02] text-[9px] font-bold">
                      <span className="material-symbols-outlined text-[14px]">{icon}</span>{label}
                    </Link>
                  ) : (
                    <button key={label} className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-white/30 hover:text-white transition-colors border border-white/[0.02] text-[9px] font-bold">
                      <span className="material-symbols-outlined text-[14px]">{icon}</span>{label}
                    </button>
                  )
                ))}
              </div>

              {/* Threat gauge */}
              {selectedDetail.ransomware > 0 && (
                <div className="bg-[#0a0f1a] rounded-xl p-4 border border-white/[0.03]">
                  <p className="text-[8px] text-white/15 font-bold tracking-widest mb-3">THREAT ANALYSIS</p>
                  <div className="flex items-center gap-4">
                    <div className="relative size-14 shrink-0">
                      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray={`${Math.min(selectedDetail.ransomware * 25, 95)} 100`} strokeLinecap="round" className="drop-shadow-[0_0_4px_rgba(239,68,68,0.5)] gaugeIn" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-black text-white">{Math.min(selectedDetail.ransomware * 25, 95)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-400">High Risk</p>
                      <p className="text-[9px] text-white/25 mt-0.5 leading-relaxed">Ransomware-pattern encryption detected</p>
                      <p className="text-[8px] text-white/15 mt-1">{selectedDetail.ransomware} active event{selectedDetail.ransomware > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity log */}
              <div>
                <p className="text-[8px] text-white/15 font-bold tracking-widest mb-3">ACTIVITY LOG</p>
                <div className="pl-3.5 border-l border-white/[0.04] space-y-3">
                  {selectedDetail.alerts.slice(-5).reverse().map((a, i) => {
                    const isR = a.alert_type === 'ransomware_suspected'
                    const file = a.path ? (a.path.split('\\').pop() || a.path.split('/').pop()) : null
                    return (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[9px] top-1 size-2 rounded-full ring-2 ring-[#060b12] ${isR ? 'bg-red-500' : 'bg-orange-400'}`} />
                        <p className="text-[10px] font-semibold text-white/55">{isR ? 'Ransomware detected' : 'Honeytoken accessed'}</p>
                        {file && <p className="text-[9px] text-white/20 font-mono truncate mt-0.5">{file}</p>}
                        <p className="text-[8px] text-white/12 mt-0.5">{timeAgo(a.timestamp)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Endpoint info */}
              <div>
                <p className="text-[8px] text-white/15 font-bold tracking-widest mb-2">ENDPOINT INFO</p>
                <div className="divide-y divide-white/[0.03]">
                  {[['Hostname', selectedDetail.host], ['Total Events', selectedDetail.alerts.length], ['Last Seen', timeAgo(selectedDetail.latestTs)], ['Status', selectedDetail.ransomware > 0 ? 'Compromised' : 'Active']].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px] py-2">
                      <span className="text-white/20">{k}</span>
                      <span className={`font-mono ${k === 'Status' && selectedDetail.ransomware > 0 ? 'text-red-400 font-bold' : 'text-white/50'}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/[0.04]">
              <Link to="/alerts" className="w-full py-2.5 rounded-xl text-[10px] font-bold text-cyan-400 bg-cyan-500/8 hover:bg-cyan-500/12 border border-cyan-500/10 flex items-center justify-center gap-1.5 transition-colors">
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>View All Alerts
              </Link>
            </div>
          </aside>
        )}
      </main>
    </div>
  )
}
