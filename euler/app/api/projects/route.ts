import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { project } from "@/db/schema"

function isMissingProjectTableError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("project") &&
    (error.message.toLowerCase().includes("does not exist") ||
      error.message.toLowerCase().includes("failed query"))
  )
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as { name?: string }
  const name = body.name?.trim()

  if (!name) {
    return Response.json({ error: "Project name is required" }, { status: 400 })
  }

  if (name.length > 80) {
    return Response.json(
      { error: "Project name must be 80 characters or less" },
      { status: 400 }
    )
  }

  const now = new Date()
  const id = crypto.randomUUID()

  try {
    await db.insert(project).values({
      id,
      name,
      userId: session.user.id,
      createdAt: now,
      updatedAt: now,
    })
  } catch (error) {
    if (isMissingProjectTableError(error)) {
      return Response.json(
        {
          error:
            "Project table is missing. Run the latest database migration and try again.",
        },
        { status: 500 }
      )
    }

    throw error
  }

  return Response.json({ id })
}
