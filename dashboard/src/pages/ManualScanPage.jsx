import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchConfig, patchConfig, simulateRansomware, undoSimulation } from '../api.js'

export default function ManualScanPage() {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [results, setResults] = useState([])
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    const [monitoredPaths, setMonitoredPaths] = useState([])
    const [newPath, setNewPath] = useState('')
    const [isSimulating, setIsSimulating] = useState(false)
    const [simMsg, setSimMsg] = useState('')
    const [isUndoing, setIsUndoing] = useState(false)

    async function handleSimulate() {
        if (isSimulating) return
        setIsSimulating(true)
        setSimMsg('')
        try {
            const target = monitoredPaths.length > 0 ? monitoredPaths[0] : null;
            await simulateRansomware(target)
            setSimMsg(`Mock Ransomware process triggered on ${target || 'default'}! Watch for alerts.`)
        } catch (e) {
            setSimMsg(`Error: ${e.message}`)
        } finally {
            setIsSimulating(false)
            setTimeout(() => setSimMsg(''), 6000)
        }
    }

    async function handleUndo() {
        if (isUndoing) return
        setIsUndoing(true)
        setSimMsg('')
        try {
            const target = monitoredPaths.length > 0 ? monitoredPaths[0] : null;
            await undoSimulation(target)
            setSimMsg('Undo triggered! Restoring original data from .bak files.')
        } catch (e) {
            setSimMsg(`Undo Error: ${e.message}`)
        } finally {
            setIsUndoing(false)
            setTimeout(() => setSimMsg(''), 6000)
        }
    }

    useEffect(() => {
        fetchConfig().then(cfg => {
            setMonitoredPaths(cfg.monitored_paths || [])
        }).catch(() => { })
    }, [])

    async function handleAddPath() {
        const trimmed = newPath.trim()
        if (!trimmed || monitoredPaths.includes(trimmed)) return
        const updated = [...monitoredPaths, trimmed]
        setMonitoredPaths(updated)
        setNewPath('')
        try {
            await patchConfig({ monitored_paths: updated })
        } catch {
            setMonitoredPaths(monitoredPaths) // revert
        }
    }

    async function handleRemovePath(pathToRemove) {
        const updated = monitoredPaths.filter(p => p !== pathToRemove)
        setMonitoredPaths(updated)
        try {
            await patchConfig({ monitored_paths: updated })
        } catch {
            setMonitoredPaths(monitoredPaths) // revert
        }
    }

    function handleDragOver(e) {
        e.preventDefault()
        setIsDragging(true)
    }

    function handleDragLeave(e) {
        e.preventDefault()
        setIsDragging(false)
    }

    function handleDrop(e) {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleScan(e.dataTransfer.files)
        }
    }

    function handleFileSelect(e) {
        if (e.target.files && e.target.files.length > 0) {
            handleScan(e.target.files)
        }
    }

    async function handleScan(filesList) {
        const files = Array.from(filesList)
        if (files.length === 0) return

        setIsScanning(true)
        setError(null)
        setResults([])

        const formData = new FormData()
        files.forEach(file => {
            formData.append('files', file)
        })

        try {
            const res = await fetch('http://localhost:8000/scan', {
                method: 'POST',
                body: formData,
            })
            if (!res.ok) throw new Error(`Server responded with status: ${res.status}`)
            const data = await res.json()
            setResults(data.results || [])
        } catch (err) {
            setError(err.message || 'An error occurred during scanning.')
        } finally {
            setIsScanning(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden">
            {/* ── SIDEBAR (Simplified for direct routing back to Dashboard) ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
            <aside
                className={`w-72 flex-col border-r border-[#233648] bg-background-dark flex fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex items-center justify-between p-6 pb-2 mt-2">
                    <div className="flex items-center gap-3">
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
                </div>
                <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
                    <nav className="flex flex-col gap-2">
                        <Link to="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors">
                            <span className="material-symbols-outlined fill-1">dashboard</span>
                            <span className="text-sm font-medium leading-normal">Overview</span>
                        </Link>
                        <Link to="/scan" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary text-white transition-colors">
                            <span className="material-symbols-outlined">document_scanner</span>
                            <span className="text-sm font-medium leading-normal">Manual Scan</span>
                        </Link>
                        <Link to="/Incidents" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors">
                            <span className="material-symbols-outlined">warning</span>
                            <span className="text-sm font-medium leading-normal">Incidents</span>
                        </Link>
                    </nav>

                    <div className="flex flex-col gap-2 border-t border-[#233648] pt-4 mt-auto">
                        <Link
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors"
                            to="/config/thresholds"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-sm font-medium leading-normal">System Settings</span>
                        </Link>
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

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0b1219] overflow-hidden">
                <header className="flex items-center gap-4 border-b border-[#233648] bg-background-dark px-6 py-4">
                    <button className="lg:hidden text-white" onClick={() => setSidebarOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[20px]">document_scanner</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">On-Demand File Scanner</h1>
                            <p className="text-[11px] text-[#556980]">Entropy analysis · Simulation · Directory management</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* ── DRAG & DROP SCANNER ── */}
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[28px]">search</span>
                                Entropy Analysis Scanner
                            </h2>
                            <p className="mt-1.5 text-[#92adc9] text-sm leading-relaxed max-w-2xl">
                                Upload suspect files to instantly analyze their structural entropy using Shannon's algorithm. Files scoring above the configured threshold are flagged as potentially encrypted by ransomware.
                            </p>
                        </div>

                        {/* Dropzone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative group border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 overflow-hidden ${isDragging
                                ? 'border-primary bg-primary/10 scale-[1.01]'
                                : 'border-[#2a3c4f] bg-gradient-to-b from-[#111a24] to-[#0e1820] hover:border-primary/40 hover:bg-[#131e29]'
                                }`}
                        >
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            {/* Background Glow */}
                            <div className={`absolute inset-0 transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                                style={{ background: 'radial-gradient(circle at center, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />

                            <div className={`relative z-10 flex flex-col items-center ${isScanning ? 'animate-pulse' : ''}`}>
                                <div className={`size-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${isDragging ? 'bg-primary/20 scale-110' : 'bg-[#1a2a3a] group-hover:bg-[#233648]'}`}>
                                    <span className={`material-symbols-outlined text-5xl transition-colors duration-300 ${isDragging ? 'text-primary' : isScanning ? 'text-amber-400 animate-spin' : 'text-[#4b6a88] group-hover:text-primary/70'}`}>
                                        {isScanning ? 'progress_activity' : isDragging ? 'file_download' : 'shield'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1.5">
                                    {isScanning ? 'Analyzing file entropy...' : (isDragging ? 'Release to scan files' : 'Drop files here to scan')}
                                </h3>
                                <p className="text-[#556980] text-sm">
                                    {isScanning ? 'Computing Shannon entropy on uploaded files' : 'or click to browse — supports multiple files'}
                                </p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
                                <div>
                                    <p className="font-semibold text-sm">Scan Failed</p>
                                    <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Results Table */}
                        {results.length > 0 && (
                            <div className="bg-[#111a24] border border-[#2a3c4f] rounded-2xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-[#2a3c4f] flex justify-between items-center bg-gradient-to-r from-[#1a2a3a] to-[#111a24]">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
                                        <h3 className="text-base font-bold text-white">Scan Results</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#92adc9] bg-[#233648] px-2.5 py-1 rounded-full">{results.length} files</span>
                                    </div>
                                    <button onClick={() => setResults([])} className="text-xs text-[#556980] hover:text-white transition-colors flex items-center gap-1.5 bg-[#1e2e3e] px-3 py-1.5 rounded-lg hover:bg-[#233648]">
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                        Clear
                                    </button>
                                </div>
                                <div className="divide-y divide-[#1e2e3e]">
                                    {results.map((r, i) => {
                                        const entropyPct = (r.entropy / 8) * 100
                                        const barColor = r.compromised ? 'bg-gradient-to-r from-red-500 to-red-400' : r.entropy > 5 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                        const threatLevel = r.compromised ? 'CRITICAL' : r.entropy > 6 ? 'HIGH' : r.entropy > 4 ? 'MEDIUM' : 'LOW'
                                        const threatColor = r.compromised ? 'text-red-400' : r.entropy > 6 ? 'text-amber-400' : r.entropy > 4 ? 'text-yellow-400' : 'text-emerald-400'
                                        return (
                                            <div key={i} className="px-6 py-4 hover:bg-[#151f2b] transition-colors">
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className={`material-symbols-outlined text-[18px] ${r.compromised ? 'text-red-400' : 'text-emerald-400'}`}>
                                                            {r.compromised ? 'gpp_bad' : 'gpp_good'}
                                                        </span>
                                                        <span className="text-sm font-medium text-white truncate max-w-[250px]" title={r.filename}>{r.filename}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${threatColor}`}>{threatLevel}</span>
                                                        <span className="text-sm font-mono text-white font-bold tabular-nums w-14 text-right">{r.entropy.toFixed(3)}</span>
                                                    </div>
                                                </div>
                                                {/* Entropy Bar */}
                                                <div className="h-1.5 bg-[#1e2e3e] rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${entropyPct}%` }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── MONITORED DIRECTORIES ── */}
                        <div className="rounded-2xl border border-[#2a3c4f] bg-[#111a24] overflow-hidden">
                            <div className="border-b border-[#2a3c4f] bg-gradient-to-r from-[#1a2a3a] to-[#111a24] px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-[20px]">folder_supervised</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">Live Monitored Directories</h3>
                                        <p className="text-xs text-[#556980] mt-0.5">
                                            Directories actively watched by the Ransom-Trap agent. Adding a path also deploys honeytokens there.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6">
                                    <div className="relative flex-1">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#556980] text-[18px]">
                                            create_new_folder
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="e.g. C:\Users\Admin\Documents"
                                            value={newPath}
                                            onChange={e => setNewPath(e.target.value)}
                                            className="w-full bg-[#0b1219] border border-[#2a3c4f] text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-[#334b63] transition-colors"
                                            onKeyDown={e => { if (e.key === 'Enter') handleAddPath() }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddPath}
                                        disabled={!newPath.trim() || monitoredPaths.includes(newPath.trim())}
                                        className="bg-primary hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                        Add Path
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#556980] mb-3">Currently Monitoring ({monitoredPaths.length})</h4>
                                    {monitoredPaths.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-[#2a3c4f] bg-[#0b1219] p-10 text-center">
                                            <span className="material-symbols-outlined text-4xl text-[#2a3c4f] mb-2 block">folder_off</span>
                                            <p className="text-[#556980] text-sm">No paths configured</p>
                                            <p className="text-[#334b63] text-xs mt-1">Add a directory above to start monitoring.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {monitoredPaths.map(p => (
                                                <div
                                                    key={p}
                                                    className="flex items-center gap-3 bg-[#0e1820] border border-[#1e2e3e] rounded-xl px-4 py-3 group hover:border-[#334b63] transition-all"
                                                >
                                                    <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="material-symbols-outlined text-emerald-400 text-[18px]">folder</span>
                                                    </div>
                                                    <span className="text-sm text-white font-mono break-all flex-1 leading-relaxed" title={p}>{p}</span>
                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                                                        <button
                                                            onClick={() => handleRemovePath(p)}
                                                            className="size-8 rounded-lg text-[#556980] hover:text-white hover:bg-red-500/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                            title="Stop watching this path"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── TEST UTILITIES ── */}
                        <div className="rounded-2xl border border-[#2a3c4f] bg-[#111a24] overflow-hidden mb-12">
                            <div className="border-b border-[#2a3c4f] bg-gradient-to-r from-[#2a1520] to-[#111a24] px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-lg bg-red-500/15 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-red-400 text-[20px]">science</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">Ransomware Simulation Lab</h3>
                                        <p className="text-xs text-[#556980] mt-0.5">
                                            Safely trigger a mock ransomware attack to test detection, process termination, folder locking, and notifications.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                {/* Simulation Info */}
                                <div className="bg-[#0b1219] border border-[#1e2e3e] rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-amber-400 text-[18px] mt-0.5">info</span>
                                        <div className="text-xs text-[#92adc9] space-y-1 leading-relaxed">
                                            <p><strong className="text-white">How it works:</strong> The simulator creates 5 dummy test files, then overwrites them with high-entropy random data (<code className="text-amber-400">os.urandom</code>) to mimic ransomware encryption.</p>
                                            <p>The agent will detect the entropy spike, terminate the simulator, and lock the folder. Use <strong className="text-white">Undo</strong> to restore everything.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Target Directory */}
                                {monitoredPaths.length > 0 && (
                                    <div className="flex items-center gap-2 mb-5 text-xs">
                                        <span className="material-symbols-outlined text-[#556980] text-[16px]">location_on</span>
                                        <span className="text-[#556980]">Target:</span>
                                        <span className="text-white font-mono bg-[#0b1219] px-2.5 py-1 rounded-lg border border-[#1e2e3e]">{monitoredPaths[0]}</span>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={handleSimulate}
                                        disabled={isSimulating || isUndoing}
                                        className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-95 shadow-lg shadow-red-500/20"
                                    >
                                        <span className={`material-symbols-outlined text-[20px] ${isSimulating ? 'animate-pulse' : ''}`}>
                                            {isSimulating ? 'pending' : 'play_circle'}
                                        </span>
                                        {isSimulating ? 'Deploying Simulation...' : 'Launch Ransomware Simulation'}
                                    </button>

                                    <button
                                        onClick={handleUndo}
                                        disabled={isSimulating || isUndoing}
                                        className="bg-[#1e2e3e] hover:bg-[#233648] border border-[#2a3c4f] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-95"
                                        title="Restore all test files to their original state"
                                    >
                                        <span className={`material-symbols-outlined text-[20px] ${isUndoing ? 'animate-spin' : ''}`}>
                                            {isUndoing ? 'progress_activity' : 'undo'}
                                        </span>
                                        {isUndoing ? 'Restoring Files...' : 'Undo & Restore'}
                                    </button>
                                </div>

                                {/* Status Message */}
                                {simMsg && (
                                    <div className={`mt-5 rounded-xl border px-5 py-4 flex items-start gap-3 ${simMsg.startsWith('Error') || simMsg.startsWith('Undo Error')
                                        ? 'bg-red-500/10 border-red-500/20'
                                        : simMsg.includes('Undo')
                                            ? 'bg-blue-500/10 border-blue-500/20'
                                            : 'bg-emerald-500/10 border-emerald-500/20'
                                        }`} style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                        <span className={`material-symbols-outlined text-[20px] mt-0.5 ${simMsg.startsWith('Error') || simMsg.startsWith('Undo Error')
                                            ? 'text-red-400'
                                            : simMsg.includes('Undo')
                                                ? 'text-blue-400'
                                                : 'text-emerald-400'
                                            }`}>
                                            {simMsg.startsWith('Error') || simMsg.startsWith('Undo Error') ? 'error' : simMsg.includes('Undo') ? 'restore' : 'check_circle'}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {simMsg.startsWith('Error') || simMsg.startsWith('Undo Error') ? 'Operation Failed' : simMsg.includes('Undo') ? 'Restoration Started' : 'Simulation Launched'}
                                            </p>
                                            <p className="text-xs text-[#92adc9] mt-0.5">{simMsg}</p>
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

