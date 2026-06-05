import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { and, desc, eq, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { subscription } from "@/db/schema"
import { Pricing } from "@/components/landing/pricing"
import { JsonLdScript } from "@/components/json-ld-script"
import { productJsonLd, breadcrumbListJsonLd } from "@/lib/json-ld"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Pricing - AI Manim Video Generation Plans",
  description:
    "Choose the perfect plan for your educational animation needs. From free starter credits to pro unlimited rendering, Kineo has a plan for every creator.",
  openGraph: {
    title: "Kineo Pricing - AI Manim Video Generation Plans",
    description:
      "Choose the perfect plan for your educational animation needs.",
  },
  twitter: {
    title: "Kineo Pricing - AI Manim Video Generation Plans",
    description:
      "Choose the perfect plan for your educational animation needs.",
  },
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kineo.ai"

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
    <>
      <JsonLdScript
        data={[
          breadcrumbListJsonLd([
            { name: "Home", url: siteUrl },
            { name: "Pricing", url: `${siteUrl}/pricing` },
          ]),
          productJsonLd({
            name: "Kineo Subscription Plans",
            description:
              "AI-powered Manim video generation plans for creators and educators.",
            offers: [
              { price: 29, priceCurrency: "USD", billingInterval: "month" },
              { price: 290, priceCurrency: "USD", billingInterval: "year" },
              { price: 79, priceCurrency: "USD", billingInterval: "month" },
              { price: 790, priceCurrency: "USD", billingInterval: "year" },
            ],
          }),
        ]}
      />
      <div className="flex min-h-svh flex-col">
        <header className="border-b border-border/40">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white">
                K
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Kineo
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {session ? (
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="flex-1 py-20 md:py-28">
          <Pricing currentSubscription={currentSubscription} />
        </main>
      </div>
    </>
  )
}
