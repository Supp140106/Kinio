"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollReveal } from "@/components/landing/scroll-reveal"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "scenes", label: "Scenes" },
  { id: "script", label: "Script" },
  { id: "render", label: "Render" },
]

const TAB_CONTENT: Record<
  string,
  { title: string; description: string; mockup: React.ReactNode }
> = {
  scenes: {
    title: "Storyboard at a glance",
    description:
      "Every scene Kineo generates appears as a storyboard card. Reorder, duplicate, or tweak individual scenes before final render.",
    mockup: (
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-muted-foreground">
              Total duration
            </div>
            <div className="text-2xl font-semibold">1:47</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600">
              4 scenes
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              title: "Fourier Intro",
              time: "0:28",
              color: "from-violet-600 to-indigo-700",
            },
            {
              title: "Wave Analysis",
              time: "0:32",
              color: "from-blue-600 to-cyan-700",
            },
            {
              title: "Decomposition",
              time: "0:25",
              color: "from-emerald-600 to-teal-700",
            },
            {
              title: "Reconstruction",
              time: "0:22",
              color: "from-amber-600 to-rose-700",
            },
          ].map((scene) => (
            <div key={scene.title} className="group cursor-pointer">
              <div
                className={`mb-1.5 aspect-video rounded-lg bg-gradient-to-br ${scene.color} flex items-center justify-center`}
              >
                <div className="size-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <svg className="size-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21" />
                  </svg>
                </div>
              </div>
              <div className="text-[10px] font-medium truncate">
                {scene.title}
              </div>
              <div className="text-[8px] text-muted-foreground">
                {scene.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  script: {
    title: "AI-powered script editor",
    description:
      "Write or paste your script with LaTeX math notation. Kineo parses it and generates matching visuals for every section.",
    mockup: (
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2 rounded-t-md bg-muted/50 px-3 py-2">
          <div className="size-2 rounded-full bg-red-400" />
          <div className="size-2 rounded-full bg-amber-400" />
          <div className="size-2 rounded-full bg-green-400" />
          <span className="ml-2 text-[10px] text-muted-foreground">
            script.md
          </span>
          <div className="ml-auto flex gap-1">
            <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[8px] text-violet-500">
              AI Enhance
            </span>
          </div>
        </div>
        <div className="space-y-2 text-[10px] leading-relaxed">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">##</span> The
            Fourier Transform
          </p>
          <p className="text-muted-foreground">
            Any periodic signal can be expressed as a sum of sine and cosine
            waves.
          </p>
          <p className="font-mono text-blue-500">
            {`$$ F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt $$`}
          </p>
          <p className="text-muted-foreground">
            Where each frequency component contributes to the original signal.
          </p>
          <p className="font-mono text-amber-600">
            [generate: sine_wave_superposition]
          </p>
        </div>
        <div className="rounded-lg bg-muted/30 p-2 text-center text-[9px] text-muted-foreground">
          AI parsed 3 visual elements from script
        </div>
      </div>
    ),
  },
  render: {
    title: "Render anywhere, instantly",
    description:
      "Cloud GPU rendering pipeline processes your video in minutes. Export as MP4, GIF, or push directly to YouTube, TikTok, and Twitter.",
    mockup: (
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-medium text-muted-foreground">
            Render queue
          </div>
          <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[8px] text-violet-500">
            3 active
          </span>
        </div>
        {[
          {
            title: "Fourier Series Explained",
            progress: 82,
            time: "0:42 remaining",
            status: "text-violet-500",
          },
          {
            title: "Binary Search Visualization",
            progress: 45,
            time: "1:20 remaining",
            status: "text-blue-500",
          },
          {
            title: "Neural Network Overview",
            progress: 12,
            time: "2:05 remaining",
            status: "text-muted-foreground",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-border/50 bg-muted/20 p-2.5"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-medium">{item.title}</span>
              <span className={`text-[8px] ${item.status}`}>
                {item.progress}%
              </span>
            </div>
            <div className="mb-1 h-1.5 rounded-full bg-muted-foreground/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <div className="text-[8px] text-muted-foreground">{item.time}</div>
          </div>
        ))}
        <div className="flex gap-1.5 text-[9px] text-muted-foreground">
          <span className="rounded border border-border/50 px-1.5 py-0.5">
            MP4
          </span>
          <span className="rounded border border-border/50 px-1.5 py-0.5">
            GIF
          </span>
          <span className="rounded border border-border/50 px-1.5 py-0.5">
            YouTube
          </span>
          <span className="rounded border border-border/50 px-1.5 py-0.5">
            TikTok
          </span>
        </div>
      </div>
    ),
  },
}

export function Showcase() {
  const [activeTab, setActiveTab] = useState("scenes")

  return (
    <section id="showcase" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            Product
          </div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            See the{" "}
            <span className="text-gradient">workflow</span>
          </h2>
        </ScrollReveal>

        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex rounded-xl border border-border/50 bg-muted/30 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
                <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl">
                  {TAB_CONTENT[activeTab].mockup}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {TAB_CONTENT[activeTab].title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {TAB_CONTENT[activeTab].description}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
