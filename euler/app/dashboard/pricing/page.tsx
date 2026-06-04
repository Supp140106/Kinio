import { headers } from "next/headers"
import { and, desc, eq, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { subscription } from "@/db/schema"
import { Pricing } from "@/components/landing/pricing"

export default async function PricingPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  const currentSubscription = session
    ? (
        await db
          .select({
            plan: subscription.plan,
            billingInterval: subscription.billingInterval,
            stripeSubscriptionId: subscription.stripeSubscriptionId,
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
      )[0] ?? null
    : null

  return (
    <div className="px-6 py-8">
      <Pricing currentSubscription={currentSubscription} compact />
    </div>
  )
}
