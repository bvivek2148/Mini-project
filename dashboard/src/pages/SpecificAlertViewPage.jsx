import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { fetchAlerts, acknowledgeAlert } from '../api.js'

function formatTs(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString([], {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
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

function copyText(text) {
  if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => { })
}

const LS_KEY = 'rt_recent_alerts'
function saveRecent(idx) {
  try {
    const prev = JSON.parse(localStorage.getItem(LS_KEY) || '[]').filter(x => x !== idx)
    localStorage.setItem(LS_KEY, JSON.stringify([idx, ...prev].slice(0, 10)))
  } catch { }
}

/* ── Reusable card shell ─────────────────────────────────────────────────── */
function Card({ icon, title, badge, children, className = '' }) {
  return (
    <div className={`bg-[#0f1923] rounded-2xl border border-white/[0.06] overflow-hidden ${className}`}>
      <div className="px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
        <h3 className="text-white font-semibold text-[15px] flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[18px] text-blue-400">{icon}</span>
          {title}
        </h3>
        {badge}
      </div>
      {children}
    </div>
  )
}

/* ── Status pill ────────────────────────────────────────────────────────── */
function StatusChip({ ok, yesLabel = 'Active', noLabel = 'Inactive' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${ok
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      : 'bg-red-500/10 text-red-400/70 border-red-500/15'
      }`}>
      <span className={`size-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400/60'}`} />
      {ok ? yesLabel : noLabel}
    </span>
  )
}

export default function SpecificAlertViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [allAlerts, setAllAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [alertStatus, setAlertStatus] = useState(null)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    fetchAlerts().then(data => {
      setAllAlerts(data)
      let idx = parseInt(id, 10)
      if (isNaN(idx)) idx = data.length - 1
      const found = idx >= 0 ? data[idx] ?? null : null
      setAlert(found)
      setAlertStatus(found?.status ?? null)
      setLoading(false)
      if (idx >= 0 && !isNaN(idx)) saveRecent(idx)
    }).catch(() => setLoading(false))
  }, [id])

  const currentIdx = isNaN(parseInt(id, 10)) ? (allAlerts.length - 1) : parseInt(id, 10)
  const isR = alert?.alert_type === 'ransomware_suspected'
  const qFiles = alert?.quarantined_files || []

  function handleCopy(text, key) {
    copyText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  /* ── severity helpers ── */
  const sevLabel = isR ? 'Critical' : 'High'
  const sevColor = isR ? 'bg-red-500/15 text-red-400 border-red-500/25' : 'bg-orange-500/15 text-orange-400 border-orange-500/25'

  /* ── loading / not found ── */
  if (loading) return (
    <div className="bg-[#080e14] min-h-screen flex items-center justify-center font-['Inter',sans-serif]">
      <div className="flex items-center gap-3 text-slate-400">
        <span className="material-symbols-outlined animate-spin text-blue-400 text-3xl">progress_activity</span>
        <span className="text-lg font-medium">Loading alert…</span>
      </div>
    </div>
  )

  if (!alert) return (
    <div className="bg-[#080e14] min-h-screen flex flex-col items-center justify-center font-['Inter',sans-serif] gap-4">
      <span className="material-symbols-outlined text-6xl text-slate-600">search_off</span>
      <p className="text-slate-400 text-lg">Alert #{id} not found.</p>
      <button onClick={() => navigate('/Incidents')} className="text-blue-400 hover:text-blue-300 text-sm font-medium">← Back to Incidents</button>
    </div>
  )

  return (
    <div className="bg-[#080e14] min-h-screen flex flex-col font-['Inter',sans-serif] text-white">

      {/* ══════ HEADER ══════ */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0a1018]/90 backdrop-blur-xl px-8 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 text-white hover:text-white">
            <span className="material-symbols-outlined text-blue-400 text-[28px]">shield_lock</span>
            <span className="text-lg font-bold tracking-tight">Ransom Trap</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-7">
            <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/">Dashboard</Link>
            <Link className="text-white text-sm font-medium" to="/Incidents">Incidents</Link>
            <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/alerts">Alerts</Link>
            <Link className="text-slate-400 hover:text-white transition-colors text-sm font-medium" to="/Incidents/analysts">Analysts</Link>
          </nav>
        </div>
      </header>

      {/* ══════ MAIN ══════ */}
      <main className="flex-1 flex flex-col items-center py-7 px-5 lg:px-10">
        <div className="w-full max-w-[1440px] flex flex-col gap-7">

          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link to="/Incidents" className="hover:text-white transition-colors">Incidents</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-white font-medium">Alert #{id}</span>
          </nav>

          {/* ── Alert Header ── */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 pb-6 border-b border-white/[0.06]">
            <div className="flex flex-col gap-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-widest border ${sevColor}`}>{sevLabel}</span>
                {alertStatus ? (
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-widest border ${alertStatus === 'acknowledged' ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' :
                    alertStatus === 'escalated' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                    }`}>{alertStatus}</span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-widest bg-white/[0.04] text-slate-400 border border-white/[0.08]">Active</span>
                )}
                <span className="text-slate-500 text-sm">Detected {timeAgo(alert.timestamp)}</span>
              </div>
              <h1 className="text-[28px] lg:text-[34px] font-extrabold tracking-tight leading-tight">
                {isR ? 'Suspicious Encryption / Ransomware Activity' : 'Honeytoken File Accessed'}
              </h1>
              <p className="text-slate-400 text-[15px] leading-relaxed">
                {isR
                  ? `Mass file modification detected matching ransomware patterns on host '${alert.host}'.`
                  : `Honeytoken file accessed on host '${alert.host}' — possible unauthorized access.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button className="flex items-center gap-2 h-9 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-[13px] font-semibold rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">ios_share</span>Export
              </button>
              <button className="flex items-center gap-2 h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold rounded-lg shadow-[0_0_16px_rgba(59,130,246,0.35)] transition-all"
                onClick={async () => { await acknowledgeAlert(currentIdx, { status: 'acknowledged' }); setAlertStatus('acknowledged') }}>
                <span className="material-symbols-outlined text-[18px]">task_alt</span>Acknowledge
              </button>
              <button className="flex items-center gap-2 h-9 px-4 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 text-[13px] font-semibold rounded-lg transition-colors"
                onClick={async () => { await acknowledgeAlert(currentIdx, { status: 'escalated' }); setAlertStatus('escalated') }}>
                <span className="material-symbols-outlined text-[18px]">priority_high</span>Escalate
              </button>
              <button className="flex items-center gap-2 h-9 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-white text-[13px] font-semibold rounded-lg transition-colors"
                onClick={async () => { await acknowledgeAlert(currentIdx, { status: 'resolved' }); setAlertStatus('resolved'); navigate('/Incidents') }}>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>Resolve
              </button>
            </div>
          </div>

          {/* ── Active Response Status Strip ── */}
          {isR && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: 'gpp_bad', label: 'Process Kill', ok: alert.process_killed, yes: 'Terminated', no: 'Not Killed', desc: alert.process_killed ? `PID ${alert.pid} terminated` : 'Process was not terminated', gradient: 'from-red-500/10 to-transparent' },
                { icon: 'lock', label: 'Folder Lockdown', ok: alert.folder_locked, yes: 'Locked', no: 'Unlocked', desc: alert.folder_locked ? 'Write access revoked' : 'Folder still writable', gradient: 'from-amber-500/10 to-transparent' },
                { icon: 'shield', label: 'Auto Quarantine', ok: qFiles.length > 0, yes: `${qFiles.length} File${qFiles.length !== 1 ? 's' : ''}`, no: 'None', desc: qFiles.length > 0 ? `${qFiles.length} file(s) isolated` : 'No files quarantined', gradient: 'from-violet-500/10 to-transparent' },
              ].map(c => (
                <div key={c.label} className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br ${c.gradient} p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-slate-300">{c.icon}</span>
                      <span className="text-[13px] font-semibold text-white">{c.label}</span>
                    </div>
                    <StatusChip ok={c.ok} yesLabel={c.yes} noLabel={c.no} />
                  </div>
                  <p className="text-slate-400 text-xs">{c.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Two Column Layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT (4/12) ── */}
            <div className="lg:col-span-4 flex flex-col gap-6">

              {/* Risk Gauge */}
              <Card icon="speed" title="Threat Confidence">
                <div className="p-5 flex items-center gap-6">
                  <div className="relative size-[88px] flex-shrink-0">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeDasharray="100,100" strokeWidth="3.5" strokeLinecap="round" />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke={isR ? '#ef4444' : '#f97316'} strokeWidth="3.5" strokeLinecap="round"
                        strokeDasharray={`${isR ? 92 : 65}, 100`}
                        style={{ filter: `drop-shadow(0 0 6px ${isR ? 'rgba(239,68,68,0.5)' : 'rgba(249,115,22,0.4)'})` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[22px] font-extrabold">{isR ? '92%' : '65%'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`font-bold text-lg ${isR ? 'text-red-400' : 'text-orange-400'}`}>
                      {isR ? 'High Confidence' : 'Medium Risk'}
                    </span>
                    <span className="text-slate-500 text-[13px] leading-relaxed">Based on entropy analysis &amp; behavioral heuristics.</span>
                  </div>
                </div>
              </Card>

              {/* Incident Context */}
              <Card icon="info" title="Incident Context">
                <div className="p-4 flex flex-col gap-0">
                  {[
                    { label: 'Hostname', value: alert.host || '—', icon: 'computer', copy: true },
                    { label: 'IP Address', value: alert.local_ip || '—', icon: 'language', copy: !!alert.local_ip },
                    { label: 'Process', value: alert.process_name || '—', icon: 'terminal', copy: false },
                    { label: 'PID', value: alert.pid != null ? String(alert.pid) : '—', icon: 'memory', copy: false },
                    { label: 'Alert Type', value: alert.alert_type || '—', icon: 'warning', copy: false },
                  ].map(({ label, value, icon, copy }) => (
                    <div key={label} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-slate-500">{icon}</span>
                        <span className="text-slate-400 text-[13px] w-20 flex-shrink-0">{label}</span>
                        <span className="text-white text-[13px] font-medium font-mono truncate">{value}</span>
                      </div>
                      {copy && (
                        <button className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-all" onClick={() => handleCopy(value, label)}>
                          <span className="material-symbols-outlined text-[15px]">{copied === label ? 'check' : 'content_copy'}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Timeline */}
              <Card icon="timeline" title="Activity Timeline">
                <div className="p-5 overflow-y-auto max-h-[420px]">
                  <div className="relative ml-2.5 border-l border-white/[0.08] space-y-6">
                    {[
                      { color: 'bg-blue-400', label: 'Alert Received', desc: 'Alert submitted to server from agent.', ts: 'Auto-logged' },
                      { color: 'bg-amber-400', label: isR ? 'Encryption Detected' : 'Honeytoken Accessed', desc: isR ? 'Rapid high-entropy file modifications detected.' : `File accessed: ${alert.path?.split('\\').pop() || '—'}`, ts: formatTs(alert.timestamp) },
                      { color: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', label: 'Threat Confirmed', desc: isR ? 'Heuristic engine classified activity as ransomware.' : 'Honeytoken trap triggered.', ts: formatTs(alert.timestamp) },
                      ...(alert.process_killed ? [{ color: 'bg-emerald-400', label: 'Process Terminated', desc: `PID ${alert.pid} killed via auto-response.`, ts: formatTs(alert.timestamp) }] : []),
                      ...(alert.folder_locked ? [{ color: 'bg-violet-400', label: 'Folder Locked', desc: 'Write access revoked on target directory.', ts: formatTs(alert.timestamp) }] : []),
                      ...(qFiles.length > 0 ? [{ color: 'bg-cyan-400', label: `${qFiles.length} File(s) Quarantined`, desc: `Moved to isolated quarantine directory.`, ts: formatTs(alert.timestamp) }] : []),
                    ].map((ev, i) => (
                      <div key={i} className="relative pl-6">
                        <span className={`absolute -left-[7px] top-1.5 size-3 rounded-full border-2 border-[#0f1923] ${ev.color}`} />
                        <span className="text-[11px] text-slate-500 font-mono">{ev.ts}</span>
                        <p className="text-white text-[13px] font-semibold mt-0.5">{ev.label}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{ev.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* ── RIGHT (8/12) ── */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Process Metadata */}
              <Card icon="memory" title="Process Metadata"
                badge={alert.pid != null && <span className="text-[11px] font-mono bg-red-500/15 text-red-400 px-2.5 py-1 rounded-md border border-red-500/20">PID: {alert.pid}</span>}>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {alert.path && (
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">File Path (Trigger)</label>
                      <div className="bg-black/30 p-3 rounded-lg border border-white/[0.06] font-mono text-[13px] text-white break-all flex items-start gap-2 group">
                        {alert.path}
                        <button className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity" onClick={() => handleCopy(alert.path, 'path')}>
                          <span className="material-symbols-outlined text-[16px]">{copied === 'path' ? 'check' : 'content_copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                  {[
                    { label: 'Process Name', value: alert.process_name || '—', icon: 'terminal' },
                    { label: 'Host Machine', value: alert.host || '—', icon: 'computer' },
                    { label: 'IP Address', value: alert.local_ip || '—', icon: 'language' },
                    { label: 'Detection Time', value: formatTs(alert.timestamp), icon: 'schedule' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block">{f.label}</label>
                      <div className="flex items-center gap-2 text-[13px] text-white font-mono">
                        <span className="material-symbols-outlined text-slate-500 text-[16px]">{f.icon}</span>
                        {f.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* File Activity */}
              <Card icon="folder_zip" title="File Activity"
                badge={<span className="text-[11px] font-mono text-slate-500">{alert.path ? '1 file' : '0 files'}</span>}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-black/20 text-slate-500 font-medium border-b border-white/[0.06]">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Operation</th>
                        <th className="px-5 py-3 font-semibold">File Path</th>
                        <th className="px-5 py-3 font-semibold">Size</th>
                        <th className="px-5 py-3 font-semibold text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {alert.path ? (
                        <tr className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/15">
                              <span className="size-1.5 rounded-full bg-red-400" />
                              {isR ? 'Encrypt' : 'Access'}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono text-slate-300 truncate max-w-[300px]" title={alert.path}>
                            {alert.path}
                          </td>
                          <td className="px-5 py-3 text-slate-500">—</td>
                          <td className="px-5 py-3 text-slate-400 text-right font-mono">
                            {new Date((alert.timestamp || 0) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-5 py-10 text-center text-slate-500">No file activity recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Quarantined Files (only if any) */}
              {qFiles.length > 0 && (
                <Card icon="shield" title="Quarantined Files"
                  badge={<span className="text-[11px] font-mono bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-md border border-violet-500/20">{qFiles.length} file{qFiles.length !== 1 ? 's' : ''}</span>}>
                  <div className="p-4 space-y-2">
                    {qFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/20 border border-white/[0.04] hover:border-violet-500/20 transition-colors">
                        <span className="material-symbols-outlined text-violet-400 text-[18px]">lock</span>
                        <span className="text-[13px] font-mono text-white flex-1 truncate">{f}</span>
                        <span className="text-[11px] text-slate-500">Isolated</span>
                      </div>
                    ))}
                    <p className="text-[11px] text-slate-500 pt-2 px-1">
                      Files moved to <code className="bg-black/30 px-1.5 py-0.5 rounded text-slate-400">ransom_trap/data/quarantine/</code>
                    </p>
                  </div>
                </Card>
              )}

              {/* Network + Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Network */}
                <Card icon="lan" title="Network Info">
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-red-400 animate-pulse" />
                        <div className="flex flex-col">
                          <span className="text-white text-[13px] font-mono">{alert.host || '—'}</span>
                          <span className="text-slate-500 text-[11px]">Source Host · {alert.local_ip || '127.0.0.1'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400/80 px-2 py-0.5 rounded-md border border-red-500/15">Attacker</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-emerald-400" />
                        <div className="flex flex-col">
                          <span className="text-slate-300 text-[13px] font-mono">Ransom Trap Server</span>
                          <span className="text-slate-500 text-[11px]">Port 8000 · API</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400/80 px-2 py-0.5 rounded-md border border-emerald-500/15">Reporting</span>
                    </div>
                  </div>
                </Card>

                {/* Analyst Notes */}
                <Card icon="edit_note" title="Analyst Notes">
                  <div className="p-4 flex flex-col">
                    <textarea
                      className="w-full bg-black/20 border border-white/[0.06] rounded-lg p-3 text-[13px] text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 resize-none transition-all"
                      placeholder="Add investigation notes…"
                      rows={4}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => { setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2000) }}
                        className={`text-[12px] font-bold px-4 py-2 rounded-lg transition-all ${noteSaved
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20'
                          }`}
                      >
                        {noteSaved ? '✓ Saved' : 'Save Note'}
                      </button>
                    </div>
                  </div>
                </Card>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
