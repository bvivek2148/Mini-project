import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tokens, setTokens] = useState([])
  const [loadingTokens, setLoadingTokens] = useState(true)
  const [filterTab, setFilterTab] = useState('All')
  const { alerts } = useAlerts(6000)

  // Refresh token list whenever alerts change (new triggers!)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Extension icon mapping
  function TokenIcon({ name }) {
    const ext = (name || '').split('.').pop().toLowerCase()
    const map = {
      xlsx: { icon: 'table_chart', color: 'text-green-500 bg-green-500/10' },
      xls: { icon: 'table_chart', color: 'text-green-500 bg-green-500/10' },
      pdf: { icon: 'picture_as_pdf', color: 'text-red-500 bg-red-500/10' },
      txt: { icon: 'description', color: 'text-slate-400 bg-slate-400/10' },
      sql: { icon: 'database', color: 'text-blue-500 bg-blue-500/10' },
    }
    const { icon, color } = map[ext] || { icon: 'folder_zip', color: 'text-slate-400 bg-slate-400/10' }
    return (
      <div className={`size-8 rounded ${color} flex items-center justify-center`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>
    )
  }

  return (
    <div className="font-display bg-[#111a22] text-white overflow-hidden">
      <div className="flex h-screen w-full">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* Sidebar */}
        <aside className={`w-64 h-full flex-col border-r border-[#2d3b4a] bg-[#0b1219] flex-shrink-0 flex fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <Link className="p-6 flex items-center gap-3" to="/dashboard" onClick={() => setSidebarOpen(false)} aria-label="Dashboard">
            <div className="bg-primary/20 p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary text-2xl">shield</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-base font-bold leading-none">Ransom Trap</span>
              <span className="text-gray-500 text-xs font-medium mt-1">Admin Console</span>
            </div>
          </Link>
          <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c252e] transition-colors group" to="/dashboard" onClick={() => setSidebarOpen(false)}>
              <span className="material-symbols-outlined text-gray-400 group-hover:text-white">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-white transition-colors" to="/honeytokens/manage" onClick={() => setSidebarOpen(false)}>
              <span className="material-symbols-outlined text-primary">bug_report</span>
              <span className="text-sm font-medium">Honeytokens</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c252e] transition-colors group" to="/honeytokens/logs" onClick={() => setSidebarOpen(false)}>
              <span className="material-symbols-outlined text-gray-400 group-hover:text-white">description</span>
              <span className="text-sm font-medium">Access Logs</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c252e] transition-colors group" to="/Incidents" onClick={() => setSidebarOpen(false)}>
              <span className="material-symbols-outlined text-gray-400 group-hover:text-white">notifications_active</span>
              <span className="text-sm font-medium">All Alerts</span>
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0b1219]">
          {/* Header */}
          <header className="h-16 border-b border-[#2d3b4a] bg-[#111a22] flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
            <div className="flex items-center md:hidden gap-3">
              <button className="text-gray-400 hover:text-primary" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <Link className="text-lg font-bold text-white" to="/dashboard" onClick={() => setSidebarOpen(false)}>Ransom Trap</Link>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              {!loadingTokens && (
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${activeAlerts > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
                  {activeAlerts > 0 ? `${activeAlerts} TRIGGERED` : 'All Clear'}
                </span>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              {/* Heading */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Honeytoken Management</h2>
                  <p className="text-gray-400 text-base">Deployed deception files — monitored for unauthorized access.</p>
                </div>
                <Link
                  to="/honeytokens/logs"
                  className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">open_in_new</span>
                  View Access Logs
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1c252e] p-6 rounded-xl border border-[#2d3b4a] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 font-medium">Total Deployed</span>
                    <span className="bg-blue-500/10 text-blue-500 p-1.5 rounded-lg material-symbols-outlined">folder_open</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{loadingTokens ? '—' : totalDeployed}</span>
                    <span className="text-sm text-gray-400">files</span>
                  </div>
                </div>
                <div className="bg-[#1c252e] p-6 rounded-xl border border-red-500/20 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`font-medium ${activeAlerts > 0 ? 'text-red-400' : 'text-gray-400'}`}>Triggered Alerts</span>
                      <span className={`text-red-500 p-1.5 rounded-lg material-symbols-outlined ${activeAlerts > 0 ? 'animate-pulse' : ''}`}>warning</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{loadingTokens ? '—' : activeAlerts}</span>
                      {activeAlerts > 0 && <span className="text-sm text-red-500 font-medium">Critical</span>}
                    </div>
                  </div>
                </div>
                <div className="bg-[#1c252e] p-6 rounded-xl border border-[#2d3b4a] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 font-medium">Access Events</span>
                    <span className="bg-green-500/10 text-green-500 p-1.5 rounded-lg material-symbols-outlined">health_and_safety</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{honeytokenAlerts.length}</span>
                    <span className="text-sm text-gray-400">total</span>
                  </div>
                  {honeytokenAlerts.length > 0 && (
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min(honeytokenAlerts.length * 10, 100)}%` }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Filters + Table */}
              <div className="flex flex-col bg-[#1c252e] rounded-xl border border-[#2d3b4a] shadow-sm">
                {/* Toolbar */}
                <div className="p-4 border-b border-[#2d3b4a] flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex gap-1">
                      {['All', 'Monitoring', 'Triggered'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setFilterTab(tab)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterTab === tab ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                          type="button"
                        >
                          {tab}
                          {tab === 'Triggered' && activeAlerts > 0 && (
                            <span className="ml-1.5 text-[10px] bg-red-500/20 text-red-400 px-1 rounded">{activeAlerts}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 hidden sm:inline">
                    {displayed.length} of {tokens.length} tokens
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-[#111a22]/50 border-b border-[#2d3b4a]">
                      <tr>
                        <th className="px-6 py-3 font-medium" scope="col">Token File</th>
                        <th className="px-6 py-3 font-medium" scope="col">Location</th>
                        <th className="px-6 py-3 font-medium" scope="col">Status</th>
                        <th className="px-6 py-3 font-medium" scope="col">Last Host</th>
                        <th className="px-6 py-3 font-medium text-right" scope="col">Last Alert</th>
                        <th className="px-6 py-3 font-medium text-center" scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2d3b4a]">
                      {loadingTokens && (
                        <tr><td colSpan={6} className="py-12 text-center">
                          <div className="flex items-center justify-center gap-2 text-gray-400">
                            <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                            Loading honeytokens…
                          </div>
                        </td></tr>
                      )}
                      {!loadingTokens && displayed.length === 0 && (
                        <tr><td colSpan={6} className="py-12 text-center text-gray-500">No honeytokens match this filter</td></tr>
                      )}
                      {!loadingTokens && displayed.map((token, i) => (
                        <tr key={i} className={`transition-colors group ${token.status === 'TRIGGERED' ? 'bg-red-900/5 hover:bg-red-900/10' : 'hover:bg-white/5'}`}>
                          <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <TokenIcon name={token.name} />
                              <div className="flex flex-col">
                                <span>{token.name}</span>
                                <span className={`text-xs font-normal ${token.status === 'TRIGGERED' ? 'text-red-400' : 'text-gray-500'}`}>
                                  {token.status === 'TRIGGERED' ? 'Compromised' : 'Monitoring'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-gray-400 break-all">{token.path}</span>
                          </td>
                          <td className="px-6 py-4">
                            {token.status === 'TRIGGERED' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-900/50">
                                <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                                TRIGGERED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50">
                                <span className="size-1.5 rounded-full bg-green-500" />
                                Monitoring
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs">{token.host || '—'}</td>
                          <td className="px-6 py-4 text-right font-mono text-xs">
                            <span className={token.status === 'TRIGGERED' ? 'text-red-400 font-bold' : ''}>
                              {formatLastAlert(token.last_alert_ts)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Link to="/honeytokens/logs" className="text-gray-400 hover:text-primary transition-colors" title="View Logs">
                                <span className="material-symbols-outlined">visibility</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-[#2d3b4a]">
                  <span className="text-sm text-gray-400">
                    Showing <span className="font-semibold text-white">{displayed.length}</span> of{' '}
                    <span className="font-semibold text-white">{tokens.length}</span> honeytokens
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
