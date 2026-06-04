"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "./scroll-reveal"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

const TIERS = [
  {
    name: "Creator",
    monthly: 29,
    yearly: 290,
    planId: "creator",
    description: "For individual creators and students.",
    features: [
      "5-minute video length",
      "720p export",
      "10 scenes per project",
      "1 AI voice",
      "Community access",
      "Standard rendering queue",
    ],
    cta: "Start free trial",
    popular: false,
  },
  {
    name: "Pro",
    monthly: 79,
    yearly: 790,
    planId: "pro",
    description: "For educators and professional creators.",
    features: [
      "15-minute video length",
      "4K export",
      "Unlimited scenes",
      "Premium AI voices (10)",
      "Team collaboration",
      "Priority rendering queue",
      "Custom watermark removal",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Studio",
    monthly: null,
    yearly: null,
    planId: null,
    description: "For schools, startups, and studios.",
    features: [
      "Unlimited video length",
      "All export formats + API",
      "Unlimited projects",
      "Custom voice cloning",
      "Dedicated support (15min)",
      "SSO & team management",
      "Custom branding",
      "On-premise rendering option",
    ],
    cta: "Contact sales",
    popular: false,
  },
]

type CurrentSubscription = {
  plan: string
  billingInterval: string | null
  stripeSubscriptionId: string | null
} | null

export function Pricing({
  currentSubscription,
  compact,
}: {
  currentSubscription: CurrentSubscription
  compact?: boolean
}) {
  const router = useRouter()
  const [annual, setAnnual] = useState(
    () => currentSubscription?.billingInterval === "year"
  )
  const [loading, setLoading] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedBillingInterval = annual ? "year" : "month"
  const currentPlanIndex = useMemo(
    () => TIERS.findIndex((tier) => tier.planId === currentSubscription?.plan),
    [currentSubscription?.plan]
  )

  async function handleUpgrade(planId: string) {
    setLoading(planId)
    setErrorMessage(null)

    const { data: session } = await authClient.getSession()

    if (!session) {
      router.push("/sign-in")
      setLoading(null)
      return
    }

    const isExistingSubscription = Boolean(
      currentSubscription?.stripeSubscriptionId
    )

    const { error } = await authClient.subscription.upgrade({
      plan: planId,
      annual,
      subscriptionId: currentSubscription?.stripeSubscriptionId ?? undefined,
      successUrl: "/dashboard",
      cancelUrl: "/",
      returnUrl: "/dashboard",
      disableRedirect: false,
    })

    if (error) {
      console.error(error)
      setErrorMessage(
        error.message || "Unable to update subscription right now."
      )
      setLoading(null)
      return
    }

    if (!isExistingSubscription) {
      setLoading(null)
    }
  }

  return (
    <section id="pricing" className={compact ? "py-0" : "py-20 md:py-28"}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {compact ? (
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              Pricing
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Choose your plan
            </h2>
            {currentSubscription ? (
              <p className="mt-3 text-sm font-medium text-foreground">
                Selected plan:{" "}
                <span className="capitalize">{currentSubscription.plan}</span>
                {currentSubscription.billingInterval
                  ? ` (${currentSubscription.billingInterval})`
                  : ""}
              </p>
            ) : null}
          </div>
        ) : (
          <ScrollReveal className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              Pricing
            </div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Simple, transparent <span className="text-gradient">pricing</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Start for free. Upgrade when your audience grows.
            </p>
            {currentSubscription ? (
              <p className="mt-3 text-sm font-medium text-foreground">
                Selected plan:{" "}
                <span className="capitalize">{currentSubscription.plan}</span>
                {currentSubscription.billingInterval
                  ? ` (${currentSubscription.billingInterval})`
                  : ""}
              </p>
            ) : null}
          </ScrollReveal>
        )}

        <div className="mb-10 flex items-center justify-center gap-3 text-sm">
          <span
            className={cn(
              "transition-colors",
              !annual ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              annual ? "bg-violet-500" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow-sm transition-transform",
                annual && "translate-x-5"
              )}
            />
          </button>
          <span
            className={cn(
              "transition-colors",
              annual ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Annual
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
            Save 20%
          </span>
        </div>

        {errorMessage ? (
          <div className="mx-auto mb-6 max-w-xl rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => {
            const tierIndex = TIERS.findIndex(
              (item) => item.planId === tier.planId
            )
            const isCurrentPlan =
              currentSubscription?.plan === tier.planId &&
              currentSubscription?.billingInterval === selectedBillingInterval
            const isCurrentFamilyPlan =
              currentSubscription?.plan === tier.planId
            const isUpgrade =
              currentPlanIndex >= 0 &&
              tierIndex >= 0 &&
              tierIndex > currentPlanIndex

            const card = (
              <div
                key={tier.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-8 transition-all hover:shadow-lg",
                    isCurrentPlan
                      ? "border-emerald-500/40 shadow-md ring-2 ring-emerald-500/15"
                      : isCurrentFamilyPlan
                        ? "border-emerald-500/30 shadow-md ring-1 ring-emerald-500/10"
                        : tier.popular
                          ? "border-violet-500/30 shadow-md ring-1 ring-violet-500/10"
                          : "border-border/60"
                  )}
                >
                  {isCurrentPlan ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-emerald-500 px-4 py-1 text-[10px] font-semibold text-white">
                        Selected
                      </span>
                    </div>
                  ) : isCurrentFamilyPlan ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-emerald-500/90 px-4 py-1 text-[10px] font-semibold text-white">
                        Current plan
                      </span>
                    </div>
                  ) : tier.popular ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-linear-to-r from-violet-500 to-indigo-600 px-4 py-1 text-[10px] font-semibold text-white">
                        Most popular
                      </span>
                    </div>
                  ) : null}

                  <div>
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                    <div className="mt-5 flex items-baseline gap-1">
                      {tier.monthly !== null ? (
                        <>
                          <span className="text-4xl font-bold tracking-tight">
                            ${annual ? tier.yearly : tier.monthly}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            /{annual ? "year" : "month"}
                          </span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold tracking-tight">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-violet-500" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Button
                      variant={
                        tier.popular || isCurrentPlan ? "default" : "outline"
                      }
                      disabled={loading === tier.planId || isCurrentPlan}
                      className={cn(
                        "w-full",
                        (tier.popular || isCurrentPlan) &&
                          "bg-linear-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700",
                        isCurrentPlan &&
                          "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                      )}
                      onClick={() => {
                        if (tier.planId) {
                          handleUpgrade(tier.planId)
                        } else {
                          window.location.href = "mailto:sales@kineo.com"
                        }
                      }}
                    >
                      {loading === tier.planId ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        "Selected"
                      ) : isCurrentFamilyPlan ? (
                        annual ? (
                          "Switch to annual"
                        ) : (
                          "Switch to monthly"
                        )
                      ) : currentSubscription ? (
                        isUpgrade ? (
                          `Upgrade to ${tier.name}`
                        ) : (
                          `Switch to ${tier.name}`
                        )
                      ) : (
                        tier.cta
                      )}
                    </Button>
                  </div>
                </div>
              )
            return compact ? card : <ScrollReveal key={tier.name} delay={i * 0.1}>{card}</ScrollReveal>
          })}
        </div>
      </div>
    </section>
  )
}
