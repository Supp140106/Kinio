"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, GripVertical, Loader2, Moon, Sun, Zap } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import Markdown from "react-markdown"

import { AgentPlan } from "@/components/ui/agent-plan"
import { PromptInputBox } from "@/components/ui/ai-prompt-box"
import { PreviewPanel } from "@/components/workspace/preview-panel"
import { useGenerate } from "@/hooks/use-generate"
import { useTheme } from "next-themes"
import { useWorkspaceStore } from "@/stores/workspace-store"

// ── Props ──────────────────────────────────────────────────────────────────────

type ProjectWorkspaceProps = {
  projectId: string
  projectName: string
  createdAt: string
  credits: number
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ProjectWorkspace({
  projectId,
  projectName,
  credits: initialCredits,
}: ProjectWorkspaceProps) {
  const [leftWidth, setLeftWidth] = useState(28)
  const [credits, setCredits] = useState(initialCredits)
  const [insufficientCredits, setInsufficientCredits] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevStatusRef = useRef<string>("idle")
  const historyFetched = useRef(false)

  const messages = useWorkspaceStore((s) => s.messages)
  const lastCode = useWorkspaceStore((s) => s.lastCode)
  const lastPlan = useWorkspaceStore((s) => s.lastPlan)
  const lastVideoUrl = useWorkspaceStore((s) => s.lastVideoUrl)
  const isHistoryLoading = useWorkspaceStore((s) => s.isHistoryLoading)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { theme, setTheme } = useTheme()
  const fetchHistory = useWorkspaceStore((s) => s.fetchHistory)
  const addUserMessage = useWorkspaceStore((s) => s.addUserMessage)
  const addAssistantMessage = useWorkspaceStore((s) => s.addAssistantMessage)

  const {
    status,
    currentNode,
    plan,
    code,
    videoUrl,
    error,
    iteration,
    generate,
    abort,
  } = useGenerate(projectId)

  // Load chat history on mount (once)
  useEffect(() => {
    if (historyFetched.current) return
    historyFetched.current = true
    fetchHistory(projectId)
  }, [projectId, fetchHistory])

  // Auto-scroll on new messages or live updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, status, currentNode])

  // Freeze the result into the store when generation completes
  useEffect(() => {
    if (
      prevStatusRef.current === "running" &&
      (status === "done" || status === "error")
    ) {
      addAssistantMessage({
        plan,
        code,
        videoUrl,
        status,
        iteration,
        error,
      })
    }
    prevStatusRef.current = status
  }, [status, plan, code, videoUrl, error, iteration, addAssistantMessage])

  // ── Drag-to-resize ───────────────────────────────────────────────────────────

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    setLeftWidth(Math.min(Math.max(pct, 20), 70))
  }, [])

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }, [])

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  function startDrag() {
    isDragging.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  // ── Send handler ─────────────────────────────────────────────────────────────

  async function handleSend(text: string) {
    if (!text.trim() || status === "running") return
    const prompt = text.trim()
    setInsufficientCredits(false)

    const cost = lastCode ? 5 : 10

    const res = await fetch("/api/credits/deduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: cost }),
    })

    const data = await res.json()

    if (!res.ok) {
      if (res.status === 402) {
        setCredits(data.credits)
        setInsufficientCredits(true)
      }
      return
    }

    setCredits(data.credits)
    addUserMessage(prompt)
    generate(prompt, lastCode ?? undefined, lastPlan ?? undefined)
  }

  const effectiveCode = code ?? lastCode
  const effectiveVideoUrl = videoUrl ?? lastVideoUrl
  const isEmpty = messages.length === 0 && status === "idle" && !isHistoryLoading

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-svh flex-col bg-background text-foreground">
      {/* ── Header ── */}
      <header className="flex shrink-0 items-center gap-3 border-b px-6 py-3.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{projectName}</span>

        {status === "running" && (
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            Generating…
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            title="Toggle theme"
          >
            {!mounted ? <div className="size-3.5" /> : theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </button>
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Zap className="size-3" />
            {credits}
          </div>
          <span className="font-mono text-[11px] text-muted-foreground/50">
            {projectId}
          </span>
        </div>
      </header>

      {/* ── Panels ── */}
      <div ref={containerRef} className="flex min-h-0 flex-1">
        {/* Left — Chat */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex min-h-0 min-w-0 flex-col"
        >
          {/* Messages */}
          <div className="scrollbar-hide flex-1 overflow-y-auto px-5 py-6">
            <div className="mx-auto flex max-w-md flex-col gap-4">
              {isHistoryLoading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Loader2 className="size-8 animate-spin text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Loading project history...
                  </p>
                </div>
              ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {projectName}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Describe an animation to get started.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  if (msg.role === "user") {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                          {msg.text}
                        </div>
                      </div>
                    )
                  }

                  // Assistant result card
                  return (
                    <div key={msg.id} className="w-full">
                      <div className="w-full rounded-2xl border bg-muted/30 px-4 py-4 text-sm">
                        {msg.status === "done" ? (
                          <>
                            <p className="mb-2 font-semibold text-foreground">
                              ✅ Animation ready
                            </p>
                            {msg.plan && (
                              <div className="text-xs text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[10px] [&_strong]:font-semibold [&_strong]:text-foreground/80 [&>h1]:mb-1 [&>h1]:text-sm [&>h1]:font-semibold [&>h1]:text-foreground [&>h2]:mb-1 [&>h2]:text-xs [&>h2]:font-semibold [&>h2]:text-foreground [&>h3]:text-xs [&>h3]:font-medium [&>h3]:text-foreground [&>ol]:mb-1 [&>ol]:list-decimal [&>ol]:space-y-0.5 [&>ol]:pl-4 [&>p]:mb-1 [&>p]:leading-relaxed [&>ul]:mb-1 [&>ul]:list-disc [&>ul]:space-y-0.5 [&>ul]:pl-4">
                                <Markdown>{msg.plan}</Markdown>
                              </div>
                            )}
                            <p className="mt-2 text-xs text-muted-foreground/60">
                              Rendered in {msg.iteration} iteration
                              {msg.iteration !== 1 ? "s" : ""}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-destructive">
                              ❌ Generation failed
                            </p>
                            {msg.error && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {msg.error}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              {/* Animated pipeline plan — slides up on prompt send, disappears when video is done */}
              <AnimatePresence>
                {status === "running" && (
                  <motion.div
                    key="agent-plan"
                    initial={{ y: 48, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                      },
                    }}
                    exit={{
                      y: -16,
                      opacity: 0,
                      transition: { duration: 0.22, ease: "easeIn" },
                    }}
                  >
                    <AgentPlan
                      status={status}
                      currentNode={currentNode}
                      plan={plan}
                      code={code}
                      error={error}
                      iteration={iteration}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Prompt input */}
          <div className="shrink-0 border-t bg-background px-5 py-4">
            {insufficientCredits && (
              <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                You don&apos;t have enough credits. Your plan provides{" "}
                <strong>
                  {credits === 20 ? "20" : credits === 500 ? "500" : "1000"}
                </strong>{" "}
                credits per month.
                {credits === 0 && (
                  <span className="block mt-1">
                    Credits reset at the start of your billing cycle.
                  </span>
                )}
              </div>
            )}
            <PromptInputBox
              onSend={handleSend}
              onStop={abort}
              isLoading={status === "running"}
              placeholder={
                effectiveCode
                  ? "Describe a change to your animation…"
                  : "Describe an animation to generate…"
              }
            />
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          onMouseDown={startDrag}
          className="group relative flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-border/40 transition-colors hover:bg-border"
        >
          <GripVertical className="size-3.5 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
        </div>

        {/* Right — Preview */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PreviewPanel
            status={status}
            currentNode={currentNode}
            videoUrl={effectiveVideoUrl}
            code={effectiveCode}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}
