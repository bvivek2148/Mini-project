import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'

function formatTs(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString([], {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
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
  a.href = url; a.download = 'process_termination_log.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function ProcessTerminationLogPage() {
  const { alerts, loading, error } = useAlerts(5000)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')

  // Treat all alerts as detection events shown in this log
  const rows = useMemo(() => {
    return alerts.map(a => ({
      ...a,
      severity: a.alert_type === 'ransomware_suspected' ? 'Critical' : 'High',
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

  function SeverityBadge({ severity }) {
    const cls = {
      Critical: 'bg-red-50 dark:bg-red-400/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10 dark:ring-red-400/20',
      High: 'bg-orange-50 dark:bg-orange-400/10 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-600/10 dark:ring-orange-400/20',
    }[severity] || 'bg-gray-100 text-gray-600 px-2 py-1 text-xs font-medium'
    return <span className={`inline-flex items-center rounded-md ${cls}`}>{severity}</span>
  }

  return (
    <div className="bg-background-light dark:bg-background-dark h-screen overflow-y-auto font-display text-slate-900 dark:text-white transition-colors duration-200">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-[#233648] bg-white dark:bg-[#111a22] px-6 py-3 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-primary size-8 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">shield_lock</span>
            </div>
            <Link to="/dashboard" className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight hover:text-primary transition-colors" aria-label="Dashboard">
              Ransom Trap
            </Link>
          </div>
          <nav className="hidden lg:flex items-center gap-8 flex-1 ml-8">
            <Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors" to="/dashboard">Dashboard</Link>
            <Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors" to="/Incidents">Incidents</Link>
            <span className="text-primary font-medium text-sm">Logs</span>
          </nav>
        </header>

        <div className="flex flex-1 justify-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col w-full max-w-7xl flex-1 gap-6">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <Link className="text-slate-500 dark:text-[#92adc9] hover:text-primary font-medium" to="/dashboard">Dashboard</Link>
              <span className="text-slate-400 dark:text-[#586e84] font-medium">/</span>
              <span className="text-slate-900 dark:text-white font-semibold">Alert Log</span>
            </div>

            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    Detection Event Log
                  </h1>
                  {!loading && !error && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      Live
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-[#92adc9] text-base font-normal max-w-2xl">
                  Full audit trail of all detection events recorded by the Ransom Trap agent.
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => exportCSV(filtered)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-5 h-10 text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Export CSV
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#192633] border border-gray-200 dark:border-[#324d67] shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-[#92adc9] text-sm font-medium">Total Events</p>
                  <span className="material-symbols-outlined text-slate-400 dark:text-[#586e84]">bar_chart</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">{loading ? '—' : rows.length}</p>
                  {!loading && <p className="text-emerald-500 text-sm font-bold">All time</p>}
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#192633] border border-red-300 dark:border-red-900/40 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-[#92adc9] text-sm font-medium">Ransomware Detected</p>
                  <span className="material-symbols-outlined text-red-400">gpp_bad</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">{loading ? '—' : ransomwareCount}</p>
                  {ransomwareCount > 0 && <p className="text-red-500 text-sm font-bold">CRITICAL</p>}
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#192633] border border-gray-200 dark:border-[#324d67] shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-[#92adc9] text-sm font-medium">Honeytoken Access</p>
                  <span className="material-symbols-outlined text-orange-400">warning</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">{loading ? '—' : honeytokenCount}</p>
                  {!loading && <p className="text-orange-400 text-sm font-bold">{honeytokenCount > 0 ? 'Alerts' : 'None'}</p>}
                </div>
              </div>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-[#111a22] p-4 rounded-xl border border-gray-200 dark:border-[#233648] shadow-sm">
              <div className="flex-1">
                <div className="relative flex w-full items-stretch">
                  <input
                    className="w-full rounded-l-lg border border-gray-300 dark:border-[#324d67] bg-gray-50 dark:bg-[#192633] px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-[#92adc9] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Search PID, process name, host..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <button className="flex items-center justify-center rounded-r-lg border border-l-0 border-gray-300 dark:border-[#324d67] bg-gray-100 dark:bg-[#233648] px-3 text-slate-500 dark:text-white">
                    <span className="material-symbols-outlined">search</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <div className="relative">
                  <select
                    className="h-full appearance-none rounded-lg border border-gray-300 dark:border-[#324d67] bg-gray-50 dark:bg-[#192633] pl-3 pr-10 text-sm text-slate-700 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={severityFilter}
                    onChange={e => setSeverityFilter(e.target.value)}
                  >
                    <option>All</option>
                    <option>Critical</option>
                    <option>High</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Main Table */}
            <div className="relative flex flex-col rounded-xl border border-gray-200 dark:border-[#233648] bg-white dark:bg-[#111a22] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-[#192633] text-xs uppercase text-slate-500 dark:text-[#92adc9]">
                    <tr>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">Timestamp</th>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">Severity</th>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">Process Name</th>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">PID</th>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">Host</th>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">Alert Type</th>
                      <th className="px-6 py-4 font-semibold tracking-wider text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#233648] border-t border-gray-100 dark:border-[#233648]">
                    {loading && (
                      <tr><td colSpan={7} className="py-12 text-center text-[#92adc9]">
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                          Connecting to server…
                        </div>
                      </td></tr>
                    )}
                    {!loading && error && (
                      <tr><td colSpan={7} className="py-12 text-center text-red-400">{error}</td></tr>
                    )}
                    {!loading && !error && filtered.length === 0 && (
                      <tr><td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#92adc9]">
                          <span className="material-symbols-outlined text-4xl text-green-500">verified_user</span>
                          <span>No detection events match your filter</span>
                        </div>
                      </td></tr>
                    )}
                    {!loading && !error && [...filtered].reverse().map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors group">
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap text-xs">{formatTs(r.timestamp)}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><SeverityBadge severity={r.severity} /></td>
                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium font-mono text-xs">{r.process_name || '—'}</td>
                        <td className="px-6 py-4 font-mono text-primary text-xs">{r.pid || '—'}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">{r.host || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center gap-1.5 font-medium text-xs ${r.alert_type === 'ransomware_suspected' ? 'text-red-400' : 'text-orange-400'}`}>
                            <span className="material-symbols-outlined text-[16px]">{r.alert_type === 'ransomware_suspected' ? 'gpp_bad' : 'key'}</span>
                            {r.alert_type === 'ransomware_suspected' ? 'RANSOMWARE' : 'HONEYTOKEN'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/alerts/${alerts.indexOf(r)}`}
                            className="text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-[#233648] bg-gray-50 dark:bg-[#111a22] px-6 py-3">
                <div className="text-sm text-slate-500 dark:text-[#92adc9]">
                  Showing <span className="font-medium text-slate-900 dark:text-white">{filtered.length}</span> of{' '}
                  <span className="font-medium text-slate-900 dark:text-white">{rows.length}</span> events
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
