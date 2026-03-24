import React from 'react'

export const ThemeCtx = React.createContext({ dark: true })

export function mkTheme(dark) {
  return {
    dark,
    pageBg: dark ? '#06080c' : '#f8fafc',
    sidebarBg: dark ? '#080b12' : '#ffffff',
    sidebarBorder: dark ? 'rgba(255,255,255,0.04)' : '#e2e8f0',
    headerBg: dark ? 'rgba(10,14,20,0.7)' : 'rgba(255,255,255,0.8)',
    headerBorder: dark ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
    cardBg: dark ? '#0b1018' : '#ffffff',
    cardBorder: dark ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
    text: dark ? '#f8fafc' : '#1e293b',
    sub: dark ? '#94a3b8' : '#64748b',
    muted: dark ? '#64748b' : '#94a3b8',
    divider: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    inputBg: dark ? 'rgba(255,255,255,0.03)' : '#f1f5f9',
    inputBorder: dark ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
    btnHoverBg: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
    rowHover: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    dropdownBg: dark ? 'rgba(12,18,28,0.98)' : 'rgba(255,255,255,0.98)',
    dropdownBorder: dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
    dropdownShadow: dark ? '0 10px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)' : '0 10px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)',
  }
}

export function Logo({ size = 32, color = '#60a5fa' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4L6 9V17C6 22.52 10.27 27.69 16 28C21.73 27.69 26 22.52 26 17V9L16 4Z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16L15 19L20 13" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
