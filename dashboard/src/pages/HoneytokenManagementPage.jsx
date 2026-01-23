import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function HoneytokenManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="font-display bg-background-light dark:bg-[#101922] text-gray-900 dark:text-white overflow-hidden">
      <div className="flex h-screen w-full">
        {sidebarOpen ? (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        ) : null}

        {/* Side Navigation */}
        <aside
          className={`w-64 h-full flex-col border-r border-[#2d3b4a] bg-[#101922] flex-shrink-0 flex fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Link
            className="p-6 flex items-center gap-3"
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            aria-label="Go to Dashboard"
          >
            <div className="bg-primary/20 p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary text-2xl">shield</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-base font-bold leading-none">Ransom Trap</span>
              <span className="text-gray-500 text-xs font-medium mt-1">Admin Console</span>
            </div>
          </Link>

          <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c252e] transition-colors group"
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-white">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-white transition-colors"
              to="/honeytokens/manage"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-primary fill-1">bug_report</span>
              <span className="text-sm font-medium">Honeytokens</span>
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c252e] transition-colors group"
              to="/honeytokens/logs"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-white">description</span>
              <span className="text-sm font-medium">Logs</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-[#2d3b4a]">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1c252e] cursor-pointer transition-colors">
              <div
                className="size-8 rounded-full bg-cover bg-center"
                data-alt="Portrait of current user"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAvHLIy3fIE1UfWQXH1nQ_Bru7WAn4Hh_D8I4m-rqh7K6lLWksr55ccBAdS4YLViXT0XAUCi3FPq0VK7NsiXPq9SDolyBxgWWy1p3jO6h6FiPbMzamEcwmk6WvrR_CFuPPybvQ0Y5r0pKN8ZnOBxY-JwaQHe1CxMq407dMez5sySAF5YWJorLRkY2MxQGnLvzrTxmN1_4SsktEJVMHJtTec5_lGWWjFQThHSTRpSZJqgeyMr8hiq8jM3aTnqZIMsYn3scFfAfr5aIU')",
                }}
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-white truncate">Alex Morgan</span>
                <span className="text-xs text-gray-500 truncate">SecOps Lead</span>
              </div>
              <span className="material-symbols-outlined text-gray-500 ml-auto">expand_more</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-[#0b1219]">
          {/* Top Header */}
          <header className="h-16 border-b border-gray-200 dark:border-[#2d3b4a] bg-white dark:bg-[#101922] flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
            <div className="flex items-center md:hidden gap-3">
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-primary"
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <Link
                className="text-lg font-bold text-gray-900 dark:text-white"
                to="/dashboard"
                onClick={() => setSidebarOpen(false)}
              >
                Ransom Trap
              </Link>
            </div>


            <div className="flex items-center gap-4 ml-auto">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  search
                </span>
                <input
                  className="h-10 pl-10 pr-4 bg-gray-100 dark:bg-[#1c252e] border-transparent focus:border-primary focus:ring-0 rounded-lg text-sm w-64 text-gray-900 dark:text-white placeholder-gray-500 transition-all"
                  placeholder="Search tokens..."
                  type="text"
                />
              </div>
              <button
                className="flex items-center justify-center size-10 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c252e] transition-colors relative"
                type="button"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#101922]" />
              </button>
              <button
                className="flex items-center justify-center size-10 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c252e] transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              {/* Page Heading */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Honeytoken Management</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-base">
                    Deploy and monitor deception assets to detect ransomware activity.
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Deploy New Honeytoken
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1c252e] p-6 rounded-xl border border-gray-200 dark:border-[#2d3b4a] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Total Deployed</span>
                    <span className="bg-blue-500/10 text-blue-500 p-1.5 rounded-lg material-symbols-outlined">
                      folder_open
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">142</span>
                    <span className="text-sm text-green-500 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-sm">trending_up</span> +12
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1c252e] p-6 rounded-xl border border-red-500/20 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-red-600 dark:text-red-400 font-medium">Active Alerts</span>
                      <span className="bg-red-500/10 text-red-500 p-1.5 rounded-lg material-symbols-outlined animate-pulse">
                        warning
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">2</span>
                      <span className="text-sm text-red-500 font-medium">Critical</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1c252e] p-6 rounded-xl border border-gray-200 dark:border-[#2d3b4a] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Coverage Health</span>
                    <span className="bg-green-500/10 text-green-500 p-1.5 rounded-lg material-symbols-outlined">
                      health_and_safety
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">98%</span>
                    <span className="text-sm text-gray-500">System Wide</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>

              {/* Filters & Table */}
              <div className="flex flex-col bg-white dark:bg-[#1c252e] rounded-xl border border-gray-200 dark:border-[#2d3b4a] shadow-sm">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 dark:border-[#2d3b4a] flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#101922] border border-gray-300 dark:border-[#2d3b4a] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1c252e] transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">filter_list</span>
                      Filters
                    </button>
                    <div className="h-6 w-px bg-gray-300 dark:bg-[#2d3b4a] mx-1" />
                    <div className="flex gap-1">
                      <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary/10 text-primary" type="button">
                        All
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        type="button"
                      >
                        Active
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        type="button"
                      >
                        Triggered
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Sort by:</span>
                    <select className="form-select bg-gray-50 dark:bg-[#101922] border-gray-300 dark:border-[#2d3b4a] text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2">
                      <option>Last Activity</option>
                      <option>Name (A-Z)</option>
                      <option>Status</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-[#101922]/50 border-b border-gray-200 dark:border-[#2d3b4a]">
                      <tr>
                        <th className="p-4 w-4" scope="col">
                          <div className="flex items-center">
                            <input
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                              id="checkbox-all"
                              type="checkbox"
                            />
                          </div>
                        </th>
                        <th className="px-6 py-3 font-medium" scope="col">
                          Token Name
                        </th>
                        <th className="px-6 py-3 font-medium" scope="col">
                          Location
                        </th>
                        <th className="px-6 py-3 font-medium" scope="col">
                          Status
                        </th>
                        <th className="px-6 py-3 font-medium text-right" scope="col">
                          Last Alert
                        </th>
                        <th className="px-6 py-3 font-medium text-center" scope="col">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-[#2d3b4a]">
                      {/* Row 1: Triggered */}
                      <tr className="bg-red-50/50 dark:bg-red-900/5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group">
                        <td className="p-4 w-4">
                          <div className="flex items-center">
                            <input
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                              type="checkbox"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">database</span>
                            </div>
                            <div className="flex flex-col">
                              <span>admin_backup.sql</span>
                              <span className="text-xs text-red-500 font-normal">Compromised</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 group/copy">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">/db/prod/backups</span>
                            <button
                              className="opacity-0 group-hover/copy:opacity-100 text-gray-400 hover:text-white transition-opacity"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                            TRIGGERED
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-red-500 font-bold">NOW</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-100">
                            <button className="text-gray-400 hover:text-primary transition-colors" title="View Logs" type="button">
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors" title="Revoke" type="button">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Row 2: Active */}
                      <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 w-4">
                          <div className="flex items-center">
                            <input
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                              type="checkbox"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">table_chart</span>
                            </div>
                            <div className="flex flex-col">
                              <span>salary_report_2023.xlsx</span>
                              <span className="text-xs text-gray-500 font-normal">Excel Spreadsheet</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 group/copy">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">/finance/shared/</span>
                            <button
                              className="opacity-0 group-hover/copy:opacity-100 text-gray-400 hover:text-white transition-opacity"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                            <span className="size-1.5 rounded-full bg-green-500" />
                            Monitoring
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs">2m ago</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-gray-400 hover:text-primary transition-colors" type="button">
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors" type="button">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Row 3: Active */}
                      <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 w-4">
                          <div className="flex items-center">
                            <input
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                              type="checkbox"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                            </div>
                            <div className="flex flex-col">
                              <span>Q3_Financials.pdf</span>
                              <span className="text-xs text-gray-500 font-normal">PDF Document</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 group/copy">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">/hr/confidential/</span>
                            <button
                              className="opacity-0 group-hover/copy:opacity-100 text-gray-400 hover:text-white transition-opacity"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                            <span className="size-1.5 rounded-full bg-green-500" />
                            Monitoring
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs">1h ago</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-gray-400 hover:text-primary transition-colors" type="button">
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors" type="button">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Row 4: Inactive */}
                      <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 w-4">
                          <div className="flex items-center">
                            <input
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                              type="checkbox"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">terminal</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-500">aws_keys_backup.txt</span>
                              <span className="text-xs text-gray-600 font-normal">Text File</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 group/copy">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">/dev/local/env</span>
                            <button
                              className="opacity-0 group-hover/copy:opacity-100 text-gray-400 hover:text-white transition-opacity"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            <span className="size-1.5 rounded-full bg-gray-400" />
                            Inactive
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-gray-500">3d ago</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-gray-400 hover:text-primary transition-colors" type="button">
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors" type="button">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Row 5: Triggered */}
                      <tr className="bg-red-50/50 dark:bg-red-900/5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group">
                        <td className="p-4 w-4">
                          <div className="flex items-center">
                            <input
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                              type="checkbox"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">folder_zip</span>
                            </div>
                            <div className="flex flex-col">
                              <span>client_data_archive.zip</span>
                              <span className="text-xs text-red-500 font-normal">Compromised</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 group/copy">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">/users/public/downloads</span>
                            <button
                              className="opacity-0 group-hover/copy:opacity-100 text-gray-400 hover:text-white transition-opacity"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                            TRIGGERED
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-red-500 font-bold">5m ago</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-100">
                            <button className="text-gray-400 hover:text-primary transition-colors" title="View Logs" type="button">
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                            <button className="text-gray-400 hover:text-red-500 transition-colors" title="Revoke" type="button">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-[#2d3b4a]">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">1-5</span> of{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">142</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 text-sm font-medium text-gray-500 bg-white dark:bg-[#101922] border border-gray-300 dark:border-[#2d3b4a] rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50"
                      type="button"
                    >
                      Previous
                    </button>
                    <button
                      className="px-3 py-1 text-sm font-medium text-gray-500 bg-white dark:bg-[#101922] border border-gray-300 dark:border-[#2d3b4a] rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="flex justify-center pb-6">
                <p className="text-xs text-gray-500 dark:text-gray-600">
                  Secure Deception Network v2.4.1 • <a className="hover:text-primary" href="#">Documentation</a> •{' '}
                  <a className="hover:text-primary" href="#">Support</a>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
