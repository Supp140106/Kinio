"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
} from "lucide-react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"

import type { GenerateStatus } from "@/hooks/use-generate"

// ── Types ──────────────────────────────────────────────────────────────────────

type TaskStatus = "completed" | "in-progress" | "pending" | "failed"

interface Subtask {
  id: string
  title: string
  description: string
  status: TaskStatus
}

interface PipelineTask {
  id: string
  title: string
  description: string
  status: TaskStatus
  subtasks: Subtask[]
}

// ── Pipeline stage definitions ─────────────────────────────────────────────────

const STAGES = [
  {
    node: "detect_mode",
    title: "Detecting Mode",
    description: "Analysing your request to choose the right approach",
  },
  {
    node: "plan",
    title: "Planning Animation",
    description: "Creating a structured plan for the Manim animation",
  },
  {
    node: "code",
    title: "Writing Code",
    description: "Generating Python / Manim code for the animation",
  },
  {
    node: "render",
    title: "Rendering Video",
    description: "Executing the code and rendering the animation",
  },
] as const

// ── Task builder ───────────────────────────────────────────────────────────────

function buildTasks(
  status: GenerateStatus,
  currentNode: string | null,
  plan: string | null,
  code: string | null,
  error: string | null,
  iteration: number
): PipelineTask[] {
  const isFixing = currentNode === "fix"
  const currentIdx = isFixing
    ? STAGES.length - 1
    : STAGES.findIndex((s) => s.node === currentNode)

  const tasks: PipelineTask[] = STAGES.map((stage, i) => {
    let taskStatus: TaskStatus = "pending"

    if (status === "done") {
      taskStatus = "completed"
    } else if (status === "error") {
      if (currentIdx < 0) taskStatus = i === 0 ? "failed" : "pending"
      else if (i < currentIdx) taskStatus = "completed"
      else if (i === currentIdx) taskStatus = "failed"
    } else if (status === "running") {
      if (isFixing) {
        taskStatus = i < STAGES.length - 1 ? "completed" : "in-progress"
      } else if (currentIdx < 0) {
        taskStatus = "pending"
      } else if (i < currentIdx) taskStatus = "completed"
      else if (i === currentIdx) taskStatus = "in-progress"
    }

    // Subtasks for stages that produce output
    const subtasks: Subtask[] = []

    if (stage.node === "plan" && plan) {
      subtasks.push({
        id: "plan-content",
        title: "Animation Plan",
        description: plan.length > 280 ? plan.slice(0, 280) + "…" : plan,
        status: taskStatus === "in-progress" ? "in-progress" : "completed",
      })
    }

    if (stage.node === "code" && code) {
      const lines = code.split("\n")
      const preview =
        lines.slice(0, 5).join("\n") + (lines.length > 5 ? "\n…" : "")
      subtasks.push({
        id: "code-preview",
        title: "Generated Code",
        description: preview,
        status: taskStatus === "in-progress" ? "in-progress" : "completed",
      })
    }

    if (stage.node === "render" && status === "done" && iteration > 0) {
      subtasks.push({
        id: "render-info",
        title: `Rendered in ${iteration} iteration${iteration !== 1 ? "s" : ""}`,
        description: "Animation video generated and uploaded successfully",
        status: "completed",
      })
    }

    return {
      id: stage.node,
      title: stage.title,
      description: stage.description,
      status: taskStatus,
      subtasks,
    }
  })

  // Append the fix task while actively fixing
  if (isFixing) {
    tasks.push({
      id: "fix",
      title: "Fixing Render Error",
      description:
        "Analysing and correcting issues from the failed render attempt",
      status: "in-progress",
      subtasks: error
        ? [
            {
              id: "fix-error",
              title: "Error Details",
              description:
                error.length > 280 ? error.slice(0, 280) + "…" : error,
              status: "in-progress",
            },
          ]
        : [],
    })
  }

  return tasks
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusIcon({
  status,
  size = "md",
}: {
  status: TaskStatus
  size?: "sm" | "md"
}) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
  if (status === "completed")
    return <CheckCircle2 className={`${cls} text-green-500`} />
  if (status === "in-progress")
    return <CircleDotDashed className={`${cls} text-blue-500`} />
  if (status === "failed") return <CircleX className={`${cls} text-red-500`} />
  return <Circle className={`${cls} text-muted-foreground/40`} />
}

