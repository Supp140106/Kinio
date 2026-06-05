import { ScrollReveal } from "@/components/landing/scroll-reveal"

const LOGOS = [
  "Brilliant",
  "Desmos",
  "Khan Academy",
  "Wolfram",
  "GeoGebra",
  "Codecademy",
]

export function LogoCloud() {
  return (
    <section className="border-y border-border/40 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by educators and creators worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {LOGOS.map((name) => (
              <div
                key={name}
                className="text-sm font-semibold tracking-tight text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
                style={{ letterSpacing: "0.02em" }}
              >
                {name}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
