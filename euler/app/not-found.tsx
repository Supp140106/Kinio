import type { Metadata } from "next"
import { NotFoundPage } from "@/components/ui/404-page-not-found"

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return <NotFoundPage />
}
