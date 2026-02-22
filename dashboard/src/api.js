/**
 * Shared API helper for the Ransom-Trap dashboard.
 * In dev, Vite proxies /api → http://127.0.0.1:8000
 */
const BASE = '/api'

// ── Alerts ────────────────────────────────────────────────────────────────────
export async function fetchAlerts() {
    const res = await fetch(`${BASE}/alerts`)
    if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.status}`)
    return res.json()
}

export async function clearAlerts() {
    const res = await fetch(`${BASE}/alerts`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Failed to clear alerts: ${res.status}`)
    return res.json()
}

// ── Agent control ─────────────────────────────────────────────────────────────
export async function fetchAgentStatus() {
    const res = await fetch(`${BASE}/agent/status`)
    if (!res.ok) throw new Error(`Failed to fetch agent status: ${res.status}`)
    return res.json()   // { running: bool, pid: number|null }
}

export async function agentStart() {
    const res = await fetch(`${BASE}/agent/start`, { method: 'POST' })
    if (!res.ok) throw new Error(`Failed to start agent: ${res.status}`)
    return res.json()
}

export async function agentStop() {
    const res = await fetch(`${BASE}/agent/stop`, { method: 'POST' })
    if (!res.ok) throw new Error(`Failed to stop agent: ${res.status}`)
    return res.json()
}

// ── Honeytokens ───────────────────────────────────────────────────────────────
export async function fetchHoneytokens() {
    const res = await fetch(`${BASE}/honeytokens`)
    if (!res.ok) throw new Error(`Failed to fetch honeytokens: ${res.status}`)
    return res.json()
    // Returns: [{ name, path, full_path, status, last_alert_ts, host }]
}

// ── Config ────────────────────────────────────────────────────────────────────
export async function fetchConfig() {
    const res = await fetch(`${BASE}/config`)
    if (!res.ok) throw new Error(`Failed to fetch config: ${res.status}`)
    return res.json()
}
