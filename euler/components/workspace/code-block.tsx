"use client"

import { useEffect, useState } from "react"
import type { Highlighter } from "shiki"

// Singleton — created once, reused for every highlight call
let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        themes: ["github-dark"],
        langs: ["python"],
      })
    )
  }
  return highlighterPromise
}

interface CodeBlockProps {
  code: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("")

  useEffect(() => {
    if (!code) return
    getHighlighter()
      .then((hl) =>
        hl.codeToHtml(code, {
          lang: "python",
          theme: "github-dark",
        })
      )
      .then(setHtml)
      .catch(() => setHtml("")) // fallback to plain on error
  }, [code])

  if (!html) {
    // Plain fallback while shiki loads
    return (
      <pre className="h-full overflow-auto bg-muted p-6 pt-14 text-xs leading-relaxed text-foreground">
        <code className="font-mono">{code}</code>
      </pre>
    )
  }

  return (
    <div
      // shiki emits a <pre> with inline background — let it fill the container
      className="h-full overflow-auto [&>pre]:h-full [&>pre]:p-6 [&>pre]:pt-14 [&>pre]:text-xs [&>pre]:leading-relaxed [&>pre]:!font-mono"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
