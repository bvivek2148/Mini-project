import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAlerts, acknowledgeAlert } from '../api.js'

function formatTs(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString([], {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Math.floor(Date.now() / 1000 - ts)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function IncidentsViewPage() {
  const navigate = useNavigate()
  const [allAlerts, setAllAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
      .then(data => {
        setAllAlerts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Group alerts into simplified Kanban columns based on their status
  const columns = {
    new: allAlerts.filter(a => !a.status || a.status === 'new'),
    investigating: allAlerts.filter(a => a.status === 'acknowledged' || a.status === 'escalated'),
    resolved: allAlerts.filter(a => a.status === 'resolved')
  }

  const handleStatusChange = async (alertIdx, newStatus) => {
    await acknowledgeAlert(alertIdx, { status: newStatus })
    // Optimistic UI update
    setAllAlerts(prev => {
      const copy = [...prev]
      if (copy[alertIdx]) copy[alertIdx].status = newStatus
      return copy
    })
  }

  const IncidentCard = ({ alert, index }) => {
    const isRansomware = alert.alert_type === 'ransomware_suspected'
    const color = isRansomware ? 'danger' : 'orange-500'

    return (
      <div className="bg-surface-dark border border-white/10 rounded-lg p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full bg-${color} animate-pulse`} />
            <span className="text-white font-medium text-sm truncate max-w-[150px]" title={alert.host}>
              {alert.host || 'Unknown Host'}
            </span>
          </div>
          <span className="text-xs text-text-secondary font-mono">{timeAgo(alert.timestamp)}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className={`text-xs font-bold uppercase tracking-wide text-${color}`}>
            {isRansomware ? 'Ransomware' : 'Honeytoken'}
          </span>
          <span className="text-text-secondary text-xs truncate" title={alert.path || 'Unknown Path'}>
            {alert.path || 'Unknown Path'}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/alerts/${index}`)}
              className="text-xs font-medium text-text-secondary hover:text-white flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              View
            </button>
            {(!alert.status || alert.status === 'new') && (
              <button
                onClick={() => handleStatusChange(index, 'acknowledged')}
                className="text-xs font-medium text-primary hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">task_alt</span>
                Ack
              </button>
            )}
            {(alert.status === 'acknowledged' || alert.status === 'escalated') && (
              <button
                onClick={() => handleStatusChange(index, 'resolved')}
                className="text-xs font-medium text-success hover:text-green-400 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Resolve
              </button>
            )}
          </div>

          {/* Dummy Analyst Avatar */}
          {alert.status && alert.status !== 'new' && (
            <div className="size-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-[10px] text-primary font-bold" title="Claimed by Analyst">
              {alert.status === 'resolved' ? 'JD' : 'You'}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
      {/* ── TOP NAVIGATION ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-surface-dark bg-background-dark px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-white">
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined text-4xl">shield_lock</span>
            </div>
            <Link to="/" className="text-white text-lg font-bold leading-tight tracking-[-0.015em] hover:text-white">
              Ransom Trap
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-9">
            <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" to="/">Dashboard</Link>
            <Link className="text-white text-sm font-medium leading-normal" to="/Incidents">Incidents</Link>
            <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" to="/alerts">Alerts</Link>
            <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" to="/Incidents/analysts">Analysts</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <span className="absolute left-3 text-text-secondary material-symbols-outlined text-[20px]">search</span>
            <input
              className="w-64 bg-surface-dark border-none rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-text-secondary focus:ring-1 focus:ring-primary"
              placeholder="Search incidents..."
            />
          </div>
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-surface-dark"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCBGWm_A3xJs9cVmw2Vk29_idfHrCo_D1p9unfQzQElfFNU9Gk4kkUjbjfRdhvC9wl00AQ9gB_1YyX852nH73PegjhE56mnmqlhHsCLg4SEXUYIMYVXut5DN10Aj2FfmKwTJC7BEuDxt1GTorUe-tBbKSK95ca42MYiF0J5cz219c0EWtguU3ucUs86Y9xMUaRs6PN5aSzNR8a3SRB3eghgPemyLdxbxvhuM7M5s2lShyG5wlgn9H5V7F2G3qtCTK9_Ejlv1UBkebo")' }}
          />
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col p-6 lg:p-10 max-w-[1600px] mx-auto w-full">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Incident Command
              <span className="text-sm font-medium px-2 py-1 rounded-md bg-white/10 text-text-secondary border border-white/10 relative -top-1">
                {allAlerts.length} Total
              </span>
            </h1>
            <p className="text-text-secondary mt-1">Manage active threat response workflows and assign analysts.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/Incidents/terminationlog" className="flex items-center gap-2 px-4 py-2 bg-surface-dark hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
              <span className="material-symbols-outlined text-[18px] text-danger">receipt_long</span>
              Termination Log
            </Link>
            <Link to="/reports" className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 rounded-lg text-sm font-medium text-white shadow-lg transition-colors">
              <span className="material-symbols-outlined text-[18px]">summarize</span>
              Generate Report
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-text-secondary">
            <span className="material-symbols-outlined animate-spin text-primary">sync</span>
            Loading incidents...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[600px]">

            {/* Column 1: New / Unassigned */}
            <div className="flex flex-col bg-surface-dark/50 rounded-xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-warning/20 bg-warning/5 flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2 text-warning">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  New Alerts
                </h2>
                <span className="size-6 rounded-full bg-warning/20 text-warning flex items-center justify-center text-xs font-bold">
                  {columns.new.length}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
                {columns.new.length === 0 ? (
                  <div className="text-center p-8 text-text-secondary text-sm border border-dashed border-white/10 rounded-lg">
                    No new alerts to review.
                  </div>
                ) : (
                  columns.new.map(alert => <IncidentCard key={allAlerts.indexOf(alert)} alert={alert} index={allAlerts.indexOf(alert)} />)
                )}
              </div>
            </div>

            {/* Column 2: Investigating */}
            <div className="flex flex-col bg-surface-dark/50 rounded-xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-primary/20 bg-primary/5 flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-[20px]">troubleshoot</span>
                  Investigating
                </h2>
                <span className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  {columns.investigating.length}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
                {columns.investigating.length === 0 ? (
                  <div className="text-center p-8 text-text-secondary text-sm border border-dashed border-white/10 rounded-lg">
                    No active investigations.
                  </div>
                ) : (
                  columns.investigating.map(alert => <IncidentCard key={allAlerts.indexOf(alert)} alert={alert} index={allAlerts.indexOf(alert)} />)
                )}
              </div>
            </div>

            {/* Column 3: Resolved */}
            <div className="flex flex-col bg-surface-dark/50 rounded-xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-success/20 bg-success/5 flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2 text-success">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  Resolved
                </h2>
                <span className="size-6 rounded-full bg-success/20 text-success flex items-center justify-center text-xs font-bold">
                  {columns.resolved.length}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 opacity-75 hover:opacity-100 transition-opacity">
                {columns.resolved.length === 0 ? (
                  <div className="text-center p-8 text-text-secondary text-sm border border-dashed border-white/10 rounded-lg">
                    No resolved incidents yet.
                  </div>
                ) : (
                  columns.resolved.slice(0, 10).map(alert => <IncidentCard key={allAlerts.indexOf(alert)} alert={alert} index={allAlerts.indexOf(alert)} />)
                )}
                {columns.resolved.length > 10 && (
                  <div className="text-center pt-2 text-text-secondary text-xs">
                    + {columns.resolved.length - 10} earlier resolved incidents hidden. View Reports for full history.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
