import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'

function formatSpikeTime(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function timeAgo(ts) {
  if (!ts) return ''
  const diff = Math.floor(Date.now() / 1000 - ts)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function EntropyAnalysisPage() {
  const navigate = useNavigate()
  const { alerts, loading } = useAlerts(6000)
  const [timeRange, setTimeRange] = useState('1H')
  const [search, setSearch] = useState('')

  const ransomwareAlerts = alerts.filter(a => a.alert_type === 'ransomware_suspected')
  const honeytokenAlerts = alerts.filter(a => a.alert_type === 'honeytoken_access')
  const latestRansomware = ransomwareAlerts.length > 0
    ? ransomwareAlerts[ransomwareAlerts.length - 1]
    : null
  const currentEntropy = latestRansomware?.details?.entropy_threshold ?? '—'
  const spikeTime = formatSpikeTime(latestRansomware?.timestamp)
  const filesAffected = ransomwareAlerts.length
  const hostName = latestRansomware?.host || 'No active host'

  // Build dynamic SVG chart path from alerts based on timestamps
  const chartData = useMemo(() => {
    if (alerts.length === 0) return { linePath: '', areaPath: '', dots: [] }
    const sorted = [...alerts].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    const minTs = sorted[0]?.timestamp || 0
    const maxTs = sorted[sorted.length - 1]?.timestamp || minTs + 3600
    const range = Math.max(maxTs - minTs, 60)
    
    const points = sorted.map(a => {
      const x = ((a.timestamp - minTs) / range) * 1000
      const entropy = a.alert_type === 'ransomware_suspected' 
        ? (a.details?.entropy_threshold || 7.8)
        : (2 + Math.random() * 3)
      const y = 300 - (entropy / 8) * 300
      return { x: Math.round(x), y: Math.round(y), entropy, isRansomware: a.alert_type === 'ransomware_suspected' }
    })
    
    if (points.length === 0) return { linePath: '', areaPath: '', dots: [] }
    
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
    const areaPath = linePath + ` L${points[points.length - 1].x} 300 L${points[0].x} 300 Z`
    const dots = points.filter(p => p.isRansomware)
    
    return { linePath, areaPath, dots }
  }, [alerts])

  // X-axis labels based on real timestamps
  const xLabels = useMemo(() => {
    if (alerts.length === 0) return ['—','—','—','—','—']
    const sorted = [...alerts].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    const minTs = sorted[0]?.timestamp || 0
    const maxTs = sorted[sorted.length - 1]?.timestamp || minTs + 3600
    const labels = []
    for (let i = 0; i < 5; i++) {
      const ts = minTs + ((maxTs - minTs) / 4) * i
      labels.push(formatSpikeTime(ts))
    }
    return labels
  }, [alerts])

  // All events for table (both types), sorted newest first, with search
  const allEvents = useMemo(() => {
    const combined = [...alerts].reverse().map((a, i) => ({
      ...a,
      _idx: alerts.length - 1 - i,
      entropy: a.alert_type === 'ransomware_suspected' ? (a.details?.entropy_threshold || 8.0) : (2 + (i % 4)),
      isRansomware: a.alert_type === 'ransomware_suspected',
    }))
    if (!search) return combined
    const q = search.toLowerCase()
    return combined.filter(a =>
      [a.host, a.path, a.process_name, a.alert_type].some(v => (v || '').toLowerCase().includes(q))
    )
  }, [alerts, search])

  const displayEvents = allEvents.slice(0, 12)

  return (
    <div className="min-h-screen bg-[#06080c] font-display text-white selection:bg-indigo-500/30">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-cyan-500/[0.02] rounded-full blur-[100px]" />
        <div className="absolute top-[50%] right-[-5%] w-[400px] h-[400px] bg-red-500/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* HEADER */}
        <header className="flex-none px-6 py-4 flex items-center justify-between border-b border-white/[0.05] bg-[#0a0e14]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center justify-center size-10 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.1] text-white/50 hover:text-white transition-all group shadow-sm shadow-black"
            >
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            </button>
            <div className="h-8 w-px bg-white/[0.05]" />
            <div>
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Entropy Analysis</h1>
              </div>
              <p className="text-[11px] text-white/40 mt-0.5 ml-6 font-medium tracking-wide uppercase">File Encryption Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 bg-[#0a0e14] p-1 rounded-xl border border-white/[0.05] shadow-inner shadow-black/50">
               {[
                { to: '/', icon: 'dashboard', label: 'Dashboard' },
                { to: '/alerts', icon: 'notifications_active', label: 'Alerts' },
                { to: '/Incidents', icon: 'security', label: 'Incidents' },
                { to: '/settings', icon: 'tune', label: 'Thresholds' }
              ].map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] hover:shadow-sm transition-all text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
            
            {/* Page Title Row & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black tracking-tight text-white/90">System Entropy</h2>
                  {ransomwareAlerts.length > 0 ? (
                    <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-[10px] font-bold text-red-400 border border-red-500/20 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                      <span className="size-1.5 rounded-full bg-red-400" />
                      Threat Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      All Clear
                    </span>
                  )}
                </div>
                <p className="text-white/40 font-mono text-sm pl-0.5">
                  Host: <span className="text-white/70">{hostName}</span> <span className="mx-2 text-white/20">|</span> Polling every <span className="text-white/70">6s</span>
                </p>
              </div>

              <div className="flex gap-3">
                 <div className="relative w-[260px]">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-[18px]">search</span>
                    <input
                      className="block w-full h-10 rounded-xl border border-white/[0.05] bg-[#0a0e14] pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 shadow-inner shadow-black/50 transition-all placeholder:text-white/20"
                      placeholder="Filter events..."
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                 </div>
                 <Link to="/alerts" className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white text-sm font-bold rounded-xl transition-all border border-white/[0.05] hover:border-white/[0.1]">
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  View Alerts
                </Link>
                 <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export
                </button>
              </div>
            </div>

            {/* Stats Cards — 4 cards now */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Peak Entropy */}
              <div className="bg-[#0b1018]/80 backdrop-blur rounded-2xl p-5 border border-white/[0.05] shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-white/[0.08] transition-all">
                {(!loading && ransomwareAlerts.length > 0) && (
                   <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 opacity-60" />
                )}
                <div className="absolute right-0 top-0 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                  <span className="material-symbols-outlined text-[64px] text-red-500">warning</span>
                </div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">speed</span>
                  Peak Entropy
                </p>
                <div className="flex items-baseline gap-2">
                  {loading ? (
                    <div className="h-10 w-16 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <p className={`text-4xl font-black tracking-tighter ${currentEntropy > 7.5 ? 'text-red-400' : 'text-white'}`}>{currentEntropy}</p>
                  )}
                  {!loading && currentEntropy > 7.5 && (
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider animate-pulse">Critical</span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.04] text-[10px] text-white/30">
                  Threshold: <span className="text-white/50">7.5</span>
                </div>
              </div>

              {/* Latest Detection */}
              <div className="bg-[#0b1018]/80 backdrop-blur rounded-2xl p-5 border border-white/[0.05] shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-white/[0.08] transition-all">
                <div className="absolute right-0 top-0 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                  <span className="material-symbols-outlined text-[64px] text-indigo-500">timeline</span>
                </div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  Last Spike
                </p>
                <div className="flex items-baseline gap-2">
                  {loading ? (
                    <div className="h-10 w-24 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl font-black tracking-tighter text-white/90">{spikeTime}</p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.04] text-[10px] text-white/30">
                  {latestRansomware ? (<span>Source: <span className="text-white/50 font-mono">{latestRansomware.host}</span></span>) : 'No spikes yet'}
                </div>
              </div>

              {/* Ransomware Events */}
              <div className="bg-[#0b1018]/80 backdrop-blur rounded-2xl p-5 border border-white/[0.05] shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-white/[0.08] transition-all">
                <div className="absolute right-0 top-0 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                  <span className="material-symbols-outlined text-[64px] text-orange-500">gpp_bad</span>
                </div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">gpp_bad</span>
                  Ransomware Events
                </p>
                <div className="flex items-baseline gap-2">
                  {loading ? (
                    <div className="h-10 w-12 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <p className={`text-4xl font-black tracking-tighter ${filesAffected > 0 ? 'text-orange-400' : 'text-white'}`}>{filesAffected}</p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.04] text-[10px]">
                   {filesAffected > 0 ? (
                      <span className="text-orange-400 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">error</span> Requires review</span>
                   ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">check_circle</span> Clean</span>
                   )}
                </div>
              </div>

              {/* Total Monitored */}
              <div className="bg-[#0b1018]/80 backdrop-blur rounded-2xl p-5 border border-white/[0.05] shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-white/[0.08] transition-all">
                <div className="absolute right-0 top-0 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                  <span className="material-symbols-outlined text-[64px] text-cyan-500">monitoring</span>
                </div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">monitoring</span>
                  Total Events
                </p>
                <div className="flex items-baseline gap-2">
                  {loading ? (
                    <div className="h-10 w-12 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <p className="text-4xl font-black tracking-tighter text-cyan-400">{alerts.length}</p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.04] text-[10px] text-white/30">
                  Honeytoken: <span className="text-white/50">{honeytokenAlerts.length}</span> <span className="mx-1.5 text-white/10">•</span> Ransomware: <span className="text-white/50">{ransomwareAlerts.length}</span>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-[#0b1018]/80 backdrop-blur rounded-2xl border border-white/[0.05] shadow-2xl shadow-black/50 p-6 flex flex-col gap-5 relative hover:border-white/[0.08] transition-all">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
                    Entropy Timeline
                    <span className="text-[10px] text-white/30 font-medium uppercase tracking-widest bg-white/[0.03] px-2 py-1 rounded border border-white/[0.05]">{alerts.length} data points</span>
                  </h3>
                  <p className="text-sm text-white/40 mt-1">
                    Shannon entropy score mapping — spikes above <span className="text-red-400 font-bold">7.5</span> indicate potential encryption.
                  </p>
                </div>
                
                {/* Time Range Selector */}
                <div className="flex bg-[#07090d] p-1 rounded-xl border border-white/[0.05] self-start sm:self-auto shadow-inner shadow-black">
                  {['1H', '24H', '7D', 'ALL'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setTimeRange(t)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        timeRange === t
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' 
                          : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02] border border-transparent'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

               {/* Dynamic Chart */}
               <div className="w-full h-[280px] bg-[#07090e] rounded-xl border border-white/[0.03] relative p-4 group overflow-hidden">
                  {/* Hover tools */}
                  <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {['zoom_in', 'zoom_out', 'restart_alt'].map(icon => (
                       <button key={icon} className="size-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors border border-white/5">
                         <span className="material-symbols-outlined text-[16px]">{icon}</span>
                       </button>
                    ))}
                  </div>

                  {/* Y-Axis */}
                  <div className="absolute left-3 top-3 bottom-9 w-7 flex flex-col justify-between text-[9px] text-white/20 font-mono text-right pointer-events-none">
                    <span>8.0</span><span>6.0</span><span>4.0</span><span>2.0</span><span>0.0</span>
                  </div>
                  {/* X-Axis */}
                  <div className="absolute left-12 right-3 bottom-2 h-4 flex justify-between text-[9px] text-white/20 font-mono pointer-events-none">
                    {xLabels.map((l, i) => <span key={i}>{l}</span>)}
                  </div>

                  {/* SVG Chart */}
                  <div className="absolute left-12 right-3 top-3 bottom-9">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                      <defs>
                        <linearGradient id="entropyFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                        </linearGradient>
                        <pattern id="egrid" width="100" height="75" patternUnits="userSpaceOnUse">
                          <path d="M 100 0 L 0 0 0 75" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect fill="url(#egrid)" height="100%" width="100%" />
                      
                      {/* Threshold Line */}
                      <line x1="0" x2="1000" y1="18.75" y2="18.75" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                      <text fill="#ef4444" fontFamily="monospace" fontSize="9" x="10" y="14" opacity="0.7">CRITICAL 7.5</text>

                      {/* Dynamic Area & Line */}
                      {chartData.areaPath && (
                        <path d={chartData.areaPath} fill="url(#entropyFill)" />
                      )}
                      {chartData.linePath && (
                        <path 
                          className="drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" 
                          d={chartData.linePath} 
                          fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
                        />
                      )}
                      
                      {/* Dynamic Critical Dots */}
                      {chartData.dots.map((d, i) => (
                        <g key={i}>
                          <circle cx={d.x} cy={d.y} r="6" fill="#ef4444" opacity="0.15" className="animate-ping" />
                          <circle cx={d.x} cy={d.y} r="4" fill="#ef4444" stroke="#06080c" strokeWidth="2" />
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Loading overlay */}
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#07090e]/80 backdrop-blur-sm z-20">
                      <div className="size-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    </div>
                  )}
               </div>
            </div>

            {/* Events Table */}
            <div className="bg-[#0b1018]/80 backdrop-blur border border-white/[0.05] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden mb-8 hover:border-white/[0.08] transition-all">
               <div className="p-5 border-b border-white/[0.05] flex items-center justify-between bg-[#111721]/50">
                  <div>
                    <h3 className="text-white/90 font-bold text-lg flex items-center gap-2">
                      Triggering Events
                      <span className="text-[10px] font-bold text-white/30 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">{allEvents.length}</span>
                    </h3>
                    <p className="text-white/40 text-xs mt-0.5">All alerts correlated with entropy analysis</p>
                  </div>
                  <div className="flex gap-2 text-white/40">
                    <button className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-transparent hover:border-white/10 transition-all" title="Filter"><span className="material-symbols-outlined text-[16px]">filter_list</span></button>
                    <button className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-transparent hover:border-white/10 transition-all" title="Options"><span className="material-symbols-outlined text-[16px]">more_vert</span></button>
                  </div>
               </div>
               
               <div className="w-full">
                  {/* List Header */}
                  <div className="grid grid-cols-[90px_60px_1fr_180px_100px_100px] gap-3 px-5 py-2.5 bg-[#0a0e14] border-b border-white/[0.03] text-[10px] font-bold text-white/25 uppercase tracking-widest">
                    <div>Time</div>
                    <div>Type</div>
                    <div>Source Path</div>
                    <div>Entropy Score</div>
                    <div>Process</div>
                    <div className="text-center">Action</div>
                  </div>

                  {/* List Rows */}
                  <div className="flex flex-col divide-y divide-white/[0.02]">
                    {displayEvents.length === 0 && (
                      <div className="py-16 flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-[48px] text-white/10 mb-3">shield_lock</span>
                        <p className="text-white/40 text-sm font-bold">No events detected</p>
                        <p className="text-white/25 text-xs mt-1">Your systems appear clean. Keep monitoring.</p>
                      </div>
                    )}
                    {displayEvents.map((alert, i) => {
                      const t = formatSpikeTime(alert.timestamp)
                      const ago = timeAgo(alert.timestamp)
                      const fullPath = alert.path || ''
                      const name = fullPath.split('\\').pop() || fullPath.split('/').pop() || 'Unknown File'
                      const pathOnly = fullPath.substring(0, fullPath.length - name.length) || alert.host || '—'
                      const val = alert.entropy
                      const isCritical = val >= 7.5
                      
                      return (
                      <div key={i} className="grid grid-cols-[90px_60px_1fr_180px_100px_100px] gap-3 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                         {/* Time */}
                         <div className="flex flex-col">
                           <span className="text-xs font-mono text-white/60">{t}</span>
                           <span className="text-[10px] text-white/25">{ago}</span>
                         </div>
                         
                         {/* Type badge */}
                         <div>
                           {alert.isRansomware ? (
                             <span className="inline-flex items-center justify-center size-7 rounded bg-red-500/10 border border-red-500/15" title="Ransomware">
                               <span className="material-symbols-outlined text-[16px] text-red-400">gpp_bad</span>
                             </span>
                           ) : (
                             <span className="inline-flex items-center justify-center size-7 rounded bg-orange-500/10 border border-orange-500/15" title="Honeytoken">
                               <span className="material-symbols-outlined text-[16px] text-orange-400">key</span>
                             </span>
                           )}
                         </div>

                         {/* Source */}
                         <div className="flex items-center gap-2.5 pr-4 min-w-0">
                           <div className={`flex items-center justify-center size-7 rounded shrink-0 ${isCritical ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.03] text-white/30'}`}>
                             <span className="material-symbols-outlined text-[16px]">{isCritical ? 'lock' : 'description'}</span>
                           </div>
                           <div className="flex flex-col min-w-0">
                             <span className="text-sm font-semibold text-white/90 truncate" title={name}>{name}</span>
                             <span className="text-[10px] font-mono text-white/25 truncate" title={pathOnly}>{pathOnly}</span>
                           </div>
                         </div>
                         
                         {/* Entropy */}
                         <div className="flex items-center gap-2">
                           <span className={`text-xs font-bold font-mono w-7 ${isCritical ? 'text-red-400' : 'text-white/40'}`}>{val.toFixed(2)}</span>
                           <div className="flex-1 h-1.5 bg-[#0a0e14] rounded-full overflow-hidden shadow-inner shadow-black/50">
                             <div className={`h-full rounded-full transition-all ${isCritical ? 'bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]' : 'bg-white/10'}`} style={{ width: `${Math.min(100, (val / 8) * 100)}%` }} />
                           </div>
                         </div>
                         
                         {/* Process */}
                         <div className="text-xs font-mono text-white/40 truncate" title={alert.process_name}>{alert.process_name || '—'}</div>
                         
                         {/* Action */}
                         <div className="flex justify-center">
                           <Link
                             to={`/alerts/${alert._idx}`}
                             className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/15 hover:border-indigo-500/30 transition-all flex items-center gap-1"
                           >
                             <span className="material-symbols-outlined text-[14px]">visibility</span>
                             View
                           </Link>
                         </div>
                      </div>
                      )
                    })}
                  </div>

                  {/* Table Footer */}
                  <div className="px-5 py-3 bg-[#0a0e14] border-t border-white/[0.05] flex items-center justify-between text-xs text-white/30">
                    <p>Showing <strong className="text-white/60">{displayEvents.length}</strong> of <strong className="text-white/60">{allEvents.length}</strong> events</p>
                    <Link to="/alerts" className="text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1 transition-colors">
                      View All In Alerts <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
