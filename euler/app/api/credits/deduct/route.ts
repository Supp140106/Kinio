import { headers } from "next/headers"
import { and, desc, eq, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { subscription, userCredits } from "@/db/schema"

const PLAN_CREDITS: Record<string, number> = {
  creator: 500,
  pro: 1000,
}

function getPlanMax(plan: string | null): number {
  if (plan && PLAN_CREDITS[plan]) return PLAN_CREDITS[plan]
  return 20
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { amount } = (await request.json()) as { amount?: number }
  if (typeof amount !== "number" || amount <= 0) {
    return Response.json({ error: "Invalid amount" }, { status: 400 })
  }

  let record = await db
    .select({
      credits: userCredits.credits,
      lastCreditReset: userCredits.lastCreditReset,
    })
    .from(userCredits)
    .where(eq(userCredits.userId, session.user.id))
    .limit(1)

  if (!record[0]) {
    await db.insert(userCredits).values({ userId: session.user.id, credits: 20 })
    record = [{ credits: 20, lastCreditReset: null }]
  }

  let currentCredits = record[0].credits
  const now = new Date()

  const activeSubscription = await db
    .select({
      plan: subscription.plan,
      periodStart: subscription.periodStart,
    })
    .from(subscription)
    .where(
      and(
        eq(subscription.referenceId, session.user.id),
        inArray(subscription.status, ["active", "trialing"])
      )
    )
    .orderBy(desc(subscription.periodEnd))
    .limit(1)

  let plan: string | null = null
  if (activeSubscription[0]) {
    plan = activeSubscription[0].plan
    const periodStart = activeSubscription[0].periodStart
    if (
      periodStart &&
      (!record[0].lastCreditReset || new Date(record[0].lastCreditReset) < periodStart)
    ) {
      currentCredits = getPlanMax(plan)
      await db
        .update(userCredits)
        .set({ credits: currentCredits, lastCreditReset: now })
        .where(eq(userCredits.userId, session.user.id))
    }
  } else {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    if (!record[0].lastCreditReset || record[0].lastCreditReset < thirtyDaysAgo) {
      currentCredits = getPlanMax(null)
      await db
        .update(userCredits)
        .set({ credits: currentCredits, lastCreditReset: now })
        .where(eq(userCredits.userId, session.user.id))
    }
  }

  if (currentCredits < amount) {
    return Response.json(
      { error: "Insufficient credits", credits: currentCredits },
      { status: 402 }
    )
  }

  const remaining = currentCredits - amount
  await db
    .update(userCredits)
    .set({ credits: remaining })
    .where(eq(userCredits.userId, session.user.id))

  return Response.json({ credits: remaining })
}
