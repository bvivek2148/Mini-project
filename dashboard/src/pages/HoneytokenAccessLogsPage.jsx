import React from 'react'
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
  const honeytokenAlerts = [...alerts]
    .filter(a => a.alert_type === 'honeytoken_access')
    .reverse()
  return (
    <div className="bg-background-light dark:bg-background-dark h-screen overflow-y-auto flex flex-col font-display text-white">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-surface-dark px-10 py-3 bg-background-dark sticky top-0 z-50">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">shield_lock</span>
          </div>
          <Link
            to="/dashboard"
            className="text-white text-lg font-bold leading-tight tracking-[-0.015em] hover:text-white"
            aria-label="Go to Dashboard"
          >
            Ransom Trap
          </Link>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Go back
            </button>
            <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" to="/dashboard">
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-text-secondary hover:text-white transition-colors" type="button">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-surface-dark"
              data-alt="User profile avatar image"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1lPcyHh6_XCOam-YAqNPOeF5F9Gmw8BC4Hys7hJ_1J2mxkyWzZXlRvibIa03dRk_Uv17scBnMKbvZ_RdtbT5hqU-75jTMTy14nae2qe-SUwrR6mPkfogjsaKz1tYHgWYP8dMAikFO3-XWNwG8z-xR-98zaA7U_OeHN9HHnue-J6UpRrBTCGCKx_NINE0dQcw_hv8rUCZHnJ_gfvWhJKGYQ802PJr9Y28OxvdJXq-xPx_bp6WnwEI-Ubj2YCMP9kCKK-hds1ZTmIc")',
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 px-4 md:px-10 py-6 max-w-[1600px] mx-auto w-full flex flex-col">

        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Honeytoken Access Logs</h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <p className="text-text-secondary text-sm font-normal leading-normal">Real-time monitoring active</p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold tracking-[0.015em] shadow-[0_0_15px_rgba(19,127,236,0.4)]" type="button">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="truncate">Export Logs</span>
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-surface-dark/50 border border-surface-dark rounded-xl p-4 mb-6 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-xl">
              <label className="flex w-full items-center rounded-lg h-10 bg-background-dark border border-surface-dark focus-within:border-primary transition-colors overflow-hidden">
                <div className="text-text-secondary flex items-center justify-center pl-3">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="w-full bg-transparent border-none text-white focus:ring-0 placeholder:text-text-secondary/70 h-full px-3 text-sm font-normal"
                  placeholder="Search by IP, File Name, or User Agent..."
                  defaultValue=""
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="flex h-10 items-center gap-2 rounded-lg bg-background-dark border border-surface-dark hover:border-text-secondary/50 px-3 transition-all group" type="button">
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">calendar_today</span>
                <span className="text-text-secondary group-hover:text-white text-sm font-medium">Last 24 Hours</span>
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">keyboard_arrow_down</span>
              </button>
              <button className="flex h-10 items-center gap-2 rounded-lg bg-background-dark border border-surface-dark hover:border-text-secondary/50 px-3 transition-all group" type="button">
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">warning</span>
                <span className="text-text-secondary group-hover:text-white text-sm font-medium">Severity: All</span>
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">keyboard_arrow_down</span>
              </button>
              <button className="flex h-10 items-center gap-2 rounded-lg bg-background-dark border border-surface-dark hover:border-text-secondary/50 px-3 transition-all group" type="button">
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">public</span>
                <span className="text-text-secondary group-hover:text-white text-sm font-medium">Location: All</span>
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">keyboard_arrow_down</span>
              </button>
              <button className="ml-2 text-primary text-sm font-medium hover:underline" type="button">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-surface-dark bg-background-dark flex flex-col shadow-2xl">
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-dark/40 border-b border-surface-dark">
                  <th className="py-4 pl-6 pr-4 text-xs font-semibold uppercase tracking-wider text-text-secondary w-10" />
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Source IP</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Location</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">File Accessed</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">User Agent</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Timestamp (UTC)</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Severity</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-dark">
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-[#92adc9]">
                        <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                        Connecting to server…
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && honeytokenAlerts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#92adc9]">
                        <span className="material-symbols-outlined text-4xl text-green-500">verified_user</span>
                        <span>{error || 'No honeytoken accesses detected — system is clean'}</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && honeytokenAlerts.map((alert, i) => {
                  const filename = alert.path
                    ? (alert.path.split('\\').pop() || alert.path.split('/').pop() || alert.path)
                    : '—'
                  return (
                    <tr key={i} className="group hover:bg-surface-dark/30 transition-colors">
                      <td className="pl-6 py-4">
                        <div className="h-8 w-1 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-white text-sm">{alert.host || '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-[#92adc9]">Local endpoint</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-white">
                          <span className="material-symbols-outlined text-text-secondary text-[18px]">lock</span>
                          <span className="text-sm font-medium">{filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[200px]">
                        <p className="truncate text-sm text-text-secondary">
                          {alert.process_name || '—'} (PID: {alert.pid || '?'})
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm text-text-secondary">{formatTimestamp(alert.timestamp)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          CRITICAL
                        </span>
                      </td>
                      <td className="px-4 py-4 pr-6 text-right">
                        <button className="text-text-secondary hover:text-white p-1 rounded hover:bg-surface-dark transition-colors" type="button">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-surface-dark bg-surface-dark/20 p-4">
            <div className="flex items-center gap-2">
              <p className="text-xs text-text-secondary">Rows per page:</p>
              <select className="h-8 rounded bg-background-dark border-surface-dark text-xs text-white focus:border-primary focus:ring-0" defaultValue="10">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-text-secondary">1-{honeytokenAlerts.length} of {honeytokenAlerts.length}</p>
              <div className="flex items-center gap-1">
                <button className="flex items-center justify-center size-8 rounded hover:bg-surface-dark text-text-secondary disabled:opacity-50" type="button" disabled>
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button className="flex items-center justify-center size-8 rounded bg-primary text-white text-xs font-medium shadow-lg shadow-blue-900/50" type="button">
                  1
                </button>
                <button className="flex items-center justify-center size-8 rounded hover:bg-surface-dark text-text-secondary text-xs font-medium" type="button">
                  2
                </button>
                <button className="flex items-center justify-center size-8 rounded hover:bg-surface-dark text-text-secondary text-xs font-medium" type="button">
                  3
                </button>
                <span className="text-text-secondary text-xs px-1">...</span>
                <button className="flex items-center justify-center size-8 rounded hover:bg-surface-dark text-text-secondary text-xs font-medium" type="button">
                  15
                </button>
                <button className="flex items-center justify-center size-8 rounded hover:bg-surface-dark text-text-secondary" type="button">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
