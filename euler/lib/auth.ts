import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { user } from "@/db/schema"
import { stripe } from "@better-auth/stripe"
import Stripe from "stripe"
import { sendEmail } from "./email"
import {
  verificationEmailHtml,
  resetPasswordEmailHtml,
} from "./email-templates"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user: cbUser, url }) => {
      const [existing] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, cbUser.id))
        .limit(1)
      if (!existing) return

      void sendEmail({
        to: cbUser.email,
        subject: "Reset your password",
        html: resetPasswordEmailHtml({ url, userName: cbUser.name }),
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user: cbUser, url }) => {
      const [existing] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, cbUser.id))
        .limit(1)
      if (!existing) return

      void sendEmail({
        to: cbUser.email,
        subject: "Verify your email",
        html: verificationEmailHtml({ url, userName: cbUser.name }),
      })
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    ...(stripeSecretKey
      ? [
          stripe({
            stripeClient: new Stripe(stripeSecretKey, {
              apiVersion: "2026-04-22.dahlia",
            }),
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
            createCustomerOnSignUp: true,
            subscription: {
              enabled: true,
              plans: [
                {
                  name: "creator",
                  priceId: "price_1TbCG9FK4CM4s0S7uuNlNbCd",
                  annualDiscountPriceId: "price_1TbCIPFK4CM4s0S7h0Vc71tZ",
                  limits: {
                    videoLength: 5,
                    exportQuality: "720p",
                    scenes: 10,
                    aiVoices: 1,
                  },
                  freeTrial: {
                    days: 7,
                  },
                },
                {
                  name: "pro",
                  priceId: "price_1TbCJxFK4CM4s0S7xoFvnQCr",
                  annualDiscountPriceId: "price_1TbCKTFK4CM4s0S7nLhjuS33",
                  limits: {
                    videoLength: 15,
                    exportQuality: "4k",
                    scenes: -1,
                    aiVoices: 10,
                  },
                  freeTrial: {
                    days: 7,
                  },
                },
              ],
            },
          }),
        ]
      : []),
  ],
})
