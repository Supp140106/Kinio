export function HeroMockup() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-2.5">
        <div className="size-2.5 rounded-full bg-red-400" />
        <div className="size-2.5 rounded-full bg-amber-400" />
        <div className="size-2.5 rounded-full bg-green-400" />
        <div className="ml-3 flex-1 rounded-md bg-muted px-3 py-1 text-[10px] text-muted-foreground">
          app.kineo.ai / project / fourier-series
        </div>
        <div className="text-[10px] text-muted-foreground">Render: 00:42</div>
      </div>

      <div className="flex">
        <div className="hidden w-40 space-y-2 border-r border-border/50 bg-muted/30 p-3 sm:block">
          {[
            { title: "Fourier Series", dur: "0:32", active: true },
            { title: "Binary Search", dur: "0:28", active: false },
            { title: "Gradient Descent", dur: "0:45", active: false },
          ].map((scene) => (
            <div
              key={scene.title}
              className={`rounded-md p-2 ${
                scene.active
                  ? "bg-violet-500/10 ring-1 ring-violet-500/20"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-muted-foreground/10 text-[8px] text-muted-foreground">
                  <svg viewBox="0 0 40 24" className="h-6 w-10">
                    <path
                      d="M2 22 Q10 2, 20 12 T38 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[10px] font-medium">
                    {scene.title}
                  </div>
                  <div className="text-[8px] text-muted-foreground">
                    {scene.dur}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-3 p-4">
          <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="text-center">
              <svg
                viewBox="0 0 200 100"
                className="mx-auto h-20 w-40 text-white/80"
              >
                <text
                  x="50%"
                  y="40%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  opacity="0.5"
                >
                  f(x) = Σ aₙ sin(nx) + bₙ cos(nx)
                </text>
                <line
                  x1="10"
                  y1="75"
                  x2="190"
                  y2="75"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
                <line
                  x1="20"
                  y1="60"
                  x2="20"
                  y2="90"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
                {Array.from({ length: 12 }).map((_, i) => {
                  const x = 20 + i * 14
                  const y = 75 - Math.sin(i * 0.8) * 15 - Math.cos(i * 0.3) * 8
                  return (
                    <line
                      key={i}
                      x1={i > 0 ? 20 + (i - 1) * 14 : x}
                      y1={i > 0 ? 75 - Math.sin((i - 1) * 0.8) * 15 - Math.cos((i - 1) * 0.3) * 8 : y}
                      x2={x}
                      y2={y}
                      stroke="#818cf8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  )
                })}
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>0:12 / 0:32</span>
            </div>
            <div className="flex-1">
              <div className="h-1 rounded-full bg-muted-foreground/10">
                <div className="h-full w-1/3 rounded-full bg-violet-500" />
              </div>
            </div>
            <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[8px]">
              4K · 60fps
            </span>
          </div>
        </div>

        <div className="hidden w-44 border-l border-border/50 bg-muted/30 p-3 lg:block">
          <div className="mb-2 text-[9px] font-medium text-muted-foreground">
            Code
          </div>
          <div className="space-y-1 font-mono text-[8px] leading-relaxed">
            <div className="text-blue-400">class</div>
            <div className="pl-2 text-blue-300">FourierSeries</div>
            <div className="pl-2 text-blue-400">def</div>
            <div className="pl-4 text-amber-300">construct</div>
            <div className="pl-4 text-muted-foreground">self</div>
            <div className="pl-4 text-muted-foreground">.</div>
            <div className="pl-4 text-muted-foreground">add</div>
            <div className="pl-4 text-muted-foreground">(</div>
            <div className="pl-4 text-muted-foreground">)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
