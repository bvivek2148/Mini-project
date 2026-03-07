import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'

function formatTs(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString([], {
    year: 'numeric', month: 'short', day: '2-digit',
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

function exportCSV(rows) {
  const header = ['Timestamp', 'Severity', 'Process Name', 'PID', 'Alert Type', 'Action', 'Host']
  const lines = rows.map(r => [
    formatTs(r.timestamp), r.severity, r.process_name || '—', r.pid || '—',
    r.alert_type, 'LOGGED', r.host || '—',
  ].map(v => `"${v}"`).join(','))
  const csv = [header.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'detection_event_log.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function ProcessTerminationLogPage() {
  const navigate = useNavigate()
  const { alerts, loading, error } = useAlerts(5000)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')

  const rows = useMemo(() => {
    return alerts.map((a, idx) => ({
      ...a,
      severity: a.alert_type === 'ransomware_suspected' ? 'Critical' : 'High',
      _alertIndex: idx,
    }))
  }, [alerts])

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const q = search.toLowerCase()
      const matchSearch = !q || [r.process_name, r.host, String(r.pid), r.alert_type]
        .some(v => (v || '').toLowerCase().includes(q))
      const matchSeverity = severityFilter === 'All' || r.severity === severityFilter
      return matchSearch && matchSeverity
    })
  }, [rows, search, severityFilter])

  const ransomwareCount = rows.filter(r => r.alert_type === 'ransomware_suspected').length
  const honeytokenCount = rows.filter(r => r.alert_type === 'honeytoken_access').length
  const criticalPercent = rows.length > 0 ? Math.round((ransomwareCount / rows.length) * 100) : 0

  /* ── Inline SVG icons (guaranteed to render) ── */
  const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
  const KeyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  )
  const SkullIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" />
      <path d="M8 20v2h8v-2" /><path d="M12.5 2C7.25 2 4 5.81 4 10.5 4 15.19 7.25 18 12 18s8-2.81 8-7.5C20 5.81 16.75 2 12.5 2z" />
    </svg>
  )
  const BarChartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
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
            <div className="size-9 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Detection Event Log</h1>
              <p className="text-[11px] text-text-secondary">Process termination · Threat audit trail</p>
            </div>
          </div>

          {!loading && !error && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 ml-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              LIVE
            </span>
          )}
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
          <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span className="hidden md:inline">Settings</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8">

        {/* ── OVERVIEW SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">

          {/* Stat Card: Total Events */}
          <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="size-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
                <BarChartIcon />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-white/5 px-2.5 py-1 rounded-full">All Time</span>
            </div>
            <p className="text-3xl font-black tracking-tight">{loading ? '—' : rows.length}</p>
            <p className="text-sm text-text-secondary mt-1">Total Events</p>
            <div className="absolute -bottom-4 -right-4 size-24 rounded-full bg-primary/5 blur-2xl" />
          </div>

          {/* Stat Card: Ransomware */}
          <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-red-500/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="size-11 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center text-red-400">
                <SkullIcon />
              </div>
              {ransomwareCount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">Critical</span>
              )}
            </div>
            <p className="text-3xl font-black tracking-tight text-red-400">{loading ? '—' : ransomwareCount}</p>
            <p className="text-sm text-text-secondary mt-1">Ransomware Detected</p>
            <div className="absolute -bottom-4 -right-4 size-24 rounded-full bg-red-500/5 blur-2xl" />
          </div>

          {/* Stat Card: Honeytoken */}
          <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-amber-500/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-400">
                <KeyIcon />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">{criticalPercent}% Critical</span>
            </div>
            <p className="text-3xl font-black tracking-tight text-amber-400">{loading ? '—' : honeytokenCount}</p>
            <p className="text-sm text-text-secondary mt-1">Honeytoken Access</p>
            <div className="absolute -bottom-4 -right-4 size-24 rounded-full bg-amber-500/5 blur-2xl" />
          </div>

          {/* Severity Breakdown mini-visual */}
          <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
                <ShieldIcon />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Protected</span>
            </div>
            <p className="text-sm text-text-secondary mb-3">Severity Breakdown</p>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1.5 h-8">
              <div className="flex-1 bg-red-500/80 rounded-t" style={{ height: rows.length > 0 ? `${Math.max((ransomwareCount / rows.length) * 100, 8)}%` : '8%' }} title={`Critical: ${ransomwareCount}`} />
              <div className="flex-1 bg-amber-500/80 rounded-t" style={{ height: rows.length > 0 ? `${Math.max((honeytokenCount / rows.length) * 100, 8)}%` : '8%' }} title={`High: ${honeytokenCount}`} />
            </div>
            <div className="flex justify-between text-[10px] text-text-secondary mt-1.5">
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-red-500" />Critical</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-amber-500" />High</span>
            </div>
            <div className="absolute -bottom-4 -right-4 size-24 rounded-full bg-emerald-500/5 blur-2xl" />
          </div>
        </div>

        {/* ── FILTERS & ACTIONS BAR ── */}
        <div className="bg-surface-dark/50 border border-white/5 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50 text-[18px]">search</span>
              <input
                className="w-full bg-background-dark border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-text-secondary/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                placeholder="Search by PID, process name, host, or alert type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {['All', 'Critical', 'High'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${severityFilter === sev
                    ? sev === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : sev === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/5 text-text-secondary border border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {sev}
                </button>
              ))}
            </div>
            <button
              onClick={() => exportCSV(filtered)}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* ── EVENT LOG TABLE ── */}
        <div className="bg-surface-dark/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-background-dark/60">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Timestamp</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Severity</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Process</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">PID</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Host</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Alert Type</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading && (
                  <tr><td colSpan={7} className="py-28 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="size-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-text-secondary text-sm">Connecting to detection engine…</span>
                    </div>
                  </td></tr>
                )}
                {!loading && error && (
                  <tr><td colSpan={7} className="py-28 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="size-14 rounded-full bg-red-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-400 text-[28px]">error</span>
                      </div>
                      <div>
                        <p className="text-red-400 font-semibold text-sm">Connection Error</p>
                        <p className="text-text-secondary text-xs mt-1">{error}</p>
                      </div>
                    </div>
                  </td></tr>
                )}
                {!loading && !error && filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-28 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="size-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-emerald-400 text-[28px]">verified_user</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">No Matching Events</p>
                        <p className="text-text-secondary text-xs mt-1">Try adjusting your search or severity filter</p>
                      </div>
                    </div>
                  </td></tr>
                )}
                {!loading && !error && [...filtered].reverse().map((r, i) => {
                  const isRansomware = r.alert_type === 'ransomware_suspected'
                  return (
                    <tr key={i} className={`transition-colors group ${isRansomware ? 'hover:bg-red-500/[0.03]' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`size-2 rounded-full flex-shrink-0 ${isRansomware ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                          <div>
                            <span className="font-mono text-white/80 text-xs">{formatTs(r.timestamp)}</span>
                            <span className="block text-[10px] text-text-secondary/50 font-mono mt-0.5">{timeAgo(r.timestamp)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${r.severity === 'Critical'
                          ? 'text-red-400 bg-red-500/15'
                          : 'text-amber-400 bg-amber-500/15'
                          }`}>
                          <span className={`size-1.5 rounded-full ${r.severity === 'Critical' ? 'bg-red-400' : 'bg-amber-400'}`} />
                          {r.severity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {r.process_name ? (
                          <code className="text-white text-xs bg-white/5 px-2 py-0.5 rounded border border-white/5">{r.process_name}</code>
                        ) : (
                          <span className="text-text-secondary/30 text-xs italic">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {r.pid ? (
                          <code className="font-mono text-primary text-xs font-semibold">{r.pid}</code>
                        ) : (
                          <span className="text-text-secondary/30 text-xs italic">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/70">{r.host || '—'}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${isRansomware
                          ? 'text-red-400 bg-red-500/15'
                          : 'text-amber-400 bg-amber-500/15'
                          }`}>
                          {isRansomware ? '⚠' : '🔑'} {isRansomware ? 'Ransomware' : 'Honeytoken'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/alerts/${r._alertIndex}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all opacity-50 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 bg-background-dark/40">
            <div className="text-xs text-text-secondary">
              Showing <span className="font-bold text-white">{filtered.length}</span> of{' '}
              <span className="font-bold text-white">{rows.length}</span> detection events
            </div>
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Auto-refresh: 5s
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
