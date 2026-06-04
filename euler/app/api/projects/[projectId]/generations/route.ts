import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"

import { db } from "@/db"
import { generation, project } from "@/db/schema"
import { auth } from "@/lib/auth"

// ── GET /api/projects/[projectId]/generations ──────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params

  const proj = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, session.user.id)),
  })
  if (!proj) return Response.json({ error: "Not found" }, { status: 404 })

  const generations = await db
    .select()
    .from(generation)
    .where(eq(generation.projectId, projectId))
    .orderBy(desc(generation.createdAt))
    .limit(50)

  return Response.json({ generations })
}

// ── POST /api/projects/[projectId]/generations ─────────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params

  const proj = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, session.user.id)),
  })
  if (!proj) return Response.json({ error: "Not found" }, { status: 404 })

  const body = (await request.json()) as {
    prompt: string
    plan?: string | null
    code?: string | null
    videoUrl?: string | null
    status: string
    error?: string | null
    iteration?: number
  }

  const now = new Date()
  const id = crypto.randomUUID()

  await db.insert(generation).values({
    id,
    projectId,
    prompt: body.prompt,
    plan: body.plan ?? null,
    code: body.code ?? null,
    videoUrl: body.videoUrl ?? null,
    status: body.status,
    error: body.error ?? null,
    iteration: body.iteration ?? 0,
    createdAt: now,
    updatedAt: now,
  })

  // Keep project.updatedAt fresh for dashboard ordering
  await db
    .update(project)
    .set({ updatedAt: now })
    .where(eq(project.id, projectId))

  return Response.json({ id }, { status: 201 })
}
