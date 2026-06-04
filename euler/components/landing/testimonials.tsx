"use client"

import { ScrollReveal } from "./scroll-reveal"
import { Star } from "lucide-react"

const TESTIMONIALS = [
  {
    quote:
      "Kineo has transformed how I prepare lectures. What used to take me two days to animate now happens in under an hour. My students understand concepts faster because they can actually see them.",
    name: "Dr. Emily Park",
    title: "Professor of Mathematics",
    company: "Stanford University",
    rating: 5,
  },
  {
    quote:
      "I was spending 10+ hours per video on animations alone. Kineo replaced my entire pipeline. The AI scene generation is uncanny — it captures exactly the visual I had in my head.",
    name: "James Liu",
    title: "STEM Creator, 2M+ subscribers",
    company: "YouTube",
    rating: 5,
  },
  {
    quote:
      "We evaluated every animation tool for our curriculum. Kineo was the only one that understood both the pedagogy and the production quality we needed. Our content team adopted it in days.",
    name: "Dr. Amara Osei",
    title: "Director of Content",
    company: "Brilliant",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal className="mb-14 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Loved by{" "}
            <span className="text-gradient">educators & creators</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            From lecture halls to millions of YouTube viewers.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-xl border border-border/50 bg-card p-7 transition-all hover:border-border hover:shadow-md">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-border/40 pt-4">
                  <div className="flex size-9 items-center justify-center rounded-full bg-violet-500/10 text-xs font-semibold text-violet-600">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.title},{" "}
                      <span className="font-medium text-foreground/70">
                        {t.company}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
