import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { stripe } from "@better-auth/stripe"
import { magicLink } from "better-auth/plugins/magic-link"
import Stripe from "stripe"
import { sendEmail } from "./email"
import { signInEmailHtml } from "./email-templates"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Sign in to Kineo",
          html: signInEmailHtml({ url }),
        })
      },
    }),
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
