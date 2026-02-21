import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'
import { fetchAgentStatus, agentStart, agentStop } from '../api.js'

function formatTs(ts) {
  if (!ts) return '—'
  const d = new Date(ts * 1000)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function DashboardOverviewPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { alerts, loading, error } = useAlerts(5000)

  // Agent start/stop state
  const [agentRunning, setAgentRunning] = useState(false)
  const [agentToggling, setAgentToggling] = useState(false)

  // Poll agent status every 5 seconds
  React.useEffect(() => {
    let cancelled = false
    async function pollStatus() {
      try {
        const s = await fetchAgentStatus()
        if (!cancelled) setAgentRunning(s.running)
      } catch { /* server may not be up yet */ }
    }
    pollStatus()
    const id = setInterval(pollStatus, 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  async function handleAgentToggle() {
    if (agentToggling) return
    setAgentToggling(true)
    try {
      if (agentRunning) {
        await agentStop()
        setAgentRunning(false)
      } else {
        await agentStart()
        setAgentRunning(true)
      }
    } catch (e) {
      console.error('Agent toggle failed:', e)
    } finally {
      setAgentToggling(false)
    }
  }

  const ransomwareAlerts = alerts.filter(a => a.alert_type === 'ransomware_suspected')
  const honeytokenAlerts = alerts.filter(a => a.alert_type === 'honeytoken_access')
  const recentAlerts = [...alerts].reverse().slice(0, 3)

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`w-72 flex-col border-r border-[#233648] bg-background-dark flex fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3 px-2 mt-2">
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary/20"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDYBVma9FFsfv7iby7buy_M4M5gS_w8bo7i4Bp_owrVhnc6iR8SsMT24-MkJIrQjwi55aiRCKIXI9oqbVfbLCqtoVMWFUpP3xR9_bf23OyYhUJuqglxMebPo_mw9s1soInDNyWsEO4HWV7u-yYuco7mJZ6AaXpK_Do9eXnZQLPha9-ZnhM7IczBs6Ql-rCcCxvLmdHS0MDxspxe-EI9x-7HmEZKzvjjM0O7Eq4-kAvj-zu24C1KIVz2SfMdBF0AtwKklQsiraQfTCY")',
                }}
              />
              <div className="flex flex-col">
                <h1 className="text-white text-base font-bold leading-normal">Admin Console</h1>
                <p className="text-[#92adc9] text-xs font-normal leading-normal">Security Ops Lead</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="material-symbols-outlined fill-1">dashboard</span>
                <span className="text-sm font-medium leading-normal">Overview</span>
              </Link>
              <Link
                to="/alerts/R-2024-001"
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="material-symbols-outlined">warning</span>
                <span className="text-sm font-medium leading-normal">Incidents</span>
              </Link>
              <Link
                to="/entropy"
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="material-symbols-outlined text-2xl">ssid_chart</span>
                <span className="text-sm font-medium leading-normal">Entropy Analysis</span>
              </Link>
              <Link
                to="/network"
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="material-symbols-outlined">hub</span>
                <span className="text-sm font-medium leading-normal">Network Topology View</span>
              </Link>
              <Link
                to="/honeytokens/manage"
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="material-symbols-outlined">bug_report</span>
                <span className="text-sm font-medium leading-normal">Honeytokens</span>
              </Link>
              <Link
                to="/reports"
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="material-symbols-outlined">description</span>
                <span className="text-sm font-medium leading-normal">Reports</span>
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2 border-t border-[#233648] pt-4">
            <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors" href="#">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-medium leading-normal">System Settings</span>
            </a>
            <button
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors text-left"
              type="button"
              onClick={() => {
                setSidebarOpen(false)
                navigate('/login', { replace: true })
              }}
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm font-medium leading-normal">Logout</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-[#233648] bg-background-dark px-6 py-4">
          <div className="flex items-center gap-4 lg:gap-8 w-full max-w-2xl">
            <button
              className="lg:hidden text-white"
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 text-white hover:text-white"
              aria-label="Go to Dashboard"
            >
              <div className="size-8 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M24 4L6 12V22C6 33.5 13.7 44.1 24 46C34.3 44.1 42 33.5 42 22V12L24 4Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                  />
                  <path d="M24 14V34" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                  <path d="M14 24H34" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                </svg>
              </div>
              <span className="text-white text-xl font-black leading-tight tracking-tight hidden sm:block">Ransom Trap</span>
            </Link>
            <label className="hidden md:flex flex-col min-w-40 flex-1 h-10 max-w-lg ml-8">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#233648] focus-within:ring-2 focus-within:ring-primary transition-shadow">
                <div className="text-[#92adc9] flex items-center justify-center pl-4 pr-2">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  className="w-full bg-transparent border-none text-white placeholder:text-[#92adc9] focus:outline-none focus:ring-0 text-sm h-full"
                  placeholder="Search IP, Hash, or Hostname..."
                  defaultValue=""
                />
              </div>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              {/* ONLINE / OFFLINE badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-l border h-9 border-r-0 transition-colors ${agentRunning
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
                }`}>
                <div className={`size-2 rounded-full ${agentRunning
                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse'
                    : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                  }`} />
                <span className={`text-xs font-bold tracking-wider ${agentRunning ? 'text-green-500' : 'text-red-400'
                  }`}>
                  {agentRunning ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              {/* STOP / START toggle */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-r bg-[#233648] border border-[#334b63] h-9 border-l-0">
                <span className={`text-[9px] font-bold px-1 uppercase ${!agentRunning ? 'text-white' : 'text-[#92adc9]'
                  }`}>Stop</span>
                <button
                  aria-checked={agentRunning}
                  aria-label={agentRunning ? 'Stop agent' : 'Start agent'}
                  disabled={agentToggling}
                  onClick={handleAgentToggle}
                  className={`group relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out focus:outline-none
                    disabled:opacity-60 disabled:cursor-wait
                    ${agentRunning ? 'bg-primary hover:bg-red-500' : 'bg-[#334b63] hover:bg-green-600'}`}
                  role="switch"
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0
                      transition duration-200 ease-in-out
                      ${agentRunning ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
                <span className={`text-[9px] font-bold px-1 uppercase ${agentRunning ? 'text-white' : 'text-[#92adc9]'
                  }`}>Start</span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#233648] mx-1 hidden sm:block" />
            <div className="flex gap-2">
              <button className="relative flex size-10 items-center justify-center rounded-lg bg-[#233648] text-white hover:bg-[#334b63] transition-colors">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 border border-[#233648]" />
              </button>
              <a
                className="flex size-10 items-center justify-center rounded-lg bg-[#233648] text-white hover:bg-[#334b63] transition-colors"
                href="#restart-modal"
                title="Restart Service"
              >
                <span className="material-symbols-outlined text-[20px]">restart_alt</span>
              </a>
              <button className="flex size-10 items-center justify-center rounded-lg bg-[#233648] text-white hover:bg-[#334b63] transition-colors" title="Refresh Dashboard">
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
              <button className="hidden sm:flex size-10 items-center justify-center rounded-lg bg-[#233648] text-white hover:bg-[#334b63] transition-colors">
                <span className="material-symbols-outlined text-[20px]">help</span>
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 scroll-smooth">
          <div className="mx-auto flex flex-col max-w-[1200px] gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-white text-3xl md:text-4xl font-black tracking-tight">Dashboard Overview</h1>
                <p className="text-[#92adc9] text-sm md:text-base">Real-time ransomware detection and response status</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[#92adc9] text-xs font-mono">Last updated: 10:42:05 AM</span>
                  <button className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    <span>Live Mode</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Active Threats card — LIVE */}
              <div className="flex flex-col gap-3 rounded-xl p-6 bg-[#233648] border-l-4 border-red-500 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-red-500">security</span>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-[#92adc9] text-sm font-semibold uppercase tracking-wider">Active Threats</p>
                  {ransomwareAlerts.length > 0 && (
                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded font-bold animate-pulse">LIVE</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  {loading ? (
                    <p className="text-[#92adc9] text-2xl font-bold">—</p>
                  ) : (
                    <p className="text-white text-4xl font-bold tracking-tight">{ransomwareAlerts.length}</p>
                  )}
                </div>
                {error && <p className="text-xs text-red-400 truncate">{error}</p>}
              </div>
              {/* Honeytoken Hits card — LIVE */}
              <div className="flex flex-col gap-3 rounded-xl p-6 bg-[#233648] border-l-4 border-orange-500 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-orange-500">bug_report</span>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-[#92adc9] text-sm font-semibold uppercase tracking-wider">Honeytoken Hits</p>
                  {honeytokenAlerts.length > 0 && (
                    <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded font-bold">!</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  {loading ? (
                    <p className="text-[#92adc9] text-2xl font-bold">—</p>
                  ) : (
                    <p className="text-white text-4xl font-bold tracking-tight">{honeytokenAlerts.length}</p>
                  )}
                </div>
              </div>
              {/* Total Alerts card — LIVE */}
              <div className="flex flex-col gap-3 rounded-xl p-6 bg-[#233648] border-l-4 border-primary relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-primary">notifications_active</span>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-[#92adc9] text-sm font-semibold uppercase tracking-wider">Total Alerts</p>
                </div>
                <div className="flex items-baseline gap-2">
                  {loading ? (
                    <p className="text-[#92adc9] text-2xl font-bold">—</p>
                  ) : (
                    <p className="text-white text-4xl font-bold tracking-tight">{alerts.length}</p>
                  )}
                </div>
              </div>
              {/* Agent Status live card */}
              <div className="flex flex-col gap-3 rounded-xl p-6 bg-[#233648] border-l-4 border-green-500 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-green-500">verified_user</span>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-[#92adc9] text-sm font-semibold uppercase tracking-wider">Agent Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${error ? 'bg-red-500/20 text-red-400'
                      : agentRunning ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                    {error ? 'SERVER ERROR' : agentRunning ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-white text-lg font-bold tracking-tight">
                    {error ? 'Server unreachable' : agentRunning ? 'Monitoring active' : 'Agent stopped'}
                  </p>
                </div>
                <button
                  onClick={handleAgentToggle}
                  disabled={agentToggling}
                  className={`mt-1 self-start text-xs font-bold px-3 py-1 rounded transition-colors disabled:opacity-60 ${agentRunning
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/40'
                    }`}
                >
                  {agentToggling ? 'Please wait…' : agentRunning ? 'Stop Agent' : 'Start Agent'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 flex flex-col rounded-xl bg-[#233648] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white text-lg font-bold">Threat Detection Velocity</h3>
                    <p className="text-[#92adc9] text-sm">Alert volume over the last 24 hours</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-primary" />
                    <span className="text-xs text-[#92adc9]">Events</span>
                    <span className="size-3 rounded-full bg-red-500 ml-2" />
                    <span className="text-xs text-[#92adc9]">Critical</span>
                  </div>
                </div>
                <div className="relative w-full h-[240px] mt-auto">
                  <div className="absolute inset-0 flex flex-col justify-between text-[#556980] text-xs font-mono pointer-events-none z-0">
                    <div className="border-b border-[#334b63] w-full h-0 flex items-end">
                      <span>100</span>
                    </div>
                    <div className="border-b border-[#334b63] w-full h-0 flex items=end">
                      <span>75</span>
                    </div>
                    <div className="border-b border-[#334b63] w-full h-0 flex items-end">
                      <span>50</span>
                    </div>
                    <div className="border-b border-[#334b63] w-full h-0 flex items-end">
                      <span>25</span>
                    </div>
                    <div className="border-b border-[#334b63] w-full h-0 flex items-end">
                      <span>0</span>
                    </div>
                  </div>
                  <svg className="absolute inset-0 w-full h-full z-10 drop-shadow-lg" preserveAspectRatio="none" viewBox="0 0 500 100">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#137fec" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,80 C20,80 30,40 50,40 C70,40 80,70 100,70 C120,70 130,20 150,20 C170,20 180,60 200,60 C220,60 230,85 250,85 C270,85 280,30 300,30 C320,30 330,50 350,50 C370,50 380,10 400,10 C420,10 430,70 450,70 C470,70 480,45 500,45 V100 H0 Z"
                      fill="url(#chartGradient)"
                    />
                    <path
                      d="M0,80 C20,80 30,40 50,40 C70,40 80,70 100,70 C120,70 130,20 150,20 C170,20 180,60 200,60 C220,60 230,85 250,85 C270,85 280,30 300,30 C320,30 330,50 350,50 C370,50 380,10 400,10 C420,10 430,70 450,70 C470,70 480,45 500,45"
                      fill="none"
                      stroke="#137fec"
                      strokeWidth="2"
                    />
                    <circle cx="150" cy="20" fill="#ef4444" r="3" stroke="#fff" strokeWidth="1" />
                    <circle cx="400" cy="10" fill="#ef4444" r="3" stroke="#fff" strokeWidth="1" />
                  </svg>
                </div>
                <div className="flex justify-between text-[#92adc9] text-xs font-mono mt-4">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                  <span>NOW</span>
                </div>
              </div>
              <div className="flex flex-col rounded-xl bg-[#233648] shadow-sm overflow-hidden h-full">
                <div className="p-5 border-b border-[#334b63] flex items-center justify-between bg-[#233648]">
                  <h3 className="text-white text-lg font-bold">Live Threat Feed</h3>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span className="text-xs font-bold text-red-400 tracking-wide">LIVE</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loading && (
                    <div className="flex items-center justify-center p-8 text-[#92adc9] text-sm">
                      <span className="material-symbols-outlined animate-spin mr-2 text-primary">sync</span>
                      Connecting to server…
                    </div>
                  )}
                  {!loading && recentAlerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-[#92adc9] text-sm gap-2">
                      <span className="material-symbols-outlined text-3xl text-green-500">verified_user</span>
                      No alerts yet
                    </div>
                  )}
                  {recentAlerts.map((alert, i) => {
                    const isRansomware = alert.alert_type === 'ransomware_suspected'
                    return (
                      <div key={i} className="group flex gap-3 p-4 border-b border-[#334b63] hover:bg-[#2a4055] transition-all cursor-pointer">
                        <div className="mt-1">
                          <div className={`flex items-center justify-center size-8 rounded transition-colors ${isRansomware
                            ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white'
                            : 'bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'
                            }`}>
                            <span className="material-symbols-outlined text-lg">
                              {isRansomware ? 'bug_report' : 'key'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="justify-between items-start mb-0.5 flex">
                            <h4 className="text-white text-sm font-semibold truncate pr-2">
                              {isRansomware ? 'Ransomware Suspected' : 'Honeytoken Accessed'}
                            </h4>
                            <span className="text-[#92adc9] text-[10px] whitespace-nowrap font-mono">
                              {formatTs(alert.timestamp)}
                            </span>
                          </div>
                          <p className="text-[#92adc9] text-xs truncate">
                            Host: <span className="text-white/70">{alert.host || '—'}</span>
                            {alert.process_name && (
                              <> • <span className={isRansomware ? 'text-red-400' : 'text-orange-400'}>{alert.process_name}</span></>
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="p-3 bg-[#1e2e3e] border-t border-[#334b63] text-center">
                  <Link
                    to="/alerts/real-time"
                    className="text-xs text-primary font-bold hover:text-white transition-colors uppercase tracking-wide"
                  >
                    View Full Feed
                  </Link>
                </div>
              </div>
              <div className="xl:col-span-3 flex flex-col rounded-xl bg-[#233648] shadow-sm overflow-hidden h-full">
                <div className="p-5 border-b border-[#334b63] flex items-center justify-between bg-[#233648]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#92adc9]">public</span>
                    <h3 className="text-white text-lg font-bold">Endpoint Map</h3>
                  </div>
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
                  </span>
                </div>
                <div className="relative flex-1 bg-[#101922] min-h-[400px] xl:min-h-[450px] group/map">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover/map:grayscale-0 transition-all duration-700"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCbzsu07R3qPI1x9wlzPUj8mZ0EX1EkYbCMu7t8ewGT0q3dS95eRT8alL2Ynj1vonzn-N6ZsjqsqX_3gFb_5fLQFZdy3bbIYoiUhdnrjjXbM9SXFosW8FQmI1D90Nw4brqm4uDfaGED_bymByj_Io9nM3heErzutlxY8zSeli2GcDLvGnCSq5LrWkDid1HMiWN_VO0tj8-DXQaXgUjF5PVj57YtmL1JK1RBXoKJ2goXEq726J8mQHT3GU_ipc5J40JXQ24M5YFW1zE")',
                    }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(19,127,236,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(19,127,236,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  <div className="absolute top-[32%] left-[22%] group">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-20" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 ring-4 ring-green-500/20 cursor-pointer" />
                    </div>
                  </div>
                  <div className="absolute top-[35%] left-[49%] group">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-30" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 ring-4 ring-red-500/20 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col rounded-xl bg-[#233648] shadow-sm overflow-hidden mb-8">
              <div className="flex items-center justify-between p-6 border-b border-[#334b63]">
                <h3 className="text-white text-lg font-bold">Recent Security Alerts</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-[#334b63] rounded hover:bg-[#405d7a]">
                    Export CSV
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded hover:bg-blue-600">
                    View All
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#92adc9]">
                  <thead className="bg-[#1e2e3e] text-xs uppercase font-semibold text-white">
                    <tr>
                      <th className="px-6 py-4">Severity</th>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Hostname</th>
                      <th className="px-6 py-4">Threat Type</th>
                      <th className="px-6 py-4">Action Taken</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334b63]">
                    <tr className="hover:bg-[#2a4055] transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded bg-red-500/10 px-2 py-1 text-xs font-bold text-red-500 border border-red-500/20">
                          <span className="size-1.5 rounded-full bg-red-500" /> CRITICAL
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-mono">Oct 24, 10:41:22</td>
                      <td className="px-6 py-4 text-white font-medium">Finance-Server-01</td>
                      <td className="px-6 py-4">Ransomware.WannaCry</td>
                      <td className="px-6 py-4">
                        <span className="text-green-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span> Auto-Blocked
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-white font-medium text-xs">Investigate</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div
        id="restart-modal"
        className="fixed inset-0 z-[100] hidden items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-md bg-[#1e293b] rounded-xl shadow-2xl border border-[#334b63] overflow-hidden transform transition-all">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-3xl">restart_alt</span>
              </div>
              <h3 className="text-xl font-bold text-white">Restart System?</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[#92adc9] text-sm leading-relaxed">
                Are you sure you want to restart the Ransom Trap monitoring service?
              </p>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <span className="material-symbols-outlined text-orange-500 text-sm mt-0.5">warning</span>
                <p className="text-orange-400 text-xs font-medium">
                  This action will temporarily interrupt real-time monitoring and threat detection across all
                  connected endpoints.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-8">
              <a className="px-4 py-2 text-sm font-bold text-[#92adc9] hover:text-white transition-colors" href="#">
                Cancel
              </a>
              <a
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                href="#"
              >
                Confirm Restart
              </a>
            </div>
          </div>
          <a className="absolute top-4 right-4 text-[#92adc9] hover:text-white transition-colors" href="#">
            <span className="material-symbols-outlined">close</span>
          </a>
        </div>
      </div>
    </div>
  )
}
