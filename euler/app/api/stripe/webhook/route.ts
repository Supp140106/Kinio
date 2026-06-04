import Stripe from "stripe"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { user, userCredits } from "@/db/schema"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PLAN_CREDITS: Record<string, number> = {
  creator: 500,
  pro: 1000,
}

function getPlanMax(plan: string | null): number {
  if (plan && PLAN_CREDITS[plan]) return PLAN_CREDITS[plan]
  return 20
}

async function updateUserCredits(stripeCustomerId: string, plan: string | null) {
  const credits = getPlanMax(plan)
  const [userRecord] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.stripeCustomerId, stripeCustomerId))
    .limit(1)
  if (!userRecord) return

  const existing = await db
    .select({ userId: userCredits.userId })
    .from(userCredits)
    .where(eq(userCredits.userId, userRecord.id))
    .limit(1)

  if (existing[0]) {
    await db
      .update(userCredits)
      .set({ credits, lastCreditReset: new Date() })
      .where(eq(userCredits.userId, userRecord.id))
  } else {
    await db
      .insert(userCredits)
      .values({ userId: userRecord.id, credits, lastCreditReset: new Date() })
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") ?? ""

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subId = session.subscription as string
        if (!customerId || !subId) break

        const subscription = await stripe.subscriptions.retrieve(subId)
        const plan = subscription.items.data[0]?.price?.lookup_key ?? null
        await updateUserCredits(customerId, plan)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const plan = subscription.items.data[0]?.price?.lookup_key ?? null
        await updateUserCredits(customerId, plan)
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subId = invoice.parent?.subscription_details?.subscription
        if (subId && typeof subId === "string") {
          const subscription = await stripe.subscriptions.retrieve(subId)
          const plan = subscription.items.data[0]?.price?.lookup_key ?? null
          await updateUserCredits(customerId, plan)
        }
        break
      }
    }
  } catch (error) {
    console.error("Stripe webhook error:", error)
  }

  return Response.json({ ok: true })
}
