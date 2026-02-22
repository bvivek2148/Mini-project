import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'

function formatTimestamp(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

function SeverityBadge({ alertType }) {
  if (alertType === 'ransomware_suspected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        CRITICAL
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
      HIGH
    </span>
  )
}

export default function RealTimeAlertsPage() {
  const [search, setSearch] = useState('')
  const { alerts, loading, error } = useAlerts(3000)
  const navigate = useNavigate()

  const sortedAlerts = [...alerts].reverse()
  const filtered = sortedAlerts.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (a.host || '').toLowerCase().includes(q) ||
      (a.process_name || '').toLowerCase().includes(q) ||
      (a.alert_type || '').toLowerCase().includes(q) ||
      (a.path || '').toLowerCase().includes(q)
    )
  })
  return (
    <div className="flex h-screen w-full">
      {/* SIDEBAR */}
      <aside className="flex w-64 flex-col border-r border-border-dark bg-[#111a22] flex-shrink-0 transition-all duration-300">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border-dark/50">
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full size-10 bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/20"
            data-alt="Abstract gradient logo representing security shield"
          />
          <div className="flex flex-col">
            <h1 className="text-white text-base font-bold leading-none tracking-tight">
              Ransom Trap
            </h1>
            <p className="text-[#92adc9] text-xs font-medium mt-1">Security Console</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-4 mt-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-border-dark hover:text-white transition-colors cursor-pointer group">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors" style={{ fontSize: 24 }}>
              grid_view
            </span>
            <p className="text-sm font-medium">Dashboard</p>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-white cursor-pointer relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>
              warning
            </span>
            <p className="text-sm font-medium">Alerts</p>
            <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">12</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-border-dark hover:text-white transition-colors cursor-pointer group">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors" style={{ fontSize: 24 }}>
              dns
            </span>
            <p className="text-sm font-medium">Devices</p>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-border-dark hover:text-white transition-colors cursor-pointer group">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors" style={{ fontSize: 24 }}>
              manage_accounts
            </span>
            <p className="text-sm font-medium">Analysts</p>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-border-dark hover:text-white transition-colors cursor-pointer group">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors" style={{ fontSize: 24 }}>
              settings
            </span>
            <p className="text-sm font-medium">Settings</p>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-border-dark/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-8 border border-border-dark"
              data-alt="User profile picture of a security analyst"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC7EPPE5H-9yQ0vT2r3Z-tdZggnU1KMzPgr9fSG1YQymr71fYN1o00G6hLuTdfMYeLAYkRiVLaFWIRLFBwzKYPxa271aNVKjSt0W223oT1XgNflCTTfKqoQGJZwk19UpxoIETm0l9ey02gxnYHqHyV6-Oy1OxB9dekLy_W3Mk_mzYT9X80PN8TzkDtTXfz5iOg87scUNRISxVg9H7pcKboeHkI4zg1_Wq_DARrxRTz5d3nFYRKymln9Ne_z8OipgvigBk6Ui3f9how")',
              }}
            />
            <div className="flex flex-col">
              <p className="text-white text-sm font-medium">Alex Chen</p>
              <p className="text-[#92adc9] text-xs">Senior Analyst</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-dark">
        {/* Header Section */}
        <header className="flex flex-col px-6 py-6 gap-6 bg-background-dark/95 backdrop-blur z-10 sticky top-0 border-b border-border-dark/50">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-white text-2xl font-bold tracking-tight">Security Alerts</h2>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
              </div>
              <p className="text-[#92adc9] text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ fontSize: 16 }}>
                  wifi_tethering
                </span>
                Live Feed •{' '}
                {loading ? 'Connecting…' : error ? <span className="text-red-400">{error}</span> : `${filtered.length} alert(s) shown`}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border-dark bg-transparent px-4 text-sm font-medium text-white hover:bg-border-dark transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  upload
                </span>
                Export CSV
              </button>
              <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  play_arrow
                </span>
                Run Playbook
              </button>
            </div>
          </div>

          {/* Toolbar (Search & Filters) */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-lg relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#92adc9] group-focus-within:text-primary transition-colors" style={{ fontSize: 20 }}>
                  search
                </span>
              </div>
              <input
                className="block w-full rounded-lg border-none bg-[#233648] py-2.5 pl-10 pr-4 text-white placeholder-[#92adc9] focus:ring-2 focus:ring-primary focus:bg-[#2b4257] sm:text-sm transition-all"
                placeholder="Search IP, Hostname, Threat ID..."
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              <button className="flex h-9 items-center gap-2 rounded-lg bg-[#233648] px-3 hover:bg-[#2f465c] transition-colors border border-transparent hover:border-primary/30">
                <span className="text-white text-xs font-medium">Severity:</span>
                <span className="text-primary text-xs font-bold">All</span>
                <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: 18 }}>
                  expand_more
                </span>
              </button>
              <button className="flex h-9 items-center gap-2 rounded-lg bg-[#233648] px-3 hover:bg-[#2f465c] transition-colors border border-transparent hover:border-primary/30">
                <span className="text-white text-xs font-medium">Status:</span>
                <span className="text-primary text-xs font-bold">Active</span>
                <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: 18 }}>
                  expand_more
                </span>
              </button>
              <button className="flex h-9 items-center gap-2 rounded-lg bg-[#233648] px-3 hover:bg-[#2f465c] transition-colors border border-transparent hover:border-primary/30">
                <span className="text-white text-xs font-medium">Time:</span>
                <span className="text-white text-xs">Last 24h</span>
                <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: 18 }}>
                  expand_more
                </span>
              </button>
              <button className="flex h-9 items-center gap-2 rounded-lg bg-[#233648] px-3 hover:bg-[#2f465c] transition-colors border border-transparent hover:border-primary/30">
                <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: 18 }}>
                  filter_list
                </span>
                <span className="text-white text-xs font-medium">More Filters</span>
              </button>
            </div>
          </div>
        </header>

        {/* Table Section */}
        <div className="flex-1 overflow-auto px-6 pb-6 relative">
          <div className="min-w-full inline-block align-middle">
            <div className="rounded-lg border border-border-dark bg-[#16202a] overflow-hidden">
              <table className="min-w-full divide-y divide-border-dark">
                <thead className="bg-[#1c2834]">
                  <tr>
                    <th className="px-6 py-4 text-left" scope="col">
                      <div className="flex items-center">
                        <input
                          className="h-4 w-4 rounded border-gray-600 bg-[#233648] text-primary focus:ring-primary focus:ring-offset-[#16202a]"
                          type="checkbox"
                        />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-[#92adc9] uppercase tracking-wider"
                      scope="col"
                    >
                      Severity
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-[#92adc9] uppercase tracking-wider"
                      scope="col"
                    >
                      Timestamp
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-[#92adc9] uppercase tracking-wider"
                      scope="col"
                    >
                      Threat Type
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-[#92adc9] uppercase tracking-wider"
                      scope="col"
                    >
                      Host / IP
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-[#92adc9] uppercase tracking-wider"
                      scope="col"
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-[#92adc9] uppercase tracking-wider"
                      scope="col"
                    >
                      Assignee
                    </th>
                    <th className="relative px-6 py-3" scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark bg-[#16202a]">
                  {loading && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-[#92adc9]">
                          <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                          Connecting to server…
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#92adc9]">
                          <span className="material-symbols-outlined text-4xl text-green-500">verified_user</span>
                          <span>{error ? error : 'No alerts yet — system is clean'}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.map((alert, i) => {
                    const originalIdx = alerts.indexOf(alert)
                    return (
                      <tr key={i} onClick={() => navigate(`/alerts/${originalIdx}`)} className="hover:bg-[#1e2c3b] group transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input className="h-4 w-4 rounded border-gray-600 bg-[#233648] text-primary" type="checkbox" onClick={e => e.stopPropagation()} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <SeverityBadge alertType={alert.alert_type} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                          {formatTimestamp(alert.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {alert.alert_type === 'ransomware_suspected' ? 'Ransomware Suspected' : 'Honeytoken Access'}
                          </div>
                          <div className="text-xs text-[#92adc9]">
                            {alert.path ? `File: ${alert.path.split('\\').pop() || alert.path.split('/').pop()}` : `PID: ${alert.pid || '—'}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{alert.host || '—'}</div>
                          <div className="text-xs text-[#92adc9] font-mono">{alert.process_name || 'unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary border border-primary/20">
                            New
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px] text-white font-bold">--</div>
                            <span className="text-sm text-[#92adc9] italic">Unassigned</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-[#92adc9] hover:text-white transition-colors p-1 hover:bg-[#233648] rounded" onClick={e => e.stopPropagation()}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>open_in_new</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Footer / Pagination */}
              <div className="bg-[#16202a] px-6 py-3 border-t border-border-dark flex items-center justify-between">
                <div className="text-xs text-[#92adc9]">
                  Showing <span className="text-white font-medium">{filtered.length}</span> of{' '}
                  <span className="text-white font-medium">{alerts.length}</span> alerts
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center justify-center h-8 w-8 rounded border border-border-dark text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors disabled:opacity-50"
                    disabled
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      chevron_left
                    </span>
                  </button>
                  <button className="flex items-center justify-center h-8 w-8 rounded bg-primary text-white font-medium text-xs">
                    1
                  </button>
                  <button className="flex items-center justify-center h-8 w-8 rounded border border-border-dark text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors">
                    2
                  </button>
                  <button className="flex items-center justify-center h-8 w-8 rounded border border-border-dark text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors">
                    3
                  </button>
                  <button className="flex items-center justify-center h-8 w-8 rounded border border-border-dark text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>


      </main>
    </div>
  )
}
