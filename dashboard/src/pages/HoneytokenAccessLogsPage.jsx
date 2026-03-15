import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'

function formatTimestamp(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

export default function HoneytokenAccessLogsPage() {
  const navigate = useNavigate()
  const { alerts, loading, error } = useAlerts(5000)
  const honeytokenAlerts = useMemo(() => {
    return [...alerts].filter(a => a.alert_type === 'honeytoken_access').reverse()
  }, [alerts])

  const [search, setSearch] = useState('')
  const [timeFilter, setTimeFilter] = useState('All')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [severityOpen, setSeverityOpen] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredAlerts = useMemo(() => {
    return honeytokenAlerts.filter(a => {
      // Search
      if (search) {
        const s = search.toLowerCase()
        const match = [a.host, a.path, a.process_name, a.pid].some(val => 
          val && String(val).toLowerCase().includes(s)
        )
        if (!match) return false
      }
      // Time Filter
      if (timeFilter !== 'All' && a.timestamp) {
        const now = Date.now() / 1000
        const diff = now - a.timestamp
        if (timeFilter === '24h' && diff > 86400) return false
        if (timeFilter === '7d' && diff > 86400 * 7) return false
        if (timeFilter === '30d' && diff > 86400 * 30) return false
      }
      // Severity Filter
      if (severityFilter !== 'All') {
        const sev = a.severity ? a.severity.toUpperCase() : 'CRITICAL' // defaults to critical for honeytokens
        if (sev !== severityFilter.toUpperCase()) return false
      }
      return true
    })
  }, [honeytokenAlerts, search, timeFilter, severityFilter])

  // Reset to page 1 on filter changes
  React.useEffect(() => { setCurrentPage(1) }, [search, timeFilter, severityFilter, rowsPerPage])

  const totalPages = Math.ceil(filteredAlerts.length / rowsPerPage) || 1
  const displayedAlerts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredAlerts.slice(start, start + rowsPerPage)
  }, [filteredAlerts, currentPage, rowsPerPage])

  const exportCSV = () => {
    if (filteredAlerts.length === 0) return
    const headers = ['Timestamp', 'Host', 'File_Path', 'Process', 'PID', 'Severity']
    const rows = filteredAlerts.map(a => [
      formatTimestamp(a.timestamp),
      a.host || 'N/A',
      a.path || 'N/A',
      a.process_name || 'N/A',
      a.pid || 'N/A',
      a.severity || 'CRITICAL'
    ])
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(','))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `honeytoken_logs_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const css = `
    .glass { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
  `

  return (
    <div className="h-screen flex flex-col bg-[#020408] font-display text-white overflow-hidden relative">
      <style>{css}</style>

      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.01) 40%, transparent 70%)' }} />
        <svg className="absolute inset-0 w-full h-full opacity-40">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
          <rect fill="url(#grid)" width="100%" height="100%" />
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
            <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-blue-400">format_list_bulleted</span>
            </div>
            <div>
              <h1 className="text-[13px] font-bold text-white/90 tracking-wide leading-tight">FULL AUDIT LOG</h1>
              <p className="text-[10px] text-white/40 font-medium">Decoy File Access History</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.04]">
            <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-white/30 font-bold">RECORDS</span>
            <span className="text-blue-400 font-black">{filteredAlerts.length}</span>
          </div>
          <div className="h-6 w-px bg-white/[0.04] mx-1" />
          <div className="flex gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
            {[{ to: '/', i: 'dashboard' }, { to: '/honeytokens', i: 'key' }, { to: '/alerts', i: 'notifications_active' }].map(l => (
              <Link key={l.to} to={l.to} className="size-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all">
                <span className="material-symbols-outlined text-[18px]">{l.i}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col z-10 w-full max-w-[1600px] mx-auto min-h-0">

        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-end gap-6 mb-8 shrink-0 relative z-20">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-4xl font-black leading-tight tracking-tight drop-shadow-lg">Access Event Logs</h1>
            <div className="flex items-center gap-2">
              <div className="relative flex size-2.5">
                <span className="animate-ping absolute inset-0 rounded-full bg-blue-400 opacity-60" />
                <span className="relative rounded-full size-2.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </div>
              <p className="text-blue-400/80 text-[12px] font-bold tracking-widest uppercase shadow-blue-500/20 drop-shadow-sm">Recording all decentralized interactions</p>
            </div>
          </div>
          <button onClick={exportCSV} className="flex items-center justify-center gap-2 rounded-xl h-11 px-6 bg-white/[0.03] hover:bg-white/[0.1] border border-white/[0.08] transition-all text-white text-[13px] font-bold shadow-xl" type="button">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-[#060b12]/80 border border-white/[0.05] rounded-t-2xl p-4 shrink-0 glass shadow-2xl relative z-20">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-xl">
              <div className="flex w-full items-center rounded-xl h-10 bg-white/[0.02] border border-white/[0.05] focus-within:border-white/20 transition-colors overflow-hidden px-3 gap-2">
                <span className="material-symbols-outlined text-[18px] text-white/30">search</span>
                <input
                  className="w-full bg-transparent border-none text-[13px] text-white focus:outline-none placeholder-white/20 h-full"
                  placeholder="Query by IP, Hostname, Process Name, or PID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-white/20 hover:text-white/60">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-white/[0.02] rounded-xl border border-white/[0.05] p-1">
                {['24h', '7d', '30d', 'All'].map(t => (
                  <button key={t} onClick={() => setTimeFilter(t)} 
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${timeFilter === t ? 'bg-white/[0.08] text-white shadow-md' : 'text-white/30 hover:text-white/60'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="relative">
                <button onClick={() => setSeverityOpen(!severityOpen)} className="flex h-10 items-center justify-between gap-2 min-w-[140px] rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] px-3.5 transition-all" type="button">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white/30 text-[16px]">warning</span>
                    <span className="text-white/60 text-[11px] font-bold">Severity: {severityFilter}</span>
                  </div>
                  <span className="material-symbols-outlined text-white/30 text-[18px]">arrow_drop_down</span>
                </button>
                {severityOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-[#0a111a] border border-white/[0.1] rounded-xl shadow-2xl z-50 overflow-hidden glass">
                    {['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
                      <button key={s} onClick={() => { setSeverityFilter(s); setSeverityOpen(false) }} className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="flex-1 min-h-0 bg-[#060b12]/60 border border-white/[0.05] border-t-0 rounded-b-2xl flex flex-col glass shadow-2xl relative z-10 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-[#060b12] border-b border-white/[0.1] shadow-lg">
                <tr className="text-[11px] font-black text-white/40 uppercase tracking-widest relative">
                  {/* Subtle top light line */}
                  <th colSpan="8" className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent p-0"></th>
                  <th className="py-5 pl-8 pr-4 w-10" />
                  <th className="py-5 px-6 whitespace-nowrap">Assigned Endpoint</th>
                  <th className="py-5 px-6 whitespace-nowrap">Accessed File</th>
                  <th className="py-5 px-6 whitespace-nowrap">Executing Process</th>
                  <th className="py-5 px-6 whitespace-nowrap">Severity</th>
                  <th className="py-5 px-6 whitespace-nowrap text-right pr-12">Timestamp (UTC)</th>
                  <th className="py-5 px-6 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center bg-white/[0.01]">
                      <div className="inline-flex flex-col items-center gap-3">
                        <div className="size-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                        <p className="text-[11px] text-white/30 font-bold tracking-widest">FETCHING LOGS...</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filteredAlerts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center bg-white/[0.01]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-emerald-500/50">verified_user</span>
                        </div>
                        <p className="text-[13px] text-white/40 font-medium">{error || (search ? 'No access records match your search.' : 'Zero deception file access events logged.')}</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && displayedAlerts.map((alert, i) => {
                  const filename = alert.path
                    ? (alert.path.split('\\').pop() || alert.path.split('/').pop() || alert.path)
                    : '—'
                  const sev = alert.severity ? alert.severity.toUpperCase() : 'CRITICAL'
                  const isCritical = sev === 'CRITICAL' || sev === 'HIGH'
                  return (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="pl-6 py-5">
                        <div className={`size-2.5 rounded-full ${isCritical ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]'}`} />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[18px] text-white/20">desktop_windows</span>
                          <span className="font-bold text-white/90 text-[14px]">{alert.host || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 max-w-[300px]">
                          <div className="size-8 rounded-lg border border-white/[0.05] bg-white/[0.02] flex flex-shrink-0 items-center justify-center shadow-inner">
                            <span className="material-symbols-outlined text-white/50 text-[16px]">folder_open</span>
                          </div>
                          <span className="text-[13px] font-bold text-white tracking-wide truncate" title={alert.path}>{filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[13px] font-mono text-white/60 bg-[#060b12] px-2.5 py-1 rounded shadow-inner border border-white/[0.02]">
                            {alert.process_name || 'N/A'}
                          </p>
                          {alert.pid && <span className="text-[11px] text-white/30 font-mono">PID:{alert.pid}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                         <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-black border shadow-[0_0_15px_rgba(239,68,68,0.05)] ${
                           isCritical 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                         }`}>
                          <span className={`w-2 h-2 rounded-full animate-pulse ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`} />
                          {sev}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right pr-12">
                        <span className="font-mono text-[12px] text-white/40">{formatTimestamp(alert.timestamp)}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button className="text-white/20 hover:text-white/80 size-8 rounded-lg hover:bg-white/[0.05] transition-colors flex items-center justify-center" type="button">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between border-t border-white/[0.05] bg-white/[0.01] p-4 shrink-0">
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Rows per page:</p>
              <select 
                className="h-8 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px] font-bold text-white/60 focus:outline-none focus:border-white/20 px-2 cursor-pointer" 
                value={rowsPerPage}
                onChange={e => setRowsPerPage(Number(e.target.value))}
              >
                <option value="10" className="bg-[#060b12]">10</option>
                <option value="20" className="bg-[#060b12]">20</option>
                <option value="50" className="bg-[#060b12]">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
                {filteredAlerts.length > 0 ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredAlerts.length)}` : '0'} OF {filteredAlerts.length}
              </p>
              <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.02]">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="flex items-center justify-center size-7 rounded-lg hover:bg-white/[0.05] text-white/30 disabled:opacity-30 transition-colors" 
                  disabled={currentPage === 1}
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="flex items-center justify-center size-7 rounded-lg bg-blue-500/20 text-blue-400 text-[11px] font-bold border border-blue-500/20" type="button">
                  {currentPage}
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="flex items-center justify-center size-7 rounded-lg hover:bg-white/[0.05] text-white/40 text-[11px] font-bold transition-colors disabled:opacity-30" 
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
