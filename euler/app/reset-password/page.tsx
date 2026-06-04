"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  if (token) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setError("")
          const { error: err } = await authClient.resetPassword({
            newPassword: password,
            token,
          })
          if (err) {
            setError(err.message || "Something went wrong")
          } else {
            router.push("/sign-in")
          }
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Enter new password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full">
          Reset password
        </Button>
      </form>
    )
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setError("")
        const { error: err } = await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (err) {
          setError(err.message || "Something went wrong")
        } else {
          setSent(true)
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="name@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {sent ? (
        <p className="text-sm text-emerald-600">Check your email for a reset link.</p>
      ) : (
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      )}
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Enter your email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
