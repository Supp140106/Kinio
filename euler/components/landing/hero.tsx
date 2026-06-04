"use client"

import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/landing/scroll-reveal"
import { ArrowRight, Play } from "lucide-react"
import { HeroMockup } from "./hero-mockup"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 lg:pt-40 lg:pb-32">
      <div className="absolute inset-0 bg-dot-grid-lg opacity-50" />
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-violet-500/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal direction="left" className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-violet-500" />
              Introducing Kineo — AI Manim Studio
            </div>

            <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Turn Ideas Into Cinematic
              <br />
              <span className="text-gradient">
                Manim Videos
              </span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Describe any concept in plain text and watch Kineo generate
              beautiful animated math, science, and educational videos with AI.
              No animation experience needed.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-1.5 text-base">
                Create your first video
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2 text-base">
                <Play className="size-4" />
                Watch demo
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="size-7 rounded-full border-2 border-background bg-muted-foreground/20"
                    style={{
                      backgroundImage: `url(https://i.pravatar.cc/28?img=${i + 10})`,
                      backgroundSize: "cover",
                    }}
                  />
                ))}
              </div>
              <span>
                Trusted by{" "}
                <span className="font-semibold text-foreground">50,000+</span>{" "}
                creators
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.15} className="relative">
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-violet-500/10 to-transparent blur-xl" />
              <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-violet-500/5">
                <HeroMockup />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
