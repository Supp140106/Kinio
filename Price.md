# Kineo - Pricing & Stripe Features Report

## Tech Stack
- **Frontend**: Next.js (App Router), React 19, TypeScript, Drizzle ORM (PostgreSQL)
- **Backend**: Python FastAPI (no payment logic — Stripe is entirely frontend-managed)
- **Auth**: Better Auth with `@better-auth/stripe` plugin

---

## Pricing Tiers

| Tier | Period | Price | Limits |
|---|---|---|---|
| **Free** | Monthly | $0 (20 credits) | Trial-level access |
| **Creator** | Monthly | **$29** | 5 min video, 720p, 10 scenes, 1 AI voice |
| **Creator** | Yearly | **$290** | Same limits |
| **Pro** | Monthly | **$79** | 15 min video, 4K, unlimited scenes, 10 AI voices |
| **Pro** | Yearly | **$790** | Same limits |
| **Studio** | Custom | **Custom** | Unlimited everything |

Credit limits per billing cycle:
- **Free**: 20 credits
- **Creator**: 500 credits
- **Pro**: 1000 credits

---

## Stripe Features Used

| Feature | Where | Details |
|---|---|---|
| **Stripe Client SDK** | `lib/auth.ts` | `stripe` ^22.0.0, API version `2026-04-22.dahlia` |
| **Better Auth Stripe Plugin** | `lib/auth.ts` | `createCustomerOnSignUp: true`, subscription CRUD orchestration |
| **Customers API** | `lib/auth.ts` | Auto-creates Stripe Customer on user signup |
| **Checkout Sessions** | `pricing.tsx` | `authClient.subscription.upgrade()` triggers Stripe Checkout |
| **Subscriptions API** | Webhook `route.ts` | Handles `customer.subscription.created/updated` events |
| **Invoices API** | Webhook `route.ts` | Handles `invoice.paid` to refresh credits |
| **Webhook Signature Verification** | `route.ts` | `stripe.webhooks.constructEvent()` |
| **Price Lookup Keys** | Webhook `route.ts` | Maps `subscription.items[0].price.lookup_key` to plan name |
| **Price IDs** | `lib/auth.ts` | 4 price IDs configured (creator monthly/yearly, pro monthly/yearly) |

### Stripe Price IDs Configured in Stripe Dashboard
- `price_1TbCG9FK4CM4s0S7uuNlNbCd` — Creator Monthly
- `price_1TbCIPFK4CM4s0S7h0Vc71tZ` — Creator Yearly
- `price_1TbCJxFK4CM4s0S7xoFvnQCr` — Pro Monthly
- `price_1TbCKTFK4CM4s0S7nLhjuS33` — Pro Yearly

---

## Database Tables Involved

### `subscription` table
| Column | Type | Description |
|---|---|---|
| `id` | text (PK) | Subscription ID |
| `plan` | text (NOT NULL) | `"creator"` / `"pro"` / etc. |
| `referenceId` | text (FK → user.id) | Owner |
| `stripeCustomerId` | text | Stripe customer ID |
| `stripeSubscriptionId` | text | Stripe subscription ID |
| `status` | text | `active`, `trialing`, `incomplete`, etc. |
| `periodStart` / `periodEnd` | timestamp | Billing period |
| `cancelAtPeriodEnd` | boolean | Cancellation flag |
| `billingInterval` | text | `"month"` / `"year"` |
| `stripeScheduleId` | text | For schedule changes |
| `trialStart` / `trialEnd` | timestamp | Trial period |

### `user` table (Stripe columns)
| Column | Type |
|---|---|
| `stripeCustomerId` | text |

### `userCredits` table
| Column | Type | Default |
|---|---|---|
| `userId` | text (PK, FK → user.id) | — |
| `credits` | integer | `20` |
| `lastCreditReset` | timestamp | — |

---

## Stripe Keys in `.env`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Architecture Flow

```
Pricing Page
  └─ User clicks "Upgrade"
      └─ authClient.subscription.upgrade({ plan, annual })
          └─ Better Auth Stripe Plugin
              └─ Stripe Checkout Session
                  └─ User completes payment

Stripe Webhook → POST /api/stripe/webhook
  ├─ checkout.session.completed    → updateUserCredits(customerId, plan)
  ├─ customer.subscription.*       → updateUserCredits(customerId, plan)
  └─ invoice.paid                  → updateUserCredits(customerId, plan)

updateUserCredits():
  └─ Find user by stripeCustomerId
  └─ Set credits = PLAN_CREDITS[plan] (500/1000/20)
  └─ Reset lastCreditReset

Generation:
  └─ Frontend checks userCredits before allowing generation
  └─ Python backend has NO payment logic
```

---

## Migration to Dodo Payments (Checklist)

- [ ] Replace Better Auth Stripe plugin with custom Dodo Payments integration
- [ ] Replace 4 Stripe Price IDs with Dodo Payments product/price IDs
- [ ] Rewrite webhook handler (`app/api/stripe/webhook/route.ts`) for Dodo webhook events
- [ ] Update `lib/auth.ts` and `lib/auth-client.ts` — remove Stripe client, add Dodo SDK
- [ ] Replace Stripe env vars with Dodo Payments keys
- [ ] Update pricing UI (`components/landing/pricing.tsx`) to call Dodo checkout
- [ ] Remove or repurpose Stripe-specific DB columns (`stripeCustomerId`, `stripeSubscriptionId`, `stripeScheduleId`)
- [ ] Update dashboard sidebar (`sidebar.tsx`) to fetch plan from Dodo subscription data
- [ ] Update `app/pricing/page.tsx` and `app/dashboard/pricing/page.tsx`
- [ ] Update `app/dashboard/layout.tsx` for plan-based credit logic
- [ ] Update `hooks/use-generate.ts` and generation API for any plan-dependent logic
- [ ] Uninstall `stripe` npm package and `@better-auth/stripe` plugin
