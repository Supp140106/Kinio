"use client"

import { useState } from "react"
import { Check, Code2, Copy, Play } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/workspace/code-block"
import { RenderLoader } from "@/components/workspace/render-loader"
import type { GenerateStatus } from "@/hooks/use-generate"

interface PreviewPanelProps {
  status: GenerateStatus
  currentNode: string | null
  videoUrl: string | null
  code: string | null
  error: string | null
}

export function PreviewPanel({
  status,
  currentNode,
  videoUrl,
  code,
  error,
}: PreviewPanelProps) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-sm font-semibold text-destructive">
          Generation failed
        </p>
        {error && (
          <pre className="max-w-md overflow-auto rounded-xl border bg-destructive/5 px-4 py-3 text-left text-xs leading-relaxed text-destructive">
            {error}
          </pre>
        )}
      </div>
    )
  }

  // ── Running — 3-D loader ──────────────────────────────────────────────────────
  if (status === "running") {
    return <RenderLoader />
  }

  // ── Idle (no history) — empty placeholder ──────────────────────────────────────
  if (status === "idle" && !videoUrl && !code) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20">
          <Play className="size-7 text-muted-foreground/25" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground/60">
            Your animation will appear here
          </p>
          <p className="mt-1 text-xs text-muted-foreground/40">
            Send a prompt to generate a Manim video
          </p>
        </div>
      </div>
    )
  }

  // ── Content — tabs: Preview + Code (done or idle-with-history) ─────────────────
  return (
    <Tabs defaultValue="preview" className="flex h-full flex-col gap-0">
      <div className="flex shrink-0 items-center border-b px-4 py-2">
        <TabsList variant="line" className="h-8">
          <TabsTrigger value="preview" className="gap-1.5 px-3 text-xs">
            <Play className="size-3" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-1.5 px-3 text-xs">
            <Code2 className="size-3" />
            Code
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="preview" className="min-h-0 flex-1 p-4">
        {videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            autoPlay
            loop
            className="h-full w-full rounded-xl bg-black object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No video produced
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="code"
        className="relative min-h-0 flex-1 overflow-hidden rounded-b-none bg-muted"
      >
        {/* Copy button floats over the code surface */}
        <button
          onClick={copyCode}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:bg-background hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3 text-green-500" />
          ) : (
            <Copy className="size-3" />
          )}
          {copied ? "Copied!" : "Copy code"}
        </button>
        <CodeBlock code={code ?? ""} />
      </TabsContent>
    </Tabs>
  )
}
