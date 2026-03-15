import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAlerts } from '../hooks/useAlerts.js'

function formatTimestamp(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const { alerts, loading } = useAlerts(5000)

  // Use today and 7 days ago as default dates
  const today = new Date().toISOString().split('T')[0]
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [dateRange, setDateRange] = useState({ start: lastWeek, end: today })
  const [incidentType, setIncidentType] = useState('All Incidents')
  const [exportFormat, setExportFormat] = useState('PDF')
  const [includeMeta, setIncludeMeta] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const filteredAlerts = useMemo(() => {
    return [...alerts].filter(a => {
      if (dateRange.start && a.timestamp) {
        const startTs = new Date(dateRange.start).getTime() / 1000
        if (a.timestamp < startTs) return false
      }
      if (dateRange.end && a.timestamp) {
        const endTs = new Date(dateRange.end).getTime() / 1000 + 86400
        if (a.timestamp > endTs) return false
      }
      if (incidentType !== 'All Incidents') {
        const typeStr = (a.alert_type || '').toLowerCase()
        if (incidentType === 'Honeytoken Access' && typeStr !== 'honeytoken_access') return false
        if (incidentType === 'Process Termination' && typeStr !== 'process_terminated') return false
        if (incidentType === 'High Severity Only') {
            const sev = (a.severity || 'CRITICAL').toUpperCase()
            if (sev !== 'CRITICAL' && sev !== 'HIGH') return false
        }
      }
      return true
    }).reverse()
  }, [alerts, dateRange, incidentType])

  const stats = useMemo(() => {
    const total = filteredAlerts.length
    const critical = filteredAlerts.filter(a => {
        const sev = (a.severity || 'CRITICAL').toUpperCase()
        return sev === 'CRITICAL' || sev === 'HIGH'
    }).length
    return { total, critical, standard: total - critical }
  }, [filteredAlerts])

  const handleExport = () => {
    if (filteredAlerts.length === 0) {
        alert("No data to export for the selected criteria.")
        return;
    }

    if (exportFormat === 'CSV') {
        const headers = ['Timestamp', 'Type', 'Host', 'Process', 'PID', 'Severity', 'Details/Path', ...(includeMeta ? ['Raw_Data'] : [])]
        const rows = filteredAlerts.map(a => [
            a.timestamp ? new Date(a.timestamp * 1000).toISOString() : 'N/A',
            a.alert_type || 'Unknown',
            a.host || 'N/A',
            a.process_name || 'N/A',
            a.pid || 'N/A',
            a.severity || 'CRITICAL',
            a.path || a.details || 'N/A',
            ...(includeMeta ? [JSON.stringify(a)] : [])
        ])
        const csvContent = [headers.join(','), ...rows.map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(','))].join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `ransom_trap_report_${new Date().getTime()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } else if (exportFormat === 'JSON') {
        let exportData = filteredAlerts
        if (!includeMeta) {
          exportData = filteredAlerts.map(({_id, ...rest}) => rest) // strip some meta if unchecked
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2))
        const link = document.createElement("a")
        link.setAttribute("href", dataStr)
        link.setAttribute("download", `ransom_trap_report_${new Date().getTime()}.json`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } else {
        // Trigger Browser Print for PDF
        // We add a temporary class to the body to hide everything except the preview
        document.body.classList.add('print-mode')
        setTimeout(() => {
          window.print()
          document.body.classList.remove('print-mode')
        }, 300)
    }
  }

  const css = `
    .glass { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }
    input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }

    @media print {
      body * { 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important; 
      }
      body { background: white !important; margin: 0 !important; padding: 0 !important; }
      .hide-on-print { display: none !important; }
      .print-container { 
        position: absolute !important; 
        left: 0 !important; 
        top: 0 !important; 
        width: 100% !important; 
        max-width: none !important; 
        margin: 0 !important; 
        padding: 0 !important; 
        box-shadow: none !important; 
        transform: none !important; 
        background: white !important; 
        z-index: 999999 !important;
      }
    }
  `

  return (
    <div className="h-screen flex flex-col bg-[#020408] font-display text-white overflow-hidden relative">
      <style>{css}</style>

      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none z-0 hide-on-print">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(99,102,241,0.08) 0%, rgba(59,130,246,0.02) 40%, transparent 70%)' }} />
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <pattern id="grid-reports" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
          <rect fill="url(#grid-reports)" width="100%" height="100%" />
        </svg>
      </div>

      {/* HEADER */}
      <header className="flex-none h-14 px-6 flex items-center justify-between border-b border-white/[0.04] bg-[#0ce12]/98 glass z-30 shrink-0 hide-on-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="size-8 rounded-lg bg-white/[0.02] hover:bg-white/[0.07] border border-white/[0.04] text-white/40 hover:text-white transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div className="h-6 w-px bg-white/[0.04]" />
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-indigo-400">description</span>
            </div>
            <div>
              <h1 className="text-[13px] font-bold text-white/90 tracking-wide leading-tight">REPORT DASHBOARD</h1>
              <p className="text-[10px] text-white/40 font-medium">Export & Analysis</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
            {[{ to: '/', i: 'dashboard' }, { to: '/honeytokens', i: 'key' }, { to: '/alerts', i: 'notifications_active' }].map(l => (
              <Link key={l.to} to={l.to} className="size-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all">
                <span className="material-symbols-outlined text-[18px]">{l.i}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col z-10 w-full max-w-[1600px] mx-auto min-h-0 relative">
        <div className="flex flex-col gap-2 mb-8 shrink-0 relative z-20 hide-on-print">
          <h1 className="text-white text-4xl font-black leading-tight tracking-tight drop-shadow-lg">Generate Execution Report</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex size-2.5">
              <span className="animate-ping absolute inset-0 rounded-full bg-indigo-400 opacity-60" />
              <span className="relative rounded-full size-2.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
            </div>
            <p className="text-indigo-400/80 text-[12px] font-bold tracking-widest uppercase shadow-indigo-500/20 drop-shadow-sm">Extract telemetry & telemetry data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Configuration Form */}
          <div className="xl:col-span-1 flex flex-col gap-6 relative hide-on-print">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/0 rounded-2xl blur opacity-50 z-0 pointer-events-none" />
            <div className="bg-[#060b12]/90 border border-white/[0.08] rounded-2xl p-6 md:p-8 glass shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-20">
              <h2 className="text-white text-xl font-black mb-8 flex items-center gap-3 tracking-wide">
                <span className="material-symbols-outlined text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">tune</span>
                EXPORT CONFIGURATION
              </h2>
              <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
                
                {/* Date Range */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-white/50 tracking-widest uppercase drop-shadow-sm">Reporting Period</label>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="relative group">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <input
                        className="w-full relative bg-[#0a111a] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-[13px] font-bold focus:outline-none focus:border-indigo-500/70 focus:bg-[#0d1522] transition-colors shadow-inner"
                        type="date"
                        value={dateRange.start}
                        onChange={e => setDateRange({...dateRange, start: e.target.value})}
                      />
                      <span className="text-[10px] text-white/30 absolute -bottom-5 left-2 font-black uppercase tracking-widest">Start Date</span>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <input
                        className="w-full relative bg-[#0a111a] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-[13px] font-bold focus:outline-none focus:border-indigo-500/70 focus:bg-[#0d1522] transition-colors shadow-inner"
                        type="date"
                        value={dateRange.end}
                        onChange={e => setDateRange({...dateRange, end: e.target.value})}
                      />
                      <span className="text-[10px] text-white/30 absolute -bottom-5 left-2 font-black uppercase tracking-widest">End Date</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="text-[11px] font-black text-white/50 tracking-widest uppercase drop-shadow-sm">Telemetry Type</label>
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <select 
                      value={incidentType}
                      onChange={e => setIncidentType(e.target.value)}
                      className="w-full relative bg-[#0a111a] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-[13px] font-bold focus:outline-none focus:border-indigo-500/70 focus:bg-[#0d1522] transition-colors shadow-inner appearance-none cursor-pointer"
                    >
                      <option className="bg-[#0a111a]">All Incidents</option>
                      <option className="bg-[#0a111a]">Honeytoken Access</option>
                      <option className="bg-[#0a111a]">Process Termination</option>
                      <option className="bg-[#0a111a]">High Severity Only</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none drop-shadow-sm">expand_more</span>
                  </div>
                </div>

                {/* Format Selector */}
                <div className="space-y-4 mt-6">
                  <label className="text-[11px] font-black text-white/50 tracking-widest uppercase drop-shadow-sm">Export Format</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['PDF', 'CSV', 'JSON'].map(fmt => (
                      <label key={fmt} className="cursor-pointer group relative">
                        <input 
                          className="peer sr-only" 
                          name="format" 
                          type="radio" 
                          checked={exportFormat === fmt} 
                          onChange={() => setExportFormat(fmt)} 
                        />
                        <div className={`absolute -inset-[1px] bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-xl opacity-0 peer-checked:opacity-100 blur-[2px] transition-opacity`} />
                        <div className="flex flex-col items-center justify-center py-5 rounded-xl border border-white/[0.08] bg-[#0a111a] group-hover:bg-[#0d1522] peer-checked:border-indigo-400 peer-checked:bg-[#0d1522] transition-all h-28 relative overflow-hidden z-10 shadow-inner">
                          {exportFormat === fmt && <div className="absolute inset-0 bg-indigo-500/10" />}
                          <span className={`material-symbols-outlined text-[28px] mb-2 relative z-10 ${exportFormat === fmt ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'text-white/30'}`}>
                            {fmt === 'PDF' && 'picture_as_pdf'}
                            {fmt === 'CSV' && 'csv'}
                            {fmt === 'JSON' && 'data_object'}
                          </span>
                          <span className={`text-[11px] font-black tracking-wider relative z-10 ${exportFormat === fmt ? 'text-indigo-400' : 'text-white/30'}`}>{fmt}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-5 pt-6 border-t border-white/[0.08]">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center size-5 shrink-0">
                      <input
                        className="peer appearance-none size-5 border-2 border-white/20 rounded bg-[#0a111a] checked:border-indigo-500 checked:bg-indigo-500 transition-colors cursor-pointer shadow-inner"
                        type="checkbox"
                        checked={includeMeta}
                        onChange={e => setIncludeMeta(e.target.checked)}
                      />
                      <span className="material-symbols-outlined text-white text-[14px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity font-bold drop-shadow-md">check</span>
                    </div>
                    <span className="text-[13px] font-bold text-white/70 group-hover:text-white transition-colors">Include raw metadata payloads</span>
                  </label>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center size-5 shrink-0">
                      <input
                        className="peer appearance-none size-5 border-2 border-white/10 rounded bg-[#0a111a] checked:border-indigo-500/50 checked:bg-indigo-500/30 transition-colors cursor-not-allowed shadow-inner"
                        type="checkbox"
                        disabled
                      />
                      <span className="material-symbols-outlined text-white text-[14px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity font-bold">check</span>
                    </div>
                    <span className="text-[13px] font-bold text-white/30 transition-colors">Redact Hostnames/IPs <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded ml-2 uppercase tracking-widest">Pro</span></span>
                  </label>
                </div>

                {/* Action */}
                <div className="pt-8 mt-auto">
                  <button 
                    onClick={handleExport}
                    className="w-full relative group flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-4 px-6 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all active:scale-[0.98] text-[14px] tracking-wide"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay" />
                    <span className="material-symbols-outlined text-[22px] drop-shadow-md">file_download</span>
                    GENERATE & DOWNLOAD
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Dynamic Preview Area */}
          <div className={`xl:col-span-2 flex flex-col h-[800px] xl:h-[auto] relative transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-[100] h-auto' : ''}`}>
            {isFullscreen && <div className="fixed inset-[-100px] bg-[#020408]/90 backdrop-blur-md z-[-1] hide-on-print" onClick={() => setIsFullscreen(false)} />}
            <div className="absolute -inset-0.5 bg-gradient-to-bl from-indigo-500/10 to-blue-500/0 rounded-2xl blur opacity-50 z-0 pointer-events-none hide-on-print" />
            <div className={`bg-[#060b12]/90 border border-white/[0.08] rounded-2xl flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden glass relative ${isFullscreen ? 'h-full z-10' : 'h-full z-20'}`}>
              {/* Preview Toolbar */}
              <div className="border-b border-white/[0.08] bg-[#0a111a] p-4 flex items-center justify-between shrink-0 relative hide-on-print">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
                <h2 className="text-white text-[13px] font-black tracking-wide flex items-center gap-3 relative z-10">
                  <span className="material-symbols-outlined text-indigo-400 text-[18px] drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">visibility</span>
                  LIVE {exportFormat} PREVIEW
                </h2>
                <div className="flex items-center gap-2 bg-white/[0.02] rounded-lg p-1 border border-white/[0.02]">
                  <span className="text-[10px] font-bold text-white/30 tracking-widest px-2 uppercase mr-2">{filteredAlerts.length} Records Found</span>
                  <button 
                    onClick={() => setZoomLevel(prev => Math.max(0.3, prev - 0.1))}
                    className="flex items-center justify-center size-7 rounded hover:bg-white/[0.08] text-white/30 hover:text-white transition-colors" title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="text-[10px] font-mono text-white/40 min-w-[32px] text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button 
                    onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
                    className="flex items-center justify-center size-7 rounded hover:bg-white/[0.08] text-white/30 hover:text-white transition-colors" title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1"></div>
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className={`flex items-center justify-center size-7 rounded transition-colors ${isFullscreen ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/[0.08] text-white/30 hover:text-white'}`} title="Toggle Fullscreen"
                  >
                    <span className="material-symbols-outlined text-[18px]">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
                  </button>
                </div>
              </div>

              {/* Preview Canvas */}
              <div className="flex-1 bg-[#020408]/80 p-4 sm:p-8 overflow-y-auto relative flex justify-center custom-scrollbar inset-shadow-sm items-start">
                
                {/* Simulated Paper Sheet (If PDF is selected) */}
                {exportFormat === 'PDF' && (
                  <div 
                    className="w-[800px] shrink-0 bg-white text-black min-h-[1056px] shadow-[0_0_60px_rgba(0,0,0,0.8)] p-12 origin-top transition-transform duration-300 relative print-container"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', marginBottom: `${-(1 - zoomLevel) * 1056}px` }}
                  >
                    {/* Report Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
                      <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-3">
                          <span className="material-symbols-outlined text-4xl font-bold">shield_lock</span>
                          <span className="font-extrabold text-3xl tracking-tight text-slate-800">Ransom Trap</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-700 uppercase tracking-widest">Incident Activity Report</h1>
                        <p className="text-slate-500 text-lg font-medium mt-2">{incidentType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest">Generated On</p>
                        <p className="text-sm font-semibold text-slate-700 whitespace-nowrap mt-1">{new Date().toLocaleString()}</p>
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest mt-5">Period Range</p>
                        <p className="text-sm font-semibold text-slate-700 whitespace-nowrap mt-1">{dateRange.start} TO {dateRange.end}</p>
                      </div>
                    </div>

                    {/* Report Summary Stats */}
                    <div className="grid grid-cols-3 gap-6 mb-10">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative z-10">
                        <p className="text-[11px] text-slate-500 font-semibold tracking-widest uppercase mb-2">Total Events Captured</p>
                        <p className="text-5xl font-extrabold text-slate-700">{stats.total}</p>
                      </div>
                      <div className="bg-red-50 p-6 rounded-2xl border border-red-200 shadow-sm relative overflow-hidden z-10">
                        <div className="absolute right-0 top-0 w-20 h-20 bg-red-100/50 rounded-bl-full flex items-start justify-end p-4 z-0"><span className="material-symbols-outlined text-red-400 font-medium">warning</span></div>
                        <p className="text-[11px] text-red-500 font-semibold tracking-widest uppercase mb-2 relative z-10">Critical Severity</p>
                        <p className="text-5xl font-extrabold text-red-600 relative z-10">{stats.critical}</p>
                      </div>
                      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 shadow-sm relative z-10">
                        <p className="text-[11px] text-indigo-500 font-semibold tracking-widest uppercase mb-2">Standard Severity</p>
                        <p className="text-5xl font-extrabold text-indigo-600">{stats.standard}</p>
                      </div>
                    </div>

                    {/* Data Table */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest border-b-2 border-slate-200 pb-2 mb-4">Latest Logged Events</h3>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            <th className="py-3 px-2">Timestamp (UTC)</th>
                            <th className="py-3 px-2">Type</th>
                            <th className="py-3 px-2">Target Host/Path</th>
                            <th className="py-3 px-2 text-right">Severity</th>
                          </tr>
                        </thead>
                        <tbody className="text-[13px] font-medium text-slate-600">
                          {loading ? (
                            <tr><td colSpan="4" className="py-6 text-center italic text-slate-400">Loading data...</td></tr>
                          ) : filteredAlerts.length === 0 ? (
                            <tr><td colSpan="4" className="py-6 text-center italic text-slate-400">No events found for the selected configuration.</td></tr>
                          ) : (
                            filteredAlerts.slice(0, 15).map((alert, i) => {
                               const isCritical = (alert.severity || '').toUpperCase() === 'CRITICAL' || (alert.severity || '').toUpperCase() === 'HIGH'
                               return (
                                <tr key={i} className="border-b border-slate-100">
                                  <td className="py-3 px-2 font-mono text-[11px] whitespace-nowrap text-slate-500">{formatTimestamp(alert.timestamp)}</td>
                                  <td className="py-3 px-2 font-medium">{alert.alert_type}</td>
                                  <td className="py-3 px-2 max-w-[200px] truncate">{alert.path || alert.host || 'N/A'}</td>
                                  <td className="py-3 px-2 text-right">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${isCritical ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>{alert.severity || 'CRITICAL'}</span>
                                  </td>
                                </tr>
                               )
                            })
                          )}
                        </tbody>
                      </table>
                      {filteredAlerts.length > 15 && (
                          <div className="text-center py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                              + {filteredAlerts.length - 15} More Records Included in PDF Pages...
                          </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t-2 border-slate-200 flex justify-between items-center text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                      <p>Confidential Security Document - Internal Use Only</p>
                      <p>Page 1 / {Math.max(1, Math.ceil(filteredAlerts.length / 15))}</p>
                    </div>
                  </div>
                )}
                
                {/* Programmatic Previews (CSV/JSON) */}
                {exportFormat === 'CSV' && (
                  <div className="w-full h-full flex flex-col bg-[#0a111a] border border-white/[0.08] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-[#0d1522]">
                      <div className="size-3 rounded-full bg-red-500/80" />
                      <div className="size-3 rounded-full bg-yellow-500/80" />
                      <div className="size-3 rounded-full bg-green-500/80" />
                      <span className="ml-2 text-[10px] font-mono text-white/30 truncate">export_data.csv</span>
                    </div>
                    <div className="flex-1 p-5 font-mono text-[12px] text-emerald-400/90 overflow-auto whitespace-pre align-top custom-scrollbar drop-shadow-[0_0_2px_rgba(52,211,153,0.3)]">
                      {`Timestamp,Type,Host,Process,PID,Severity,Details/Path${includeMeta ? ',Raw_Data' : ''}\n`}
                      {filteredAlerts.slice(0, 30).map(a => `${a.timestamp ? new Date(a.timestamp * 1000).toISOString() : 'N/A'},${a.alert_type},${a.host},${a.process_name || 'N/A'},${a.pid || 'N/A'},${a.severity || 'CRITICAL'},${a.path || a.details}${includeMeta ? `,"{...}"` : ''}`).join('\n')}
                      {filteredAlerts.length > 30 ? `\n... ${filteredAlerts.length - 30} more rows ...` : ''}
                      {filteredAlerts.length === 0 ? "No records found matching filters." : ""}
                    </div>
                  </div>
                )}

                {exportFormat === 'JSON' && (
                  <div className="w-full h-full flex flex-col bg-[#0a111a] border border-white/[0.08] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-[#0d1522]">
                      <div className="size-3 rounded-full bg-red-500/80" />
                      <div className="size-3 rounded-full bg-yellow-500/80" />
                      <div className="size-3 rounded-full bg-green-500/80" />
                      <span className="ml-2 text-[10px] font-mono text-white/30 truncate">export_data.json</span>
                    </div>
                    <div className="flex-1 p-5 font-mono text-[13px] text-amber-400/90 overflow-auto whitespace-pre align-top leading-relaxed custom-scrollbar drop-shadow-[0_0_2px_rgba(251,191,36,0.2)]">
                      {JSON.stringify(filteredAlerts.slice(0, 3).map(({_id, ...rest}) => includeMeta ? {...rest, _id} : rest), null, 2)}
                      {filteredAlerts.length > 3 ? `\n\n// ... ${filteredAlerts.length - 3} more objects omitted in preview ...` : ''}
                      {filteredAlerts.length === 0 ? "[]" : ""}
                    </div>
                  </div>
                )} 

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
