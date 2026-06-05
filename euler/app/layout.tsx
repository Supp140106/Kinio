import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kineo.ai"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kineo - AI Manim Video Generator | Text to Animation",
    template: "%s | Kineo",
  },
  description:
    "Generate stunning Manim animations from natural language. Kineo uses AI to turn your ideas into cinematic math, science, and educational videos. No animation experience needed.",
  keywords: [
    "AI Manim Generator",
    "Manim Video Generator",
    "Generate Manim Animations with AI",
    "Text to Manim Video",
    "AI Animation Generator",
    "Python Animation Generator",
    "Educational Animation Creator",
    "Math Animation Generator",
    "3Blue1Brown Animation Maker",
  ],
  openGraph: {
    type: "website",
    siteName: "Kineo",
    title: "Kineo - AI Manim Video Generator",
    description:
      "Generate stunning Manim animations from natural language. Kineo uses AI to turn your ideas into cinematic math, science, and educational videos.",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kineo - AI Manim Video Generator",
    description:
      "Generate stunning Manim animations from natural language. Kineo uses AI to turn your ideas into cinematic math, science, and educational videos.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  colorScheme: "dark light",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "scrollbar-hide scroll-smooth antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="scrollbar-hide">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