function badgeClass(s: TaskStatus) {
  if (s === "completed") return "bg-green-100 text-green-700"
  if (s === "in-progress") return "bg-blue-100  text-blue-700"
  if (s === "failed") return "bg-red-100   text-red-700"
  return "bg-muted text-muted-foreground/60"
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface AgentPlanProps {
  status: GenerateStatus
  currentNode: string | null
  plan: string | null
  code: string | null
  error: string | null
  iteration: number
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AgentPlan({
  status,
  currentNode,
  plan,
  code,
  error,
  iteration,
}: AgentPlanProps) {
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false

  const tasks = useMemo(
    () => buildTasks(status, currentNode, plan, code, error, iteration),
    [status, currentNode, plan, code, error, iteration]
  )

  const [expandedTasks, setExpandedTasks] = useState<string[]>([])
  const [expandedSubtasks, setExpandedSubtasks] = useState<
    Record<string, boolean>
  >({})

  // Auto-expand the active node and any task that gains subtasks
  useEffect(() => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      tasks.forEach((t) => {
        if (t.status === "in-progress" || t.subtasks.length > 0) next.add(t.id)
      })
      return [...next]
    })
  }, [tasks])

  const toggleTask = (id: string) =>
    setExpandedTasks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`
    setExpandedSubtasks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // ── Animation variants ───────────────────────────────────────────────────────

  const spring = prefersReducedMotion ? ("tween" as const) : ("spring" as const)

  const taskVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -4 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: spring, stiffness: 500, damping: 30 },
    },
  }

  const listVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: {
      height: "auto",
      opacity: 1,
      overflow: "visible",
      transition: {
        duration: 0.25,
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        when: "beforeChildren" as const,
        ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number],
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      overflow: "hidden",
      transition: { duration: 0.2 },
    },
  }

  const subtaskVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: spring, stiffness: 500, damping: 25 },
    },
  }

  const detailVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: {
      opacity: 1,
      height: "auto",
      overflow: "visible",
      transition: { duration: 0.22 },
    },
  }

  if (status === "idle") return null

  return (
    <motion.div
      className="rounded-xl border bg-card shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.28 } }}
    >
      <LayoutGroup>
        <div className="p-3">
          <ul className="space-y-0.5">
            {tasks.map((task, index) => {
              const isExpanded = expandedTasks.includes(task.id)

              return (
                <motion.li
                  key={task.id}
                  className={
                    index !== 0 ? "mt-1 border-t border-border/40 pt-1.5" : ""
                  }
                  initial="hidden"
                  animate="visible"
                  variants={taskVariants}
                >
                  {/* ── Task row ── */}
                  <motion.div
                    className="group flex cursor-pointer items-center rounded-md px-2 py-1.5"
                    whileHover={{
                      backgroundColor: "rgba(0,0,0,0.03)",
                      transition: { duration: 0.15 },
                    }}
                    onClick={() => toggleTask(task.id)}
                  >
                    {/* Status icon */}
                    <motion.div
                      className="mr-2 shrink-0"
                      whileTap={{ scale: 0.88 }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={task.status}
                          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                          transition={{
                            duration: 0.18,
                            ease: [0.2, 0.65, 0.3, 0.9],
                          }}
                        >
                          <StatusIcon status={task.status} />
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>

                    {/* Title + badge */}
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm ${
                          task.status === "completed"
                            ? "text-muted-foreground line-through"
                            : task.status === "pending"
                              ? "text-muted-foreground/50"
                              : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={task.status}
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${badgeClass(task.status)}`}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.2 }}
                        >
                          {task.status}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* ── Subtasks ── */}
                  <AnimatePresence>
                    {isExpanded && task.subtasks.length > 0 && (
                      <motion.div
                        className="relative overflow-hidden"
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        {/* Connecting dashed line */}
                        <div className="absolute top-0 bottom-0 left-[18px] border-l-2 border-dashed border-muted-foreground/20" />
                        <ul className="mt-0.5 mr-1 mb-1 ml-3 space-y-0.5">
                          {task.subtasks.map((subtask) => {
                            const subKey = `${task.id}-${subtask.id}`
                            const isSubExpanded = expandedSubtasks[subKey]

                            return (
                              <motion.li
                                key={subtask.id}
                                className="flex flex-col py-0.5 pl-5"
                                variants={subtaskVariants}
                                layout
                              >
                                <motion.div
                                  className="flex flex-1 cursor-pointer items-center rounded-md p-1"
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.03)",
                                    transition: { duration: 0.15 },
                                  }}
                                  onClick={() =>
                                    toggleSubtask(task.id, subtask.id)
                                  }
                                  layout
                                >
                                  <div className="mr-2 shrink-0">
                                    <AnimatePresence mode="wait">
                                      <motion.div
                                        key={subtask.status}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.15 }}
                                      >
                                        <StatusIcon
                                          status={subtask.status}
                                          size="sm"
                                        />
                                      </motion.div>
                                    </AnimatePresence>
                                  </div>
                                  <span
                                    className={`text-xs ${
                                      subtask.status === "completed"
                                        ? "text-muted-foreground line-through"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {subtask.title}
                                  </span>
                                </motion.div>

                                {/* Subtask detail (expand on click) */}
                                <AnimatePresence>
                                  {isSubExpanded && (
                                    <motion.div
                                      className="mt-1 ml-1.5 overflow-hidden border-l border-dashed border-foreground/10 pl-5 text-xs text-muted-foreground"
                                      variants={detailVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="hidden"
                                      layout
                                    >
                                      <pre className="py-1 font-sans leading-relaxed break-words whitespace-pre-wrap">
                                        {subtask.description}
                                      </pre>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.li>
                            )
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </LayoutGroup>
    </motion.div>
  )
}
