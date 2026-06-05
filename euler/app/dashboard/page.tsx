import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { project } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { DashboardClient } from "./client"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
}

function isMissingProjectTableError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("project") &&
    (error.message.toLowerCase().includes("does not exist") ||
      error.message.toLowerCase().includes("failed query"))
  )
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Not authenticated</p>
      </div>
    )
  }

  let projectsReady = true
  let recentProjects: Array<{
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
  }> = []

  try {
    recentProjects = await db
      .select({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })
      .from(project)
      .where(eq(project.userId, session.user.id))
      .orderBy(desc(project.updatedAt))
      .limit(8)
  } catch (error) {
    if (isMissingProjectTableError(error)) {
      projectsReady = false
    } else {
      throw error
    }
  }

  return (
    <DashboardClient
      userName={session.user.name}
      projectsReady={projectsReady}
      recentProjects={recentProjects.map((item) => ({
        id: item.id,
        name: item.name,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }))}
    />
  )
}
