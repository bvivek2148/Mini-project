import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'
import { acknowledgeAlert } from '../api.js'

const PER_PAGE = 10

function formatTs(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}
function timeAgo(ts) {
  if (!ts) return ''
  const diff = Math.floor(Date.now() / 1000 - ts)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function RealTimeAlertsPage() {
  const navigate = useNavigate()
  const { alerts, loading, error } = useAlerts(3000)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [expandedIdx, setExpandedIdx] = useState(null)

  const items = useMemo(() => [...alerts].reverse().map((a, i) => ({
    ...a,
    _idx: alerts.length - 1 - i,
    severity: a.alert_type === 'ransomware_suspected' ? 'Critical' : 'High',
    typeName: a.alert_type === 'ransomware_suspected' ? 'Ransomware' : 'Honeytoken',
  })), [alerts])

  const filtered = useMemo(() => {
    return items.filter(a => {
      if (typeFilter === 'Ransomware' && a.alert_type !== 'ransomware_suspected') return false
      if (typeFilter === 'Honeytoken' && a.alert_type !== 'honeytoken_access') return false
      if (!search) return true
      const q = search.toLowerCase()
      return [a.host, a.process_name, a.alert_type, a.path, String(a.pid)]
        .some(v => (v || '').toLowerCase().includes(q))
    })
  }, [items, search, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const ransomwareCount = alerts.filter(a => a.alert_type === 'ransomware_suspected').length
  const honeytokenCount = alerts.filter(a => a.alert_type === 'honeytoken_access').length
  const newCount = alerts.filter(a => !a.status || a.status === 'new').length

  const handleAck = async (e, idx) => {
    e.stopPropagation()
    try { await acknowledgeAlert(idx) } catch {}
  }

  const goPage = (p) => { setPage(Math.max(1, Math.min(totalPages, p))); setExpandedIdx(null) }
  const pageNums = () => {
    const nums = []
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) nums.push(i)
    return nums
  }

  return (
    <div className="min-h-screen bg-[#06080c] font-display text-white selection:bg-blue-500/30">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[-200px] w-[600px] h-[600px] bg-blue-500/[0.02] rounded-full blur-[100px]" />
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Live Alerts</h1>
              </div>
              <p className="text-[11px] text-white/40 mt-0.5 ml-6 font-medium tracking-wide uppercase">Real-time threat feed</p>
            </div>
          </div>
          <div className="flex gap-2 bg-[#0a0e14] p-1 rounded-xl border border-white/[0.05] shadow-inner shadow-black/50">
            {[
              { to: '/', icon: 'dashboard', label: 'Dashboard' },
              { to: '/Incidents', icon: 'security', label: 'Incidents' },
              { to: '/Incidents/terminationlog', icon: 'list_alt', label: 'Logs' }
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
        </header>

        {/* MAIN LAYOUT */}
        <main className="flex-1 overflow-hidden flex flex-col p-6 gap-6 max-w-[1400px] w-full mx-auto">
          
          {/* TOP SECTION: Filters & Quick Stats */}
          <div className="flex-none flex flex-col lg:flex-row gap-6">
            
            {/* Search & Filter Control */}
            <div className="flex-1 bg-[#10151d] border border-white/[0.05] rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-lg shadow-black/40">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/20">search</span>
                <input
                  type="text"
                  placeholder="Query hosts, paths, or process IDs..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="w-full h-11 bg-[#06080c] border border-black rounded-xl pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 shadow-inner shadow-black transition-all placeholder:text-white/20"
                />
              </div>
              <div className="flex bg-[#06080c] p-1 rounded-xl border border-black shadow-inner shadow-black">
                {['All', 'Ransomware', 'Honeytoken'].map(t => {
                  const isActive = typeFilter === t
                  return (
                    <button
                      key={t}
                      onClick={() => { setTypeFilter(t); setPage(1) }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all relative overflow-hidden ${
                        isActive 
                          ? t === 'Ransomware' ? 'text-red-300' : t === 'Honeytoken' ? 'text-orange-300' : 'text-blue-300'
                          : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      {isActive && (
                        <div className={`absolute inset-0 opacity-20 ${
                          t === 'Ransomware' ? 'bg-red-500' : t === 'Honeytoken' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                      )}
                      <span className="relative z-10">{t}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              {[
                { label: 'Critical Threats', val: ransomwareCount, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                { label: 'High Priority', val: honeytokenCount, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                { label: 'Unreviewed', val: newCount, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
              ].map(stat => (
                <div key={stat.label} className={`flex flex-col justify-center px-5 py-2 rounded-2xl border ${stat.border} ${stat.bg} shadow-lg shadow-black/20 min-w-[140px]`}>
                  <p className={`text-2xl font-black ${stat.color} leading-none`}>{loading ? '—' : stat.val}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70 ${stat.color}`}>{stat.label}</p>
                </div>
              ))}
            </div>

          </div>

          {/* LIST SECTION */}
          <div className="flex-1 flex flex-col bg-[#0d121a]/80 backdrop-blur border border-white/[0.05] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden relative">
            
            {/* Table Header */}
            <div className="flex-none grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center bg-[#111721] px-6 py-4 border-b border-white/[0.05]">
              <div className="w-[120px] text-[10px] font-bold text-white/40 uppercase tracking-widest pl-2">Severity & Type</div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Source / Target</div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Timestamp</div>
              <div className="w-[180px] text-right text-[10px] font-bold text-white/40 uppercase tracking-widest pr-4">Status & Actions</div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d121a]/60 backdrop-blur-sm z-10">
                  <div className="size-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
                  <p className="text-white font-medium animate-pulse tracking-wide">Syncing with engine...</p>
                </div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                  <span className="material-symbols-outlined text-[64px] mb-4 text-white/20">shield_lock</span>
                  <p className="text-lg font-bold">No Threats Detected</p>
                  <p className="text-sm text-white/50">Your security perimeter is currently clear.</p>
                </div>
              )}
              
              <div className="flex flex-col relative pb-4">
                {paged.map((alert, i) => {
                  const isRansomware = alert.alert_type === 'ransomware_suspected'
                  const isExpanded = expandedIdx === i
                  const fileName = alert.path ? (alert.path.split('\\').pop() || alert.path.split('/').pop()) : null
                  
                  const baseColor = isRansomware ? 'red' : 'orange'
                  
                  return (
                    <div key={alert._idx} className="border-b border-white/[0.02] last:border-transparent mx-2">
                      <div 
                        onClick={() => setExpandedIdx(isExpanded ? null : i)}
                        className={`group relative flex items-center gap-4 px-4 py-3.5 my-1 cursor-pointer transition-all duration-300 rounded-xl overflow-hidden
                          ${isExpanded ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'}
                        `}
                      >
                        {/* Left edge glow for focus state */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${baseColor}-500 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />

                        {/* Col 1: Severity */}
                        <div className="w-[120px] flex items-center justify-center pl-2">
                          <div className={`flex flex-col items-center justify-center size-14 rounded-lg bg-${baseColor}-500/10 border border-${baseColor}-500/20 shadow-[0_0_15px_rgba(0,0,0,0)] group-hover:shadow-${baseColor}-500/20 transition-all`}>
                            <span className={`material-symbols-outlined text-[24px] text-${baseColor}-400 mb-0.5`}>
                              {isRansomware ? 'gpp_bad' : 'key'}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest text-${baseColor}-400/80`}>
                              {alert.severity}
                            </span>
                          </div>
                        </div>

                        {/* Col 2: Context */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-bold text-white/90 truncate">{alert.host || 'Unknown-Host'}</span>
                            <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[10px] text-white/40 font-mono border border-white/[0.05]">PID: {alert.pid || '—'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs">
                            {fileName ? (
                              <div className="flex items-center text-white/50 bg-[#06080c] px-2 py-1 rounded border border-black shadow-inner truncate max-w-[200px] xl:max-w-[300px]">
                                <span className="material-symbols-outlined text-[14px] mr-1.5 opacity-50">description</span>
                                <span className="truncate">{fileName}</span>
                              </div>
                            ) : (
                              <div className="text-white/30 italic">No file data</div>
                            )}
                            {alert.process_name && (
                              <>
                                <span className="material-symbols-outlined text-[14px] text-white/20">arrow_forward</span>
                                <span className="text-blue-400 font-mono px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
                                  {alert.process_name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Col 3: Time */}
                        <div className="flex-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm font-mono tracking-wide">{formatTs(alert.timestamp).split(',')[1]}</p>
                          <p className="text-white/40 text-[11px] font-medium mt-0.5 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {timeAgo(alert.timestamp)} — {formatTs(alert.timestamp).split(',')[0]}
                          </p>
                        </div>

                        {/* Col 4: Status & Actions */}
                        <div className="w-[180px] flex items-center justify-end pr-2 gap-3">
                          
                          {/* Status Pill */}
                          {alert.status === 'acknowledged' ? (
                            <span className="px-2.5 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-[10px] font-bold text-blue-400 uppercase tracking-widest hidden sm:inline-block">Acked</span>
                          ) : alert.status === 'escalated' ? (
                            <span className="px-2.5 py-1 rounded border border-orange-500/30 bg-orange-500/10 text-[10px] font-bold text-orange-400 uppercase tracking-widest animate-pulse hidden sm:inline-block">Escalated</span>
                          ) : alert.status === 'resolved' ? (
                            <span className="px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-400 uppercase tracking-widest hidden sm:inline-block">Resolved</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest relative hidden sm:inline-block">
                              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-blue-500 animate-ping" />
                              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-blue-500" />
                              New
                            </span>
                          )}

                          {/* Quick Actions (Always Visible) */}
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/alerts/${alert._idx}`}
                              onClick={e => e.stopPropagation()}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/20 transition-colors shadow-sm shadow-blue-500/5 flex items-center gap-1.5"
                              title="Investigate Alert"
                            >
                              <span className="material-symbols-outlined text-[14px]">visibility</span>
                              <span className="hidden lg:inline">View</span>
                            </Link>

                             {(!alert.status || alert.status === 'new') && (
                              <button
                                onClick={(e) => handleAck(e, alert._idx)}
                                className={`size-8 flex items-center justify-center rounded bg-white/5 hover:bg-emerald-500/20 text-white/40 hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-500/30 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hidden md:flex'}`}
                                title="Acknowledge"
                              >
                                <span className="material-symbols-outlined text-[18px]">done_all</span>
                              </button>
                            )}
                            <button className="size-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white/40 transition-colors">
                              <span className={`material-symbols-outlined text-[20px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Content */}
                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[300px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                        <div className="mx-4 ml-24 bg-[#080b10] border border-white/[0.05] rounded-xl p-4 shadow-inner shadow-black">
                          <div className="grid grid-cols-3 gap-6 mb-4">
                             <div>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Full Executable Path</p>
                              <p className="font-mono text-xs text-white/70 bg-black/50 p-2 rounded border border-white/5 truncate" title={alert.path}>{alert.path || 'N/A'}</p>
                             </div>
                             <div>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Alert ID Reference</p>
                              <p className="font-mono text-sm text-blue-400">#RT-{alert._idx.toString().padStart(6, '0')}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                            <Link
                              to={`/alerts/${alert._idx}`}
                              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              Investigate Alert
                            </Link>
                            {(!alert.status || alert.status === 'new') && (
                              <button
                                onClick={() => acknowledgeAlert(alert._idx).catch(()=>{})}
                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors border border-white/10"
                              >
                                Mark as Acknowledged
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Pagination / Footer */}
            <div className="flex-none bg-[#111721] p-4 border-t border-white/[0.05] flex items-center justify-between">
              <div className="text-xs font-medium text-white/40 flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                Live Monitoring Active
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/30 mr-2">
                    Page <strong className="text-white/70">{page}</strong> of <strong className="text-white/70">{totalPages}</strong>
                  </span>
                  <button onClick={() => goPage(page - 1)} disabled={page === 1} className="size-8 flex items-center justify-center rounded bg-white/[0.03] text-white/50 hover:bg-white/[0.08] hover:text-white disabled:opacity-30 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_back_ios_new</span>
                  </button>
                  {pageNums().map(p => (
                    <button
                      key={p}
                      onClick={() => goPage(p)}
                      className={`size-8 flex items-center justify-center rounded text-xs font-bold transition-all ${
                        p === page 
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                          : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="size-8 flex items-center justify-center rounded bg-white/[0.03] text-white/50 hover:bg-white/[0.08] hover:text-white disabled:opacity-30 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward_ios</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
