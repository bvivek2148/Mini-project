import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b12] text-white">
      <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-[#1f2937] px-8 py-10 shadow-2xl">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-bold">
            <span className="material-symbols-outlined">shield</span>
          </div>
          <h1 className="text-2xl font-bold">Security Command Center</h1>
          <p className="text-sm text-[#9ca3af] text-center">
            Please authenticate to access the Ransom Trap dashboard.
          </p>
        </div>
        <form className="space-y-5" onSubmit={(e) => {
          e.preventDefault()
          navigate('/dashboard', { replace: true })
        }}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded-lg border border-[#1f2937] bg-[#020617] px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full rounded-lg border border-[#1f2937] bg-[#020617] px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            Secure Login
          </button>
        </form>
      </div>
    </div>
  )
}
