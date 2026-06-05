import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { and, desc, eq, inArray } from "drizzle-orm"
import { db } from "@/db"
import { subscription, userCredits } from "@/db/schema"
import { SidebarWrapper } from "./sidebar-wrapper"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Not authenticated</p>
      </div>
    )
  }

  const activeSubscription = await db
    .select({
      plan: subscription.plan,
      billingInterval: subscription.billingInterval,
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
    <SidebarWrapper
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
      plan={activeSubscription[0]?.plan ?? null}
      billingInterval={activeSubscription[0]?.billingInterval ?? null}
      credits={userRecord.credits}
    >
      {children}
    </SidebarWrapper>
  )
}
