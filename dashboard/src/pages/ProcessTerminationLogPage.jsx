import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ProcessTerminationLogPage() {
  const [incidentsMenuOpen, setIncidentsMenuOpen] = useState(false)
  return (
    <div className="bg-background-light dark:bg-background-dark h-screen overflow-y-auto font-display text-slate-900 dark:text-white transition-colors duration-200">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-[#233648] bg-white dark:bg-[#111a22] px-6 py-3 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-primary size-8 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">shield_lock</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">SentinelGuard</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors"
                to="/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors"
                to="/alerts/real-time"
              >
                Incidents
              </Link>
              <span className="text-primary font-medium text-sm">Logs</span>
              <Link
                className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors"
                to="/config/thresholds"
              >
                Configuration
              </Link>
            </nav>
            <div className="flex gap-3 items-center border-l border-gray-200 dark:border-[#233648] pl-6">
              <button className="flex size-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#233648] text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#324d67] transition-colors relative">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#233648]" />
              </button>
              <button className="flex size-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#233648] text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#324d67] transition-colors">
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
              </button>
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-gray-200 dark:ring-[#233648]"
                data-alt="User profile avatar showing a generic silhouette"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuALLNn9-riEA9P4As8_yqRjiNnLpuQVgzjYuvpBH3QNF-PuGTASiMJtfCU0F40kVoeItM5vV7vEiJQB9vQ9QByV27fz5N3ZHvSMluHutC1PAMCchkQVnDGlOyZMqrAdld9PSNu1-7cBbpMciBugyo8h0nM63_uLRp2nGmj1VfRE_SGUb3Hme9DwSeCcLLBOI1cE9tcXNaUlU3x-1TfxQRzN54UcR7FpWUL2cSsD-PBwzw3CYsnFiIUeFovv1QYA-msJNdb0gApyyYg")',
                }}
              />
            </div>
          </div>
        </header>

        <div className="flex flex-1 justify-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col w-full max-w-7xl flex-1 gap-6">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <Link className="text-slate-500 dark:text-[#92adc9] hover:text-primary font-medium" to="/dashboard">
                Dashboard
              </Link>
              <span className="text-slate-400 dark:text-[#586e84] font-medium">/</span>

              <div className="relative inline-flex items-center">
                <Link
                  className="text-slate-500 dark:text-[#92adc9] hover:text-primary font-medium"
                  to="/alerts/real-time"
                  onClick={() => setIncidentsMenuOpen(false)}
                >
                  Incidents
                </Link>
                <button
                  type="button"
                  className="ml-1 inline-flex items-center justify-center text-slate-400 dark:text-[#586e84] hover:text-primary dark:hover:text-white transition-colors"
                  aria-label="Incidents menu"
                  onClick={() => setIncidentsMenuOpen((v) => !v)}
                >
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>

                {incidentsMenuOpen ? (
                  <div className="absolute left-0 top-full mt-2 min-w-52 rounded-lg border border-gray-200 dark:border-[#233648] bg-white dark:bg-[#111a22] shadow-lg z-50 overflow-hidden">
                    <Link
                      className="block px-3 py-2 text-sm text-slate-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors"
                      to="/alerts/R-2024-001"
                      onClick={() => setIncidentsMenuOpen(false)}
                    >
                      R-2024-001
                    </Link>
                    <Link
                      className="block px-3 py-2 text-sm text-slate-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors"
                      to="/processes/termination-log"
                      onClick={() => setIncidentsMenuOpen(false)}
                    >
                      Termination Log
                    </Link>
                  </div>
                ) : null}
              </div>

              <span className="text-slate-400 dark:text-[#586e84] font-medium">/</span>
              <span className="text-slate-900 dark:text-white font-semibold">Termination Log</span>
            </div>

            {/* Page Heading & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    Process Termination Log
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Monitoring Active
                  </span>
                </div>
                <p className="text-slate-500 dark:text-[#92adc9] text-base font-normal max-w-2xl">
                  Audit trail of automated responses to suspicious process activities detected by SentinelGuard engine.
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-[#233648] text-slate-700 dark:text-white px-4 h-10 text-sm font-bold hover:bg-gray-200 dark:hover:bg-[#324d67] transition-colors">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                  Config
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-5 h-10 text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Export CSV
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#192633] border border-gray-200 dark:border-[#324d67] shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-[#92adc9] text-sm font-medium">Total Terminations (24h)</p>
                  <span className="material-symbols-outlined text-slate-400 dark:text-[#586e84]">bar_chart</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">42</p>
                  <p className="text-emerald-500 text-sm font-bold flex items-center">
                    <span className="material-symbols-outlined text-sm">trending_up</span> +12%
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#192633] border border-gray-200 dark:border-[#324d67] shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-[#92adc9] text-sm font-medium">False Positives</p>
                  <span className="material-symbols-outlined text-slate-400 dark:text-[#586e84]">check_circle</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">1</p>
                  <p className="text-slate-400 dark:text-[#586e84] text-sm font-medium">0% change</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#192633] border border-gray-200 dark:border-[#324d67] shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-[#92adc9] text-sm font-medium">Active Threats</p>
                  <span className="material-symbols-outlined text-red-500 dark:text-red-400">warning</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">0</p>
                  <p className="text-emerald-500 text-sm font-bold">Secure</p>
                </div>
              </div>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-[#111a22] p-4 rounded-xl border border-gray-200 dark:border-[#233648] shadow-sm">
              <div className="flex-1">
                <div className="relative flex w-full items-stretch">
                  <input
                    className="w-full rounded-l-lg border border-gray-300 dark:border-[#324d67] bg-gray-50 dark:bg-[#192633] px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-[#92adc9] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Search PID, Name, Hash or Path..."
                  />
                  <button className="flex items-center justify-center rounded-r-lg border border-l-0 border-gray-300 dark:border-[#324d67] bg-gray-100 dark:bg-[#233648] px-3 text-slate-500 dark:text-white hover:bg-gray-200 dark:hover:bg-[#324d67]">
                    <span className="material-symbols-outlined">search</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-[#324d67] bg-gray-50 dark:bg-[#192633] px-3 py-2.5">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                  <span className="text-sm text-slate-700 dark:text-white whitespace-nowrap">Last 24 Hours</span>
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
                </div>
                <div className="relative">
                  <select className="h-full appearance-none rounded-lg border border-gray-300 dark:border-[#324d67] bg-gray-50 dark:bg-[#192633] pl-3 pr-10 text-sm text-slate-700 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>All Severities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </span>
                </div>
                <div className="relative">
                  <select className="h-full appearance-none rounded-lg border border-gray-300 dark:border-[#324d67] bg-gray-50 dark:bg-[#192633] pl-3 pr-10 text-sm text-slate-700 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>All Statuses</option>
                    <option>Terminated</option>
                    <option>Quarantined</option>
                    <option>Failed</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Main Data Table */}
            <div className="relative flex flex-col rounded-xl border border-gray-200 dark:border-[#233648] bg-white dark:bg-[#111a22] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-[#192633] text-xs uppercase text-slate-500 dark:text-[#92adc9]">
                    <tr>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">Timestamp</th>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">Severity</th>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">Process Name</th>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">PID</th>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">Threat Signature</th>
                      <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">Action Taken</th>
                      <th className="px-6 py-4 font-semibold tracking-wider text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#233648] border-t border-gray-100 dark:border-[#233648]">
                    <tr className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">2023-10-27 14:23:01</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-400/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10 dark:ring-red-400/20">
                          Critical
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">svchost.exe</td>
                      <td className="px-6 py-4 font-mono text-primary cursor-pointer hover:underline">4492</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">Ransom.Encrypt.Gen</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                          <span className="material-symbols-outlined text-[16px]">block</span>
                          TERMINATED
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">2023-10-27 14:18:45</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-orange-50 dark:bg-orange-400/10 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-600/10 dark:ring-orange-400/20">
                          High
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">powershell.exe</td>
                      <td className="px-6 py-4 font-mono text-primary cursor-pointer hover:underline">1021</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">Suspicious.Script.Exec</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                          <span className="material-symbols-outlined text-[16px]">block</span>
                          TERMINATED
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">2023-10-27 13:55:12</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-yellow-50 dark:bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 ring-1 ring-inset ring-yellow-600/10 dark:ring-yellow-400/20">
                          Medium
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">unknown_installer.exe</td>
                      <td className="px-6 py-4 font-mono text-primary cursor-pointer hover:underline">8834</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">Heuristic.Behave.Drop</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium text-xs">
                          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                          QUARANTINED
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">2023-10-27 12:40:00</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-400/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10 dark:ring-red-400/20">
                          Critical
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">cmd.exe</td>
                      <td className="px-6 py-4 font-mono text-primary cursor-pointer hover:underline">512</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">Exploit.RCE.Attempt</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                          <span className="material-symbols-outlined text-[16px]">block</span>
                          TERMINATED
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">2023-10-27 11:15:33</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-400/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/10 dark:ring-green-400/20">
                          Resolved
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">updater_service.exe</td>
                      <td className="px-6 py-4 font-mono text-primary cursor-pointer hover:underline">9921</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">False.Positive.Heuristic</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium text-xs">
                          <span className="material-symbols-outlined text-[16px]">undo</span>
                          RESTORED
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-[#233648] bg-gray-50 dark:bg-[#111a22] px-6 py-3">
                <div className="text-sm text-slate-500 dark:text-[#92adc9]">
                  Showing <span className="font-medium text-slate-900 dark:text-white">1</span> to{' '}
                  <span className="font-medium text-slate-900 dark:text-white">5</span> of{' '}
                  <span className="font-medium text-slate-900 dark:text-white">42</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center justify-center rounded-lg border border-gray-300 dark:border-[#324d67] bg-white dark:bg-[#192633] px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#233648]"
                    disabled
                  >
                    Previous
                  </button>
                  <button className="flex items-center justify-center rounded-lg border border-gray-300 dark:border-[#324d67] bg-white dark:bg-[#192633] px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-white hover:bg-gray-50 dark:hover:bg-[#233648]">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
