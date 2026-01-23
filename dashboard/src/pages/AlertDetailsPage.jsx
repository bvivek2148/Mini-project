import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export default function AlertDetailsPage() {
  const { id } = useParams()
  const [incidentsMenuOpen, setIncidentsMenuOpen] = useState(false)

  return (
    <div className="bg-background-light dark:bg-background-dark h-screen overflow-y-auto flex flex-col font-display overflow-x-hidden text-slate-900 dark:text-white">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-surface-dark bg-background-dark px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-white">
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined text-4xl">shield_lock</span>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">SentinelGuard</h2>
          </div>
          <div className="hidden lg:flex items-center gap-9">
            <a className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" href="#">
              Dashboard
            </a>
            <a className="text-white text-sm font-medium leading-normal" href="#">
              Incidents
            </a>
            <a className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" href="#">
              Alerts
            </a>
            <a className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" href="#">
              Devices
            </a>
            <a className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" href="#">
              Analysts
            </a>
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
            data-alt="User profile avatar"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCBGWm_A3xJs9cVmw2Vk29_idfHrCo_D1p9unfQzQElfFNU9Gk4kkUjbjfRdhvC9wl00AQ9gB_1YyX852nH73PegjhE56mnmqlhHsCLg4SEXUYIMYVXut5DN10Aj2FfmKwTJC7BEuDxt1GTorUe-tBbKSK95ca42MYiF0J5cz219c0EWtguU3ucUs86Y9xMUaRs6PN5aSzNR8a3SRB3eghgPemyLdxbxvhuM7M5s2lShyG5wlgn9H5V7F2G3qtCTK9_Ejlv1UBkebo")',
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-6 px-6 lg:px-10">
        <div className="w-full max-w-[1400px] flex flex-col gap-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm">
            <div className="relative inline-flex items-center">
              <Link
                className="text-text-secondary hover:text-white transition-colors"
                to="/alerts/real-time"
                onClick={() => setIncidentsMenuOpen(false)}
              >
                Incidents
              </Link>
              <button
                type="button"
                className="ml-1 inline-flex items-center justify-center text-text-secondary hover:text-white transition-colors"
                aria-label="Incidents menu"
                onClick={() => setIncidentsMenuOpen((v) => !v)}
              >
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>

              {incidentsMenuOpen ? (
                <div className="absolute left-0 top-full mt-2 min-w-52 rounded-lg border border-white/10 bg-surface-dark shadow-lg z-50 overflow-hidden">
                  <Link
                    className="block px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors"
                    to={`/alerts/${id ?? 'R-2024-001'}`}
                    onClick={() => setIncidentsMenuOpen(false)}
                  >
                    {id ?? 'R-2024-001'}
                  </Link>
                  <Link
                    className="block px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors"
                    to="/processes/termination-log"
                    onClick={() => setIncidentsMenuOpen(false)}
                  >
                    Termination Log
                  </Link>
                </div>
              ) : null}
            </div>

            <span className="text-text-secondary mx-2">/</span>
            <span className="text-white font-medium">{id ?? 'R-2024-001'}</span>
          </nav>

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 border-b border-surface-dark pb-6">
            <div className="flex flex-col gap-2 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-danger/20 text-danger border border-danger/20">
                  Critical
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-surface-dark text-text-secondary border border-surface-dark">
                  Active
                </span>
                <span className="text-text-secondary text-sm">Detected 14 minutes ago</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Alert #R-2024-001: Suspicious Encryption Activity
              </h1>
              <p className="text-text-secondary text-lg">
                Mass file modification detected matching generic ransomware patterns on workstation 'FIN-04'.
              </p>
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
              <button className="flex items-center gap-2 h-10 px-5 bg-surface-dark hover:bg-[#2f455a] text-white text-sm font-semibold rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Dismiss
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Context & Summary (4/12) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Risk Score Card */}
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
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                      <path
                        className="text-gray-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="100, 100"
                        strokeWidth="4"
                      />
                      <path
                        className="text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="92, 100"
                        strokeWidth="4"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-white">92%</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-danger font-bold text-lg">High Confidence</span>
                    <span className="text-text-secondary text-sm">Based on heuristics &amp; behavioral patterns.</span>
                  </div>
                </div>
              </div>

              {/* Incident Details Card */}
              <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                    Incident Context
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <span className="text-text-secondary text-sm">Hostname</span>
                    <div className="flex items-center justify-between text-white text-sm font-medium bg-background-dark/50 px-3 py-2 rounded">
                      FIN-04
                      <button className="text-text-secondary hover:text-white">
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <span className="text-text-secondary text-sm">IP Address</span>
                    <div className="flex items-center justify-between text-white text-sm font-medium bg-background-dark/50 px-3 py-2 rounded">
                      192.168.1.45
                      <button className="text-text-secondary hover:text-white">
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <span className="text-text-secondary text-sm">User</span>
                    <div className="flex items-center justify-between text-white text-sm font-medium bg-background-dark/50 px-3 py-2 rounded">
                      NT AUTHORITY\SYSTEM
                    </div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <span className="text-text-secondary text-sm">OS</span>
                    <div className="flex items-center text-white text-sm font-medium px-3 py-2">
                      Windows 11 Pro 22H2
                    </div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <span className="text-text-secondary text-sm">Department</span>
                    <div className="flex items-center text-white text-sm font-medium px-3 py-2">Finance</div>
                  </div>
                </div>
              </div>

              {/* Activity Log / Timeline */}
              <div className="bg-surface-dark rounded-xl border border-white/5 flex flex-col h-full max-h-[500px]">
                <div className="p-4 border-b border-white/5 bg-white/5">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                    Activity Timeline
                  </h3>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="relative border-l border-white/10 ml-2 space-y-8">
                    {/* Item 1 */}
                    <div className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 bg-background-dark border-2 border-primary rounded-full size-4" />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-secondary font-mono">Today, 10:45:22 AM</span>
                        <p className="text-white text-sm font-medium">Analyst Assigned</p>
                        <p className="text-text-secondary text-xs">Incident assigned to Sarah J.</p>
                      </div>
                    </div>
                    {/* Item 2 */}
                    <div className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 bg-background-dark border-2 border-warning rounded-full size-4" />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-secondary font-mono">Today, 10:42:15 AM</span>
                        <p className="text-white text-sm font-medium">Shadow Copy Deletion Blocked</p>
                        <p className="text-text-secondary text-xs">
                          Process attempted to run{' '}
                          <code className="bg-black/30 px-1 rounded text-warning">vssadmin delete shadows</code>
                        </p>
                      </div>
                    </div>
                    {/* Item 3 */}
                    <div className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 bg-background-dark border-2 border-danger rounded-full size-4 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-secondary font-mono">Today, 10:42:01 AM</span>
                        <p className="text-white text-sm font-medium">Threat Detected</p>
                        <p className="text-text-secondary text-xs">Heuristic engine flagged rapid file encryption.</p>
                      </div>
                    </div>
                    {/* Item 4 */}
                    <div className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 bg-background-dark border-2 border-white/20 rounded-full size-4" />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-secondary font-mono">Today, 08:00:00 AM</span>
                        <p className="text-text-secondary text-sm">Shift started for FIN-04</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Technical Details (8/12) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Process Metadata */}
              <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">memory</span>
                    Process Metadata
                  </h3>
                  <span className="text-xs font-mono bg-danger/20 text-danger px-2 py-1 rounded border border-danger/20">
                    PID: 4920
                  </span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                      Command Line
                    </label>
                    <div className="bg-black/30 p-3 rounded border border-white/5 font-mono text-sm text-white break-all flex items-start gap-2 group">
                      C:\Windows\Temp\svchost.exe -k netsvcs -p
                      <button className="ml-auto opacity-0 group-hover:opacity-100 text-text-secondary hover:text-white transition-opacity">
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1 block">
                      Image Path
                    </label>
                    <div className="flex items-center gap-2 text-sm text-white font-mono break-all">
                      <span className="material-symbols-outlined text-text-secondary text-[18px]">folder_open</span>
                      C:\Windows\Temp\svchost.exe
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1 block">
                      Parent Process
                    </label>
                    <div className="flex items-center gap-2 text-sm text-white font-mono">
                      <span className="material-symbols-outlined text-text-secondary text-[18px]">subdirectory_arrow_right</span>
                      powershell.exe (PID: 1102)
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1 block">
                      SHA256 Hash
                    </label>
                    <div className="flex items-center justify-between text-sm text-text-secondary font-mono border-b border-dashed border-text-secondary/30 pb-1">
                      8a9d1c2b3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b
                      <div className="flex gap-2">
                        <a className="text-primary text-xs hover:underline" href="#">
                          VirusTotal ↗
                        </a>
                        <button className="text-text-secondary hover:text-white">
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>
                      </div>
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
                    <button className="text-text-secondary hover:text-white">
                      <span className="material-symbols-outlined">filter_list</span>
                    </button>
                    <button className="text-text-secondary hover:text-white">
                      <span className="material-symbols-outlined">download</span>
                    </button>
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
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-danger/10 text-danger border border-danger/10">
                            <span className="size-1.5 rounded-full bg-danger" /> Encrypt
                          </span>
                        </td>
                        <td
                          className="px-6 py-3 font-mono text-text-secondary truncate max-w-[200px] lg:max-w-[300px]"
                          title="C:\\Users\\j.doe\\Documents\\Financials\\Q3_Report.xlsx"
                        >
                          C:\...\Documents\Financials\Q3_Report.xlsx
                        </td>
                        <td className="px-6 py-3 text-text-secondary">4.2 MB</td>
                        <td className="px-6 py-3 text-text-secondary text-right font-mono">10:42:05.122</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-danger/10 text-danger border border-danger/10">
                            <span className="size-1.5 rounded-full bg-danger" /> Encrypt
                          </span>
                        </td>
                        <td
                          className="px-6 py-3 font-mono text-text-secondary truncate max-w-[200px] lg:max-w-[300px]"
                          title="C:\\Users\\j.doe\\Documents\\Financials\\Budget_2024.docx"
                        >
                          C:\...\Documents\Financials\Budget_2024.docx
                        </td>
                        <td className="px-6 py-3 text-text-secondary">1.8 MB</td>
                        <td className="px-6 py-3 text-text-secondary text-right font-mono">10:42:04.890</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning border border-warning/10">
                            <span className="size-1.5 rounded-full bg-warning" /> Rename
                          </span>
                        </td>
                        <td
                          className="px-6 py-3 font-mono text-text-secondary truncate max-w-[200px] lg:max-w-[300px]"
                          title="C:\\Users\\j.doe\\Documents\\Notes.txt"
                        >
                          C:\Users\j.doe\Documents\Notes.txt
                        </td>
                        <td className="px-6 py-3 text-text-secondary">12 KB</td>
                        <td className="px-6 py-3 text-text-secondary text-right font-mono">10:42:04.100</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning border border-warning/10">
                            <span className="size-1.5 rounded-full bg-warning" /> Create
                          </span>
                        </td>
                        <td
                          className="px-6 py-3 font-mono text-text-secondary truncate max-w-[200px] lg:max-w-[300px]"
                          title="C:\\Users\\j.doe\\Documents\\README_DECRYPT.txt"
                        >
                          C:\Users\j.doe\Documents\README_DECRYPT.txt
                        </td>
                        <td className="px-6 py-3 text-text-secondary">2 KB</td>
                        <td className="px-6 py-3 text-text-secondary text-right font-mono">10:42:03.550</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="px-6 py-3 bg-background-dark/30 border-t border-white/5 text-center">
                    <button className="text-primary text-sm font-medium hover:text-blue-400 transition-colors">
                      View all 142 affected files
                    </button>
                  </div>
                </div>
              </div>

              {/* Network Activity Widget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <span className="text-white text-sm font-mono">45.33.22.11</span>
                          <span className="text-text-secondary text-xs">Port 443 (HTTPS)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-white/10 text-text-secondary px-2 py-1 rounded">ESTABLISHED</span>
                        <span className="material-symbols-outlined text-danger text-[18px]">public</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-background-dark/50 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-text-secondary" />
                        <div className="flex flex-col">
                          <span className="text-text-secondary text-sm font-mono">192.168.1.5 (DC)</span>
                          <span className="text-text-secondary text-xs">Port 88 (Kerberos)</span>
                        </div>
                      </div>
                      <span className="text-xs bg-white/10 text-text-secondary px-2 py-1 rounded">CLOSED</span>
                    </div>
                  </div>
                </div>
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
                    />
                    <div className="mt-3 flex justify-end">
                      <button className="bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold px-3 py-2 rounded transition-colors">
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
