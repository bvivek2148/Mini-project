import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchConfig, patchConfig, simulateRansomware, undoSimulation } from '../api.js'

export default function ManualScanPage() {
    const navigate = useNavigate()
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
    const [activeTab, setActiveTab] = useState('scanner') // 'scanner' | 'directories' | 'simulation'
    const [selectedSimPaths, setSelectedSimPaths] = useState([])

    function togglePath(p) {
        setSelectedSimPaths(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
    }
    function selectAllPaths() {
        setSelectedSimPaths(prev => prev.length === monitoredPaths.length ? [] : [...monitoredPaths])
    }

    async function handleSimulate() {
        if (isSimulating) return
        const targets = selectedSimPaths.length > 0 ? selectedSimPaths : (monitoredPaths.length > 0 ? [monitoredPaths[0]] : [])
        if (targets.length === 0) return
        setIsSimulating(true)
        setSimMsg('')
        try {
            for (const target of targets) {
                await simulateRansomware(target)
            }
            setSimMsg(`Simulation triggered on ${targets.length} path${targets.length !== 1 ? 's' : ''}! Watch for alerts.`)
        } catch (e) {
            setSimMsg(`Error: ${e.message}`)
        } finally {
            setIsSimulating(false)
            setTimeout(() => setSimMsg(''), 6000)
        }
    }

    async function handleUndo() {
        if (isUndoing) return
        const targets = selectedSimPaths.length > 0 ? selectedSimPaths : (monitoredPaths.length > 0 ? [monitoredPaths[0]] : [])
        if (targets.length === 0) return
        setIsUndoing(true)
        setSimMsg('')
        try {
            for (const target of targets) {
                await undoSimulation(target)
            }
            setSimMsg(`Undo triggered on ${targets.length} path${targets.length !== 1 ? 's' : ''}! Restoring files.`)
        } catch (e) {
            setSimMsg(`Undo Error: ${e.message}`)
        } finally {
            setIsUndoing(false)
            setTimeout(() => setSimMsg(''), 6000)
        }
    }

    useEffect(() => {
        fetchConfig().then(cfg => {
            const paths = cfg.monitored_paths || []
            setMonitoredPaths(paths)
            if (paths.length > 0 && selectedSimPaths.length === 0) setSelectedSimPaths([...paths])
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
            setMonitoredPaths(monitoredPaths)
        }
    }

    async function handleRemovePath(pathToRemove) {
        const updated = monitoredPaths.filter(p => p !== pathToRemove)
        setMonitoredPaths(updated)
        try {
            await patchConfig({ monitored_paths: updated })
        } catch {
            setMonitoredPaths(monitoredPaths)
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
            // Enrich results with file size and type from the original FileList
            const enriched = (data.results || []).map((r, i) => {
                const fileObj = files[i]
                return {
                    ...r,
                    size: fileObj ? fileObj.size : 0,
                    type: fileObj ? (fileObj.type || fileObj.name.split('.').pop()) : 'unknown',
                }
            })
            setResults(enriched)
        } catch (err) {
            setError(err.message || 'An error occurred during scanning.')
        } finally {
            setIsScanning(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const compromisedCount = results.filter(r => r.compromised).length
    const cleanCount = results.length - compromisedCount

    return (
        <div className="min-h-screen bg-background-dark font-display text-white">

            {/* ── TOP NAVIGATION BAR ── */}
            <header className="flex items-center justify-between border-b border-surface-dark bg-background-dark px-6 lg:px-10 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    {/* Go Back — icon-only circle button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="size-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 flex items-center justify-center text-text-secondary hover:text-white transition-all group"
                        title="Go back"
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-px transition-transform">arrow_back</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-[20px]">document_scanner</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">On-Demand Scanner</h1>
                            <p className="text-[11px] text-text-secondary">Entropy analysis · Simulation · Directory management</p>
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
                    <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        <span className="hidden md:inline">Settings</span>
                    </Link>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <main className="max-w-6xl mx-auto px-6 lg:px-10 py-8">

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 bg-surface-dark/50 rounded-xl p-1.5 mb-8 w-fit border border-white/5">
                    {[
                        { id: 'scanner', label: 'File Scanner', icon: 'search' },
                        { id: 'directories', label: 'Monitored Paths', icon: 'folder_supervised' },
                        { id: 'simulation', label: 'Simulation Lab', icon: 'science' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-text-secondary hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* TAB 1: FILE SCANNER                                              */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                {activeTab === 'scanner' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[28px]">shield</span>
                                Entropy Analysis Scanner
                            </h2>
                            <p className="mt-2 text-text-secondary text-sm leading-relaxed max-w-2xl">
                                Upload suspect files to instantly analyze their structural entropy using Shannon's algorithm.
                                Files scoring above the configured threshold are flagged as potentially encrypted by ransomware.
                            </p>
                        </div>

                        {/* Dropzone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative group border-2 border-dashed rounded-2xl p-20 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 overflow-hidden ${isDragging
                                ? 'border-primary bg-primary/10 scale-[1.01] shadow-[0_0_60px_rgba(59,130,246,0.15)]'
                                : 'border-white/10 bg-gradient-to-b from-surface-dark/80 to-background-dark hover:border-primary/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.08)]'
                                }`}
                        >
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            {/* Animated Background Glow */}
                            <div className={`absolute inset-0 transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                                style={{ background: 'radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />

                            <div className={`relative z-10 flex flex-col items-center ${isScanning ? 'animate-pulse' : ''}`}>
                                <div className={`size-24 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${isDragging
                                    ? 'bg-primary/20 scale-110 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                                    : 'bg-surface-dark group-hover:bg-white/5 border border-white/5 group-hover:border-primary/20'}`}>
                                    <span className={`material-symbols-outlined text-6xl transition-all duration-300 ${isDragging ? 'text-primary animate-bounce' : isScanning ? 'text-amber-400 animate-spin' : 'text-text-secondary group-hover:text-primary/70'}`}>
                                        {isScanning ? 'progress_activity' : isDragging ? 'file_download' : 'upload_file'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                    {isScanning ? 'Analyzing file entropy...' : (isDragging ? 'Release to scan files' : 'Drop files here to scan')}
                                </h3>
                                <p className="text-text-secondary text-sm">
                                    {isScanning ? 'Computing Shannon entropy on uploaded files' : 'or click to browse — supports multiple files'}
                                </p>
                                {!isScanning && !isDragging && (
                                    <div className="mt-5 flex items-center gap-3 text-xs text-text-secondary">
                                        <span className="flex items-center gap-1.5 bg-surface-dark px-3 py-1.5 rounded-full border border-white/5">
                                            <span className="size-1.5 rounded-full bg-emerald-400" /> .txt .docx
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-surface-dark px-3 py-1.5 rounded-full border border-white/5">
                                            <span className="size-1.5 rounded-full bg-amber-400" /> .pdf .xlsx
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-surface-dark px-3 py-1.5 rounded-full border border-white/5">
                                            <span className="size-1.5 rounded-full bg-red-400" /> Any file type
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-danger/10 border border-danger/20 text-danger px-5 py-4 rounded-xl flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                                <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
                                <div>
                                    <p className="font-semibold text-sm">Scan Failed</p>
                                    <p className="text-xs text-danger/80 mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        {results.length > 0 && (
                            <div className="space-y-4">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-surface-dark border border-white/5 rounded-xl p-5 flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-primary/15 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{results.length}</p>
                                            <p className="text-xs text-text-secondary">Files Scanned</p>
                                        </div>
                                    </div>
                                    <div className="bg-surface-dark border border-white/5 rounded-xl p-5 flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-emerald-400 text-[24px]">gpp_good</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-emerald-400">{cleanCount}</p>
                                            <p className="text-xs text-text-secondary">Clean Files</p>
                                        </div>
                                    </div>
                                    <div className="bg-surface-dark border border-white/5 rounded-xl p-5 flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-danger/15 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-danger text-[24px]">gpp_bad</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-danger">{compromisedCount}</p>
                                            <p className="text-xs text-text-secondary">Compromised</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Table */}
                                <div className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
                                            <h3 className="text-base font-bold">Scan Results</h3>
                                        </div>
                                        <button onClick={() => setResults([])} className="text-xs text-text-secondary hover:text-white transition-colors flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                            Clear
                                        </button>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {results.map((r, i) => {
                                            const entropyPct = (r.entropy / 8) * 100
                                            const barColor = r.compromised ? 'bg-gradient-to-r from-red-500 to-red-400' : r.entropy > 5 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                            const threatLevel = r.compromised ? 'CRITICAL' : r.entropy > 6 ? 'HIGH' : r.entropy > 4 ? 'MEDIUM' : 'LOW'
                                            const fileSize = r.size ? (r.size < 1024 ? `${r.size} B` : r.size < 1048576 ? `${(r.size / 1024).toFixed(1)} KB` : `${(r.size / 1048576).toFixed(2)} MB`) : '—'
                                            const fileExt = r.filename?.split('.').pop()?.toUpperCase() || '—'
                                            return (
                                                <div key={i} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className={`material-symbols-outlined text-[20px] ${r.compromised ? 'text-danger' : 'text-emerald-400'}`}>
                                                                {r.compromised ? 'gpp_bad' : 'gpp_good'}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <span className="text-sm font-medium truncate block max-w-[300px]" title={r.filename}>{r.filename}</span>
                                                                <span className="text-[11px] text-text-secondary">{fileExt} · {fileSize}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 flex-shrink-0">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${r.compromised
                                                                ? 'text-danger bg-danger/10 border-danger/20'
                                                                : r.entropy > 6
                                                                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                                                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                                                }`}>{threatLevel}</span>
                                                            <div className="text-right">
                                                                <span className="text-sm font-mono font-bold tabular-nums block">{r.entropy.toFixed(3)}</span>
                                                                <span className="text-[10px] text-text-secondary">bits/byte</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex-1">
                                                            <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${entropyPct}%` }} />
                                                        </div>
                                                        <span className="text-[10px] text-text-secondary/60 w-8 text-right">{Math.round(entropyPct)}%</span>
                                                    </div>
                                                    {r.compromised && (
                                                        <p className="text-[11px] text-danger/80 mt-2 flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[14px]">warning</span>
                                                            Entropy exceeds threshold — file likely encrypted by ransomware
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* TAB 2: MONITORED PATHS                                           */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                {activeTab === 'directories' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[28px]">folder_supervised</span>
                                Live Monitored Directories
                            </h2>
                            <p className="mt-2 text-text-secondary text-sm leading-relaxed max-w-2xl">
                                Directories actively watched by the Ransom-Trap agent. Adding a path also deploys honeytokens there for early warning detection.
                            </p>
                        </div>

                        {/* Add New Path */}
                        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Add New Directory</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
                                        create_new_folder
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="e.g. C:\Users\Admin\Documents"
                                        value={newPath}
                                        onChange={e => setNewPath(e.target.value)}
                                        className="w-full bg-background-dark border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary/50 transition-colors"
                                        onKeyDown={e => { if (e.key === 'Enter') handleAddPath() }}
                                    />
                                </div>
                                <button
                                    onClick={handleAddPath}
                                    disabled={!newPath.trim() || monitoredPaths.includes(newPath.trim())}
                                    className="bg-primary hover:bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                    Add Path
                                </button>
                            </div>
                        </div>

                        {/* Paths List */}
                        <div className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-[20px]">checklist</span>
                                    <h3 className="font-bold">Currently Monitoring</h3>
                                </div>
                                <span className="text-xs bg-white/10 text-text-secondary px-3 py-1 rounded-full font-bold">{monitoredPaths.length} paths</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {monitoredPaths.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <span className="material-symbols-outlined text-5xl text-white/10 mb-3 block">folder_off</span>
                                        <p className="text-text-secondary text-sm">No paths configured</p>
                                        <p className="text-text-secondary/50 text-xs mt-1">Add a directory above to start monitoring.</p>
                                    </div>
                                ) : (
                                    monitoredPaths.map(p => (
                                        <div
                                            key={p}
                                            className="flex items-center gap-4 px-6 py-4 group hover:bg-white/[0.02] transition-all"
                                        >
                                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/10">
                                                <span className="material-symbols-outlined text-emerald-400 text-[20px]">folder</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-mono break-all leading-relaxed" title={p}>{p}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Active</span>
                                                <button
                                                    onClick={() => handleRemovePath(p)}
                                                    className="size-9 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                    title="Stop watching this path"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* TAB 3: SIMULATION LAB                                            */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                {activeTab === 'simulation' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-danger text-[28px]">science</span>
                                Ransomware Simulation Lab
                            </h2>
                            <p className="mt-2 text-text-secondary text-sm leading-relaxed max-w-2xl">
                                Safely trigger a mock ransomware attack to test detection, process termination, folder locking, and notifications in a controlled environment.
                            </p>
                        </div>

                        {/* How it works */}
                        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/10">
                                    <span className="material-symbols-outlined text-amber-400 text-[20px]">info</span>
                                </div>
                                <div className="text-sm text-text-secondary space-y-2 leading-relaxed">
                                    <p><strong className="text-white">How it works:</strong> The simulator creates 5 dummy test files, then overwrites them with high-entropy random data (<code className="text-amber-400 bg-amber-500/10 px-1.5 rounded">os.urandom</code>) to mimic ransomware encryption.</p>
                                    <p>The agent will detect the entropy spike, terminate the simulator, and lock the folder. Use <strong className="text-white">Undo</strong> to restore everything.</p>
                                </div>
                            </div>
                        </div>

                        {/* Target directory and controls */}
                        <div className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                                <h3 className="font-bold">Simulation Controls</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Multi-Select Target Paths */}
                                {monitoredPaths.length > 0 ? (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Target Directories</label>
                                            <button
                                                onClick={selectAllPaths}
                                                className="text-[11px] font-semibold text-primary hover:text-blue-300 transition-colors flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">
                                                    {selectedSimPaths.length === monitoredPaths.length ? 'deselect' : 'select_all'}
                                                </span>
                                                {selectedSimPaths.length === monitoredPaths.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                                            {monitoredPaths.map(p => {
                                                const isSelected = selectedSimPaths.includes(p)
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => togglePath(p)}
                                                        className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border transition-all ${
                                                            isSelected
                                                                ? 'bg-primary/10 border-primary/30 hover:bg-primary/15'
                                                                : 'bg-background-dark border-white/5 hover:border-white/15 hover:bg-white/[0.02]'
                                                        }`}
                                                    >
                                                        <div className={`size-5 rounded-md flex items-center justify-center flex-shrink-0 border transition-all ${
                                                            isSelected
                                                                ? 'bg-primary border-primary'
                                                                : 'border-white/20 bg-transparent'
                                                        }`}>
                                                            {isSelected && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                                                        </div>
                                                        <span className="material-symbols-outlined text-[18px] flex-shrink-0 text-text-secondary">folder</span>
                                                        <span className="text-sm font-mono text-white truncate">{p}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <p className="text-[11px] text-text-secondary/60 mt-2.5">
                                            {selectedSimPaths.length} of {monitoredPaths.length} path{monitoredPaths.length !== 1 ? 's' : ''} selected
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3">
                                        <span className="material-symbols-outlined text-amber-400 text-[18px]">warning</span>
                                        <span className="text-amber-400 text-sm">No monitored paths configured. Add one in the <button onClick={() => setActiveTab('directories')} className="underline font-medium hover:text-amber-300">Monitored Paths</button> tab first.</span>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <button
                                        onClick={handleSimulate}
                                        disabled={isSimulating || isUndoing}
                                        className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-red-500/25"
                                    >
                                        <span className={`material-symbols-outlined text-[22px] ${isSimulating ? 'animate-pulse' : ''}`}>
                                            {isSimulating ? 'pending' : 'play_circle'}
                                        </span>
                                        {isSimulating ? 'Deploying Simulation...' : 'Launch Ransomware Simulation'}
                                    </button>

                                    <button
                                        onClick={handleUndo}
                                        disabled={isSimulating || isUndoing}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-7 py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
                                        title="Restore all test files to their original state"
                                    >
                                        <span className={`material-symbols-outlined text-[22px] ${isUndoing ? 'animate-spin' : ''}`}>
                                            {isUndoing ? 'progress_activity' : 'undo'}
                                        </span>
                                        {isUndoing ? 'Restoring Files...' : 'Undo & Restore'}
                                    </button>
                                </div>

                                {/* Status Message */}
                                {simMsg && (
                                    <div className={`rounded-xl border px-5 py-4 flex items-start gap-3 animate-[fadeIn_0.3s_ease-out] ${simMsg.startsWith('Error') || simMsg.startsWith('Undo Error')
                                        ? 'bg-danger/10 border-danger/20'
                                        : simMsg.includes('Undo')
                                            ? 'bg-primary/10 border-primary/20'
                                            : 'bg-emerald-500/10 border-emerald-500/20'
                                        }`}>
                                        <span className={`material-symbols-outlined text-[20px] mt-0.5 ${simMsg.startsWith('Error') || simMsg.startsWith('Undo Error')
                                            ? 'text-danger'
                                            : simMsg.includes('Undo')
                                                ? 'text-primary'
                                                : 'text-emerald-400'
                                            }`}>
                                            {simMsg.startsWith('Error') || simMsg.startsWith('Undo Error') ? 'error' : simMsg.includes('Undo') ? 'restore' : 'check_circle'}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {simMsg.startsWith('Error') || simMsg.startsWith('Undo Error') ? 'Operation Failed' : simMsg.includes('Undo') ? 'Restoration Started' : 'Simulation Launched'}
                                            </p>
                                            <p className="text-xs text-text-secondary mt-0.5">{simMsg}</p>
                                        </div>
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
