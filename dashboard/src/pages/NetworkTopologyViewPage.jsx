import React from 'react'
import { Link } from 'react-router-dom'

export default function NetworkTopologyViewPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#233648] bg-surface-light dark:bg-[#16212e] px-6 py-3 shrink-0 z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <Link to="/dashboard" className="size-8 text-primary flex items-center justify-center">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </Link>
            <Link to="/dashboard" className="text-lg font-bold leading-tight tracking-[-0.015em] hover:text-primary transition-colors">
              Ransom Trap
            </Link>
          </div>
          <nav className="flex items-center gap-9 hidden md:flex">
            <Link
              to="/dashboard"
              className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/alerts/real-time"
              className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors"
            >
              Alerts
            </Link>
            <Link to="/network" className="text-primary text-sm font-medium">
              Network Topology
            </Link>
            <button className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors">
              Settings
            </button>
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          {/* Search */}
          <label className="flex flex-col min-w-40 !h-10 max-w-64 hidden sm:block">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#233648] overflow-hidden">
              <div className="text-slate-400 dark:text-[#92adc9] flex items-center justify-center pl-3">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  search
                </span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none border-none bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#92adc9] px-3 focus:outline-0 focus:ring-0 text-sm h-full"
                placeholder="Search IP or Hostname"
              />
            </div>
          </label>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-[#233648] text-slate-600 dark:text-slate-300 transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#16212e]" />
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-slate-200 dark:border-slate-700"
              data-alt="User profile avatar"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD5gQLfh_LcG2nBzq2zIrXyhTz79zkLdreCqVPvNCP8291w3DCXMHJNLjrD-fXf0A9xeGMH-WO26a4U3q6UW0PtfoVNvCY4ZQxwkCLM7h8pMEQqWl1YkZ0Zjw-b-P_Tc8PBpVQfuJfqL8iNtAtKftLgSsrwvI5tbN3sSu2NHP7afxFsFk_cESSV-U4t0lmpjvHNY-CqHFiwSrJ7FoYDQQ6DRp6VzNnkSlSC8oDvk_-nanlw7qx486LngthQEjy2KDRA5OrFWHb-Z0k")',
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Topology Map Background Area */}
        <div className="flex-1 bg-slate-100 dark:bg-[#0b1219] topology-grid relative overflow-hidden group/map cursor-grab active:cursor-grabbing">
          {/* Breadcrumbs Overlay */}
          <div className="absolute top-4 left-6 z-10">
            <div className="flex items-center gap-2 text-sm">
              <a className="text-slate-500 dark:text-[#92adc9] hover:text-primary transition-colors" href="#">
                Dashboard
              </a>
              <span className="text-slate-400 dark:text-[#586e82]">/</span>
              <span className="text-slate-900 dark:text-white font-medium">Network Topology</span>
            </div>
          </div>

          {/* Stats HUD */}
          <div className="absolute top-14 left-6 z-10 flex flex-col gap-3 max-w-xs">
            <div className="flex flex-col gap-2 rounded-lg p-4 bg-surface-light/90 dark:bg-[#233648]/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 dark:text-[#92adc9] text-xs font-medium uppercase tracking-wider">System Health</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">94%</p>
                    <span className="text-orange-500 text-xs font-medium flex items-center">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                        trending_down
                      </span>
                      2%
                    </span>
                  </div>
                </div>
                <div className="size-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    health_and_safety
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-lg p-4 bg-surface-light/90 dark:bg-[#233648]/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 dark:text-[#92adc9] text-xs font-medium uppercase tracking-wider">Active Threats</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">3</p>
                    <span className="text-red-500 text-xs font-medium flex items-center">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                        trending_up
                      </span>
                      CRITICAL
                    </span>
                  </div>
                </div>
                <div className="size-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    warning
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>

          {/* Filters/Legend Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
            <div className="bg-surface-light/90 dark:bg-[#16212e]/90 backdrop-blur-md rounded-full shadow-xl border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#233648] hover:bg-slate-200 dark:hover:bg-[#2d445a] transition-colors whitespace-nowrap group">
                <span className="material-symbols-outlined text-slate-500 dark:text-[#92adc9]" style={{ fontSize: 20 }}>
                  check_circle
                </span>
                <span className="text-slate-700 dark:text-white text-sm font-medium">All Endpoints</span>
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                  1,245
                </span>
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors whitespace-nowrap">
                <span className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-slate-600 dark:text-slate-300 text-sm">Healthy</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors whitespace-nowrap">
                <span className="size-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                <span className="text-red-600 dark:text-red-400 text-sm font-medium">Infected</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors whitespace-nowrap">
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 16 }}>
                  wifi_off
                </span>
                <span className="text-slate-600 dark:text-slate-300 text-sm">Offline</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors whitespace-nowrap ml-auto">
                <span className="material-symbols-outlined text-slate-500 dark:text-[#92adc9]" style={{ fontSize: 20 }}>
                  filter_list
                </span>
                <span className="text-slate-700 dark:text-white text-sm font-medium">Filter</span>
              </button>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
            <div className="flex flex-col rounded-lg bg-surface-light dark:bg-[#16212e] shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-[#233648] text-slate-600 dark:text-white transition-colors border-b border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined block" style={{ fontSize: 24 }}>
                  add
                </span>
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-[#233648] text-slate-600 dark:text-white transition-colors">
                <span className="material-symbols-outlined block" style={{ fontSize: 24 }}>
                  remove
                </span>
              </button>
            </div>
            <button className="p-2 rounded-lg bg-surface-light dark:bg-[#16212e] shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#233648] text-slate-600 dark:text-white transition-colors">
              <span className="material-symbols-outlined block" style={{ fontSize: 24 }}>
                my_location
              </span>
            </button>
          </div>

          {/* Simulated SVG Topology Visualization */}
          <div className="w-full h-full flex items-center justify-center transform scale-90 origin-center">
            <svg className="w-full h-full pointer-events-none" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="link-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#334155', stopOpacity: 0.2 }} />
                  <stop offset="50%" style={{ stopColor: '#334155', stopOpacity: 0.5 }} />
                  <stop offset="100%" style={{ stopColor: '#334155', stopOpacity: 0.2 }} />
                </linearGradient>
                <linearGradient id="link-infected" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.1 }} />
                  <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>
              {/* Connections */}
              <g strokeWidth="1.5">
                <line opacity="0.4" stroke="#334155" x1="400" y1="300" x2="200" y2="150" />
                <line opacity="0.4" stroke="#334155" x1="400" y1="300" x2="600" y2="150" />
                <line opacity="0.4" stroke="#334155" x1="400" y1="300" x2="200" y2="450" />
                <line
                  opacity="0.8"
                  stroke="url(#link-infected)"
                  strokeDasharray="5,5"
                  x1="400"
                  y1="300"
                  x2="600"
                  y2="450"
                />
                {/* Cluster 1 */}
                <line opacity="0.3" stroke="#334155" x1="200" y1="150" x2="150" y2="100" />
                <line opacity="0.3" stroke="#334155" x1="200" y1="150" x2="150" y2="200" />
                <line opacity="0.3" stroke="#334155" x1="200" y1="150" x2="250" y2="100" />
                {/* Cluster 2 (infected) */}
                <line opacity="0.6" stroke="#ef4444" x1="600" y1="450" x2="650" y2="500" />
                <line opacity="0.6" stroke="#ef4444" x1="600" y1="450" x2="550" y2="500" />
              </g>

              {/* Nodes */}
              {/* Central Hub */}
              <g
                className="cursor-pointer pointer-events-auto hover:scale-110 transition-transform duration-200"
                transform="translate(400, 300)"
              >
                <circle r="30" fill="#0f172a" stroke="#137fec" strokeWidth="2" />
                <circle r="40" fill="#137fec" opacity="0.1" />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Material Symbols Outlined"
                  fontSize="28"
                  fill="#137fec"
                >
                  dns
                </text>
              </g>

              {/* Healthy cluster hub */}
              <g className="cursor-pointer pointer-events-auto" transform="translate(200, 150)">
                <circle r="15" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Material Symbols Outlined"
                  fontSize="16"
                  fill="#10b981"
                >
                  router
                </text>
              </g>

              {/* Healthy leaves */}
              <g className="cursor-pointer pointer-events-auto" transform="translate(150, 100)">
                <circle r="8" fill="#10b981" />
              </g>
              <g className="cursor-pointer pointer-events-auto" transform="translate(150, 200)">
                <circle r="8" fill="#10b981" />
              </g>
              <g className="cursor-pointer pointer-events-auto" transform="translate(250, 100)">
                <circle r="8" fill="#10b981" />
              </g>

              {/* Infected hub */}
              <g className="cursor-pointer pointer-events-auto" transform="translate(600, 450)">
                <circle r="20" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                <circle r="20" fill="transparent" className="animate-pulse-red" />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Material Symbols Outlined"
                  fontSize="20"
                  fill="#ef4444"
                >
                  warning
                </text>
              </g>

              {/* Infected leaves */}
              <g className="cursor-pointer pointer-events-auto" transform="translate(650, 500)">
                <circle r="10" fill="#ef4444" />
                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  fontFamily="Inter"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ef4444"
                >
                  PC-402
                </text>
              </g>
              <g className="cursor-pointer pointer-events-auto" transform="translate(550, 500)">
                <circle r="10" fill="#ef4444" />
                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  fontFamily="Inter"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ef4444"
                >
                  SRV-DB-02
                </text>
              </g>

              {/* Offline node */}
              <g className="cursor-pointer pointer-events-auto opacity-60" transform="translate(600, 150)">
                <circle r="15" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" strokeDasharray="2,2" />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Material Symbols Outlined"
                  fontSize="16"
                  fill="#94a3b8"
                >
                  desktop_windows
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right Detail Panel */}
        <aside className="w-80 bg-surface-light dark:bg-[#16212e] border-l border-slate-200 dark:border-slate-700 flex flex-col z-20 shadow-2xl shrink-0">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-[#233648]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-slate-900 dark:text-white font-bold text-lg">SRV-DB-02</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  close
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-medium border border-red-500/20">
                Ransomware Detected
              </span>
              <span className="text-slate-500 dark:text-[#92adc9] font-mono">192.168.1.105</span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 col-span-2">
                <span className="material-symbols-outlined">gpp_bad</span>
                <span className="font-medium text-sm">Isolate Endpoint</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-slate-100 dark:bg-[#233648] hover:bg-slate-200 dark:hover:bg-[#2d445a] text-slate-700 dark:text-white transition-colors border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-slate-500 dark:text-[#92adc9]">terminal</span>
                <span className="font-medium text-xs">Remote Shell</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-slate-100 dark:bg-[#233648] hover:bg-slate-200 dark:hover:bg-[#2d445a] text-slate-700 dark:text-white transition-colors border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-slate-500 dark:text-[#92adc9]">description</span>
                <span className="font-medium text-xs">View Logs</span>
              </button>
            </div>

            {/* Threat Score */}
            <div>
              <h4 className="text-slate-500 dark:text-[#92adc9] text-xs font-semibold uppercase tracking-wider mb-3">
                Threat Analysis
              </h4>
              <div className="flex items-center gap-4 mb-2">
                <div className="relative size-16 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200 dark:text-[#233648]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="85, 100"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">85</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">High Risk</p>
                  <p className="text-xs text-slate-500 dark:text-[#92adc9] leading-relaxed">
                    Unusual outbound traffic detected on port 445.
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div>
              <h4 className="text-slate-500 dark:text-[#92adc9] text-xs font-semibold uppercase tracking-wider mb-3">
                Recent Activity
              </h4>
              <div className="relative pl-3 border-l border-slate-200 dark:border-[#233648] space-y-4">
                <div className="relative">
                  <div className="absolute -left-[17px] top-1 size-2 rounded-full bg-red-500 ring-4 ring-white dark:ring-[#16212e]" />
                  <p className="text-xs font-medium text-slate-900 dark:text-white">Malware signature match</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#92adc9] mt-0.5">2 mins ago • Sentinel Agent</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[17px] top-1 size-2 rounded-full bg-orange-400 ring-4 ring-white dark:ring-[#16212e]" />
                  <p className="text-xs font-medium text-slate-900 dark:text-white">Port scan detected</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#92adc9] mt-0.5">15 mins ago • Network Monitor</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[17px] top-1 size-2 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-[#16212e]" />
                  <p className="text-xs font-medium text-slate-900 dark:text-white">User login (Admin)</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#92adc9] mt-0.5">1 hour ago • Auth Log</p>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div>
              <h4 className="text-slate-500 dark:text-[#92adc9] text-xs font-semibold uppercase tracking-wider mb-3">
                System Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-[#233648]">
                  <span className="text-slate-500 dark:text-[#92adc9]">OS Version</span>
                  <span className="text-slate-700 dark:text-slate-200">Windows Server 2019</span>
                </div>
                <div className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-[#233648]">
                  <span className="text-slate-500 dark:text-[#92adc9]">Last Heartbeat</span>
                  <span className="text-slate-700 dark:text-slate-200">20s ago</span>
                </div>
                <div className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-[#233648]">
                  <span className="text-slate-500 dark:text-[#92adc9]">Agent Version</span>
                  <span className="text-slate-700 dark:text-slate-200">v4.2.1 (Latest)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-[#233648] bg-slate-50 dark:bg-[#111a22]">
            <button className="w-full py-2 px-4 rounded-md text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
              View Full Report
            </button>
          </div>
        </aside>
      </main>
    </div>
  )
}
