import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const corsOrigins: string[] = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_BACKEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter((v): v is string => Boolean(v))

function getCorsOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return null
  if (corsOrigins.length === 0) return origin
  if (corsOrigins.some((o) => origin.startsWith(o))) return origin
  return null
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  return response
}

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  addSecurityHeaders(response)

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const corsOrigin = getCorsOrigin(request)
    if (corsOrigin) {
      response.headers.set("Access-Control-Allow-Credentials", "true")
      response.headers.set("Access-Control-Allow-Origin", corsOrigin)
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      )
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-CSRF-Token"
      )
    }

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Origin": corsOrigin || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-CSRF-Token",
          "Access-Control-Max-Age": "86400",
        },
      })
    }

    return response
  }

  if (request.nextUrl.pathname.startsWith("/dashboard/")) {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
}
