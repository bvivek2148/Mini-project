import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function ManualScanPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [results, setResults] = useState([])
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

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
                <div className="flex items-center justify-between p-6">
                    <Link to="/dashboard" className="text-xl font-bold text-white tracking-tight">Ransom-Trap</Link>
                    <button className="lg:hidden text-[#92adc9]" onClick={() => setSidebarOpen(false)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col justify-between">
                    <nav className="flex flex-col gap-2">
                        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-sm font-medium leading-normal">Overview</span>
                        </Link>
                        <Link to="/scan" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary text-white transition-colors">
                            <span className="material-symbols-outlined fill-1">document_scanner</span>
                            <span className="text-sm font-medium leading-normal">Manual Scan</span>
                        </Link>
                        <Link to="/Incidents" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors">
                            <span className="material-symbols-outlined">warning</span>
                            <span className="text-sm font-medium leading-normal">Incidents</span>
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0b1219] overflow-hidden">
                <header className="flex items-center gap-4 border-b border-[#233648] bg-background-dark px-6 py-4">
                    <button className="lg:hidden text-white" onClick={() => setSidebarOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <h1 className="text-xl font-bold text-white">On-Demand File Scanner</h1>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white">Drag & Drop Scan</h2>
                            <p className="mt-2 text-text-secondary">
                                Upload suspect files or directories to instantly analyze their structural entropy and detect ransomware encryption.
                            </p>
                        </div>

                        {/* Dropzone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-[#2a3c4f] bg-surface-dark hover:border-primary/50 hover:bg-[#1c2936]'
                                }`}
                        >
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            <span className={`material-symbols-outlined text-6xl mb-4 ${isDragging ? 'text-primary' : 'text-[#4b6a88]'}`}>
                                {isScanning ? 'hourglass_empty' : 'upload_file'}
                            </span>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {isScanning ? 'Analyzing files...' : (isDragging ? 'Drop files here' : 'Click or drag files here')}
                            </h3>
                            <p className="text-text-secondary text-sm">
                                {!isScanning && 'Supports multiple files and folders.'}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-lg flex items-center gap-3">
                                <span className="material-symbols-outlined">error</span>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Results Table */}
                        {results.length > 0 && (
                            <div className="bg-surface-dark border border-[#233648] rounded-xl overflow-hidden mt-8">
                                <div className="px-6 py-4 border-b border-[#233648] flex justify-between items-center bg-[#111a22]">
                                    <h3 className="text-lg font-bold text-white">Scan Results ({results.length} files)</h3>
                                    <button onClick={() => setResults([])} className="text-sm text-text-secondary hover:text-white transition-colors">Clear</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#233648] bg-[#0b1219]">
                                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary w-1/2">Filename</th>
                                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary w-1/4 text-right">Entropy</th>
                                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary w-1/4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#233648]">
                                            {results.map((r, i) => (
                                                <tr key={i} className="hover:bg-[#1c2936] transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-white truncate max-w-[300px]" title={r.filename}>
                                                        {r.filename}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-text-secondary font-mono text-right">
                                                        {r.entropy.toFixed(3)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {r.compromised ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-danger/20 text-danger border border-danger/30">
                                                                <span className="material-symbols-outlined text-[14px]">gpp_bad</span> Compromised
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30">
                                                                <span className="material-symbols-outlined text-[14px]">gpp_good</span> Clean
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    )
}
