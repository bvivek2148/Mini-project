import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchConfig, patchConfig } from '../api.js'

export default function ThresholdConfigurationPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)

  const [killEnabled, setKillEnabled] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [monitoredPaths, setMonitoredPaths] = useState([])
  const [newPath, setNewPath] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    fetchConfig().then(cfg => {
      setConfig(cfg)
      setKillEnabled(cfg.kill_on_detection ?? false)
      setEmailEnabled(cfg.email_enabled ?? false)
      setTelegramEnabled(cfg.telegram_enabled ?? false)
      setWhatsappEnabled(cfg.whatsapp_enabled ?? false)
      setMonitoredPaths(cfg.monitored_paths || [])
    }).catch(() => { })
  }, [])

  const entropyThreshold = config ? config.entropy_threshold : 7.0
  const timeWindow = config ? config.time_window_seconds : 5
  const sliderVal = Math.min(1, Math.max(0, (entropyThreshold - 5) / 3)).toFixed(2)

  async function handleToggle(field, value, setter) {
    setter(value)
    try {
      await patchConfig({ [field]: value })
      setToastMsg(value ? `${field} enabled` : `${field} disabled`)
      setTimeout(() => setToastMsg(''), 3000)
    } catch {
      setter(!value) // revert on error
    }
  }

  async function handleAddPath() {
    const trimmed = newPath.trim()
    if (!trimmed || monitoredPaths.includes(trimmed)) return
    const updated = [...monitoredPaths, trimmed]
    setMonitoredPaths(updated)
    setNewPath('')
    try {
      await patchConfig({ monitored_paths: updated })
      setToastMsg('Path added successfully')
      setTimeout(() => setToastMsg(''), 3000)
    } catch {
      setMonitoredPaths(monitoredPaths) // revert
    }
  }

  async function handleRemovePath(pathToRemove) {
    const updated = monitoredPaths.filter(p => p !== pathToRemove)
    setMonitoredPaths(updated)
    try {
      await patchConfig({ monitored_paths: updated })
      setToastMsg('Path removed')
      setTimeout(() => setToastMsg(''), 3000)
    } catch {
      setMonitoredPaths(monitoredPaths) // revert
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased overflow-hidden">
      <style>{`
        /* Custom range slider styling for Webkit */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #137fec;
          cursor: pointer;
          margin-top: -6px;
          box-shadow: 0 0 0 4px rgba(19, 127, 236, 0.2);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #233648;
          border-radius: 2px;
        }
      `}</style>

      <div className="flex h-screen w-full overflow-hidden">
        {/* Main Content Area */}
        <main className="flex flex-1 flex-col overflow-hidden bg-background-light dark:bg-background-dark relative">
          {/* Top Navigation */}
          <header className="flex h-16 items-center justify-between border-b border-border-dark bg-surface-dark px-6 lg:px-10 flex-shrink-0 z-10">
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
                type="button"
                onClick={() => navigate(-1)}
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="text-sm font-medium">Go back</span>
              </button>

              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                  search
                </span>
                <input
                  className="h-9 w-64 rounded-lg bg-[#1c2936] border-none pl-10 pr-4 text-sm text-white placeholder-text-secondary focus:ring-1 focus:ring-primary"
                  placeholder="Search settings, IPs, or logs..."
                  type="text"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="relative rounded-full p-2 text-text-secondary hover:bg-[#1c2936] hover:text-white transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-surface-dark" />
              </button>
              <button
                className="rounded-full p-2 text-text-secondary hover:bg-[#1c2936] hover:text-white transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="mx-auto max-w-6xl space-y-8">
              {/* Page Heading */}
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Threshold Configuration</h2>
                  <p className="mt-2 text-base text-text-secondary">
                    Fine-tune the Shannon entropy detection sensitivity. Higher sensitivity increases protection
                    but may flag legitimate encrypted files (e.g., password-protected zips).
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <button
                    className="flex items-center justify-center gap-2 rounded-lg border border-border-dark bg-[#1c2936] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a3c4f] transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">history</span>
                    View Audit Log
                  </button>
                </div>
              </div>

              {/* ── Response Controls ───────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Auto-Kill Toggle */}
                <div className="rounded-xl border border-border-dark bg-surface-dark p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-danger text-[20px]">gpp_bad</span>
                      <h3 className="text-white font-bold text-sm">Auto-Kill on Detection</h3>
                    </div>
                    <p className="text-text-secondary text-xs">Automatically terminate suspicious processes when ransomware is detected.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={killEnabled}
                    onClick={() => handleToggle('kill_on_detection', !killEnabled, setKillEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-dark ${killEnabled ? 'bg-danger' : 'bg-[#2a3d51]'
                      }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${killEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                  </button>
                </div>

                {/* Email Notifications Toggle */}
                <div className="rounded-xl border border-border-dark bg-surface-dark p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
                      <h3 className="text-white font-bold text-sm">Email Notifications</h3>
                    </div>
                    <p className="text-text-secondary text-xs">Send instant email when an alert fires. Configure SMTP in config.yaml.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emailEnabled}
                    onClick={() => handleToggle('email_enabled', !emailEnabled, setEmailEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-dark ${emailEnabled ? 'bg-primary' : 'bg-[#2a3d51]'
                      }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${emailEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                  </button>
                </div>

                {/* Telegram Notifications Toggle */}
                <div className="rounded-xl border border-border-dark bg-surface-dark p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#0088cc] text-[20px]">send</span>
                      <h3 className="text-white font-bold text-sm">Telegram Alerts</h3>
                    </div>
                    <p className="text-text-secondary text-xs">Send instant Telegram messages. Configure bot token in config.yaml.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={telegramEnabled}
                    onClick={() => handleToggle('telegram_enabled', !telegramEnabled, setTelegramEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-dark ${telegramEnabled ? 'bg-[#0088cc]' : 'bg-[#2a3d51]'
                      }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${telegramEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                  </button>
                </div>

                {/* WhatsApp Notifications Toggle */}
                <div className="rounded-xl border border-border-dark bg-surface-dark p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#25D366] text-[20px]">chat</span>
                      <h3 className="text-white font-bold text-sm">WhatsApp Alerts</h3>
                    </div>
                    <p className="text-text-secondary text-xs">Send instant WhatsApp messages via Meta API. Configure in config.yaml.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={whatsappEnabled}
                    onClick={() => handleToggle('whatsapp_enabled', !whatsappEnabled, setWhatsappEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-dark ${whatsappEnabled ? 'bg-[#25D366]' : 'bg-[#2a3d51]'
                      }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${whatsappEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                  </button>
                </div>
              </div>

              {/* Toast */}
              {toastMsg && (
                <div className="fixed bottom-6 right-6 bg-surface-dark border border-primary/30 text-white text-sm px-4 py-2 rounded-lg shadow-xl z-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  {toastMsg}
                </div>
              )}

              {/* ── Monitored Directories ───────────────────────────── */}
              <div className="rounded-xl border border-border-dark bg-surface-dark p-6 mb-8">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">Monitored Directories</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Add absolute paths to folders you want the Ransom-Trap agents to actively monitor for encryption events. Note: paths must exist on the agent machine.
                  </p>
                </div>

                <div className="flex gap-2 items-center mb-6">
                  <input
                    type="text"
                    placeholder="e.g. C:\Users\Admin\Documents"
                    value={newPath}
                    onChange={e => setNewPath(e.target.value)}
                    className="flex-1 bg-[#1c2936] border border-border-dark text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    onKeyDown={e => { if (e.key === 'Enter') handleAddPath() }}
                  />
                  <button
                    onClick={handleAddPath}
                    disabled={!newPath.trim()}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Path
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {monitoredPaths.length === 0 ? (
                    <div className="text-sm text-text-secondary italic">No paths explicitly configured.</div>
                  ) : (
                    monitoredPaths.map(p => (
                      <div key={p} className="flex items-center gap-2 bg-[#1c2936] border border-border-dark rounded-full px-4 py-1.5 group">
                        <span className="text-sm text-white font-mono break-all line-clamp-1 max-w-xs" title={p}>{p}</span>
                        <button
                          onClick={() => handleRemovePath(p)}
                          className="text-text-secondary hover:text-danger flex items-center justify-center transition-colors shrink-0"
                          title="Remove Path"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Warning Banner */}
              <div className="@container">
                <div className="flex flex-col gap-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 rounded-full bg-yellow-500/20 p-2 text-yellow-500">
                      <span className="material-symbols-outlined">warning</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Active Scan Conflict Warning</h3>
                      <p className="text-sm text-text-secondary mt-1">
                        Changing thresholds during an active scan may result in inconsistent incident reporting.
                        It is recommended to pause active scans before applying changes.
                      </p>
                    </div>
                  </div>
                  <button
                    className="whitespace-nowrap rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-500 transition-colors"
                    type="button"
                  >
                    Pause Active Scans
                  </button>
                </div>
              </div>

              {/* Main Configuration Area */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column: Controls */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Sensitivity Card */}
                  <div className="rounded-xl border border-border-dark bg-surface-dark p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Entropy Sensitivity</h3>
                      <span
                        className="material-symbols-outlined text-text-secondary cursor-help"
                        title="Learn more about entropy scoring"
                      >
                        info
                      </span>
                    </div>

                    {/* Preset Buttons */}
                    <div className="mb-8 grid grid-cols-3 gap-3">
                      <button
                        className="group flex flex-col items-center gap-2 rounded-lg border border-border-dark bg-[#1c2936] p-4 text-center hover:border-primary/50 hover:bg-[#1c2936]/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-text-secondary group-hover:text-white">shield</span>
                        <span className="text-sm font-medium text-white">Conservative</span>
                        <span className="text-xs text-text-secondary">Low false positives</span>
                      </button>
                      <button
                        className="group relative flex flex-col items-center gap-2 rounded-lg border border-primary bg-primary/10 p-4 text-center ring-1 ring-primary transition-all"
                        type="button"
                      >
                        <span className="absolute -top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Active
                        </span>
                        <span className="material-symbols-outlined text-primary">balance</span>
                        <span className="text-sm font-medium text-white">Balanced</span>
                        <span className="text-xs text-primary/80">Recommended</span>
                      </button>
                      <button
                        className="group flex flex-col items-center gap-2 rounded-lg border border-border-dark bg-[#1c2936] p-4 text-center hover:border-red-500/50 hover:bg-[#1c2936]/80 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-text-secondary group-hover:text-white">rocket_launch</span>
                        <span className="text-sm font-medium text-white">Aggressive</span>
                        <span className="text-xs text-text-secondary">Max detection</span>
                      </button>
                    </div>

                    {/* Slider Control */}
                    <div className="mb-8 space-y-4 rounded-lg bg-[#1c2936]/50 p-6">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-white" htmlFor="entropy-slider">
                          Sensitivity Level
                        </label>
                        <span className="text-sm font-bold text-primary">{sliderVal} (Entropy: {entropyThreshold})</span>
                      </div>
                      <input className="w-full" id="entropy-slider" max="1" min="0" step="0.01" type="range" value={sliderVal} readOnly />
                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>0.0 (Permissive)</span>
                        <span>0.5</span>
                        <span>1.0 (Strict)</span>
                      </div>
                    </div>

                    {/* Detailed Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Minimum File Size (KB)</label>
                        <div className="relative">
                          <input
                            className="block w-full rounded-lg border border-border-dark bg-[#1c2936] p-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                            type="number"
                            value={1024}
                            readOnly
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-text-secondary">KB</span>
                        </div>
                        <p className="text-xs text-text-secondary">Files smaller than this will be ignored.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Header Skip Bytes</label>
                        <div className="relative">
                          <input
                            className="block w-full rounded-lg border border-border-dark bg-[#1c2936] p-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                            type="number"
                            value="512"
                            readOnly
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-text-secondary">Bytes</span>
                        </div>
                        <p className="text-xs text-text-secondary">Bytes to skip from file header before scanning.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Detection Window (ms)</label>
                        <div className="relative">
                          <input
                            className="block w-full rounded-lg border border-border-dark bg-[#1c2936] p-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                            type="number"
                            value={timeWindow * 1000}
                            readOnly
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-text-secondary">ms</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Max Threads</label>
                        <div className="relative">
                          <select className="block w-full rounded-lg border border-border-dark bg-[#1c2936] p-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none">
                            <option>Auto (Recommended)</option>
                            <option>2 Threads</option>
                            <option>4 Threads</option>
                            <option>8 Threads</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-text-secondary pointer-events-none text-[20px]">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-border-dark bg-surface-dark p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[#1c2936] p-2 text-white">
                        <span className="material-symbols-outlined">tune</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Advanced Heuristics</p>
                        <p className="text-xs text-text-secondary">Enable machine learning based file-type prediction.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input className="peer sr-only" type="checkbox" value="" />
                      <div className="peer h-6 w-11 rounded-full bg-[#1c2936] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50" />
                    </label>
                  </div>
                </div>

                {/* Right Column: Visualizer & Actions */}
                <div className="space-y-6">
                  {/* Impact Visualizer */}
                  <div className="rounded-xl border border-border-dark bg-surface-dark p-6">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-secondary">Projected Impact</h3>
                    <div className="mb-6 relative h-40 w-full rounded-lg bg-[#1c2936] p-4 flex items-end justify-between gap-2 overflow-hidden">
                      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                        <div className="w-full h-px bg-text-secondary border-dashed" />
                        <div className="w-full h-px bg-text-secondary border-dashed" />
                        <div className="w-full h-px bg-text-secondary border-dashed" />
                        <div className="w-full h-px bg-text-secondary border-dashed" />
                      </div>
                      <div className="group relative flex w-full flex-col items-center gap-1">
                        <div className="h-[30%] w-full rounded-t bg-emerald-500/80 transition-all group-hover:bg-emerald-500" />
                        <span className="text-[10px] text-text-secondary">Safe</span>
                      </div>
                      <div className="group relative flex w-full flex-col items-center gap-1">
                        <div className="h-[65%] w-full rounded-t bg-primary/80 transition-all group-hover:bg-primary" />
                        <span className="text-[10px] text-text-secondary">Encrypted</span>
                      </div>
                      <div className="group relative flex w-full flex-col items-center gap-1">
                        <div className="h-[15%] w-full rounded-t bg-red-500/80 transition-all group-hover:bg-red-500" />
                        <span className="text-[10px] text-text-secondary">Threats</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Est. False Positives</span>
                        <span className="font-medium text-yellow-500">~2.4%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Threat Coverage</span>
                        <span className="font-medium text-green-500">99.8%</span>
                      </div>
                      <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
                        <p className="text-xs leading-relaxed text-blue-200">
                          <span className="font-bold">Note:</span> Increasing sensitivity further may trigger alerts on
                          standard compressed archives.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column label telling how to actually edit config */}
                  {config && (
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 mb-2">
                      <p className="text-xs text-blue-300 font-medium">Current config from <code className="bg-blue-900/30 px-1 rounded">config.yaml</code></p>
                      <ul className="mt-2 space-y-1 text-xs text-blue-200">
                        <li>Entropy threshold: <span className="font-bold">{config.entropy_threshold}</span></li>
                        <li>Min suspicious files: <span className="font-bold">{config.min_suspicious_files}</span></li>
                        <li>Time window: <span className="font-bold">{config.time_window_seconds}s</span></li>
                        <li>Kill on detection: <span className="font-bold">{config.kill_on_detection ? 'Yes' : 'No'}</span></li>
                      </ul>
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-[0.98]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">save</span>
                      Apply Configuration
                    </button>
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-dark bg-transparent py-2.5 text-sm font-medium text-text-secondary hover:bg-[#1c2936] hover:text-white transition-colors"
                      type="button"
                    >
                      Discard Changes
                    </button>
                    <div className="text-center">
                      <button className="text-xs text-text-secondary underline hover:text-primary" type="button">
                        Reset to Defaults
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 border-t border-border-dark py-6 text-center text-xs text-text-secondary">
              <p>© 2024 Ransom Trap Security Systems. All rights reserved.</p>
              <p className="mt-1">Version 4.2.0-beta</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
