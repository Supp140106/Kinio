import { useCallback, useRef, useState } from "react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export type GenerateStatus = "idle" | "running" | "done" | "error"

interface GenerateState {
  status: GenerateStatus
  currentNode: string | null
  plan: string | null
  code: string | null
  videoUrl: string | null
  error: string | null
  iteration: number
}

const INITIAL_STATE: GenerateState = {
  status: "idle",
  currentNode: null,
  plan: null,
  code: null,
  videoUrl: null,
  error: null,
  iteration: 0,
}

export function useGenerate(projectId: string) {
  const [state, setState] = useState<GenerateState>(INITIAL_STATE)
  const abortRef = useRef<AbortController | null>(null)

  const generate = useCallback(
    async (
      prompt: string,
      previousCode?: string,
      previousPlan?: string,
    ) => {
      // Cancel any in-flight stream
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setState({
        status: "running",
        currentNode: null,
        plan: null,
        code: null,
        videoUrl: null,
        error: null,
        iteration: 0,
      })

      const endpoint = previousCode ? "/edit/stream" : "/generate/stream"
      const body = previousCode
        ? { prompt, previous_code: previousCode, previous_plan: previousPlan }
        : { prompt }

      // Track final values as they arrive (for DB save on done)
      let finalPlan: string | null = null
      let finalCode: string | null = null
      let finalVideoUrl: string | null = null
      let finalError: string | null = null
      let finalIteration = 0

      try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`Backend error: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            let event: Record<string, unknown>
            try {
              event = JSON.parse(line.slice(6))
            } catch {
              continue
            }

            if (event.type === "node") {
              const patch: Partial<GenerateState> = {
                currentNode: event.node as string,
              }
              if (event.plan) {
                patch.plan = event.plan as string
                finalPlan = event.plan as string
              }
              if (event.code) {
                patch.code = event.code as string
                finalCode = event.code as string
              }
              if (event.video_url) {
                patch.videoUrl = event.video_url as string
                finalVideoUrl = event.video_url as string
              }
              if (typeof event.iteration === "number") {
                patch.iteration = event.iteration
                finalIteration = event.iteration
              }
              if (event.error) {
                patch.error = event.error as string
                finalError = event.error as string
              }
              setState((prev) => ({ ...prev, ...patch }))
            } else if (event.type === "done") {
              setState((prev) => ({
                ...prev,
                status: "done",
                currentNode: null,
              }))
              // Persist to DB (fire-and-forget)
              fetch(`/api/projects/${projectId}/generations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  prompt,
                  plan: finalPlan,
                  code: finalCode,
                  videoUrl: finalVideoUrl,
                  status: "done",
                  error: null,
                  iteration: finalIteration,
                }),
              }).catch(console.error)
            } else if (event.type === "error") {
              finalError = event.message as string
              setState((prev) => ({
                ...prev,
                status: "error",
                error: finalError,
                currentNode: null,
              }))
              fetch(`/api/projects/${projectId}/generations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  prompt,
                  plan: finalPlan,
                  code: finalCode,
                  videoUrl: finalVideoUrl,
                  status: "failed",
                  error: finalError,
                  iteration: finalIteration,
                }),
              }).catch(console.error)
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        const message = err instanceof Error ? err.message : String(err)
        setState((prev) => ({
          ...prev,
          status: "error",
          error: message,
          currentNode: null,
        }))
      }
    },
    [projectId]
  )

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setState((prev) => ({ ...prev, status: "idle", currentNode: null }))
  }, [])

  return { ...state, generate, abort }
}
