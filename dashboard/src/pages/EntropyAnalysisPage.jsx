import React from 'react'
import { Link } from 'react-router-dom'

export default function EntropyAnalysisPage() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden flex h-screen w-full">
      {/* Side Navigation */}
      <aside className="w-64 h-full flex flex-col bg-[#111a22] border-r border-[#233648] shrink-0 z-20">
        <div className="p-6 pb-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-white text-xl font-bold tracking-tight">Ransom Trap</h1>
            <p className="text-[#92adc9] text-xs font-medium uppercase tracking-wider">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors group" href="#">
            <span className="material-symbols-outlined text-2xl group-hover:text-white transition-colors">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors" href="#">
            <span className="material-symbols-outlined text-2xl fill-1">ssid_chart</span>
            <span className="text-sm font-medium">Entropy Analysis</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors group" href="#">
            <span className="material-symbols-outlined text-2xl group-hover:text-white transition-colors">folder_open</span>
            <span className="text-sm font-medium">File Monitor</span>
          </a>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors group"
            to="/config/thresholds"
          >
            <span className="material-symbols-outlined text-2xl group-hover:text-white transition-colors">policy</span>
            <span className="text-sm font-medium">Entropy Thresholds</span>
          </Link>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors group" href="#">
            <span className="material-symbols-outlined text-2xl group-hover:text-white transition-colors">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>
        <div className="p-4 border-t border-[#233648]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
              JD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">John Doe</span>
              <span className="text-xs text-[#92adc9]">Lead Analyst</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#233648] bg-[#111a22] shrink-0">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-3xl">security</span>
            <h2 className="text-white text-lg font-bold tracking-tight">Ransomware Detection Suite</h2>
          </div>
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#92adc9] text-[20px]">search</span>
              </div>
              <input
                className="block w-full rounded-lg border-none bg-[#233648] py-2 pl-10 pr-3 text-sm text-white placeholder-[#92adc9] focus:ring-2 focus:ring-primary"
                placeholder="Search hosts, files, or hashes..."
                type="text"
              />
            </div>
            {/* User/Profile Actions */}
            <button className="text-[#92adc9] hover:text-white relative">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-background-dark p-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Page Heading & Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-white">Entropy Analysis</h1>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-wider">
                    Monitoring Active
                  </span>
                </div>
                <p className="text-[#92adc9] text-base">
                  Host: <span className="text-white font-mono">SRV-FIN-01</span> • IP: 192.168.1.42
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#233648] hover:bg-[#2c445a] text-white text-sm font-medium rounded-lg transition-colors border border-[#334155]">
                  <span className="material-symbols-outlined text-[18px]">table_chart</span>
                  View Logs
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(19,127,236,0.3)]">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export Report
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1e293b] border border-red-500/50 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-red-500">warning</span>
                </div>
                <p className="text-[#92adc9] text-sm font-medium mb-1">Current Entropy</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-white text-3xl font-bold">7.8</p>
                  <span className="text-red-400 text-sm font-bold bg-red-500/10 px-2 py-0.5 rounded">CRITICAL</span>
                </div>
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +22% vs 1h ago
                </p>
              </div>
              <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl text-white">timer</span>
                </div>
                <p className="text-[#92adc9] text-sm font-medium mb-1">Spike Detected</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-white text-3xl font-bold">10:42 AM</p>
                </div>
                <p className="text-[#92adc9] text-sm mt-2">Duration: 14m 32s</p>
              </div>
              <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl text-white">folder_zip</span>
                </div>
                <p className="text-[#92adc9] text-sm font-medium mb-1">Files Affected</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-white text-3xl font-bold">142</p>
                </div>
                <p className="text-orange-400 text-sm mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">priority_high</span>
                  Requires Review
                </p>
              </div>
            </div>

            {/* Main Chart Section */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white text-lg font-bold">Entropy Timeline</h3>
                  <p className="text-[#92adc9] text-sm">
                    Shannon Entropy values over time. High values (7.5+) indicate potential encryption.
                  </p>
                </div>
                {/* Time Filters */}
                <div className="flex bg-[#111a22] p-1 rounded-lg border border-[#334155] self-start sm:self-auto">
                  <button className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-primary shadow-sm">1h</button>
                  <button className="px-3 py-1.5 rounded-md text-sm font-medium text-[#92adc9] hover:text-white transition-colors">
                    24h
                  </button>
                  <button className="px-3 py-1.5 rounded-md text-sm font-medium text-[#92adc9] hover:text-white transition-colors">
                    7d
                  </button>
                  <button className="px-3 py-1.5 rounded-md text-sm font-medium text-[#92adc9] hover:text-white transition-colors">
                    Custom
                  </button>
                </div>
              </div>

              {/* Chart Visualization Area */}
              <div className="relative w-full h-[350px] bg-[#111a22] rounded-lg border border-[#334155] overflow-hidden p-4">
                {/* Chart Controls Overlay */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    className="p-1.5 bg-[#233648] rounded hover:text-white text-[#92adc9] transition-colors"
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                  <button
                    className="p-1.5 bg-[#233648] rounded hover:text-white text-[#92adc9] transition-colors"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <button
                    className="p-1.5 bg-[#233648] rounded hover:text-white text-[#92adc9] transition-colors"
                    title="Reset Zoom"
                  >
                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  </button>
                </div>

                {/* Y-Axis Labels */}
                <div className="absolute left-4 top-4 bottom-12 w-8 flex flex-col justify-between text-xs text-[#586e86] font-mono text-right pointer-events-none">
                  <span>8.0</span>
                  <span>6.0</span>
                  <span>4.0</span>
                  <span>2.0</span>
                  <span>0.0</span>
                </div>

                {/* X-Axis Labels */}
                <div className="absolute left-16 right-4 bottom-4 h-6 flex justify-between text-xs text-[#586e86] font-mono pointer-events-none">
                  <span>10:00 AM</span>
                  <span>10:15 AM</span>
                  <span>10:30 AM</span>
                  <span>10:45 AM</span>
                  <span>11:00 AM</span>
                </div>

                {/* The Chart SVG */}
                <div className="absolute left-16 right-4 top-4 bottom-12">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#137fec" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
                      </linearGradient>
                      <pattern id="gridPattern" width="100" height="75" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 75" fill="none" stroke="#233648" strokeWidth="1" />
                      </pattern>
                    </defs>
                    {/* Grid */}
                    <rect fill="url(#gridPattern)" height="100%" width="100%" opacity="0.3" />
                    {/* Threshold Line (Critical 7.5) */}
                    <line
                      x1="0"
                      x2="1000"
                      y1="20"
                      y2="20"
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                      opacity="0.7"
                    />
                    <text fill="#ef4444" fontFamily="monospace" fontSize="10" x="10" y="15">
                      THRESHOLD (7.5)
                    </text>
                    {/* Area Fill */}
                    <path
                      d="M0 250 L100 240 L200 245 L300 230 L400 235 L500 220 L600 210 L650 100 L700 30 L800 25 L900 35 L1000 40 L1000 300 L0 300 Z"
                      fill="url(#chartGradient)"
                    />
                    {/* The Line */}
                    <path
                      className="drop-shadow-[0_0_4px_rgba(19,127,236,0.6)]"
                      d="M0 250 L100 240 L200 245 L300 230 L400 235 L500 220 L600 210 L650 100 L700 30 L800 25 L900 35 L1000 40"
                      fill="none"
                      stroke="#137fec"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Data Point (Spike) */}
                    <circle cx="700" cy="30" r="4" fill="#137fec" stroke="white" strokeWidth="2" />
                    {/* Tooltip Mockup (SVG Group) */}
                    <g transform="translate(620, 50)">
                      <rect x="0" y="0" width="140" height="60" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <text x="10" y="20" fill="#92adc9" fontSize="10">
                        10:42 AM
                      </text>
                      <text x="10" y="35" fill="white" fontSize="12" fontWeight="bold">
                        Entropy: 7.82
                      </text>
                      <text x="10" y="50" fill="#ef4444" fontSize="10">
                        Spike Detected
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* Correlated File List Table */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-[#334155] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-white text-lg font-bold">Affected Files</h3>
                  <p className="text-[#92adc9] text-sm">
                    Files showing high entropy patterns within the selected timeframe.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="px-3 py-1.5 rounded-lg border border-[#334155] text-white hover:bg-[#334155] text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Filter
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-[#334155] text-white hover:bg-[#334155] text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">view_column</span>
                    Columns
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#111a22] border-b border-[#334155]">
                      <th className="px-6 py-4 text-xs font-semibold text-[#92adc9] uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#92adc9] uppercase tracking-wider">
                        Filename
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#92adc9] uppercase tracking-wider">
                        Entropy Score
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#92adc9] uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#92adc9] uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {/* Row 1 */}
                    <tr className="group hover:bg-[#233648]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">10:42:05</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">finance_q3.xlsx.encrypted</span>
                          <span className="text-xs text-[#586e86] font-mono">/mnt/data/finance/reports/</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-red-400 w-8">7.92</span>
                          <div className="w-24 h-2 bg-[#111a22] rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '98%' }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#92adc9]">2.4 MB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-primary hover:text-white transition-colors text-sm font-medium">
                          Details
                        </button>
                      </td>
                    </tr>
                    {/* Row 2 */}
                    <tr className="group hover:bg-[#233648]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">10:42:02</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">backup_manifest.db</span>
                          <span className="text-xs text-[#586e86] font-mono">/mnt/data/backups/</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-red-400 w-8">7.85</span>
                          <div className="w-24 h-2 bg-[#111a22] rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '95%' }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#92adc9]">154 MB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-primary hover:text-white transition-colors text-sm font-medium">
                          Details
                        </button>
                      </td>
                    </tr>
                    {/* Row 3 (Normal File) */}
                    <tr className="group hover:bg-[#233648]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">10:41:55</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">logo_vector.svg</span>
                          <span className="text-xs text-[#586e86] font-mono">/mnt/data/assets/images/</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#92adc9] w-8">4.21</span>
                          <div className="w-24 h-2 bg-[#111a22] rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '45%' }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#92adc9]">45 KB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-primary hover:text-white transition-colors text-sm font-medium">
                          Details
                        </button>
                      </td>
                    </tr>
                    {/* Row 4 */}
                    <tr className="group hover:bg-[#233648]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">10:41:48</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">employee_records.enc</span>
                          <span className="text-xs text-[#586e86] font-mono">/mnt/data/hr/sensitive/</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-red-400 w-8">7.98</span>
                          <div className="w-24 h-2 bg-[#111a22] rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '99%' }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#92adc9]">12 MB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-primary hover:text-white transition-colors text-sm font-medium">
                          Details
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Table Footer / Pagination */}
              <div className="px-6 py-4 border-t border-[#334155] flex items-center justify-between bg-[#111a22]">
                <p className="text-sm text-[#92adc9]">
                  Showing <span className="text-white font-medium">1-4</span> of{' '}
                  <span className="text-white font-medium">142</span> files
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded border border-[#334155] text-[#92adc9] text-sm hover:text-white hover:bg-[#233648] disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1 rounded border border-[#334155] text-[#92adc9] text-sm hover:text-white hover:bg-[#233648]">
                    Next
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
