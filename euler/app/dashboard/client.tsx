"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  FolderOpen,
  Clock3,
  Loader2,
  Trash2,
} from "lucide-react"
import { WakeBackend } from "@/components/wake-backend"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type DashboardClientProps = {
  userName: string
  projectsReady: boolean
  recentProjects: Array<{
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }>
}

export function DashboardClient({
  userName,
  projectsReady,
  recentProjects: initialProjects,
}: DashboardClientProps) {
  const router = useRouter()
  const [projectName, setProjectName] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [projects, setProjects] = useState(initialProjects)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleDeleteProject() {
    if (!deletingId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/projects/${deletingId}`, {
        method: "DELETE",
      })
      if (!res.ok) return
      setProjects((prev) => prev.filter((p) => p.id !== deletingId))
    } finally {
      setDeleteLoading(false)
      setDeletingId(null)
    }
  }

  async function handleCreateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedName = projectName.trim()
    if (!trimmedName) {
      setErrorMessage("Please enter a project name.")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: trimmedName }),
    })

    const result = (await response.json()) as { id?: string; error?: string }

    if (!response.ok || !result.id) {
      setErrorMessage(result.error || "Unable to create project right now.")
      setLoading(false)
      return
    }

    router.push(`/dashboard/projects/${result.id}`)
  }

  return (
    <div className="flex flex-col gap-8 px-6 py-8">
      <WakeBackend />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {userName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create a new project or pick up where you left off.
        </p>
      </div>

      {/* Create project */}
      <Card>
        <CardHeader>
          <CardTitle>Create a new project</CardTitle>
          <CardDescription>
            Give your project a name and we&apos;ll open its workspace right
            away.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!projectsReady ? (
            <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
              Project storage is not ready yet. Run the latest database
              migration first, then refresh this page.
            </div>
          ) : null}
          <form onSubmit={handleCreateProject}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                maxLength={80}
                disabled={!projectsReady}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={loading || !projectsReady}
                className="shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Create
                  </>
                )}
              </Button>
            </div>
            {errorMessage ? (
              <p className="mt-3 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {/* Recent projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent projects</CardTitle>
          <CardDescription>
            Your latest projects are shown here for quick access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-6 py-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
                <FolderOpen className="size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold">
                No projects yet
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first project above and it&apos;ll appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="group block"
                >
                  <div className="relative rounded-lg border border-border/60 bg-card p-5 transition-colors hover:border-border hover:bg-muted/50">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDeletingId(project.id)
                      }}
                      className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-md bg-background/60 text-muted-foreground/40 opacity-0 shadow-xs transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      aria-label="Delete project"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">
                          {project.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Open project workspace
                        </p>
                      </div>
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <FolderOpen className="size-4" />
                      </div>
                    </div>
                    <div
                      className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"
                      suppressHydrationWarning
                    >
                      <Clock3 className="size-3.5" />
                      Updated{" "}
                      <span suppressHydrationWarning>
                        {new Date(project.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
        title="Delete project"
        description="This will permanently delete the project and all generations inside it. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={handleDeleteProject}
      />
    </div>
  )
}
