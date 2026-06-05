import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "./scroll-reveal"
import { ArrowRight } from "lucide-react"

const FOOTER_LINKS = {
  Product: ["Features", "Integrations", "API"],
  Resources: ["Docs", "Tutorials", "Community", "Blog"],
  Company: ["About", "Careers", "Press", "Contact"],
}

export function CTAFooter() {
  return (
    <footer>
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal className="text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                Ready to create your{" "}
                <span className="text-gradient">first animation</span>?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                Join 50,000+ creators already bringing ideas to life with Kineo.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" className="gap-1.5 text-base bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700">
                  Start creating free <ArrowRight className="size-4" />
                </Button>
                <Button variant="outline" size="lg" className="text-base">
                  Watch demo
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="border-t border-border/40 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-[9px] font-bold text-white">
                  K
                </div>
                <span className="text-sm font-semibold tracking-tight">
                  Kineo
                </span>
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                The AI-powered animation studio for creators and educators.
              </p>
            </div>
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {heading}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Kineo. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
