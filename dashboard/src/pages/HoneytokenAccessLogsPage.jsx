import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function HoneytokenAccessLogsPage() {
  const navigate = useNavigate()
  return (
    <div className="bg-background-light dark:bg-background-dark h-screen overflow-y-auto flex flex-col font-display text-white">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-surface-dark px-10 py-3 bg-background-dark sticky top-0 z-50">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">shield_lock</span>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Ransom Trap</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Go back
            </button>
            <Link className="text-text-secondary hover:text-white transition-colors text-sm font-medium leading-normal" to="/dashboard">
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-text-secondary hover:text-white transition-colors" type="button">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-surface-dark"
              data-alt="User profile avatar image"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1lPcyHh6_XCOam-YAqNPOeF5F9Gmw8BC4Hys7hJ_1J2mxkyWzZXlRvibIa03dRk_Uv17scBnMKbvZ_RdtbT5hqU-75jTMTy14nae2qe-SUwrR6mPkfogjsaKz1tYHgWYP8dMAikFO3-XWNwG8z-xR-98zaA7U_OeHN9HHnue-J6UpRrBTCGCKx_NINE0dQcw_hv8rUCZHnJ_gfvWhJKGYQ802PJr9Y28OxvdJXq-xPx_bp6WnwEI-Ubj2YCMP9kCKK-hds1ZTmIc")',
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 px-4 md:px-10 py-6 max-w-[1600px] mx-auto w-full flex flex-col">

        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Honeytoken Access Logs</h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <p className="text-text-secondary text-sm font-normal leading-normal">Real-time monitoring active</p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold tracking-[0.015em] shadow-[0_0_15px_rgba(19,127,236,0.4)]" type="button">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="truncate">Export Logs</span>
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-surface-dark/50 border border-surface-dark rounded-xl p-4 mb-6 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-xl">
              <label className="flex w-full items-center rounded-lg h-10 bg-background-dark border border-surface-dark focus-within:border-primary transition-colors overflow-hidden">
                <div className="text-text-secondary flex items-center justify-center pl-3">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="w-full bg-transparent border-none text-white focus:ring-0 placeholder:text-text-secondary/70 h-full px-3 text-sm font-normal"
                  placeholder="Search by IP, File Name, or User Agent..."
                  defaultValue=""
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="flex h-10 items-center gap-2 rounded-lg bg-background-dark border border-surface-dark hover:border-text-secondary/50 px-3 transition-all group" type="button">
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">calendar_today</span>
                <span className="text-text-secondary group-hover:text-white text-sm font-medium">Last 24 Hours</span>
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">keyboard_arrow_down</span>
              </button>
              <button className="flex h-10 items-center gap-2 rounded-lg bg-background-dark border border-surface-dark hover:border-text-secondary/50 px-3 transition-all group" type="button">
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">warning</span>
                <span className="text-text-secondary group-hover:text-white text-sm font-medium">Severity: All</span>
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">keyboard_arrow_down</span>
              </button>
              <button className="flex h-10 items-center gap-2 rounded-lg bg-background-dark border border-surface-dark hover:border-text-secondary/50 px-3 transition-all group" type="button">
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">public</span>
                <span className="text-text-secondary group-hover:text-white text-sm font-medium">Location: All</span>
                <span className="material-symbols-outlined text-text-secondary group-hover:text-white text-[20px]">keyboard_arrow_down</span>
              </button>
              <button className="ml-2 text-primary text-sm font-medium hover:underline" type="button">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-surface-dark bg-background-dark flex flex-col shadow-2xl">
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-dark/40 border-b border-surface-dark">
                  <th className="py-4 pl-6 pr-4 text-xs font-semibold uppercase tracking-wider text-text-secondary w-10" />
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Source IP</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Location</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">File Accessed</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">User Agent</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Timestamp (UTC)</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Severity</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-dark">
                {/* Row 1: Critical */}
                <tr className="group hover:bg-surface-dark/30 transition-colors">
                  <td className="pl-6 py-4">
                    <div className="h-8 w-1 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-white text-sm">192.168.1.45</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-3.5 rounded-[2px] overflow-hidden bg-cover bg-center"
                        data-alt="Russian flag icon"
                        data-location="Russia"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBzurmod8qhswpbuhcOeN9iXeE9pT4CoJk8gS-kaTBFEumRejVNmHR-9ixnj_hFsSygK3YclztO2ydp2ti-Zmx5n-I8cdPSu5AoQKblT-9xNY28IuA2jgT7Sr1p89tl7UVXYGTAWgT9pUJEBVK_u--tcnylOCfLqoVCUiR06_2Ze4xSuxeqmQLEtUVYsMZtDPhBqaPdJ0oOLcPpPT-wr9YpETVOJPS6YIeD_dQ6mKaYXy8i0Ybp0kEDER-Qrx0MwI-3csKV41bGypU')",
                        }}
                      />
                      <span className="text-sm text-white">Moscow, RU</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-text-secondary text-[18px]">lock</span>
                      <span className="text-sm font-medium">passwords_Q3.xlsx</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-[200px]">
                    <p
                      className="truncate text-sm text-text-secondary"
                      title="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    >
                      Mozilla/5.0 (Windows NT 10.0...
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm text-text-secondary">2023-10-24 14:32:01</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      CRITICAL
                    </span>
                  </td>
                  <td className="px-4 py-4 pr-6 text-right">
                    <button className="text-text-secondary hover:text-white p-1 rounded hover:bg-surface-dark transition-colors" type="button">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>

                {/* Row 2: Warning */}
                <tr className="group hover:bg-surface-dark/30 transition-colors bg-surface-dark/10">
                  <td className="pl-6 py-4">
                    <div className="h-8 w-1 bg-yellow-500 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-white text-sm">45.22.19.112</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-3.5 rounded-[2px] overflow-hidden bg-cover bg-center"
                        data-alt="China flag icon"
                        data-location="China"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBFB1__GWLokd3b8IyzOU7VnaUKfT2-STq58YPJx3eV0D1EZDFJiCfqQ_ls6YHRPrib3jl1Q00QZ38kKfxS3dzgqu5WAPVzs2R3rvPy-W_mbsVnsEGertPaS0VvpULBhu87v5cLF4ONXoWMsTOvbtAcGb434MHchQIBnhcZWBOCoW_45DmBPliHzGPwjyYNuisKrttP8kPs7ycfG3O5Oh7VfU9KD6hKnixAOAIBrsm_EJxV0M36QYTEmjZ61GA0HA7TxwR8_cOdisM')",
                        }}
                      />
                      <span className="text-sm text-white">Beijing, CN</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-text-secondary text-[18px]">description</span>
                      <span className="text-sm font-medium">financial_report_2023.pdf</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-[200px]">
                    <p className="truncate text-sm text-text-secondary" title="curl/7.64.1">
                      curl/7.64.1
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm text-text-secondary">2023-10-24 14:28:45</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      SUSPICIOUS
                    </span>
                  </td>
                  <td className="px-4 py-4 pr-6 text-right">
                    <button className="text-text-secondary hover:text-white p-1 rounded hover:bg-surface-dark transition-colors" type="button">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>

                {/* Row 3: Info */}
                <tr className="group hover:bg-surface-dark/30 transition-colors">
                  <td className="pl-6 py-4">
                    <div className="h-8 w-1 bg-primary rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-white text-sm">10.0.0.5</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-3.5 rounded-[2px] overflow-hidden bg-cover bg-center"
                        data-alt="USA flag icon"
                        data-location="USA"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCehvMSv-v1QrP-SRXlaebK9BO4JIPVbGhM00lyBOx_Tm_L5JKt3sFpHLDtZxH-iV6gZQABGh9EZugp9o7814SuVacdCj4Odxakzd645L8Qeg8ofK2X9E3A3W_w2MV4RWa-Fy_i1Rl9M-aXZTCe-HQCcuwf9ADrrDrre1rN3WcvMukmefvGmP9XOCrcI8J6gHQntIc1aJ4_2c3orpqVTYa-fCrT7u41_ZQhZEbafco40j6bEXZUBz2NgquFmoxxO3VW6jeb6uujOSM')",
                        }}
                      />
                      <span className="text-sm text-white">Internal Network</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-text-secondary text-[18px]">folder_open</span>
                      <span className="text-sm font-medium">shared_drive_backup</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-[200px]">
                    <p className="truncate text-sm text-text-secondary" title="python-requests/2.25.1">
                      python-requests/2.25.1
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm text-text-secondary">2023-10-24 14:15:22</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      INFO
                    </span>
                  </td>
                  <td className="px-4 py-4 pr-6 text-right">
                    <button className="text-text-secondary hover:text-white p-1 rounded hover:bg-surface-dark transition-colors" type="button">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-surface-dark bg-surface-dark/20 p-4">
            <div className="flex items-center gap-2">
              <p className="text-xs text-text-secondary">Rows per page:</p>
              <select className="h-8 rounded bg-background-dark border-surface-dark text-xs text-white focus:border-primary focus:ring-0" defaultValue="10">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-text-secondary">1-10 of 145</p>
              <div className="flex items-center gap-1">
                <button className="flex items-center justify-center size-8 rounded hover:bg-surface-dark text-text-secondary disabled:opacity-50" type="button" disabled>
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button className="flex items-center justify-center size-8 rounded bg-primary text-white text-xs font-medium shadow-lg shadow-blue-900/50" type="button">
                  1
                </button>
                <button className="flex items-center justify-center size-8 rounded hover:bg-surface-dark text-text-secondary text-xs font-medium" type="button">
                  2
                </button>
                <button className="flex items-center justify-center size-8 rounded hover:bg-surface-dark text-text-secondary text-xs font-medium" type="button">
                  3
                </button>
                <span className="text-text-secondary text-xs px-1">...</span>
                <button className="flex items-center justify-center size-8 rounded hover:bg-surface-dark text-text-secondary text-xs font-medium" type="button">
                  15
                </button>
                <button className="flex items-center justify-center size-8 rounded hover:bg-surface-dark text-text-secondary" type="button">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
