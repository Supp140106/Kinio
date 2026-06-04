import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { userCredits } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [record] = await db
    .select({ credits: userCredits.credits })
    .from(userCredits)
    .where(eq(userCredits.userId, session.user.id))
    .limit(1)

  return Response.json({ credits: record?.credits ?? 0 })
}
