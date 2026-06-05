import { ScrollReveal } from "@/components/landing/scroll-reveal"
import {
  Sparkles,
  FunctionSquare,
  Timer,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FEATURES = [
  {
    title: "Prompt to Animation",
    description:
      "Describe any topic in natural language and Kineo generates complete Manim scenes with camera moves, annotations, and transitions. No coding required.",
    icon: Sparkles,
    image: "left",
    gradient: "from-violet-500/10 to-indigo-500/10",
    mockup: (
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 p-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded bg-violet-500/10 text-[10px] text-violet-500">
            AI
          </span>
          <span className="text-xs text-muted-foreground">
            &ldquo;Explain how the Fourier Transform decomposes a signal into its
            frequency components&rdquo;
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Scene 1", desc: "Sine waves intro", time: "0:08" },
            { label: "Scene 2", desc: "Decomposition", time: "0:12" },
            { label: "Scene 3", desc: "Reconstruction", time: "0:10" },
          ].map((scene) => (
            <div
              key={scene.label}
              className="rounded-lg border border-border/50 bg-muted/20 p-2.5"
            >
              <div className="mb-1 flex aspect-video items-center justify-center rounded bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="text-[6px] text-white/30">preview</div>
              </div>
              <div className="text-[10px] font-medium">{scene.label}</div>
              <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                <span>{scene.desc}</span>
                <span>{scene.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="h-1.5 flex-1 rounded-full bg-muted-foreground/10">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
          </div>
          <span>Generating scenes...</span>
        </div>
      </div>
    ),
  },
  {
    title: "Intelligent Math Rendering",
    description:
      "Beautiful LaTeX equations, animated 3D graphs, and interactive mathematical visualizations. Every formula renders with publication-ready typography.",
    icon: FunctionSquare,
    image: "right",
    gradient: "from-sky-500/10 to-blue-500/10",
    mockup: (
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {["LaTeX", "3D Plot", "Step-by-step"].map((tab) => (
            <div
              key={tab}
              className={`rounded-md px-2 py-1 text-[9px] font-medium ${
                tab === "3D Plot"
                  ? "bg-blue-500/10 text-blue-600"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <svg viewBox="0 0 120 80" className="h-24 w-36 text-white/60">
            <text
              x="50%"
              y="30%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="5"
              fill="currentColor"
              opacity="0.7"
            >
              z = x² + y²
            </text>
            <ellipse
              cx="60"
              cy="50"
              rx="35"
              ry="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.4"
              opacity="0.2"
            />
            <path
              d="M25 50 Q40 20, 60 25 T95 50"
              fill="none"
              stroke="#818cf8"
              strokeWidth="0.6"
              opacity="0.6"
            />
            <path
              d="M25 50 Q40 10, 60 15 T95 50"
              fill="none"
              stroke="#6366f1"
              strokeWidth="0.6"
              opacity="0.4"
            />
            <path
              d="M25 50 Q40 0, 60 5 T95 50"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="0.6"
              opacity="0.3"
            />
            <text x="30" y="72" fontSize="3" fill="currentColor" opacity="0.4">
              x
            </text>
            <text x="85" y="72" fontSize="3" fill="currentColor" opacity="0.4">
              y
            </text>
          </svg>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
          <div className="font-mono text-[8px]">f(x, y) = x² + y² + sin(xy)</div>
        </div>
      </div>
    ),
  },
  {
    title: "Cinematic Timeline Editor",
    description:
      "Assemble multiple AI-generated scenes into a cohesive video. Add transitions, overlay narration, and fine-tune pacing with a professional timeline.",
    icon: Timer,
    image: "left",
    gradient: "from-amber-500/10 to-rose-500/10",
    mockup: (
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { color: "bg-violet-500", w: "w-full" },
            { color: "bg-blue-500", w: "w-full" },
            { color: "bg-emerald-500", w: "w-3/4" },
            { color: "bg-amber-500", w: "w-full" },
          ].map((block, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`mb-1 h-1 rounded-full ${block.color} ${block.w}`}
              />
              <div className="flex aspect-video w-full items-center justify-center rounded bg-muted-foreground/5 text-[6px] text-muted-foreground">
                Scene {i + 1}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-muted-foreground/10 flex items-center justify-center">
            <svg className="size-3 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="relative h-6">
              <div className="absolute inset-0 flex">
                {[40, 30, 20, 25].map((w, i) => (
                  <div
                    key={i}
                    className={`h-full border-r border-background ${
                      [
                        "bg-violet-500/20",
                        "bg-blue-500/20",
                        "bg-emerald-500/20",
                        "bg-amber-500/20",
                      ][i]
                    }`}
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
              <div
                className="absolute top-0 h-full w-0.5 bg-white shadow-sm"
                style={{ left: "38%" }}
              />
            </div>
          </div>
          <span className="text-[9px] text-muted-foreground">0:12</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <div className="h-2 w-8 rounded bg-emerald-500/20" />
          <span>Narration track</span>
          <div className="ml-auto h-2 w-12 rounded bg-muted-foreground/10" />
          <span>Music</span>
        </div>
      </div>
    ),
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            How it works
          </div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            From idea to animated{" "}
            <span className="text-gradient">explanation</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Three powerful capabilities that turn any concept into a stunning
            educational video.
          </p>
        </ScrollReveal>

        <div className="space-y-24">
          {FEATURES.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.1}>
              <div
                className={cn(
                  "grid items-center gap-8 md:gap-12 lg:gap-16",
                  feature.image === "right"
                    ? "lg:grid-cols-[1fr_1.2fr]"
                    : "lg:grid-cols-[1.2fr_1fr]",
                )}
              >
                {feature.image === "right" ? (
                  <>
                    <FeatureContent feature={feature} />
                    <FeatureMockup feature={feature} />
                  </>
                ) : (
                  <>
                    <FeatureMockup feature={feature} />
                    <FeatureContent feature={feature} />
                  </>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureContent({
  feature,
}: {
  feature: (typeof FEATURES)[number]
}) {
  const Icon = feature.icon
  return (
    <div>
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-border/50 bg-muted/50">
        <Icon className="size-5 text-violet-500" />
      </div>
      <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {feature.title}
      </h3>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
      <Button variant="link" className="mt-4 h-auto gap-1 p-0 text-sm">
        Learn more <ArrowRight className="size-3.5" />
      </Button>
    </div>
  )
}

function FeatureMockup({
  feature,
}: {
  feature: (typeof FEATURES)[number]
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg",
      )}
    >
      <div className={cn("absolute inset-0 opacity-50", feature.gradient)} />
      <div className="relative">{feature.mockup}</div>
    </div>
  )
}
