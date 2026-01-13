import React from 'react'

function StatCard({ label, value, badge, badgeColor }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl p-6 bg-[#233648] border-l-4 border-primary relative overflow-hidden">
      <div className="flex justify-between items-start">
        <p className="text-[#92adc9] text-sm font-semibold uppercase tracking-wider">{label}</p>
        {badge ? (
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${badgeColor}`}>{badge}</span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardOverviewPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-white text-3xl md:text-4xl font-black tracking-tight">Dashboard Overview</h1>
            <p className="text-[#92adc9] text-sm md:text-base">
              Real-time ransomware detection and response status
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Threats" value="3" badge="+1 NEW" badgeColor="bg-red-500/20 text-red-400" />
          <StatCard label="Protected" value="1,420" badge="STABLE" badgeColor="bg-green-500/20 text-green-400" />
          <StatCard label="Blocked (24h)" value="12" />
          <StatCard label="Avg Response Time" value="4m 32s" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-[#233648] p-6">
            <h2 className="text-white text-lg font-bold mb-1">Threat Detection Velocity</h2>
            <p className="text-[#92adc9] text-sm mb-4">Alert volume over the last 24 hours</p>
            <div className="h-48 flex items-center justify-center text-[#92adc9] text-sm">
              <span>Chart placeholder (will visualize alerts over time)</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#233648] p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-lg font-bold">Live Threat Feed</h2>
              <span className="text-xs font-bold text-red-400 tracking-wide flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                LIVE
              </span>
            </div>
            <p className="text-[#92adc9] text-sm">
              Recent high-severity events and honeytoken alerts will appear here.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
