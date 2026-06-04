"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollReveal } from "./scroll-reveal"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "How does Kineo generate animations from text?",
    a: "Kineo uses AI to analyze your prompt or script, identify key concepts, and generate corresponding Manim scenes. Each scene includes camera movements, object animations, annotations, and transitions. You can review and tweak every scene before rendering.",
  },
  {
    q: "What kind of math and science visuals can I create?",
    a: "Kineo supports everything from basic algebra and geometry to calculus, linear algebra, physics simulations, chemistry reactions, data structure visualizations, neural network diagrams, and more. If you can describe it, Kineo can animate it.",
  },
  {
    q: "How long does rendering typically take?",
    a: "A typical 3-minute 1080p video renders in 5-10 minutes on our cloud GPUs. 4K videos take longer depending on scene complexity. Pro and Studio plans get priority access to render queues.",
  },
  {
    q: "Can I customize the AI-generated animations?",
    a: "Absolutely. Every generated scene is fully editable. You can adjust camera angles, object positions, animation timing, colors, text, and more. The timeline editor gives you frame-level control.",
  },
  {
    q: "What export formats and platforms are supported?",
    a: "Export as MP4, GIF, or MOV at up to 4K resolution and 60fps. You can also publish directly to YouTube, TikTok, Twitter, and Instagram. Pro plans include API access for programmatic exports.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="border-y border-border/40 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <ScrollReveal className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Frequently asked{" "}
            <span className="text-gradient">questions</span>
          </h2>
        </ScrollReveal>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="rounded-xl border border-border/50 bg-card transition-colors hover:border-border">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="text-sm font-medium leading-snug pr-4">
                      {faq.q}
                    </span>
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isOpen
                          ? "border-violet-500/30 bg-violet-500/5 text-violet-500"
                          : "border-border/60 text-muted-foreground",
                      )}
                    >
                      {isOpen ? (
                        <Minus className="size-3" />
                      ) : (
                        <Plus className="size-3" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-sm leading-relaxed text-muted-foreground">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
