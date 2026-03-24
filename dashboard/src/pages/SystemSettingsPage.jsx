import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchConfig, patchConfig } from '../api.js'

/* ══════════════════════════════════════════════════════════
   TINY REUSABLE COMPONENTS
══════════════════════════════════════════════════════════ */
function Toggle({ checked, onChange, color = '#6366f1', disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        width: 50, height: 28, borderRadius: 99, flexShrink: 0,
        background: checked ? color : 'rgba(255,255,255,0.08)',
        border: `1.5px solid ${checked ? color : 'rgba(255,255,255,0.1)'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .22s', opacity: disabled ? 0.45 : 1,
        boxShadow: checked ? `0 0 16px ${color}55` : 'none',
        outline: 'none',
      }}
    >
      <span style={{
        position: 'absolute', left: checked ? 24 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
        transition: 'left .22s cubic-bezier(.4,0,.2,1)',
      }} />
    </button>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18, overflow: 'hidden',
      backdropFilter: 'blur(12px)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function CardHeader({ icon, iconColor = '#60a5fa', title, subtitle, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 26px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: `${iconColor}1a`, border: `1.5px solid ${iconColor}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 20px ${iconColor}20`,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: iconColor }}>{icon}</span>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#f1f5f9', letterSpacing: '-0.2px' }}>{title}</p>
          {subtitle && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4a6580' }}>{subtitle}</p>}
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}

function CardBody({ children, style = {} }) {
  return <div style={{ padding: '22px 26px', ...style }}>{children}</div>
}

function Row({ label, desc, children, border = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 20, padding: '16px 0',
      borderTop: border ? '1px solid rgba(255,255,255,0.055)' : 'none',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{label}</p>
        {desc && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#4a6580', lineHeight: 1.55 }}>{desc}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function NumInput({ value, onChange, unit, min, max, w = 88 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="number" value={value}
        min={min} max={max}
        onChange={onChange}
        style={{
          width: w, background: 'rgba(255,255,255,0.05)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '8px 12px',
          fontSize: 14, color: '#e2e8f0', outline: 'none',
          fontFamily: 'monospace', textAlign: 'center',
          transition: 'border-color .18s',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,.55)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,.1)')}
      />
      {unit && <span style={{ fontSize: 12, color: '#3a5472', userSelect: 'none', fontWeight: 500 }}>{unit}</span>}
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value} onChange={onChange}
      style={{
        background: '#0d1828', border: '1.5px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '8px 34px 8px 13px',
        fontSize: 14, color: '#e2e8f0', outline: 'none', cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a6580' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 11px center',
        transition: 'border-color .18s', minWidth: 180,
      }}
      onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,.55)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,.1)')}
    >
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o} style={{ background: '#0d1828' }}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  )
}

function TextInput({ value, onChange, placeholder, w = 260 }) {
  return (
    <input
      type="text" value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: w, background: 'rgba(255,255,255,0.05)',
        border: '1.5px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '8px 13px',
        fontSize: 14, color: '#e2e8f0', outline: 'none',
        transition: 'border-color .18s',
      }}
      onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,.55)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,.1)')}
    />
  )
}

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 99,
      background: `${color}18`, color, border: `1px solid ${color}35`,
      textTransform: 'uppercase', letterSpacing: '0.1em',
    }}>{label}</span>
  )
}

function InfoBox({ icon = 'info', color = '#60a5fa', children }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '14px 16px',
      background: `${color}0d`, border: `1px solid ${color}25`,
      borderRadius: 12, marginTop: 14,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <p style={{ margin: 0, fontSize: 12, color: color === '#f59e0b' ? '#b5803a' : color === '#ef4444' ? '#9a3a3a' : '#3a5472', lineHeight: 1.6 }}>
        {children}
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'detection',     icon: 'radar',         label: 'Detection'     },
  { id: 'response',      icon: 'security',      label: 'Response'      },
  { id: 'notifications', icon: 'notifications', label: 'Notifications' },
  { id: 'performance',   icon: 'speed',         label: 'Performance'   },
  { id: 'advanced',      icon: 'build',         label: 'Advanced'      },
  { id: 'danger',        icon: 'warning',       label: 'Danger Zone'   },
]

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function SystemSettingsPage() {
  const navigate = useNavigate()
  const [tab, setTab]     = useState('detection')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [toast, setToast]   = useState(null) // {msg,type}

  /* ── config ── */
  const [killEnabled,        setKillEnabled]        = useState(false)
  const [folderLock,         setFolderLock]          = useState(true)
  const [autoQuarantine,     setAutoQuarantine]      = useState(false)
  const [emailEnabled,       setEmailEnabled]        = useState(false)
  const [telegramEnabled,    setTelegramEnabled]     = useState(false)
  const [whatsappEnabled,    setWhatsappEnabled]     = useState(false)
  const [emailAddr,          setEmailAddr]           = useState('')
  const [smtpHost,           setSmtpHost]            = useState('smtp.gmail.com')
  const [smtpPort,           setSmtpPort]            = useState(587)
  const [telegramToken,      setTelegramToken]       = useState('')
  const [telegramChat,       setTelegramChat]        = useState('')
  const [entropyThreshold,   setEntropyThreshold]    = useState(7.0)
  const [sliderVal,          setSliderVal]           = useState(0.5)
  const [calibMode,          setCalibMode]           = useState('balanced')
  const [timeWindow,         setTimeWindow]          = useState(5)
  const [scanInterval,       setScanInterval]        = useState(30)
  const [maxThreads,         setMaxThreads]          = useState('auto')
  const [logLevel,           setLogLevel]            = useState('info')
  const [retentionDays,      setRetentionDays]       = useState(30)
  const [alertCooldown,      setAlertCooldown]       = useState(60)
  const [realTime,           setRealTime]            = useState(true)
  const [deepScan,           setDeepScan]            = useState(false)
  const [honeypot,           setHoneypot]            = useState(true)
  const [adaptiveThresh,     setAdaptiveThresh]      = useState(false)
  const [procSignatureDB,    setProcSignatureDB]     = useState(true)
  const [networkIsolation,   setNetworkIsolation]    = useState(false)
  const [sandbox,            setSandbox]             = useState(false)
  const [confirmReset,       setConfirmReset]        = useState(false)

  /* ── load ── */
  useEffect(() => {
    fetchConfig().then(cfg => {
      setKillEnabled(cfg.kill_on_detection ?? false)
      setEmailEnabled(cfg.email_enabled ?? false)
      setTelegramEnabled(cfg.telegram_enabled ?? false)
      setWhatsappEnabled(cfg.whatsapp_enabled ?? false)
      const et = parseFloat(cfg.entropy_threshold || 7.0)
      setEntropyThreshold(et)
      const sv = Math.min(1, Math.max(0, (et - 5) / 3))
      setSliderVal(sv)
      setCalibMode(sv < 0.33 ? 'conservative' : sv > 0.66 ? 'aggressive' : 'balanced')
      setTimeWindow(cfg.time_window_seconds || 5)
    }).catch(() => {})
  }, [])

  /* ── helpers ── */
  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function onSlider(e) {
    const v = parseFloat(e.target.value)
    setSliderVal(v)
    setEntropyThreshold(parseFloat((v * 3 + 5).toFixed(1)))
    setCalibMode(v < 0.33 ? 'conservative' : v > 0.66 ? 'aggressive' : 'balanced')
  }

  function onPreset(mode) {
    setCalibMode(mode)
    const sv = mode === 'conservative' ? 0.15 : mode === 'aggressive' ? 0.85 : 0.5
    setSliderVal(sv)
    setEntropyThreshold(parseFloat((sv * 3 + 5).toFixed(1)))
  }

  async function handleToggle(field, value, setter) {
    setter(value)
    try {
      await patchConfig({ [field]: value })
      showToast(`${field.replace(/_/g, ' ')} ${value ? 'enabled' : 'disabled'}`)
    } catch {
      setter(!value)
      showToast('Failed to update setting', 'error')
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await patchConfig({
        kill_on_detection: killEnabled,
        email_enabled: emailEnabled,
        telegram_enabled: telegramEnabled,
        whatsapp_enabled: whatsappEnabled,
        entropy_threshold: entropyThreshold,
        time_window_seconds: timeWindow,
      })
      setSaved(true)
      showToast('Configuration saved successfully')
      setTimeout(() => setSaved(false), 3000)
    } catch {
      showToast('Failed to save configuration', 'error')
    }
    setSaving(false)
  }

  /* ── preset button ── */
  function PresetBtn({ mode, color, icon, label, sub }) {
    const active = calibMode === mode
    return (
      <button
        onClick={() => onPreset(mode)}
        style={{
          flex: 1, padding: '20px 16px', borderRadius: 14, cursor: 'pointer',
          border: `1.5px solid ${active ? color + '55' : 'rgba(255,255,255,0.07)'}`,
          background: active
            ? `linear-gradient(145deg,${color}1a,${color}08)`
            : 'rgba(255,255,255,0.02)',
          transition: 'all .2s', position: 'relative', overflow: 'hidden',
          boxShadow: active ? `0 0 28px ${color}20` : 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          outline: 'none',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = `${color}30` } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' } }}
      >
        {active && (
          <div style={{ position: 'absolute', top: 0, right: 0, background: color, color: '#fff', fontSize: 9, fontWeight: 900, padding: '4px 10px', borderRadius: '0 0 0 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Active
          </div>
        )}
        <div style={{ width: 46, height: 46, borderRadius: 14, background: `${color}18`, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'box-shadow .2s', boxShadow: active ? `0 0 18px ${color}35` : 'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: active ? color : `${color}60`, transition: 'color .2s' }}>{icon}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: active ? '#f1f5f9' : '#5a7a9a', letterSpacing: '-0.1px' }}>{label}</span>
        <span style={{ fontSize: 11, color: active ? `${color}cc` : '#2a3f56' }}>{sub}</span>
      </button>
    )
  }

  /* ── resource bar ── */
  function ResourceBar({ label, pct, color }) {
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#6b8aaa', fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: pct > 70 ? '#f87171' : pct > 45 ? '#fbbf24' : '#34d399', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
        </div>
        <div style={{ height: 7, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg,${color},${color}cc)`, boxShadow: `0 0 10px ${color}55`, transition: 'width .6s ease' }} />
        </div>
      </div>
    )
  }

  /* ═══════════════════════════ RENDER ═══════════════════════════ */
  const toastColors = { success: { bg: '#071a10', border: 'rgba(16,185,129,0.4)', text: '#34d399', shadow: 'rgba(16,185,129,0.2)', icon: 'check_circle' }, error: { bg: '#1a0808', border: 'rgba(239,68,68,0.4)', text: '#f87171', shadow: 'rgba(239,68,68,0.2)', icon: 'error' }, warning: { bg: '#1a1200', border: 'rgba(245,158,11,0.4)', text: '#fbbf24', shadow: 'rgba(245,158,11,0.2)', icon: 'warning' } }

  return (
    <div style={{ minHeight: '100vh', background: '#060b13', color: '#f1f5f9', fontFamily: 'Inter,-apple-system,sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── CSS ── */}
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastSlide { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        input[type=range]{-webkit-appearance:none;background:transparent;width:100%;cursor:pointer}
        input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:99px;background:linear-gradient(to right,#10b981 0%,#6366f1 50%,#ef4444 100%)}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#818cf8;margin-top:-8px;box-shadow:0 0 0 3px rgba(129,140,248,.22),0 0 14px rgba(129,140,248,.55);transition:transform .15s}
        input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.15)}
        input[type=range]::-moz-range-track{height:6px;border-radius:99px;background:linear-gradient(to right,#10b981 0%,#6366f1 50%,#ef4444 100%)}
        input[type=range]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#818cf8;border:none;box-shadow:0 0 14px rgba(129,140,248,.55)}
        option{background:#0d1828}
        ::placeholder{color:#2a3f56}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.14)}
        *{box-sizing:border-box}
      `}</style>

      {/* ══ TOP HEADER ══ */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 36px', height: 62, flexShrink: 0,
        background: 'rgba(6,11,19,0.96)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#4a6580', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s', outline: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#4a6580' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 19 }}>arrow_back</span>
          </button>
          <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(99,102,241,0.18)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 19, color: '#818cf8' }}>settings</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>System Settings</p>
              <p style={{ margin: 0, fontSize: 11, color: '#2a3f56', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Ransom Trap · Engine Configuration</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 20px',
              borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', outline: 'none',
              background: saved ? 'rgba(16,185,129,0.14)' : 'linear-gradient(135deg,#6366f1,#3b82f6)',
              border: saved ? '1px solid rgba(16,185,129,0.32)' : '1px solid transparent',
              color: saved ? '#34d399' : '#fff',
              fontSize: 13, fontWeight: 700, letterSpacing: '-0.1px',
              opacity: saving ? 0.7 : 1,
              boxShadow: saved ? 'none' : '0 4px 18px rgba(99,102,241,0.38)',
              transition: 'all .28s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{saved ? 'check_circle' : saving ? 'sync' : 'save'}</span>
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* ══ TAB BAR ══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        padding: '0 36px',
        background: 'rgba(6,11,19,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 62, zIndex: 40,
        overflowX: 'auto', flexShrink: 0,
      }}>
        {TABS.map(t => {
          const active = tab === t.id
          const isDanger = t.id === 'danger'
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px',
                background: 'transparent', border: 'none',
                borderBottom: `2.5px solid ${active ? (isDanger ? '#f87171' : '#818cf8') : 'transparent'}`,
                color: active ? (isDanger ? '#f87171' : '#c5d9f0') : (isDanger ? '#f87171' : '#4a6580'),
                fontSize: 14, fontWeight: active ? 700 : 500,
                cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
                transition: 'all .18s', flexShrink: 0,
                marginBottom: -1,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = isDanger ? '#fca5a5' : '#93b4d4' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = isDanger ? '#f87171' : '#4a6580' } }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{t.icon}</span>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ══ BODY ══ */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 36px 60px' }}>

          {/* ════════════ DETECTION ════════════ */}
          {tab === 'detection' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .22s ease-out' }}>

              {/* Page title */}
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Detection Settings</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#4a6580' }}>Configure Shannon entropy thresholds and detection sensitivity for accurate ransomware identification.</p>
              </div>

              {/* Entropy calibration */}
              <Card>
                <CardHeader icon="equalizer" iconColor="#818cf8" title="Shannon Entropy Calibration" subtitle="Tune the mathematical variation limit for file analysis" />
                <CardBody>

                  {/* Preset cards */}
                  <div style={{ display: 'flex', gap: 14, marginBottom: 26 }}>
                    <PresetBtn mode="conservative" color="#10b981" icon="shield"        label="Conservative" sub="Low false positives" />
                    <PresetBtn mode="balanced"     color="#6366f1" icon="balance"       label="Balanced"     sub="Recommended" />
                    <PresetBtn mode="aggressive"   color="#ef4444" icon="rocket_launch" label="Aggressive"   sub="Maximum detection" />
                  </div>

                  {/* Slider */}
                  <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 24px', marginBottom: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#3a5472' }}>Sensitivity Level</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: 9 }}>
                          <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#818cf8' }}>{sliderVal.toFixed(2)}</span>
                          <span style={{ fontSize: 11, color: '#3a5472' }}>/ 1.00</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9 }}>
                          <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#f1f5f9' }}>{entropyThreshold.toFixed(1)}</span>
                          <span style={{ fontSize: 11, color: '#3a5472' }}>eH</span>
                        </div>
                      </div>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={sliderVal} onChange={onSlider} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                      {[['Permissive', '#10b981', sliderVal < 0.33], ['Balanced', '#818cf8', sliderVal >= 0.33 && sliderVal <= 0.66], ['Strict', '#ef4444', sliderVal > 0.66]].map(([t, c, active]) => (
                        <span key={t} style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: active ? c : '#2a3f56', textShadow: active ? `0 0 10px ${c}70` : 'none', transition: 'color .2s' }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 8 }}>
                    {[
                      { l: 'False Positives', v: calibMode === 'conservative' ? '~0.2%' : calibMode === 'aggressive' ? '~8.4%' : '~2.4%', c: calibMode === 'conservative' ? '#34d399' : calibMode === 'aggressive' ? '#f87171' : '#fbbf24' },
                      { l: 'Threat Coverage', v: calibMode === 'conservative' ? '92.4%' : calibMode === 'aggressive' ? '99.9%' : '99.8%', c: '#34d399' },
                      { l: 'Entropy Cutoff',  v: `${entropyThreshold.toFixed(1)} eH`, c: '#818cf8' },
                    ].map(s => (
                      <div key={s.l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 5px', fontSize: 22, fontWeight: 900, color: s.c, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>{s.v}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#3a5472', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>{s.l}</p>
                      </div>
                    ))}
                  </div>

                  <InfoBox icon="lightbulb" color="#818cf8">
                    Sensitivity above <strong style={{ color: '#c5d9f0' }}>0.80</strong> may trigger false alerts on legitimate encrypted archives (.zip, .7z, .rar). The <strong style={{ color: '#c5d9f0' }}>Balanced</strong> preset is recommended for most production environments.
                  </InfoBox>
                </CardBody>
              </Card>

              {/* Detection Engine */}
              <Card>
                <CardHeader icon="radar" iconColor="#22d3ee" title="Detection Engine" subtitle="Core scanning and monitoring behavior" />
                <CardBody>
                  <Row label="Real-Time Monitoring" desc="Continuously watch file system events as they occur — lowest latency detection">
                    <Toggle checked={realTime} onChange={v => setRealTime(v)} color="#22d3ee" />
                  </Row>
                  <Row label="Deep File Scan" desc="Inspect file contents and structure in addition to entropy — slower but significantly more accurate" border>
                    <Toggle checked={deepScan} onChange={v => setDeepScan(v)} color="#22d3ee" />
                  </Row>
                  <Row label="Honeypot Monitoring" desc="Enable canary file trap layer — catches ransomware before it reaches real data" border>
                    <Toggle checked={honeypot} onChange={v => setHoneypot(v)} color="#22d3ee" />
                  </Row>
                  <Row label="Detection Window" desc="Time window used to count and evaluate suspicious file operations" border>
                    <NumInput value={timeWindow} onChange={e => setTimeWindow(Number(e.target.value))} unit="seconds" min={1} max={60} />
                  </Row>
                  <Row label="Background Scan Interval" desc="How often the engine re-scans directories for new threats" border>
                    <NumInput value={scanInterval} onChange={e => setScanInterval(Number(e.target.value))} unit="seconds" min={5} max={300} />
                  </Row>
                </CardBody>
              </Card>
            </div>
          )}

          {/* ════════════ RESPONSE ════════════ */}
          {tab === 'response' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .22s ease-out' }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Automated Response</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#4a6580' }}>Define exactly how the system reacts the moment ransomware is detected.</p>
              </div>

              <InfoBox icon="warning" color="#f59e0b">
                <strong style={{ color: '#fbbf24' }}>Auto-kill and quarantine</strong> will terminate processes and restrict file access immediately upon detection with no further confirmation. Test thoroughly in a lab environment before enabling in production.
              </InfoBox>

              {/* Containment */}
              <Card>
                <CardHeader icon="gpp_bad" iconColor="#f87171" title="Containment Actions" subtitle="Immediate responses triggered on detection" />
                <CardBody>
                  <Row label="Auto-Kill Process" desc="Immediately terminate the malicious process upon detection — stops encryption in its tracks">
                    <Toggle checked={killEnabled} onChange={v => handleToggle('kill_on_detection', v, setKillEnabled)} color="#ef4444" />
                  </Row>
                  <Row label="Folder Lockdown" desc="Restrict write access to affected directories during an active incident" border>
                    <Toggle checked={folderLock} onChange={v => setFolderLock(v)} color="#ef4444" />
                  </Row>
                  <Row label="Auto Quarantine" desc="Move suspicious files to an isolated quarantine directory automatically" border>
                    <Toggle checked={autoQuarantine} onChange={v => setAutoQuarantine(v)} color="#f59e0b" />
                  </Row>
                  <Row label="Alert Cooldown" desc="Minimum time between repeated alerts for the same host to prevent alert flooding" border>
                    <NumInput value={alertCooldown} onChange={e => setAlertCooldown(Number(e.target.value))} unit="seconds" min={0} max={3600} />
                  </Row>
                </CardBody>
              </Card>

              {/* Response matrix */}
              <Card>
                <CardHeader icon="account_tree" iconColor="#818cf8" title="Response Matrix" subtitle="Live action plan based on your current configuration" />
                <CardBody style={{ padding: '16px 26px' }}>
                  {[
                    { trigger: 'Ransomware Detected',    actions: [killEnabled && 'Kill Process', folderLock && 'Lock Folder', autoQuarantine && 'Quarantine', 'Generate Alert', 'Log Event'].filter(Boolean), level: 'critical' },
                    { trigger: 'Honeytoken Accessed',    actions: ['Log Event', 'Generate Alert', 'Monitor Host'],                                                                                               level: 'warning'  },
                    { trigger: 'High Entropy File Found', actions: ['Flag File', deepScan && 'Deep Scan', 'Increment Score', 'Log'].filter(Boolean),                                                           level: 'info'     },
                    { trigger: 'Repeated Modifications',  actions: ['Increment Score', 'Monitor', alertCooldown > 0 ? `Cooldown ${alertCooldown}s` : null].filter(Boolean),                                   level: 'info'     },
                  ].map((row, i) => (
                    <div key={row.trigger} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: row.level === 'critical' ? '#ef4444' : row.level === 'warning' ? '#f59e0b' : '#60a5fa', boxShadow: `0 0 8px ${row.level === 'critical' ? '#ef4444' : row.level === 'warning' ? '#f59e0b' : '#60a5fa'}80`, display: 'block' }} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#c5d9f0' }}>{row.trigger}</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {row.actions.map(a => (
                          <span key={a} style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>{a}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          )}

          {/* ════════════ NOTIFICATIONS ════════════ */}
          {tab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .22s ease-out' }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Notifications</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#4a6580' }}>Configure how and where you receive security alerts when threats are detected.</p>
              </div>

              {/* Email */}
              <Card>
                <CardHeader
                  icon="mail" iconColor="#60a5fa" title="Email Alerts" subtitle="SMTP-based email notifications"
                  right={<Toggle checked={emailEnabled} onChange={v => handleToggle('email_enabled', v, setEmailEnabled)} color="#3b82f6" />}
                />
                <CardBody style={{ opacity: emailEnabled ? 1 : 0.45, transition: 'opacity .2s', pointerEvents: emailEnabled ? 'auto' : 'none' }}>
                  <Row label="Recipient Address" desc="Where alert emails will be delivered">
                    <TextInput value={emailAddr} onChange={e => setEmailAddr(e.target.value)} placeholder="admin@example.com" />
                  </Row>
                  <Row label="SMTP Host" desc="Your email server hostname" border>
                    <TextInput value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
                  </Row>
                  <Row label="SMTP Port" desc="Typically 587 (TLS) or 465 (SSL)" border>
                    <NumInput value={smtpPort} onChange={e => setSmtpPort(Number(e.target.value))} min={1} max={65535} w={100} />
                  </Row>
                  <Row label="Test Connection" desc="Verify your SMTP settings by sending a test email" border>
                    <button
                      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.24)', color: '#60a5fa', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .18s', outline: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                      Send Test Email
                    </button>
                  </Row>
                </CardBody>
              </Card>

              {/* Telegram */}
              <Card>
                <CardHeader
                  icon="send" iconColor="#818cf8" title="Telegram Bot" subtitle="Instant mobile notifications via Telegram"
                  right={<Toggle checked={telegramEnabled} onChange={v => handleToggle('telegram_enabled', v, setTelegramEnabled)} color="#6366f1" />}
                />
                <CardBody style={{ opacity: telegramEnabled ? 1 : 0.45, transition: 'opacity .2s', pointerEvents: telegramEnabled ? 'auto' : 'none' }}>
                  <Row label="Bot Token" desc="Obtained from @BotFather on Telegram">
                    <TextInput value={telegramToken} onChange={e => setTelegramToken(e.target.value)} placeholder="1234567890:AAHxxxxx…" w={300} />
                  </Row>
                  <Row label="Chat ID" desc="Your personal or group chat ID for delivery" border>
                    <TextInput value={telegramChat} onChange={e => setTelegramChat(e.target.value)} placeholder="-1001234567890" />
                  </Row>
                  <Row label="Test Bot" desc="Send a test message to verify connectivity" border>
                    <button
                      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.24)', color: '#818cf8', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .18s', outline: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                      Send Test Message
                    </button>
                  </Row>
                </CardBody>
              </Card>

              {/* WhatsApp */}
              <Card>
                <CardHeader
                  icon="chat" iconColor="#34d399" title="WhatsApp" subtitle="Meta Cloud API integration"
                  right={<Toggle checked={whatsappEnabled} onChange={v => handleToggle('whatsapp_enabled', v, setWhatsappEnabled)} color="#10b981" />}
                />
                <CardBody>
                  <InfoBox icon="info" color="#34d399">
                    Requires a verified Meta Business account and approved WhatsApp Cloud API access. Visit the Meta Developer Portal to generate your access token and phone number ID before enabling this integration.
                  </InfoBox>
                  <Row label="API Status" desc="Current WhatsApp integration status">
                    <Badge label={whatsappEnabled ? 'Active' : 'Inactive'} color={whatsappEnabled ? '#34d399' : '#4a6580'} />
                  </Row>
                </CardBody>
              </Card>
            </div>
          )}

          {/* ════════════ PERFORMANCE ════════════ */}
          {tab === 'performance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .22s ease-out' }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Performance</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#4a6580' }}>Tune resource usage and control how aggressively the engine scans the system.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Resource limits */}
                <Card>
                  <CardHeader icon="speed" iconColor="#f59e0b" title="Resource Limits" subtitle="CPU and thread usage controls" />
                  <CardBody>
                    <Row label="Worker Threads" desc="Number of parallel file scanning threads">
                      <Select value={maxThreads} onChange={e => setMaxThreads(e.target.value)} options={[
                        { value: 'auto', label: 'Auto (Recommended)' },
                        { value: '1',    label: '1 Thread'           },
                        { value: '2',    label: '2 Threads'          },
                        { value: '4',    label: '4 Threads'          },
                        { value: 'max',  label: 'Max Available'      },
                      ]} />
                    </Row>
                    <Row label="Log Level" desc="Verbosity of engine diagnostic logs" border>
                      <Select value={logLevel} onChange={e => setLogLevel(e.target.value)} options={[
                        { value: 'debug',   label: 'Debug (Verbose)' },
                        { value: 'info',    label: 'Info (Default)'  },
                        { value: 'warning', label: 'Warning Only'    },
                        { value: 'error',   label: 'Errors Only'     },
                      ]} />
                    </Row>
                    <Row label="Log Retention" desc="Days before automatic log deletion" border>
                      <NumInput value={retentionDays} onChange={e => setRetentionDays(Number(e.target.value))} unit="days" min={1} max={365} />
                    </Row>
                  </CardBody>
                </Card>

                {/* Resource forecast */}
                <Card>
                  <CardHeader icon="monitoring" iconColor="#22d3ee" title="Resource Forecast" subtitle="Estimated system impact" />
                  <CardBody>
                    <ResourceBar label="CPU Usage"    pct={maxThreads === 'max' ? 88 : maxThreads === '4' ? 58 : maxThreads === '2' ? 32 : 18} color="#22d3ee" />
                    <ResourceBar label="Memory"       pct={deepScan ? 68 : 28}                                                                   color="#818cf8" />
                    <ResourceBar label="Disk I/O"     pct={scanInterval < 15 ? 78 : scanInterval < 30 ? 48 : 20}                                 color="#f59e0b" />
                    <ResourceBar label="Network Load" pct={Math.min(100, (emailEnabled ? 15 : 0) + (telegramEnabled ? 12 : 0) + (whatsappEnabled ? 12 : 0) + 5)} color="#34d399" />
                    <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                      <p style={{ margin: 0, fontSize: 12, color: '#3a5472', lineHeight: 1.6 }}>
                        <span style={{ color: '#6b8aaa', fontWeight: 700 }}>Tip:</span> Enabling deep scan significantly increases memory and I/O usage. Consider running it on a schedule rather than in real-time.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {/* ════════════ ADVANCED ════════════ */}
          {tab === 'advanced' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .22s ease-out' }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Advanced</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#4a6580' }}>Low-level engine options for experienced administrators. Change these only if you know what you're doing.</p>
              </div>

              <Card>
                <CardHeader icon="build" iconColor="#818cf8" title="Engine Internals" subtitle="Fine-grained algorithm controls" />
                <CardBody>
                  <Row label="Adaptive Threshold" desc="Allow the engine to auto-adjust entropy limits based on observed baseline activity">
                    <Toggle checked={adaptiveThresh} onChange={setAdaptiveThresh} color="#818cf8" />
                  </Row>
                  <Row label="Process Signature Database" desc="Use known ransomware process signatures for faster, more accurate identification" border>
                    <Toggle checked={procSignatureDB} onChange={setProcSignatureDB} color="#818cf8" />
                  </Row>
                  <Row label="Network Isolation Mode" desc="Automatically block outbound network connections from detected malicious processes" border>
                    <Toggle checked={networkIsolation} onChange={setNetworkIsolation} color="#f87171" />
                  </Row>
                  <Row label="Sandbox Analysis" desc="Route suspicious files through an isolated sandbox for evaluation — significantly slower" border>
                    <Toggle checked={sandbox} onChange={setSandbox} color="#818cf8" />
                  </Row>
                </CardBody>
              </Card>

              <Card>
                <CardHeader icon="info" iconColor="#60a5fa" title="Build Information" subtitle="Version and system details" />
                <CardBody>
                  {[
                    ['Engine Version',     'Ransom Trap v1.0.0'],
                    ['Detection Database', '2024.12 Rev. 441'  ],
                    ['Python Runtime',     '3.11.x'             ],
                    ['Config Format',      'JSON v2'            ],
                    ['Platform',           'Windows / Cross-OS' ],
                    ['Last Calibration',   'Manual · Balanced'  ],
                  ].map(([k, v], i) => (
                    <Row key={k} label={k} border={i > 0}>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: '#60a5fa', background: 'rgba(59,130,246,0.09)', padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.18)' }}>{v}</span>
                    </Row>
                  ))}
                </CardBody>
              </Card>
            </div>
          )}

          {/* ════════════ DANGER ZONE ════════════ */}
          {tab === 'danger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp .22s ease-out' }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#f87171', letterSpacing: '-0.5px' }}>Danger Zone</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#4a6580' }}>Irreversible destructive actions. There is no undo. Proceed with extreme caution.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px', background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.22)', borderRadius: 14 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#f87171', flexShrink: 0 }}>error</span>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#f87171' }}>Irreversible Operations — No Undo</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#7a3a3a', lineHeight: 1.6 }}>
                    Actions below permanently modify or delete data from the system. Ensure you have exported any important logs or configurations before proceeding.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { title: 'Clear All Alerts',          desc: 'Permanently delete every recorded security alert from the database. Historical incident data will be lost.',                             icon: 'delete_sweep',          btnLabel: 'Clear Alerts',     btnColor: '#f59e0b', fn: () => showToast('All alerts cleared') },
                  { title: 'Export & Wipe Logs',        desc: 'Download a complete log archive to your browser, then permanently delete all log files from disk.',                                   icon: 'file_download_off',     btnLabel: 'Export & Wipe',    btnColor: '#fb923c', fn: () => showToast('Logs exported and wiped') },
                  { title: 'Reset to Factory Defaults', desc: 'Restore all engine settings to their original factory state. Notification credentials, thresholds, and custom rules will be lost.',  icon: 'settings_backup_restore', btnLabel: 'Reset Defaults', btnColor: '#ef4444', fn: () => setConfirmReset(true) },
                  { title: 'Uninstall Ransom Trap',     desc: 'Remove all Ransom Trap files, honeypot tokens, configurations, and scheduled tasks from this system entirely.',                       icon: 'delete_forever',        btnLabel: 'Uninstall',        btnColor: '#dc2626', fn: () => showToast('Uninstall is disabled in demo mode', 'error') },
                ].map(a => (
                  <div key={a.title} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 16, transition: 'background .18s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#f87171' }}>{a.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{a.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#4a6580', lineHeight: 1.55 }}>{a.desc}</p>
                    </div>
                    <button
                      onClick={a.fn}
                      style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: `${a.btnColor}14`, border: `1.5px solid ${a.btnColor}35`, color: a.btnColor, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .18s', whiteSpace: 'nowrap', outline: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${a.btnColor}28`; e.currentTarget.style.borderColor = `${a.btnColor}60`; e.currentTarget.style.boxShadow = `0 0 18px ${a.btnColor}25` }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${a.btnColor}14`; e.currentTarget.style.borderColor = `${a.btnColor}35`; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{a.icon}</span>
                      {a.btnLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══ CONFIRM RESET MODAL ══ */}
      {confirmReset && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setConfirmReset(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(7px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div style={{ width: '100%', maxWidth: 440, borderRadius: 20, background: '#0c1525', border: '1.5px solid rgba(239,68,68,0.28)', boxShadow: '0 28px 70px rgba(0,0,0,0.85)', padding: '28px', animation: 'modalIn .2s ease-out' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(239,68,68,0.13)', border: '1.5px solid rgba(239,68,68,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 0 22px rgba(239,68,68,0.2)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#f87171' }}>settings_backup_restore</span>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 900, color: '#f1f5f9' }}>Reset to Factory Defaults?</h3>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: '#4a6580', lineHeight: 1.65 }}>
              This will permanently erase all custom configurations including notification credentials, entropy thresholds, and response settings. Your current configuration will be lost and cannot be recovered.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmReset(false)}
                style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b8aaa', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all .15s', outline: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b8aaa' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setConfirmReset(false); showToast('Settings reset to factory defaults') }}
                style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 18px rgba(220,38,38,0.42)', transition: 'box-shadow .18s', outline: 'none' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 26px rgba(220,38,38,0.65)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 18px rgba(220,38,38,0.42)'}
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && (() => {
        const c = toastColors[toast.type] || toastColors.success
        return (
          <div style={{
            position: 'fixed', bottom: 30, right: 30, zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '13px 20px', borderRadius: 13,
            background: c.bg, border: `1.5px solid ${c.border}`,
            boxShadow: `0 8px 36px ${c.shadow}`,
            animation: 'toastSlide .25s ease-out',
            color: c.text, fontSize: 14, fontWeight: 600, maxWidth: 360,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>{c.icon}</span>
            {toast.msg}
          </div>
        )
      })()}

    </div>
  )
}
