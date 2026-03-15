import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchHoneytokens } from '../api.js'
import { useAlerts } from '../hooks/useAlerts.js'

function formatLastAlert(ts) {
  if (!ts) return 'Never'
  const diff = Math.floor(Date.now() / 1000 - ts)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(ts * 1000).toLocaleDateString()
}

export default function HoneytokenManagementPage() {
  const navigate = useNavigate()
  const [tokens, setTokens] = useState([])
  const [loadingTokens, setLoadingTokens] = useState(true)
  const [filterTab, setFilterTab] = useState('All')
  const { alerts } = useAlerts(6000)

  useEffect(() => {
    setLoadingTokens(true)
    fetchHoneytokens()
      .then(data => { setTokens(data); setLoadingTokens(false) })
      .catch(() => setLoadingTokens(false))
  }, [alerts.length])

  const displayed = useMemo(() => {
    if (filterTab === 'All') return tokens
    if (filterTab === 'Triggered') return tokens.filter(t => t.status === 'TRIGGERED')
    return tokens.filter(t => t.status === 'monitoring')
  }, [tokens, filterTab])

  const totalDeployed = tokens.length
  const activeAlerts = tokens.filter(t => t.status === 'TRIGGERED').length
  const honeytokenAlerts = alerts.filter(a => a.alert_type === 'honeytoken_access')

  function TokenIcon({ name }) {
    const ext = (name || '').split('.').pop().toLowerCase()
    const map = {
      xlsx: { icon: 'table_chart', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
      xls:  { icon: 'table_chart', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
      pdf:  { icon: 'picture_as_pdf', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
      txt:  { icon: 'description', color: 'text-slate-300 bg-white/5 border-white/10' },
      sql:  { icon: 'database', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
      doc:  { icon: 'description', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
      docx: { icon: 'description', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    }
    const { icon, color } = map[ext] || { icon: 'folder_zip', color: 'text-slate-400 bg-white/5 border-white/10' }
    return (
      <div className={`size-10 rounded-xl border flex items-center justify-center shadow-lg ${color}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
    )
  }

  const css = `
    .glass { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.5; }
      100% { transform: scale(2); opacity: 0; }
    }
    .ring-anim::before {
      content: ''; position: absolute; inset: 0; border-radius: 50%;
      border: 1px solid rgba(239,68,68,0.5); animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    }
  `

  return (
    <div className="h-screen flex flex-col bg-[#020408] font-display text-white overflow-hidden relative">
      <style>{css}</style>

      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.01) 40%, transparent 70%)' }} />
        <svg className="absolute inset-0 w-full h-full opacity-40">
          <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.4" fill="rgba(255,255,255,0.08)" />
          </pattern>
          <rect fill="url(#dots)" width="100%" height="100%" />
        </svg>
      </div>

      {/* HEADER */}
      <header className="flex-none h-14 px-6 flex items-center justify-between border-b border-white/[0.04] bg-[#060b12]/98 glass z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="size-8 rounded-lg bg-white/[0.02] hover:bg-white/[0.07] border border-white/[0.04] text-white/40 hover:text-white transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div className="h-6 w-px bg-white/[0.04]" />
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-orange-400">key</span>
            </div>
            <div>
              <h1 className="text-[13px] font-bold text-white/90 tracking-wide leading-tight">HONEYTOKENS</h1>
              <p className="text-[10px] text-white/40 font-medium">Deception File Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.04]">
              <span className="size-1.5 rounded-full bg-orange-400" />
              <span className="text-white/30 font-bold">DEPLOYED</span>
              <span className="text-orange-400 font-black">{totalDeployed}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.04]">
              <span className={`size-1.5 rounded-full ${activeAlerts > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-white/30 font-bold">COMPROMISED</span>
              <span className={`font-black ${activeAlerts > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{activeAlerts}</span>
            </div>
          </div>
          <div className="h-6 w-px bg-white/[0.04] hidden md:block mx-1" />
          <div className="flex gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
            {[{ to: '/', i: 'dashboard' }, { to: '/alerts', i: 'notifications_active' }, { to: '/Incidents', i: 'security' }, { to: '/network', i: 'hub' }].map(l => (
              <Link key={l.to} to={l.to} className="size-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all">
                <span className="material-symbols-outlined text-[18px]">{l.i}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Deployed */}
            <div className="bg-gradient-to-br from-[#0c1420] to-[#08101a] p-6 rounded-2xl border border-white/[0.05] shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/[0.02] rounded-full blur-3xl group-hover:bg-orange-500/[0.04] transition-colors" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[11px] font-black text-white/30 tracking-widest mb-2">TOTAL DEPLOYED</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[52px] font-black text-white leading-none">{loadingTokens ? '—' : totalDeployed}</span>
                    <span className="text-[12px] text-white/30 font-medium">files active</span>
                  </div>
                </div>
                <div className="size-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.15)] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 to-orange-500/10" />
                  <span className="material-symbols-outlined text-[24px] text-orange-400">deployed_code</span>
                </div>
              </div>
              <p className="text-[12px] text-white/40 mt-2">Scattered across infrastructure endpoints</p>
            </div>

            {/* Triggered */}
            <div className={`bg-gradient-to-br from-[#0c1420] to-[#08101a] p-6 rounded-2xl border shadow-xl relative overflow-hidden group transition-all duration-300 ${activeAlerts > 0 ? 'border-red-500/30' : 'border-white/[0.05]'}`}>
              <div className={`absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl transition-colors ${activeAlerts > 0 ? 'bg-red-500/10 group-hover:bg-red-500/20' : 'bg-emerald-500/[0.02]'}`} />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[11px] font-black tracking-widest mb-2 text-white/30">COMPROMISED</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-[52px] font-black leading-none ${activeAlerts > 0 ? 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-white'}`}>{loadingTokens ? '—' : activeAlerts}</span>
                    <span className="text-[12px] text-white/30 font-medium">tokens triggered</span>
                  </div>
                </div>
                <div className={`size-12 rounded-2xl border flex items-center justify-center shadow-lg overflow-hidden relative ${activeAlerts > 0 ? 'bg-red-500/10 border-red-500/30 text-red-400 ring-anim' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  <div className={`absolute inset-0 bg-gradient-to-tr ${activeAlerts > 0 ? 'from-red-500/0 to-red-500/10' : 'from-emerald-500/0 to-emerald-500/10'}`} />
                  <span className="material-symbols-outlined text-[24px] z-10">{activeAlerts > 0 ? 'warning' : 'gpp_good'}</span>
                </div>
              </div>
              <p className={`text-[12px] mt-2 ${activeAlerts > 0 ? 'text-red-300' : 'text-white/40'}`}>{activeAlerts > 0 ? 'Immediate investigation required' : 'No decoy files have been accessed'}</p>
            </div>

            {/* Access Events */}
            <div className="bg-gradient-to-br from-[#0c1420] to-[#08101a] p-6 rounded-2xl border border-white/[0.05] shadow-xl flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[11px] font-black tracking-widest mb-2 text-white/30">ACCESS LOGS</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[52px] font-black text-white leading-none drop-shadow-md">{honeytokenAlerts.length}</span>
                    <span className="text-[12px] text-white/30 font-medium">total events</span>
                  </div>
                </div>
                <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 to-blue-500/10" />
                  <span className="material-symbols-outlined text-[24px] text-blue-400">format_list_bulleted</span>
                </div>
              </div>
              <Link to="/accesslogs" className="w-full py-3 rounded-xl bg-white/[0.02] hover:bg-blue-500/10 border border-white/[0.05] hover:border-blue-500/20 text-[12px] font-bold text-white/70 hover:text-blue-400 transition-all flex items-center justify-center gap-2 group">
                View Full Audit Log <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Tokens List Section */}
          <div className="bg-[#060b12]/80 border border-white/[0.05] rounded-2xl shadow-2xl overflow-hidden glass">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/[0.05] flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.01]">
              <div className="flex gap-2">
                {[
                  { id: 'All', label: 'All Tokens', count: tokens.length },
                  { id: 'Monitoring', label: 'Secure', count: tokens.filter(t => t.status === 'monitoring').length, dot: 'bg-emerald-500' },
                  { id: 'Triggered', label: 'Compromised', count: activeAlerts, dot: 'bg-red-500 animate-pulse' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setFilterTab(tab.id)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ${filterTab === tab.id ? 'bg-white/[0.08] text-white border border-white/[0.1] shadow-lg' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03] border border-transparent'}`}>
                    {tab.dot && <span className={`size-2 rounded-full ${tab.dot}`} />}
                    {tab.label}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${filterTab === tab.id ? 'bg-white/10 text-white/90' : 'bg-white/[0.03] text-white/50'}`}>{tab.count}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pr-3 bg-white/[0.02] border border-white/[0.05] focus-within:border-white/20 transition-colors rounded-xl px-3 py-2">
                <span className="material-symbols-outlined text-[18px] text-white/30">search</span>
                <input type="text" placeholder="Search tokens..." className="bg-transparent border-none text-[13px] text-white placeholder-white/20 focus:outline-none focus:ring-0 w-48" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.05] text-[11px] font-black text-white/40 uppercase tracking-widest">
                    <th className="px-6 py-5">Token File</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Location</th>
                    <th className="px-6 py-5">Assigned Host</th>
                    <th className="px-6 py-5 text-right">Last Interaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {loadingTokens ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="inline-flex flex-col items-center gap-3">
                          <div className="size-8 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
                          <p className="text-[11px] text-white/30 font-bold tracking-widest">LOADING TOKENS...</p>
                        </div>
                      </td>
                    </tr>
                  ) : displayed.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-white/20 text-[12px]">
                        No honeytokens match the selected filter.
                      </td>
                    </tr>
                  ) : displayed.map((token, i) => {
                    const isTriggered = token.status === 'TRIGGERED'
                    return (
                      <tr key={i} className={`group hover:bg-white/[0.02] transition-colors ${isTriggered ? 'bg-red-500/[0.02]' : ''}`}>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <TokenIcon name={token.name} />
                            <div>
                              <p className={`text-[14px] font-bold ${isTriggered ? 'text-red-300' : 'text-white/90'}`}>{token.name}</p>
                              <p className="text-[11px] text-white/30 mt-0.5 font-mono">ID: {token.id ? token.id.substring(0,8) : '...'}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {isTriggered ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                              <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                              COMPROMISED
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/80 text-[11px] font-bold">
                              <span className="size-2 rounded-full bg-emerald-500/50" />
                              SECURE
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-[12px] text-white/40 font-mono bg-white/[0.02] px-2.5 py-1.5 rounded border border-white/[0.02] w-fit max-w-[300px] truncate" title={token.path}>
                            <span className="material-symbols-outlined text-[15px] text-white/20 shrink-0">folder_open</span>
                            <span className="truncate">{token.path}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[16px] text-white/20">desktop_windows</span>
                            <span className="text-[13px] text-white/70 font-semibold">{token.host || 'Unknown Endpoint'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <span className={`text-[12px] font-mono ${isTriggered ? 'text-red-400 font-bold' : 'text-white/30'}`}>
                            {formatLastAlert(token.last_alert_ts)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-5 border-t border-white/[0.05] bg-white/[0.01] flex justify-between items-center text-[11px] text-white/40 font-black tracking-widest">
              <span>SHOWING {displayed.length} OF {tokens.length} TOKENS</span>
              {activeAlerts > 0 && <span className="text-red-400/80 flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20"><span className="material-symbols-outlined text-[14px] animate-pulse">warning</span> INVESTIGATION REQUIRED</span>}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
