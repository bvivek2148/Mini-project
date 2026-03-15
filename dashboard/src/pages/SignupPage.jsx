import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function SignupPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      navigate('/', { replace: true })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans selection:bg-indigo-500/30 flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <pattern id="grid-signup" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
          <rect fill="url(#grid-signup)" width="100%" height="100%" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Vector / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center size-16 mb-4">
             <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl animate-pulse"></div>
             <div className="relative size-14 bg-[#020408] border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
               <span className="material-symbols-outlined text-[32px] text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">shield_locked</span>
             </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 drop-shadow-md">Create Account</h1>
          <p className="text-sm font-medium text-white/50 tracking-wide">Join Ransom Trap Security Center</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
           {/* Card ambient light */}
           <div className="absolute -top-24 -right-24 size-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

           <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
             <div className="space-y-4">
               
               {/* Full Name */}
               <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <div className="relative group">
                     <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-white/30 group-focus-within:text-indigo-400 transition-colors">person</span>
                     <input 
                       type="text" 
                       required
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full bg-[#020408]/60 border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-[14px] text-white/90 placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-[#020408]/80 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all"
                       placeholder="Analyst Name"
                     />
                  </div>
               </div>

               {/* Email Field */}
               <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                  <div className="relative group">
                     <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-white/30 group-focus-within:text-indigo-400 transition-colors">mail</span>
                     <input 
                       type="email" 
                       required
                       value={formData.email}
                       onChange={e => setFormData({...formData, email: e.target.value})}
                       className="w-full bg-[#020408]/60 border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-[14px] text-white/90 placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-[#020408]/80 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all"
                       placeholder="security@corporate.com"
                     />
                  </div>
               </div>

               {/* Password Field */}
               <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5 ml-1">Master Password</label>
                  <div className="relative group">
                     <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-white/30 group-focus-within:text-indigo-400 transition-colors">key</span>
                     <input 
                       type="password" 
                       required
                       value={formData.password}
                       onChange={e => setFormData({...formData, password: e.target.value})}
                       className="w-full bg-[#020408]/60 border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-[14px] font-mono text-white/90 placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-[#020408]/80 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all"
                       placeholder="••••••••••••"
                     />
                  </div>
               </div>

               {/* Confirm Password */}
               <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                  <div className="relative group">
                     <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-white/30 group-focus-within:text-indigo-400 transition-colors">lock</span>
                     <input 
                       type="password" 
                       required
                       value={formData.confirmPassword}
                       onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                       className="w-full bg-[#020408]/60 border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-[14px] font-mono text-white/90 placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-[#020408]/80 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all"
                       placeholder="••••••••••••"
                     />
                  </div>
               </div>

             </div>

             {/* Action Button */}
             <button 
               type="submit" 
               disabled={isLoading}
               className="w-full relative group overflow-hidden bg-white/[0.02] border border-white/[0.05] rounded-xl p-0.5 mt-8 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className={`relative flex items-center justify-center gap-2 bg-[#020408] rounded-[10px] px-6 py-3.5 transition-all duration-300 ${isLoading ? 'bg-indigo-900/40 border-indigo-500/30' : 'group-hover:bg-opacity-0'}`}>
                   {isLoading ? (
                     <>
                        <span className="material-symbols-outlined text-[18px] text-white animate-spin">data_usage</span>
                        <span className="text-[14px] font-bold text-white tracking-widest uppercase">Provisioning...</span>
                     </>
                   ) : (
                     <>
                        <span className="material-symbols-outlined text-[18px] text-white/70 group-hover:text-white transition-colors">person_add</span>
                        <span className="text-[14px] font-bold text-white/90 group-hover:text-white tracking-widest uppercase transition-colors">Complete Registration</span>
                     </>
                   )}
                </div>
             </button>
           </form>
        </div>

        {/* Footer Nav */}
        <p className="mt-8 text-center text-[13px] text-white/50">
          Already authorized?{' '}
          <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-400/30">
            Secure Login
          </Link>
        </p>
      </div>
    </div>
  )
}
