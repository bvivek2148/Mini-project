import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AnalystsPage() {
    const [analysts] = useState([
        { name: 'Sarah Johnson', role: 'Senior Analyst', status: 'Online', alerts: 12, avatar: 'SJ', color: 'bg-primary' },
        { name: 'Marcus Chen', role: 'Threat Analyst', status: 'Online', alerts: 8, avatar: 'MC', color: 'bg-emerald-500' },
        { name: 'Priya Nair', role: 'SOC Analyst', status: 'Away', alerts: 5, avatar: 'PN', color: 'bg-warning' },
        { name: 'Daniel Reyes', role: 'Incident Responder', status: 'Offline', alerts: 0, avatar: 'DR', color: 'bg-slate-500' },
    ])

    const statusColor = {
        Online: 'bg-success',
        Away: 'bg-warning',
        Offline: 'bg-slate-500',
    }

    const statusText = {
        Online: 'text-success',
        Away: 'text-warning',
        Offline: 'text-slate-400',
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">

            {/* ── TOP NAVIGATION ── */}
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
                        <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium" to="/dashboard">Dashboard</Link>
                        <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium" to="/Incidents">Incidents</Link>
                        <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium" to="/alerts/list">Alerts</Link>
                        <Link className="text-white text-sm font-medium" to="/analysts">Analysts</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
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

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 flex flex-col items-center py-6 px-6 lg:px-10">
                <div className="w-full max-w-[1400px] flex flex-col gap-6">

                    {/* Breadcrumb */}
                    <nav className="flex items-center text-sm gap-2">
                        <Link to="/dashboard" className="text-text-secondary hover:text-white transition-colors">Dashboard</Link>
                        <span className="text-text-secondary">/</span>
                        <span className="text-white font-medium">Analysts</span>
                    </nav>

                    {/* Page Title */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-dark pb-6">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-bold text-white tracking-tight">Analyst Team</h1>
                            <p className="text-text-secondary">SOC analysts assigned to this Ransom Trap deployment.</p>
                        </div>
                        <button className="flex items-center gap-2 h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(19,127,236,0.3)] transition-all self-start lg:self-auto">
                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                            Add Analyst
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Analysts', value: analysts.length, icon: 'group', color: 'text-primary' },
                            { label: 'Online Now', value: analysts.filter(a => a.status === 'Online').length, icon: 'circle', color: 'text-success' },
                            { label: 'Active Alerts', value: analysts.reduce((s, a) => s + a.alerts, 0), icon: 'notifications_active', color: 'text-warning' },
                            { label: 'Avg Alerts / Analyst', value: (analysts.reduce((s, a) => s + a.alerts, 0) / analysts.length).toFixed(1), icon: 'analytics', color: 'text-text-secondary' },
                        ].map(({ label, value, icon, color }) => (
                            <div key={label} className="bg-surface-dark rounded-xl p-5 border border-white/5 flex items-center gap-4">
                                <span className={`material-symbols-outlined text-3xl ${color}`}>{icon}</span>
                                <div>
                                    <p className="text-2xl font-bold text-white">{value}</p>
                                    <p className="text-text-secondary text-sm">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Analysts Table */}
                    <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">manage_accounts</span>
                                Team Members
                            </h3>
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-text-secondary material-symbols-outlined text-[18px]">search</span>
                                <input
                                    className="bg-background-dark/60 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-white placeholder-text-secondary focus:ring-1 focus:ring-primary w-52"
                                    placeholder="Search analysts…"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-background-dark/50 text-text-secondary border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Analyst</th>
                                        <th className="px-6 py-3 font-semibold">Role</th>
                                        <th className="px-6 py-3 font-semibold">Status</th>
                                        <th className="px-6 py-3 font-semibold">Open Alerts</th>
                                        <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {analysts.map((analyst) => (
                                        <tr key={analyst.name} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`${analyst.color} size-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                                        {analyst.avatar}
                                                    </div>
                                                    <span className="text-white font-medium">{analyst.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-secondary">{analyst.role}</td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1.5 text-sm font-medium ${statusText[analyst.status]}`}>
                                                    <span className={`size-2 rounded-full ${statusColor[analyst.status]} ${analyst.status === 'Online' ? 'animate-pulse' : ''}`} />
                                                    {analyst.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {analyst.alerts > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-warning/10 text-warning border border-warning/10">
                                                        {analyst.alerts} open
                                                    </span>
                                                ) : (
                                                    <span className="text-text-secondary text-xs">None</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="text-text-secondary hover:text-primary transition-colors" title="Assign alert">
                                                        <span className="material-symbols-outlined text-[18px]">assignment</span>
                                                    </button>
                                                    <button className="text-text-secondary hover:text-white transition-colors" title="Message">
                                                        <span className="material-symbols-outlined text-[18px]">chat</span>
                                                    </button>
                                                    <button className="text-text-secondary hover:text-danger transition-colors" title="Remove">
                                                        <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
