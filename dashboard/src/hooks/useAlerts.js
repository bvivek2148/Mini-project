import { useState, useEffect, useRef } from 'react'
import { fetchAlerts } from '../api.js'

/**
 * Polls GET /alerts every `intervalMs` milliseconds.
 * Returns { alerts, loading, error }.
 */
export function useAlerts(intervalMs = 5000) {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const intervalRef = useRef(null)

    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const data = await fetchAlerts()
                if (!cancelled) {
                    setAlerts(data)
                    setError(null)
                }
            } catch (err) {
                if (!cancelled) setError(err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        intervalRef.current = setInterval(load, intervalMs)

        return () => {
            cancelled = true
            clearInterval(intervalRef.current)
        }
    }, [intervalMs])

    return { alerts, loading, error }
}
