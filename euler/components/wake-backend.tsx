"use client"

import { useEffect } from "react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export function WakeBackend() {
  useEffect(() => {
    function ping() {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      fetch(`${BACKEND_URL}/health`, {
        method: "GET",
        signal: controller.signal,
        mode: "no-cors",
      }).catch(() => {}).finally(() => clearTimeout(timeout))
    }

    ping()
    const interval = setInterval(ping, 40_000)

    return () => clearInterval(interval)
  }, [])

  return null
}
