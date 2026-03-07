import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAlerts, acknowledgeAlert } from '../api.js'

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

  const columns = {
    new: allAlerts.filter(a => !a.status || a.status === 'new'),
    investigating: allAlerts.filter(a => a.status === 'acknowledged' || a.status === 'escalated'),
    resolved: allAlerts.filter(a => a.status === 'resolved')
  }

  const handleStatusChange = async (alertIdx, newStatus) => {
    await acknowledgeAlert(alertIdx, { status: newStatus })
    setAllAlerts(prev => {
      const copy = [...prev]
      if (copy[alertIdx]) copy[alertIdx].status = newStatus
      return copy
    })
  }

  const ransomwareCount = allAlerts.filter(a => a.alert_type === 'ransomware_suspected').length
  const honeytokenCount = allAlerts.length - ransomwareCount

  const IncidentCard = ({ alert, index }) => {
    const isRansomware = alert.alert_type === 'ransomware_suspected'
    const status = alert.status || 'new'

    return (
      <div className="group bg-background-dark border border-white/5 rounded-xl p-4 hover:border-primary/30 transition-all duration-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]">
        {/* Top Row: Host + Time */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`size-2.5 rounded-full flex-shrink-0 ${isRansomware ? 'bg-red-500' : 'bg-amber-500'} ${status === 'new' ? 'animate-pulse' : ''}`} />
            <span className="text-white font-semibold text-sm truncate" title={alert.host}>
              {alert.host || 'Unknown Host'}
            </span>
          </div>
          <span className="text-[11px] text-text-secondary font-mono flex-shrink-0 ml-2">{timeAgo(alert.timestamp)}</span>
        </div>

        {/* Alert Type Badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${isRansomware
            ? 'text-red-400 bg-red-500/10 border-red-500/20'
            : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}>
            <span className="material-symbols-outlined text-[12px]">{isRansomware ? 'gpp_bad' : 'key'}</span>
            {isRansomware ? 'Ransomware' : 'Honeytoken'}
          </span>
        </div>

        {/* File Path */}
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[14px] text-text-secondary flex-shrink-0">description</span>
          <span className="text-text-secondary text-xs truncate" title={alert.path || 'Unknown Path'}>
            {alert.path || 'Unknown Path'}
          </span>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/alerts/${index}`)}
              className="text-xs font-medium text-text-secondary hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              View
            </button>
            {(!alert.status || alert.status === 'new') && (
              <button
                onClick={() => handleStatusChange(index, 'acknowledged')}
                className="text-xs font-medium text-primary hover:text-blue-300 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">task_alt</span>
                Acknowledge
              </button>
            )}
            {(alert.status === 'acknowledged' || alert.status === 'escalated') && (
              <button
                onClick={() => handleStatusChange(index, 'resolved')}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Resolve
              </button>
            )}
          </div>

          {/* Analyst Avatar */}
          {alert.status && alert.status !== 'new' && (
            <div className="size-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-[10px] text-primary font-bold" title="Assigned Analyst">
              {alert.status === 'resolved' ? 'JD' : 'You'}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark font-display text-white">

      {/* ── TOP NAVIGATION BAR ── */}
      <header className="flex items-center justify-between border-b border-surface-dark bg-background-dark px-6 lg:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Go Back */}
          <button
            onClick={() => navigate(-1)}
            className="size-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 flex items-center justify-center text-text-secondary hover:text-white transition-all group"
            title="Go back"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-px transition-transform">arrow_back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">crisis_alert</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Incident Command</h1>
              <p className="text-[11px] text-text-secondary">Threat response · Triage · Analyst assignment</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link to="/alerts" className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span className="hidden md:inline">Alerts</span>
          </Link>
          <Link to="/Incidents/analysts" className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span className="hidden md:inline">Analysts</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-dark border border-white/5 rounded-xl p-5 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined text-white text-[24px]">format_list_numbered</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{allAlerts.length}</p>
              <p className="text-xs text-text-secondary">Total Incidents</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/5 rounded-xl p-5 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
              <span className="material-symbols-outlined text-amber-400 text-[24px]">error</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{columns.new.length}</p>
              <p className="text-xs text-text-secondary">Pending Triage</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/5 rounded-xl p-5 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/10">
              <span className="material-symbols-outlined text-red-400 text-[24px]">gpp_bad</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{ransomwareCount}</p>
              <p className="text-xs text-text-secondary">Ransomware</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/5 rounded-xl p-5 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
              <span className="material-symbols-outlined text-emerald-400 text-[24px]">verified_user</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{columns.resolved.length}</p>
              <p className="text-xs text-text-secondary">Resolved</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary">Quick links:</span>
            <Link to="/Incidents/terminationlog" className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-dark hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium transition-all hover:border-white/10">
              <span className="material-symbols-outlined text-[14px] text-red-400">receipt_long</span>
              Termination Log
            </Link>
            <Link to="/reports" className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-dark hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium transition-all hover:border-white/10">
              <span className="material-symbols-outlined text-[14px] text-primary">summarize</span>
              Reports
            </Link>
            <Link to="/scan" className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-dark hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium transition-all hover:border-white/10">
              <span className="material-symbols-outlined text-[14px] text-amber-400">document_scanner</span>
              Scanner
            </Link>
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
            <span className="text-text-secondary text-sm">Loading incidents...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-h-[550px]">

            {/* ── New Alerts Column ── */}
            <div className="flex flex-col rounded-2xl border border-white/5 overflow-hidden bg-surface-dark/30">
              <div className="p-4 border-b border-amber-500/15 bg-gradient-to-r from-amber-500/[0.08] to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">error</span>
                  </div>
                  <h2 className="font-bold text-amber-400 text-sm">New Alerts</h2>
                </div>
                <span className="min-w-[28px] h-7 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-bold px-2">
                  {columns.new.length}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-1 max-h-[600px]">
                {columns.new.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/10 mb-2">inbox</span>
                    <p className="text-text-secondary text-sm">No new alerts</p>
                    <p className="text-text-secondary/50 text-xs mt-1">All caught up!</p>
                  </div>
                ) : (
                  columns.new.map(alert => <IncidentCard key={allAlerts.indexOf(alert)} alert={alert} index={allAlerts.indexOf(alert)} />)
                )}
              </div>
            </div>

            {/* ── Investigating Column ── */}
            <div className="flex flex-col rounded-2xl border border-white/5 overflow-hidden bg-surface-dark/30">
              <div className="p-4 border-b border-primary/15 bg-gradient-to-r from-primary/[0.08] to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[18px]">troubleshoot</span>
                  </div>
                  <h2 className="font-bold text-primary text-sm">Investigating</h2>
                </div>
                <span className="min-w-[28px] h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold px-2">
                  {columns.investigating.length}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-1 max-h-[600px]">
                {columns.investigating.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/10 mb-2">search_off</span>
                    <p className="text-text-secondary text-sm">No active investigations</p>
                    <p className="text-text-secondary/50 text-xs mt-1">Acknowledge alerts to move them here</p>
                  </div>
                ) : (
                  columns.investigating.map(alert => <IncidentCard key={allAlerts.indexOf(alert)} alert={alert} index={allAlerts.indexOf(alert)} />)
                )}
              </div>
            </div>

            {/* ── Resolved Column ── */}
            <div className="flex flex-col rounded-2xl border border-white/5 overflow-hidden bg-surface-dark/30">
              <div className="p-4 border-b border-emerald-500/15 bg-gradient-to-r from-emerald-500/[0.08] to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified_user</span>
                  </div>
                  <h2 className="font-bold text-emerald-400 text-sm">Resolved</h2>
                </div>
                <span className="min-w-[28px] h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold px-2">
                  {columns.resolved.length}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-1 max-h-[600px] opacity-80 hover:opacity-100 transition-opacity">
                {columns.resolved.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/10 mb-2">task_alt</span>
                    <p className="text-text-secondary text-sm">No resolved incidents</p>
                    <p className="text-text-secondary/50 text-xs mt-1">Resolve investigations to archive them here</p>
                  </div>
                ) : (
                  <>
                    {columns.resolved.slice(0, 10).map(alert => <IncidentCard key={allAlerts.indexOf(alert)} alert={alert} index={allAlerts.indexOf(alert)} />)}
                    {columns.resolved.length > 10 && (
                      <div className="text-center py-3 text-text-secondary text-xs border-t border-white/5 mt-1">
                        + {columns.resolved.length - 10} more resolved — <Link to="/reports" className="text-primary hover:text-blue-300 transition-colors">View Reports</Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
