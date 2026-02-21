/**
 * Shared API helper for the Ransom-Trap dashboard.
 * In dev, Vite proxies /api → http://127.0.0.1:8000
 * In production (served by FastAPI), /api is same origin.
 */
const BASE = '/api'

export async function fetchAlerts() {
    const res = await fetch(`${BASE}/alerts`)
    if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.status}`)
    return res.json()
}

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
