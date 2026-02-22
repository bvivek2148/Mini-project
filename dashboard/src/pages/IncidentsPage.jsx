import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { fetchAlerts } from '../api.js'

function formatTs(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString([], {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Math.floor(Date.now() / 1000 - ts)
  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}

function copyText(text) {
  if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => { })
}

// ── Recently-viewed tracking via localStorage ─────────────────────────────
const LS_KEY = 'rt_recent_alerts'

function getRecent() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

function saveRecent(idx) {
  const prev = getRecent().filter(x => x !== idx)
  localStorage.setItem(LS_KEY, JSON.stringify([idx, ...prev].slice(0, 10)))
}

export default function IncidentsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [allAlerts, setAllAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [incidentsMenuOpen, setIncidentsMenuOpen] = useState(false)
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [recentIds, setRecentIds] = useState(getRecent)

  useEffect(() => {
    fetchAlerts().then(data => {
      setAllAlerts(data)
      // If no :id in URL (e.g. /Incidents), use the most recent alert
      let idx = parseInt(id, 10)
      if (isNaN(idx)) idx = data.length - 1
      const found = idx >= 0 ? data[idx] ?? null : null
      setAlert(found)
      setLoading(false)
      if (idx >= 0 && !isNaN(idx)) {
        saveRecent(idx)
        setRecentIds(getRecent())
      }
    }).catch(() => setLoading(false))
  }, [id])

  // currentIdx used for highlighting in sidebar/dropdown
  const currentIdx = isNaN(parseInt(id, 10))
    ? (allAlerts.length - 1)
    : parseInt(id, 10)
  const isRansomware = alert?.alert_type === 'ransomware_suspected'
  const alertTitle = isRansomware
    ? `Alert #${id}: Suspicious Encryption / Ransomware Activity`
    : `Alert #${id}: Honeytoken File Accessed`
  const alertDesc = isRansomware
    ? `Mass file modification detected matching ransomware patterns on host '${alert?.host}'.`
    : `Honeytoken file accessed on host '${alert?.host}' — possible unauthorized access.`

  function handleSaveNote() {
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  // File activity derived from real alert
  const fileActivity = alert?.path ? [
    {
      op: alert.alert_type === 'ransomware_suspected' ? 'Encrypt' : 'Access',
      color: 'danger',
      path: alert.path,
      size: '—',
      ts: new Date((alert.timestamp || 0) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }
  ] : []

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">

      {/* ── TOP NAVIGATION ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-surface-dark bg-background-dark px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-white">
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined text-4xl">shield_lock</span>
            </div>
            <Link to="/dashboard" className="text-white text-lg font-bold leading-tight tracking-[-0.015em] hover:text-white">
              Ransom Trap
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-9">
            <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" to="/dashboard">Dashboard</Link>
            <Link className="text-white text-sm font-medium leading-normal" to="/Incidents">Incidents</Link>
            <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" to="/alerts/list">Alerts</Link>
            <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" to="/analysts">Analysts</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <span className="absolute left-3 text-text-secondary material-symbols-outlined text-[20px]">search</span>
            <input
              className="w-64 bg-surface-dark border-none rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-text-secondary focus:ring-1 focus:ring-primary"
              placeholder="Search alerts, hosts, hashes..."
            />
          </div>
          <button className="relative p-2 text-text-secondary hover:text-white">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-danger rounded-full border-2 border-background-dark" />
          </button>
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-surface-dark"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCBGWm_A3xJs9cVmw2Vk29_idfHrCo_D1p9unfQzQElfFNU9Gk4kkUjbjfRdhvC9wl00AQ9gB_1YyX852nH73PegjhE56mnmqlhHsCLg4SEXUYIMYVXut5DN10Aj2FfmKwTJC7BEuDxt1GTorUe-tBbKSK95ca42MYiF0J5cz219c0EWtguU3ucUs86Y9xMUaRs6PN5aSzNR8a3SRB3eghgPemyLdxbxvhuM7M5s2lShyG5wlgn9H5V7F2G3qtCTK9_Ejlv1UBkebo")' }}
          />
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center py-6 px-6 lg:px-10">
        <div className="w-full max-w-[1400px] flex flex-col gap-6">

          {loading && (
            <div className="flex items-center justify-center py-24 gap-2 text-text-secondary">
              <span className="material-symbols-outlined animate-spin text-primary">sync</span>
              Loading alert…
            </div>
          )}

          {!loading && !alert && (
            <div className="flex flex-col items-center py-24 gap-4 text-text-secondary">
              <span className="material-symbols-outlined text-5xl">search_off</span>
              <p className="text-lg">Alert #{id} not found.</p>
              <button onClick={() => navigate('/Incidents')} className="text-primary hover:underline text-sm">
                ← Back to Incidents
              </button>
            </div>
          )}

          {!loading && alert && (
            <>
              {/* Breadcrumbs */}
              <nav className="flex items-center text-sm relative">
                {/* Incidents dropdown */}
                <div className="relative inline-flex items-center">
                  <button
                    type="button"
                    className="text-text-secondary hover:text-white transition-colors flex items-center gap-0.5"
                    onClick={() => setIncidentsMenuOpen(v => !v)}
                  >
                    Incidents
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>

                  {incidentsMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIncidentsMenuOpen(false)} aria-hidden="true" />
                      <div className="absolute left-0 top-full mt-2 w-52 rounded-lg border border-white/10 bg-surface-dark shadow-2xl z-50 overflow-hidden">
                        <Link
                          to="/processes/termination-log"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                          onClick={() => setIncidentsMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
                          Termination Log
                        </Link>
                      </div>
                    </>
                  )}
                </div>

              </nav>

              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 border-b border-surface-dark pb-6">
                <div className="flex flex-col gap-2 max-w-3xl">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${isRansomware ? 'bg-danger/20 text-danger border-danger/20' : 'bg-orange-500/20 text-orange-400 border-orange-500/20'}`}>
                      {isRansomware ? 'Critical' : 'High'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-surface-dark text-text-secondary border border-surface-dark">Active</span>
                    <span className="text-text-secondary text-sm">Detected {timeAgo(alert.timestamp)}</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">{alertTitle}</h1>
                  <p className="text-text-secondary text-lg">{alertDesc}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 h-10 px-5 bg-surface-dark hover:bg-[#2f455a] border border-[#364e65] text-white text-sm font-semibold rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[20px]">ios_share</span>
                    Export
                  </button>
                  <button className="flex items-center gap-2 h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(19,127,236,0.4)] transition-all">
                    <span className="material-symbols-outlined text-[20px]">block</span>
                    Quarantine Host
                  </button>
                  <button className="flex items-center gap-2 h-10 px-5 bg-surface-dark hover:bg-[#2f455a] text-white text-sm font-semibold rounded-lg transition-colors" onClick={() => navigate('/Incidents')}>
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── LEFT COLUMN (4/12) ── */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                  {/* Risk Probability Card */}
                  <div className="bg-surface-dark rounded-xl p-6 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-8xl">speed</span>
                    </div>
                    <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">analytics</span>
                      Risk Probability
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="relative size-24">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="4" />
                          <path
                            className={isRansomware ? 'text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-orange-400'}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none" stroke="currentColor"
                            strokeDasharray={`${isRansomware ? 92 : 65}, 100`}
                            strokeWidth="4"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-2xl font-bold text-white">{isRansomware ? '92%' : '65%'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold text-lg ${isRansomware ? 'text-danger' : 'text-orange-400'}`}>
                          {isRansomware ? 'High Confidence' : 'Medium Risk'}
                        </span>
                        <span className="text-text-secondary text-sm">Based on heuristics &amp; behavioral patterns.</span>
                      </div>
                    </div>
                  </div>

                  {/* Incident Context Card */}
                  <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                      <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                        Incident Context
                      </h3>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                      {[
                        { label: 'Hostname', value: alert.host || '—', copy: true },
                        { label: 'IP Address', value: '—', copy: false },
                        { label: 'User', value: alert.process_name ? `${alert.process_name}` : '—', copy: false },
                        { label: 'PID', value: alert.pid != null ? String(alert.pid) : '—', copy: false },
                        { label: 'Alert Type', value: alert.alert_type || '—', copy: false },
                      ].map(({ label, value, copy }) => (
                        <div key={label} className="grid grid-cols-[100px_1fr] gap-2 items-center">
                          <span className="text-text-secondary text-sm">{label}</span>
                          <div className="flex items-center justify-between text-white text-sm font-medium bg-background-dark/50 px-3 py-2 rounded">
                            {value}
                            {copy && (
                              <button className="text-text-secondary hover:text-white" onClick={() => copyText(value)}>
                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="bg-surface-dark rounded-xl border border-white/5 flex flex-col max-h-[500px]">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                      <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                        Activity Timeline
                      </h3>
                    </div>
                    <div className="p-6 overflow-y-auto">
                      <div className="relative border-l border-white/10 ml-2 space-y-8">
                        <div className="relative pl-6">
                          <span className="absolute -left-[9px] top-1 bg-background-dark border-2 border-primary rounded-full size-4" />
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-text-secondary font-mono">Auto-logged</span>
                            <p className="text-white text-sm font-medium">Alert Assigned</p>
                            <p className="text-text-secondary text-xs">Alert submitted to server from agent.</p>
                          </div>
                        </div>
                        <div className="relative pl-6">
                          <span className="absolute -left-[9px] top-1 bg-background-dark border-2 border-warning rounded-full size-4" />
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-text-secondary font-mono">{formatTs(alert.timestamp)}</span>
                            <p className="text-white text-sm font-medium">
                              {isRansomware ? 'Suspicious Encryption Detected' : 'Honeytoken Access Detected'}
                            </p>
                            <p className="text-text-secondary text-xs">
                              {isRansomware
                                ? 'Process attempted rapid file modification.'
                                : <>File accessed: <code className="bg-black/30 px-1 rounded text-warning">{alert.path?.split('\\').pop() || '—'}</code></>}
                            </p>
                          </div>
                        </div>
                        <div className="relative pl-6">
                          <span className="absolute -left-[9px] top-1 bg-background-dark border-2 border-danger rounded-full size-4 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-text-secondary font-mono">{formatTs(alert.timestamp)}</span>
                            <p className="text-white text-sm font-medium">Threat Detected</p>
                            <p className="text-text-secondary text-xs">
                              {isRansomware ? 'Heuristic engine flagged rapid file encryption.' : 'Honeytoken file triggered alert.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT COLUMN (8/12) ── */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                  {/* Process Metadata */}
                  <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                      <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">memory</span>
                        Process Metadata
                      </h3>
                      <span className="text-xs font-mono bg-danger/20 text-danger px-2 py-1 rounded border border-danger/20">
                        PID: {alert.pid ?? '—'}
                      </span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {alert.path && (
                        <div className="col-span-1 md:col-span-2">
                          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">File Path (Trigger)</label>
                          <div className="bg-black/30 p-3 rounded border border-white/5 font-mono text-sm text-white break-all flex items-start gap-2 group">
                            {alert.path}
                            <button className="ml-auto opacity-0 group-hover:opacity-100 text-text-secondary hover:text-white transition-opacity" onClick={() => copyText(alert.path)}>
                              <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            </button>
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1 block">Process Name</label>
                        <div className="flex items-center gap-2 text-sm text-white font-mono break-all">
                          <span className="material-symbols-outlined text-text-secondary text-[18px]">folder_open</span>
                          {alert.process_name || '—'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1 block">Host Machine</label>
                        <div className="flex items-center gap-2 text-sm text-white font-mono">
                          <span className="material-symbols-outlined text-text-secondary text-[18px]">computer</span>
                          {alert.host || '—'}
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1 block">Detection Timestamp</label>
                        <div className="flex items-center justify-between text-sm text-text-secondary font-mono border-b border-dashed border-text-secondary/30 pb-1">
                          {formatTs(alert.timestamp)}
                          <button className="text-text-secondary hover:text-white" onClick={() => copyText(formatTs(alert.timestamp))}>
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Activity Table */}
                  <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden flex-1">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                      <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">folder_zip</span>
                        File Activity
                      </h3>
                      <div className="flex gap-2">
                        <button className="text-text-secondary hover:text-white"><span className="material-symbols-outlined">filter_list</span></button>
                        <button className="text-text-secondary hover:text-white"><span className="material-symbols-outlined">download</span></button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-background-dark/50 text-text-secondary font-medium border-b border-white/5">
                          <tr>
                            <th className="px-6 py-3 font-semibold">Operation</th>
                            <th className="px-6 py-3 font-semibold">File Path</th>
                            <th className="px-6 py-3 font-semibold">Size</th>
                            <th className="px-6 py-3 font-semibold text-right">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {fileActivity.length > 0 ? fileActivity.map((f, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-3">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-danger/10 text-danger border border-danger/10`}>
                                  <span className="size-1.5 rounded-full bg-danger" /> {f.op}
                                </span>
                              </td>
                              <td className="px-6 py-3 font-mono text-text-secondary truncate max-w-[200px] lg:max-w-[300px]" title={f.path}>
                                {f.path.length > 40 ? `...${f.path.slice(-40)}` : f.path}
                              </td>
                              <td className="px-6 py-3 text-text-secondary">{f.size}</td>
                              <td className="px-6 py-3 text-text-secondary text-right font-mono">{f.ts}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                                No file activity recorded for this alert.
                              </td>
                            </tr>
                          )}

                          {/* All other alerts from same host as additional activity */}
                          {allAlerts
                            .map((a, i) => ({ ...a, idx: i }))
                            .filter(a => a.host === alert.host && a.idx !== currentIdx && a.path)
                            .map(a => (
                              <tr key={a.idx} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/alerts/${a.idx}`)}>
                                <td className="px-6 py-3">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning border border-warning/10">
                                    <span className="size-1.5 rounded-full bg-warning" />
                                    {a.alert_type === 'ransomware_suspected' ? 'Encrypt' : 'Access'}
                                  </span>
                                </td>
                                <td className="px-6 py-3 font-mono text-text-secondary truncate max-w-[200px] lg:max-w-[300px]" title={a.path}>
                                  {(a.path || '').length > 40 ? `...${(a.path || '').slice(-40)}` : a.path}
                                </td>
                                <td className="px-6 py-3 text-text-secondary">—</td>
                                <td className="px-6 py-3 text-text-secondary text-right font-mono">
                                  {new Date((a.timestamp || 0) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      <div className="px-6 py-3 bg-background-dark/30 border-t border-white/5 text-center">
                        <button className="text-primary text-sm font-medium hover:text-blue-400 transition-colors">
                          View all affected files from {alert.host}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Network Connections + Analyst Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Network Connections */}
                    <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
                      <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">lan</span>
                          Network Connections
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between p-3 rounded bg-background-dark/50 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-danger animate-pulse" />
                            <div className="flex flex-col">
                              <span className="text-white text-sm font-mono">{alert.host || '—'}</span>
                              <span className="text-text-secondary text-xs">Source Host</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-white/10 text-text-secondary px-2 py-1 rounded">ACTIVE</span>
                            <span className="material-symbols-outlined text-danger text-[18px]">public</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded bg-background-dark/50 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-text-secondary" />
                            <div className="flex flex-col">
                              <span className="text-text-secondary text-sm font-mono">Ransom Trap Server</span>
                              <span className="text-text-secondary text-xs">Port 8000 (API)</span>
                            </div>
                          </div>
                          <span className="text-xs bg-white/10 text-text-secondary px-2 py-1 rounded">REPORTING</span>
                        </div>
                      </div>
                    </div>

                    {/* Analyst Notes */}
                    <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">sticky_note_2</span>
                          Analyst Notes
                        </h3>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <textarea
                          className="w-full flex-1 bg-background-dark/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-text-secondary focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                          placeholder="Add a note about this investigation..."
                          rows={3}
                          value={note}
                          onChange={e => setNote(e.target.value)}
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={handleSaveNote}
                            className={`text-xs font-bold px-3 py-2 rounded transition-colors ${noteSaved ? 'bg-success/20 text-success' : 'bg-primary/20 hover:bg-primary/30 text-primary'}`}
                          >
                            {noteSaved ? '✓ Saved' : 'Add Note'}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
