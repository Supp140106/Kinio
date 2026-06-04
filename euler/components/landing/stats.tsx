"use client"

import { StaggerReveal, StaggerItem } from "./scroll-reveal"

const STATS = [
  { value: "1M+", label: "Videos rendered" },
  { value: "99.9%", label: "Render success rate" },
  { value: "50K+", label: "Active creators" },
  { value: "4.9/5", label: "Creator satisfaction" },
]

export function Stats() {
  return (
    <section className="border-y border-border/40 bg-muted/30 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <StaggerReveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StaggerItem key={stat.label} className="text-center">
              <div className="text-4xl font-bold tracking-tight md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-1.5 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
