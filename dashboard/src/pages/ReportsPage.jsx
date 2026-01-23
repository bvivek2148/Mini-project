import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-white min-h-screen flex overflow-hidden">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* SideNavBar */}
      <aside
        className={`w-64 bg-[#111a22] border-r border-[#233648] flex flex-col h-screen shrink-0 fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/20 flex items-center justify-center rounded-lg size-10 text-primary">
            <span className="material-symbols-outlined text-2xl">shield_lock</span>
          </div>
          <div>
            <Link
              to="/dashboard"
              className="text-white text-base font-bold leading-tight hover:text-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Go to Dashboard"
            >
              Ransom Trap
            </Link>
            <p className="text-[#92adc9] text-xs font-normal">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
          <a
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors group"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setSidebarOpen(false)
            }}
          >
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">bar_chart</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors group"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setSidebarOpen(false)
            }}
          >
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">map</span>
            <span className="text-sm font-medium">Real-time Map</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors group"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setSidebarOpen(false)
            }}
          >
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">warning</span>
            <span className="text-sm font-medium">Incidents</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setSidebarOpen(false)
            }}
          >
            <span className="material-symbols-outlined fill-1">description</span>
            <span className="text-sm font-medium">Reports</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors group"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setSidebarOpen(false)
            }}
          >
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>
        <div className="p-4 border-t border-[#233648]">
          <div className="flex items-center gap-3">
            <div
              className="bg-cover bg-center size-9 rounded-full bg-gray-600"
              data-alt="User avatar placeholder"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDvvq-MdIkAMQGj8BmLHguE247N3YnYclUJPgUw5DdI3bK4Ge4L0bB9NrxPH7aVNKgieDCfqI86hyNt5xhJvhzwJYb-GRrZP_W7eky0ay2Ko7SKtwo8d9Zu-JAK6Tz-v-YHK72s9Te3L8jg-hMBvRdIjcf-BGKSuDJXwOqwuSLPbvyoPuiftJH7Be8Xb4UfJ2zccx18lyUV2Nu9ctPjobYR4xyQWdkkViD8vM17P7mbBevpmKI7F7ric2Yo2z1XaiR8kTTVAzUVn5g")',
              }}
            />
            <div className="flex flex-col">
              <p className="text-white text-sm font-medium">Alex Morgan</p>
              <p className="text-[#92adc9] text-xs">Security Analyst</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* TopNavBar */}
        <header className="flex items-center justify-between border-b border-[#233648] bg-[#111a22]/90 backdrop-blur-md px-6 py-3 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-white"
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-[#92adc9]">
              <a className="hover:text-white transition-colors" href="#">
                Home
              </a>
              <span className="material-symbols-outlined text-base mx-1">chevron_right</span>
              <a className="hover:text-white transition-colors" href="#">
                Analytics
              </a>
              <span className="material-symbols-outlined text-base mx-1">chevron_right</span>
              <span className="text-white font-medium">Reports</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92adc9] material-symbols-outlined text-lg">
                search
              </span>
              <input
                className="bg-[#233648] border-none rounded-lg text-white text-sm pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-primary placeholder-[#92adc9]"
                placeholder="Search reports..."
                type="text"
              />
            </div>
            <button className="relative text-[#92adc9] hover:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-[#111a22]" />
            </button>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Generate Incident Report</h1>
                <p className="text-[#92adc9] mt-2 max-w-2xl">
                  Export detailed security logs and incident summaries for compliance audits or internal analysis.
                  Select your parameters below.
                </p>
              </div>
            </div>

            {/* Main Grid: Config + Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column: Configuration Form */}
              <div className="xl:col-span-1 flex flex-col gap-6">
                <div className="bg-surface-dark border border-[#233648] rounded-xl p-6 shadow-lg">
                  <h2 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">tune</span>
                    Configuration
                  </h2>
                  <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
                    {/* Date Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#92adc9]">Reporting Period</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <input
                            className="w-full bg-[#111a22] border border-[#233648] rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary [color-scheme:dark]"
                            type="date"
                          />
                          <span className="text-xs text-[#5e7185] absolute -bottom-5 left-1">Start Date</span>
                        </div>
                        <div className="relative">
                          <input
                            className="w-full bg-[#111a22] border border-[#233648] rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary [color-scheme:dark]"
                            type="date"
                          />
                          <span className="text-xs text-[#5e7185] absolute -bottom-5 left-1">End Date</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 space-y-2">
                      <label className="text-sm font-medium text-[#92adc9]">Incident Type</label>
                      <select className="w-full bg-[#111a22] border border-[#233648] rounded-lg px-3 py-2.5 text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary">
                        <option>All Incidents</option>
                        <option>Ransomware Attempts</option>
                        <option>Unauthorized Access</option>
                        <option>Data Exfiltration</option>
                        <option>High Severity Only</option>
                      </select>
                    </div>

                    {/* Format Selector */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-[#92adc9]">Export Format</label>
                      <div className="grid grid-cols-3 gap-3">
                        <label className="cursor-pointer">
                          <input className="peer sr-only" name="format" type="radio" defaultChecked />
                          <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#233648] bg-[#111a22] hover:bg-[#1a2632] peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary transition-all h-24">
                            <span className="material-symbols-outlined text-3xl mb-1">picture_as_pdf</span>
                            <span className="text-xs font-medium">PDF</span>
                          </div>
                        </label>
                        <label className="cursor-pointer">
                          <input className="peer sr-only" name="format" type="radio" />
                          <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#233648] bg-[#111a22] hover:bg-[#1a2632] peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary transition-all h-24">
                            <span className="material-symbols-outlined text-3xl mb-1">csv</span>
                            <span className="text-xs font-medium">CSV</span>
                          </div>
                        </label>
                        <label className="cursor-pointer">
                          <input className="peer sr-only" name="format" type="radio" />
                          <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#233648] bg-[#111a22] hover:bg-[#1a2632] peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary transition-all h-24">
                            <span className="material-symbols-outlined text-3xl mb-1">data_object</span>
                            <span className="text-xs font-medium">JSON</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 pt-2">
                      <label className="inline-flex items-center gap-3 cursor-pointer group">
                        <input
                          className="form-checkbox rounded border-[#233648] bg-[#111a22] text-primary focus:ring-offset-0 focus:ring-primary size-5"
                          type="checkbox"
                          defaultChecked
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white">Include metadata headers</span>
                      </label>
                      <label className="inline-flex items-center gap-3 cursor-pointer group">
                        <input
                          className="form-checkbox rounded border-[#233648] bg-[#111a22] text-primary focus:ring-offset-0 focus:ring-primary size-5"
                          type="checkbox"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white">Anonymize user identities</span>
                      </label>
                    </div>

                    {/* Action */}
                    <div className="pt-4 mt-auto">
                      <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">download</span>
                        Generate &amp; Download
                      </button>
                    </div>
                  </form>
                </div>

                {/* Recent History (Compact) - desktop */}
                <div className="bg-surface-dark border border-[#233648] rounded-xl p-6 hidden xl:block">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-sm font-semibold">Recent Exports</h3>
                    <a className="text-primary text-xs hover:underline" href="#">
                      View All
                    </a>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded bg-[#111a22] border border-[#233648]">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-400 text-xl">picture_as_pdf</span>
                        <div className="flex flex-col">
                          <span className="text-white text-xs font-medium">Weekly_Ransom_Report.pdf</span>
                          <span className="text-[#5e7185] text-[10px]">Today, 10:42 AM</span>
                        </div>
                      </div>
                      <button className="text-[#92adc9] hover:text-white">
                        <span className="material-symbols-outlined text-lg">download</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-[#111a22] border border-[#233648]">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-400 text-xl">csv</span>
                        <div className="flex flex-col">
                          <span className="text-white text-xs font-medium">Incidents_Q3_2023.csv</span>
                          <span className="text-[#5e7185] text-[10px]">Yesterday, 4:15 PM</span>
                        </div>
                      </div>
                      <button className="text-[#92adc9] hover:text-white">
                        <span className="material-symbols-outlined text-lg">download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Preview Area */}
              <div className="xl:col-span-2 flex flex-col h-full min-h-[600px]">
                <div className="bg-surface-dark border border-[#233648] rounded-xl flex flex-col h-full shadow-lg overflow-hidden">
                  {/* Preview Toolbar */}
                  <div className="border-b border-[#233648] bg-[#151e29] p-4 flex items-center justify-between">
                    <h2 className="text-white text-sm font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#92adc9] text-lg">visibility</span>
                      Document Preview
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#5e7185] mr-2">Previewing first 2 pages</span>
                      <button
                        className="p-1.5 rounded hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors"
                        title="Zoom Out"
                      >
                        <span className="material-symbols-outlined text-lg">remove</span>
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors"
                        title="Zoom In"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-[#233648] text-[#92adc9] hover:text-white transition-colors"
                        title="Fullscreen"
                      >
                        <span className="material-symbols-outlined text-lg">fullscreen</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview Canvas (Mockup) */}
                  <div className="flex-1 bg-[#0d1218] p-8 overflow-auto relative flex justify-center">
                    {/* Paper Sheet */}
                    <div className="w-full max-w-[800px] bg-white text-black min-h-[900px] shadow-2xl p-10 origin-top transform scale-95 md:scale-100 transition-transform duration-300">
                      {/* Report Header */}
                      <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6 mb-8">
                        <div>
                          <div className="flex items-center gap-2 text-primary mb-2">
                            <span className="material-symbols-outlined">shield_lock</span>
                            <span className="font-bold text-lg tracking-tight">Ransom Trap</span>
                          </div>
                          <h1 className="text-2xl font-bold text-gray-900">Incident Activity Report</h1>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase font-semibold">Generated On</p>
                          <p className="text-sm font-medium text-gray-700">Oct 24, 2023</p>
                          <p className="text-xs text-gray-400 uppercase font-semibold mt-2">Period</p>
                          <p className="text-sm font-medium text-gray-700">Oct 01 - Oct 23, 2023</p>
                        </div>
                      </div>

                      {/* Report Summary Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase">Total Incidents</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">142</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded border border-red-100">
                          <p className="text-xs text-red-500 uppercase">Critical Severity</p>
                          <p className="text-2xl font-bold text-red-700 mt-1">12</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded border border-blue-100">
                          <p className="text-xs text-blue-500 uppercase">Resolved</p>
                          <p className="text-2xl font-bold text-blue-700 mt-1">138</p>
                        </div>
                      </div>

                      {/* Mock Chart Area */}
                      <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Incident Volume by Day</h3>
                        <div className="h-40 w-full bg-gray-50 rounded border border-gray-100 flex items-end justify-between px-4 pb-0 pt-8 gap-2">
                          {/* Fake bars */}
                          <div className="w-full bg-blue-200 hover:bg-blue-300 rounded-t h-[30%]" />
                          <div className="w-full bg-blue-200 hover:bg-blue-300 rounded-t h-[50%]" />
                          <div className="w-full bg-blue-200 hover:bg-blue-300 rounded-t h-[40%]" />
                          <div className="w-full bg-blue-200 hover:bg-blue-300 rounded-t h-[80%]" />
                          <div className="w-full bg-blue-200 hover:bg-blue-300 rounded-t h-[60%]" />
                          <div className="w-full bg-blue-200 hover:bg-blue-300 rounded-t h-[20%]" />
                          <div className="w-full bg-red-200 hover:bg-red-300 rounded-t h-[90%]" />
                          <div className="w-full bg-blue-200 hover:bg-blue-300 rounded-t h-[45%]" />
                          <div className="w-full bg-blue-200 hover:bg-blue-300 rounded-t h-[35%]" />
                          <div className="w-full bg-blue-200 hover:bg-blue-300 rounded-t h-[55%]" />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                          <span>Oct 01</span>
                          <span>Oct 12</span>
                          <span>Oct 23</span>
                        </div>
                      </div>

                      {/* Mock Data Table */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Recent Critical Events</h3>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              <th className="py-2">ID</th>
                              <th className="py-2">Timestamp</th>
                              <th className="py-2">Type</th>
                              <th className="py-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            <tr className="border-b border-gray-100">
                              <td className="py-3 text-gray-500">#INC-9022</td>
                              <td className="py-3 text-gray-900">Oct 22, 14:02</td>
                              <td className="py-3 text-gray-900">Ransomware Blocked</td>
                              <td className="py-3 text-right text-green-600 font-medium">Resolved</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-3 text-gray-500">#INC-9021</td>
                              <td className="py-3 text-gray-900">Oct 22, 09:15</td>
                              <td className="py-3 text-gray-900">Login Failure (Multiple)</td>
                              <td className="py-3 text-right text-orange-600 font-medium">Investigating</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-3 text-gray-500">#INC-9018</td>
                              <td className="py-3 text-gray-900">Oct 21, 23:50</td>
                              <td className="py-3 text-gray-900">Outbound Data Spike</td>
                              <td className="py-3 text-right text-green-600 font-medium">Resolved</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-3 text-gray-500">#INC-9015</td>
                              <td className="py-3 text-gray-900">Oct 20, 11:30</td>
                              <td className="py-3 text-gray-900">Malware Signature</td>
                              <td className="py-3 text-right text-green-600 font-medium">Resolved</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Footer */}
                      <div className="mt-12 pt-4 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400">
                          Confidential Security Document - Internal Use Only
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Recent History */}
                <div className="xl:hidden bg-surface-dark border border-[#233648] rounded-xl p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-sm font-semibold">Recent Exports</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded bg-[#111a22] border border-[#233648]">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-400 text-xl">picture_as_pdf</span>
                        <div className="flex flex-col">
                          <span className="text-white text-xs font-medium">Weekly_Ransom_Report.pdf</span>
                          <span className="text-[#5e7185] text-[10px]">Today, 10:42 AM</span>
                        </div>
                      </div>
                      <button className="text-[#92adc9] hover:text-white">
                        <span className="material-symbols-outlined text-lg">download</span>
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
