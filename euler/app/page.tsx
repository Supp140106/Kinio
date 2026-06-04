import { headers } from "next/headers"
import { and, inArray, eq, desc } from "drizzle-orm"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { LogoCloud } from "@/components/landing/logo-cloud"
import { Features } from "@/components/landing/features"
import { Showcase } from "@/components/landing/showcase"
import { Benefits } from "@/components/landing/benefits"
import { Stats } from "@/components/landing/stats"
import { Testimonials } from "@/components/landing/testimonials"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
import { CTAFooter } from "@/components/landing/cta-footer"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { subscription, userCredits } from "@/db/schema"

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  const currentSubscription = session
    ? ((
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
      )[0] ?? null)
    : null

  const credits = session
    ? (
        await db
          .select({ credits: userCredits.credits })
          .from(userCredits)
          .where(eq(userCredits.userId, session.user.id))
          .limit(1)
      )[0]?.credits ?? 20
    : null

  return (
    <>
      <Navbar signedIn={Boolean(session)} credits={credits} />
      <main>
        <Hero />
        <LogoCloud />
        <Features />
        <Showcase />
        <Benefits />
        <Stats />
        <Testimonials />
        <Pricing currentSubscription={currentSubscription} />
        <FAQ />
      </main>
      <CTAFooter />
    </>
  )
}
