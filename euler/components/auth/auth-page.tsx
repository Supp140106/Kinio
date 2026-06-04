"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function FloatingShape({
  className,
  delay = 0,
  duration = 6,
}: {
  className?: string
  delay?: number
  duration?: number
}) {
  return (
    <motion.div
      className={cn("absolute", className)}
      initial={{ y: 0 }}
      animate={{ y: [-8, 8, -8] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <div className="size-full rounded-full bg-white/[0.03]" />
    </motion.div>
  )
}

function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/dashboard",
        })
        setLoading(false)
        if (err) {
          setError(err.message || "Invalid credentials")
        } else {
          router.push("/dashboard")
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="name@example.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Password</Label>
          <a
            href="/reset-password"
            className="text-xs text-muted-foreground underline-offset-2 hover:underline hover:text-foreground"
          >
            Forgot password?
          </a>
        </div>
        <Input
          id="signin-password"
          type="password"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700"
        size="lg"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  )
}

function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-8 text-center"
      >
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="size-7 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a verification link to your email address.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          Back
        </Button>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        const { error: err } = await authClient.signUp.email({
          name,
          email,
          password,
        })
        setLoading(false)
        if (err) {
          setError(err.message || "Something went wrong")
        } else {
          setSubmitted(true)
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Jane Smith"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="name@example.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Create a password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700"
        size="lg"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Create account"}
      </Button>
    </form>
  )
}

export function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState("sign-in")
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (session && !isPending) {
      router.push("/dashboard")
    }
  }, [session, isPending, router])

  const [googleLoading, setGoogleLoading] = useState(false)

  return (
    <div className="flex min-h-svh">
      <div className="relative flex w-full items-center justify-center bg-background px-6 lg:w-[45%]">
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
        <div className="relative w-full max-w-sm">
          <Card size="sm" className="border-border/60 shadow-lg">
            <CardHeader className="pb-2">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-[9px] font-bold text-white">
                  K
                </div>
                <span className="text-sm font-semibold tracking-tight">
                  Kineo
                </span>
              </div>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="sign-in" className="flex-1">
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger value="sign-up" className="flex-1">
                    Sign up
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {tab === "sign-in" ? (
                    <>
                      <div className="mb-6 mt-2">
                        <CardTitle className="text-base">
                          Welcome back
                        </CardTitle>
                        <CardDescription>
                          Sign in to your Kineo account.
                        </CardDescription>
                      </div>
                      <SignInForm />
                    </>
                  ) : (
                    <>
                      <div className="mb-6 mt-2">
                        <CardTitle className="text-base">
                          Create your account
                        </CardTitle>
                        <CardDescription>
                          Start creating animations in minutes.
                        </CardDescription>
                      </div>
                      <SignUpForm />
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[11px] text-muted-foreground">
                  or continue with
                </span>
              </div>

              <Button
                variant="outline"
                size="lg"
                disabled={googleLoading}
                className="w-full gap-2"
                onClick={async () => {
                  setGoogleLoading(true)
                  await authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard",
                  })
                  setGoogleLoading(false)
                }}
              >
                {googleLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <GoogleIcon className="size-4" />
                )}
                Continue with Google
              </Button>
            </CardContent>

            <CardFooter className="justify-center border-t border-border/40 pt-4">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <a href="#" className="underline underline-offset-2 hover:text-foreground">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-2 hover:text-foreground">
                  Privacy Policy
                </a>
                .
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="hidden lg:relative lg:flex lg:w-[55%] lg:items-center lg:justify-center lg:overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.08]" />

        <FloatingShape
          className="-top-12 -right-12 size-72 rounded-full bg-white/[0.02]"
          delay={0}
          duration={7}
        />
        <FloatingShape
          className="-bottom-16 -left-16 size-96 rounded-full bg-white/[0.015]"
          delay={1.5}
          duration={9}
        />
        <FloatingShape
          className="top-1/3 right-1/4 size-40 rounded-full bg-white/[0.02]"
          delay={0.8}
          duration={6}
        />

        <div className="relative z-10 max-w-md px-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.08]">
              <span className="text-3xl font-bold text-white/80">K</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-white/90">
            The AI-powered animation studio for creators and educators.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/40">
            Describe an idea. Get a cinematic animated video. No animation
            experience needed.
          </p>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-white/30">
            <div className="flex -space-x-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="size-6 rounded-full border-2 border-violet-950 bg-white/20"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/24?img=${i + 20})`,
                    backgroundSize: "cover",
                  }}
                />
              ))}
            </div>
            <span>Trusted by 50,000+ creators</span>
          </div>
        </div>
      </div>
    </div>
  )
}
