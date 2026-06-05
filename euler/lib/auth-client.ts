import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"
import { magicLinkClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [magicLinkClient(), stripeClient({ subscription: true })],
})

export const { signIn, useSession, signOut } = authClient
