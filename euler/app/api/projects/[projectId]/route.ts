import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"

import { db } from "@/db"
import { project } from "@/db/schema"
import { auth } from "@/lib/auth"

export async function DELETE(
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

  await db.delete(project).where(eq(project.id, projectId))

  return Response.json({ success: true })
}
