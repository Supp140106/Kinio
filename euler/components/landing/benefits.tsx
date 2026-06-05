import {
  Sparkles,
  FunctionSquare,
  Headphones,
  Zap,
  Clapperboard,
  WandSparkles,
} from "lucide-react"
import { ScrollReveal, StaggerReveal, StaggerItem } from "./scroll-reveal"

const BENEFITS = [
  {
    icon: Sparkles,
    title: "AI Scene Generation",
    description:
      "Describe any concept and watch Kineo generate complete Manim scenes with camera moves and annotations.",
  },
  {
    icon: FunctionSquare,
    title: "Beautiful Math Rendering",
    description:
      "Native LaTeX with perfect typography. Every formula renders crisply at any resolution.",
  },
  {
    icon: Headphones,
    title: "Auto Voice Narration",
    description:
      "Natural AI voices synced to your animation. Supports 20+ languages and custom pacing.",
  },
  {
    icon: Zap,
    title: "GPU-Accelerated Rendering",
    description:
      "4K videos in minutes, not hours. Cloud pipeline powered by NVIDIA GPUs.",
  },
  {
    icon: Clapperboard,
    title: "Export Anywhere",
    description:
      "MP4, GIF, or direct to YouTube, TikTok, Twitter. Optimized for every platform.",
  },
  {
    icon: WandSparkles,
    title: "Smart Script Enhancer",
    description:
      "Paste a rough outline and AI enhances it for maximum educational impact.",
  },
]

export function Benefits() {
  return (
    <section className="border-t border-border/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal className="mb-14 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Everything you need to{" "}
            <span className="text-gradient">create</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            From script to rendered video, Kineo handles the hard parts.
          </p>
        </ScrollReveal>

        <StaggerReveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon
            return (
              <StaggerItem key={benefit.title}>
                <div className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-md">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border/50 bg-muted/50 transition-colors group-hover:border-violet-500/20 group-hover:bg-violet-500/5">
                    <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-violet-500" />
                  </div>
                  <h3 className="text-base font-semibold">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerReveal>
      </div>
    </section>
  )
}
