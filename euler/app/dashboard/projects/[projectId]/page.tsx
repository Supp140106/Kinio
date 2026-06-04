import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { and, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { project, userCredits } from "@/db/schema"
import { ProjectWorkspace } from "./project-workspace"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    notFound()
  }

  const { projectId } = await params

  const projectRecord = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, session.user.id)),
  })

  if (!projectRecord) {
    notFound()
  }

  let [userRecord] = await db
    .select({ credits: userCredits.credits })
    .from(userCredits)
    .where(eq(userCredits.userId, session.user.id))
    .limit(1)

  if (!userRecord) {
    await db.insert(userCredits).values({ userId: session.user.id, credits: 20 })
    userRecord = { credits: 20 }
  }

  return (
    <ProjectWorkspace
      projectId={projectRecord.id}
      projectName={projectRecord.name}
      createdAt={projectRecord.createdAt.toISOString()}
      credits={userRecord.credits}
    />
  )
}
