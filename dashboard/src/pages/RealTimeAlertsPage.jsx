import React, { useEffect, useState } from 'react'

async function fetchAlerts() {
  const res = await fetch('/alerts')
  if (!res.ok) throw new Error('Failed to fetch alerts')
  return res.json()
}

export default function RealTimeAlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchAlerts()
        if (!cancelled) {
          setAlerts(Array.isArray(data) ? data.slice().reverse() : [])
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Error loading alerts')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <div className="bg-background-dark text-white min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Real-time Alerts</h1>
            <p className="text-[#92adc9] text-sm">
              Streaming alerts from the Ransom-Trap agent via /alerts API.
            </p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            LIVE
          </span>
        </header>

        <section className="rounded-xl bg-[#111827] border border-[#1f2937] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1f2937] flex items-center justify-between">
            <p className="text-sm text-[#9ca3af]">
              {loading ? 'Loading alerts…' : `${alerts.length} alert(s) loaded`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-[#020617] text-[#9ca3af] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Host</th>
                  <th className="px-4 py-3">Process</th>
                  <th className="px-4 py-3">PID</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {error && !loading && (
                  <tr>
                    <td className="px-4 py-3 text-red-400 text-sm" colSpan={6}>
                      {error}
                    </td>
                  </tr>
                )}
                {!error && !loading && alerts.length === 0 && (
                  <tr>
                    <td className="px-4 py-3 text-[#9ca3af] text-sm" colSpan={6}>
                      No alerts yet.
                    </td>
                  </tr>
                )}
                {alerts.map((a, idx) => (
                  <tr key={idx} className="hover:bg-[#111827]">
                    <td className="px-4 py-3 text-xs font-mono text-[#e5e7eb]">
                      {a.alert_type ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#e5e7eb]">
                      {a.host ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#9ca3af]">
                      {a.process_name ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#9ca3af]">
                      {a.pid ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#9ca3af]">
                      {a.timestamp ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#9ca3af]">
                      {a.path ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
