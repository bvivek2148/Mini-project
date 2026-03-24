import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'

function fmtTs(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const { alerts, loading } = useAlerts(5000)

  const today = new Date().toISOString().split('T')[0]
  const lastWeek = new Date(Date.now() - 7 * 864e5).toISOString().split('T')[0]

  const [dateRange, setDateRange] = useState({ start: lastWeek, end: today })
  const [incidentType, setIncidentType] = useState('All Incidents')
  const [exportFormat, setExportFormat] = useState('PDF')
  const [includeMeta, setIncludeMeta] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(0.85)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const filtered = useMemo(() => {
    return [...alerts].filter(a => {
      if (dateRange.start && a.timestamp) { if (a.timestamp < new Date(dateRange.start).getTime() / 1000) return false }
      if (dateRange.end && a.timestamp) { if (a.timestamp > new Date(dateRange.end).getTime() / 1000 + 86400) return false }
      if (incidentType !== 'All Incidents') {
        const t = (a.alert_type || '').toLowerCase()
        if (incidentType === 'Honeytoken Access' && t !== 'honeytoken_access') return false
        if (incidentType === 'Process Termination' && t !== 'process_terminated') return false
        if (incidentType === 'High Severity Only') {
          const s = (a.severity || 'CRITICAL').toUpperCase()
          if (s !== 'CRITICAL' && s !== 'HIGH') return false
        }
      }
      return true
    }).reverse()
  }, [alerts, dateRange, incidentType])

  const stats = useMemo(() => {
    const total = filtered.length
    const critical = filtered.filter(a => { const s = (a.severity || 'CRITICAL').toUpperCase(); return s === 'CRITICAL' || s === 'HIGH' }).length
    const ransom = filtered.filter(a => a.alert_type === 'ransomware_suspected').length
    const honey = filtered.filter(a => a.alert_type === 'honeytoken_access').length
    return { total, critical, standard: total - critical, ransom, honey }
  }, [filtered])

  /* ── export logic ── */
  const handleExport = () => {
    if (filtered.length === 0) { alert('No data to export.'); return }
    if (exportFormat === 'CSV') {
      const h = ['Timestamp', 'Type', 'Host', 'Process', 'PID', 'Severity', 'Path', ...(includeMeta ? ['Raw'] : [])]
      const rows = filtered.map(a => [
        a.timestamp ? new Date(a.timestamp * 1000).toISOString() : '', a.alert_type || '', a.host || '', a.process_name || '', a.pid || '', a.severity || 'CRITICAL', a.path || '', ...(includeMeta ? [JSON.stringify(a)] : [])
      ])
      const csv = [h.join(','), ...rows.map(r => r.map(s => `"${String(s).replace(/"/g, '""')}"`).join(','))].join('\n')
      const b = new Blob([csv], { type: 'text/csv' })
      const u = URL.createObjectURL(b)
      const l = Object.assign(document.createElement('a'), { href: u, download: `ransom_trap_${Date.now()}.csv` })
      document.body.appendChild(l); l.click(); document.body.removeChild(l)
    } else if (exportFormat === 'JSON') {
      const d = includeMeta ? filtered : filtered.map(({ _id, ...r }) => r)
      const s = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(d, null, 2))
      const l = Object.assign(document.createElement('a'), { href: s, download: `ransom_trap_${Date.now()}.json` })
      document.body.appendChild(l); l.click(); document.body.removeChild(l)
    } else {
      document.body.classList.add('print-mode')
      setTimeout(() => { window.print(); document.body.classList.remove('print-mode') }, 300)
    }
  }

  const css = `
    .rp-glass{backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
    ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:99px}
    ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.15)}
    input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:.4;cursor:pointer}
    input[type=date]::-webkit-calendar-picker-indicator:hover{opacity:.8}
    @media print{body *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
    body{background:#fff!important;margin:0!important}.rp-no-print{display:none!important}
    .rp-paper{position:absolute!important;left:0!important;top:0!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;box-shadow:none!important;transform:none!important;background:#fff!important;z-index:999999!important}}
  `

  /* ── reusable field label ── */
  const Label = ({ children }) => (
    <label className="text-[11px] font-bold text-white/35 tracking-[0.18em] uppercase block mb-2">{children}</label>
  )

  return (
    <div className="h-screen flex flex-col bg-[#050a12] font-['Inter',sans-serif] text-white overflow-hidden relative">
      <style>{css}</style>

      {/* ═══ BG ═══ */}
      <div className="absolute inset-0 pointer-events-none z-0 rp-no-print">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 75% 15%, rgba(99,102,241,0.07) 0%, transparent 60%)' }} />
      </div>

      {/* ═══ HEADER ═══ */}
      <header className="flex-none h-[52px] px-6 flex items-center justify-between border-b border-white/[0.05] bg-[#050a12]/95 rp-glass z-30 rp-no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="size-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-white/30 hover:text-white transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
          </button>
          <div className="h-5 w-px bg-white/[0.06]" />
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-indigo-500/12 border border-indigo-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-indigo-400">description</span>
            </div>
            <span className="text-[14px] font-bold text-white/90 tracking-tight">Reports</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[{ to: '/', i: 'dashboard' }, { to: '/alerts', i: 'notifications_active' }, { to: '/Incidents', i: 'warning' }].map(l => (
            <Link key={l.to} to={l.to} className="size-8 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.06] transition-all">
              <span className="material-symbols-outlined text-[17px]">{l.i}</span>
            </Link>
          ))}
        </div>
      </header>

      {/* ═══ MAIN ═══ */}
      <main className="flex-1 overflow-y-auto z-10 min-h-0">
        <div className="max-w-[1520px] mx-auto px-6 md:px-8 py-7">

          {/* Title */}
          <div className="mb-7 rp-no-print">
            <h1 className="text-[30px] font-extrabold tracking-tight leading-tight">Incident Report Generator</h1>
            <p className="text-white/35 text-[14px] mt-1">Configure filters, preview the output, and export security telemetry data.</p>
          </div>

          {/* ── Quick Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7 rp-no-print">
            {[
              { label: 'Total Events', value: stats.total, icon: 'receipt_long', color: '#60a5fa' },
              { label: 'Critical', value: stats.critical, icon: 'error', color: '#f87171' },
              { label: 'Ransomware', value: stats.ransom, icon: 'lock', color: '#fb923c' },
              { label: 'Honeytokens', value: stats.honey, icon: 'key', color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex items-center gap-3.5">
                <div className="size-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                  <span className="material-symbols-outlined text-[18px]" style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-[22px] font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[11px] text-white/30 font-medium mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Two Column Grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* ── LEFT: Controls (4/12) ── */}
            <div className="xl:col-span-4 rp-no-print">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.015]">
                  <h2 className="text-[14px] font-bold flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-indigo-400 text-[18px]">tune</span>
                    Export Configuration
                  </h2>
                </div>
                <div className="p-6 flex flex-col gap-6">

                  {/* Date Range */}
                  <div>
                    <Label>Reporting Period</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {['start', 'end'].map(k => (
                        <div key={k}>
                          <input
                            type="date"
                            value={dateRange[k]}
                            onChange={e => setDateRange({ ...dateRange, [k]: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-[13px] text-white font-medium focus:outline-none focus:border-indigo-500/50 transition-colors"
                          />
                          <span className="text-[10px] text-white/20 mt-1 block pl-0.5 capitalize">{k} date</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Incident Type */}
                  <div>
                    <Label>Incident Filter</Label>
                    <div className="relative">
                      <select
                        value={incidentType}
                        onChange={e => setIncidentType(e.target.value)}
                        className="w-full appearance-none bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 pr-9 text-[13px] text-white font-medium focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
                      >
                        {['All Incidents', 'Honeytoken Access', 'Process Termination', 'High Severity Only'].map(o => (
                          <option key={o} value={o} className="bg-[#0a111a]">{o}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/25 text-[16px] pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Format */}
                  <div>
                    <Label>Export Format</Label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'PDF', icon: 'picture_as_pdf' },
                        { id: 'CSV', icon: 'csv' },
                        { id: 'JSON', icon: 'data_object' },
                      ].map(f => {
                        const on = exportFormat === f.id
                        return (
                          <button
                            key={f.id}
                            onClick={() => setExportFormat(f.id)}
                            className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${on
                              ? 'bg-indigo-500/12 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                              }`}
                          >
                            <span className={`material-symbols-outlined text-[22px] ${on ? 'text-indigo-400' : 'text-white/25'}`}>{f.icon}</span>
                            <span className={`text-[11px] font-bold tracking-wider ${on ? 'text-indigo-400' : 'text-white/30'}`}>{f.id}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/[0.05]" />

                  {/* Options */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center size-[18px] flex-shrink-0">
                        <input type="checkbox" checked={includeMeta} onChange={e => setIncludeMeta(e.target.checked)}
                          className="peer appearance-none size-[18px] border border-white/15 rounded bg-white/[0.03] checked:border-indigo-500 checked:bg-indigo-500 transition-colors cursor-pointer" />
                        <span className="material-symbols-outlined text-white text-[13px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                      </div>
                      <span className="text-[13px] font-medium text-white/50 group-hover:text-white/70 transition-colors">Include raw metadata</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center size-[18px] flex-shrink-0">
                        <input type="checkbox" disabled className="appearance-none size-[18px] border border-white/8 rounded bg-white/[0.02] cursor-not-allowed" />
                      </div>
                      <span className="text-[13px] font-medium text-white/20">Redact IPs <span className="text-[9px] bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded ml-1.5 uppercase tracking-widest font-bold">Pro</span></span>
                    </label>
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center justify-center gap-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_24px_rgba(99,102,241,0.35)] transition-all active:scale-[0.98] text-[13px] tracking-wide mt-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">file_download</span>
                    Generate & Download
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Preview (8/12) ── */}
            <div className={`xl:col-span-8 flex flex-col min-h-[700px] relative transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-[100] min-h-0' : ''}`}>
              {isFullscreen && <div className="fixed inset-[-100px] bg-black/80 backdrop-blur-md z-[-1] rp-no-print" onClick={() => setIsFullscreen(false)} />}

              <div className={`bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden ${isFullscreen ? 'h-full z-10' : 'h-full z-20'}`}>
                {/* Preview toolbar */}
                <div className="border-b border-white/[0.05] bg-white/[0.015] px-5 py-3 flex items-center justify-between flex-shrink-0 rp-no-print">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-400 text-[16px]">visibility</span>
                    <span className="text-[13px] font-bold text-white/70">{exportFormat} Preview</span>
                    <span className="text-[11px] bg-white/[0.04] text-white/30 font-bold px-2.5 py-0.5 rounded-md border border-white/[0.05]">{filtered.length} records</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setZoomLevel(v => Math.max(0.3, v - 0.1))} className="size-7 rounded-md hover:bg-white/[0.06] text-white/25 hover:text-white flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="text-[10px] font-mono text-white/30 w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={() => setZoomLevel(v => Math.min(1.5, v + 0.1))} className="size-7 rounded-md hover:bg-white/[0.06] text-white/25 hover:text-white flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                    <div className="w-px h-4 bg-white/[0.06] mx-1" />
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className={`size-7 rounded-md flex items-center justify-center transition-colors ${isFullscreen ? 'bg-indigo-500/15 text-indigo-400' : 'hover:bg-white/[0.06] text-white/25 hover:text-white'}`}>
                      <span className="material-symbols-outlined text-[16px]">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
                    </button>
                  </div>
                </div>

                {/* Preview canvas */}
                <div className="flex-1 bg-[#030710] p-6 overflow-y-auto flex justify-center items-start">

                  {/* ── PDF Preview ── */}
                  {exportFormat === 'PDF' && (
                    <div
                      className="w-[780px] flex-shrink-0 bg-white text-slate-800 min-h-[1050px] shadow-[0_4px_60px_rgba(0,0,0,0.7)] p-10 origin-top transition-transform duration-200 rp-paper"
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', marginBottom: `${-(1 - zoomLevel) * 1050}px` }}
                    >
                      {/* PDF Header */}
                      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-7">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-indigo-600 text-[28px]">shield_lock</span>
                            <span className="font-extrabold text-[24px] tracking-tight text-slate-800">Ransom Trap</span>
                          </div>
                          <h1 className="text-[22px] font-extrabold text-slate-600 uppercase tracking-[0.2em]">Incident Activity Report</h1>
                          <p className="text-slate-400 text-[13px] font-medium mt-1">{incidentType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.15em]">Generated</p>
                          <p className="text-[12px] font-semibold text-slate-600 mt-0.5">{new Date().toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.15em] mt-3">Period</p>
                          <p className="text-[12px] font-semibold text-slate-600 mt-0.5">{dateRange.start} — {dateRange.end}</p>
                        </div>
                      </div>

                      {/* PDF Stats */}
                      <div className="grid grid-cols-4 gap-3 mb-8">
                        {[
                          { l: 'Total', v: stats.total, bg: '#f8fafc', bc: '#e2e8f0', c: '#334155' },
                          { l: 'Critical', v: stats.critical, bg: '#fef2f2', bc: '#fecaca', c: '#dc2626' },
                          { l: 'Ransomware', v: stats.ransom, bg: '#fff7ed', bc: '#fed7aa', c: '#ea580c' },
                          { l: 'Honeytokens', v: stats.honey, bg: '#f5f3ff', bc: '#ddd6fe', c: '#7c3aed' },
                        ].map(s => (
                          <div key={s.l} className="rounded-xl p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.bc}` }}>
                            <p className="text-[28px] font-extrabold leading-none" style={{ color: s.c }}>{s.v}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] mt-1.5" style={{ color: s.c + '99' }}>{s.l}</p>
                          </div>
                        ))}
                      </div>

                      {/* PDF Table */}
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] border-b-2 border-slate-200 pb-2 mb-0">Event Log</h3>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-2.5 px-2">Time</th>
                            <th className="py-2.5 px-2">Type</th>
                            <th className="py-2.5 px-2">Host / Path</th>
                            <th className="py-2.5 px-2 text-right">Severity</th>
                          </tr>
                        </thead>
                        <tbody className="text-[12px] font-medium text-slate-600">
                          {loading ? (
                            <tr><td colSpan="4" className="py-6 text-center italic text-slate-400">Loading…</td></tr>
                          ) : filtered.length === 0 ? (
                            <tr><td colSpan="4" className="py-6 text-center italic text-slate-400">No events for selected filters.</td></tr>
                          ) : filtered.slice(0, 20).map((a, i) => {
                            const crit = ['CRITICAL', 'HIGH'].includes((a.severity || 'CRITICAL').toUpperCase())
                            return (
                              <tr key={i} className="border-b border-slate-50">
                                <td className="py-2.5 px-2 font-mono text-[10px] text-slate-400 whitespace-nowrap">{fmtTs(a.timestamp)}</td>
                                <td className="py-2.5 px-2">{a.alert_type}</td>
                                <td className="py-2.5 px-2 max-w-[200px] truncate text-slate-500">{a.path || a.host || '—'}</td>
                                <td className="py-2.5 px-2 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${crit ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>{a.severity || 'CRITICAL'}</span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      {filtered.length > 20 && (
                        <p className="text-center py-3 text-[10px] font-bold text-slate-400 tracking-widest uppercase">+ {filtered.length - 20} more records in export</p>
                      )}

                      {/* PDF Footer */}
                      <div className="mt-auto pt-8 border-t border-slate-200 flex justify-between items-center text-[9px] font-bold tracking-[0.15em] text-slate-300 uppercase" style={{ marginTop: 60 }}>
                        <span>Confidential — Internal Use Only</span>
                        <span>Page 1 / {Math.max(1, Math.ceil(filtered.length / 20))}</span>
                      </div>
                    </div>
                  )}

                  {/* ── CSV Preview ── */}
                  {exportFormat === 'CSV' && (
                    <div className="w-full h-full flex flex-col bg-[#0a0f18] border border-white/[0.06] rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
                        <div className="size-2.5 rounded-full bg-red-500/70" /><div className="size-2.5 rounded-full bg-yellow-500/70" /><div className="size-2.5 rounded-full bg-green-500/70" />
                        <span className="ml-2 text-[10px] font-mono text-white/25">export_data.csv</span>
                      </div>
                      <div className="flex-1 p-5 font-mono text-[11px] text-emerald-400/80 overflow-auto whitespace-pre leading-relaxed">
                        {`Timestamp,Type,Host,Process,PID,Severity,Path${includeMeta ? ',Raw' : ''}\n`}
                        {filtered.slice(0, 30).map(a => `${a.timestamp ? new Date(a.timestamp * 1000).toISOString() : ''},${a.alert_type},${a.host},${a.process_name || ''},${a.pid || ''},${a.severity || 'CRITICAL'},${a.path || ''}${includeMeta ? ',"{...}"' : ''}`).join('\n')}
                        {filtered.length > 30 ? `\n... ${filtered.length - 30} more rows ...` : ''}
                        {filtered.length === 0 ? 'No records match filters.' : ''}
                      </div>
                    </div>
                  )}

                  {/* ── JSON Preview ── */}
                  {exportFormat === 'JSON' && (
                    <div className="w-full h-full flex flex-col bg-[#0a0f18] border border-white/[0.06] rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
                        <div className="size-2.5 rounded-full bg-red-500/70" /><div className="size-2.5 rounded-full bg-yellow-500/70" /><div className="size-2.5 rounded-full bg-green-500/70" />
                        <span className="ml-2 text-[10px] font-mono text-white/25">export_data.json</span>
                      </div>
                      <div className="flex-1 p-5 font-mono text-[12px] text-amber-400/80 overflow-auto whitespace-pre leading-relaxed">
                        {JSON.stringify(filtered.slice(0, 3).map(({ _id, ...r }) => includeMeta ? { ...r, _id } : r), null, 2)}
                        {filtered.length > 3 ? `\n\n// ... ${filtered.length - 3} more objects ...` : ''}
                        {filtered.length === 0 ? '[]' : ''}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
