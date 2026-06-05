import type { Metadata } from "next"
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
import { JsonLdScript } from "@/components/json-ld-script"
import {
  webApplicationJsonLd,
  organizationJsonLd,
  faqPageJsonLd,
} from "@/lib/json-ld"

export const metadata: Metadata = {
  title: "Kineo - AI Manim Video Generator | Text to Animation",
  description:
    "Generate stunning Manim animations from natural language. Kineo uses AI to turn your ideas into cinematic math, science, and educational videos. No animation experience needed.",
  openGraph: {
    title: "Kineo - AI Manim Video Generator",
    description:
      "Generate stunning Manim animations from natural language. Kineo uses AI to turn your ideas into cinematic math, science, and educational videos.",
  },
  twitter: {
    title: "Kineo - AI Manim Video Generator",
    description:
      "Generate stunning Manim animations from natural language. Kineo uses AI to turn your ideas into cinematic math, science, and educational videos.",
  },
}

const FAQ_QUESTIONS = [
  {
    question: "How does Kineo generate animations from text?",
    answer:
      "Kineo uses AI to analyze your prompt or script, identify key concepts, and generate corresponding Manim scenes. Each scene includes camera movements, object animations, annotations, and transitions. You can review and tweak every scene before rendering.",
  },
  {
    question: "What kind of math and science visuals can I create?",
    answer:
      "Kineo supports everything from basic algebra and geometry to calculus, linear algebra, physics simulations, chemistry reactions, data structure visualizations, neural network diagrams, and more. If you can describe it, Kineo can animate it.",
  },
  {
    question: "How long does rendering typically take?",
    answer:
      "A typical 3-minute 1080p video renders in 5-10 minutes on our cloud GPUs. 4K videos take longer depending on scene complexity. Pro and Studio plans get priority access to render queues.",
  },
  {
    question: "Can I customize the AI-generated animations?",
    answer:
      "Absolutely. Every generated scene is fully editable. You can adjust camera angles, object positions, animation timing, colors, text, and more. The timeline editor gives you frame-level control.",
  },
  {
    question: "What export formats and platforms are supported?",
    answer:
      "Export as MP4, GIF, or MOV at up to 4K resolution and 60fps. You can also publish directly to YouTube, TikTok, Twitter, and Instagram. Pro plans include API access for programmatic exports.",
  },
]

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

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kineo.ai"

  return (
    <>
      <JsonLdScript
        data={[
          webApplicationJsonLd({
            url: siteUrl,
            name: "Kineo",
            description:
              "Generate stunning Manim animations from natural language using AI.",
          }),
          organizationJsonLd({
            url: siteUrl,
            name: "Kineo",
            description:
              "AI-powered Manim video generation platform for educational animations.",
          }),
          faqPageJsonLd(FAQ_QUESTIONS),
        ]}
      />
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
