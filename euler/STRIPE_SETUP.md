# Stripe Integration Setup

This project uses [`@better-auth/stripe`](https://better-auth.vercel.app/docs/integrations/stripe) to handle subscriptions. The integration is already fully wired — you just need to create products in Stripe and plug in the keys.

---

## 1. Create Products & Prices in Stripe Dashboard

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Click **Add Product**
3. Create the following products and prices:

| Product | Price Type | Amount | Interval | Billing | Code Label |
|---|---|---|---|---|---|
| **Creator** | Recurring | $29.00 | Monthly | Standard | `price_creator_monthly` |
| **Creator** | Recurring | $290.00 | Yearly | Standard | `price_creator_yearly` |
| **Pro** | Recurring | $79.00 | Monthly | Standard | `price_pro_monthly` |
| **Pro** | Recurring | $790.00 | Yearly | Standard | `price_pro_yearly` |

After creating each price, copy the **Price ID** (starts with `price_`).

---

## 2. Update Price IDs in Code

Edit `lib/auth.ts` and replace the placeholder price IDs with the real ones from Stripe:

```ts
// Before (placeholders)
priceId: "price_creator_monthly",
annualDiscountPriceId: "price_creator_yearly",
// ...

priceId: "price_pro_monthly",
annualDiscountPriceId: "price_pro_yearly",

// After (replace with real IDs from Stripe)
priceId: "price_1R...abc123",
annualDiscountPriceId: "price_1R...def456",
```

The file is at `lib/auth.ts:54-79`.

---

## 3. Fill in Environment Variables

Edit `.env` with your Stripe keys:

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Where to find them:
| Variable | Location in Stripe Dashboard |
|---|---|
| `STRIPE_SECRET_KEY` | Developers → API Keys → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Developers → API Keys → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Developers → Webhooks → (your endpoint) → Signing secret |

---

## 4. Set Up the Stripe Webhook

The webhook is required for Stripe to notify your app of events (subscription updates, payment success/failure, etc.).

### Option A: Stripe CLI (for local development)

```bash
# Install Stripe CLI if you haven't: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
```

This will output a webhook signing secret (`whsec_...`). Copy it into `STRIPE_WEBHOOK_SECRET` in `.env`.

### Option B: Stripe Dashboard (for production)

1. Go to **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://yourdomain.com/api/auth/stripe/webhook`
3. Events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. After saving, reveal the **Signing secret** and copy it into `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## 5. How It Works (No Extra Code Needed)

The `@better-auth/stripe` plugin handles everything automatically:

| Action | What happens |
|---|---|
| **User signs up** | Stripe Customer is created automatically (`createCustomerOnSignUp: true`) |
| **User clicks "Start free trial"** | `authClient.subscription.upgrade({ plan, annual })` → redirects to Stripe Checkout |
| **User completes checkout** | Stripe webhook → better-auth creates/updates the subscription in DB |
| **Trial period** | 7-day free trial as configured in `lib/auth.ts` |
| **Monthly/yearly billing** | Handled by Stripe; status synced via webhook |
| **Subscription updates** | Webhook events sync status changes to the `subscription` table |
| **User limits** | Stored per-plan in `lib/auth.ts` (videoLength, exportQuality, scenes, aiVoices) |

The Pricing UI at `components/landing/pricing.tsx` is already connected — it calls `authClient.subscription.upgrade()` on button click.

---

## 6. Verify It's Working

1. Start your dev server: `bun run dev`
2. Run the Stripe CLI: `stripe listen --forward-to localhost:3000/api/auth/stripe/webhook`
3. Sign up at `http://localhost:3000/sign-in`
4. Go to the pricing section and click **Start free trial** on Creator or Pro
5. You should be redirected to Stripe Checkout (use Stripe test card `4242 4242 4242 4242`)
6. After checkout, verify the subscription appears in your database `subscription` table

---

## 7. Going to Production

- Switch from test keys (`sk_test_...`, `pk_test_...`) to live keys (`sk_live_...`, `pk_live_...`)
- Update the webhook endpoint URL to your production domain
- Test the full flow with real card details in Stripe's test mode first
- Update the pricing in Stripe Dashboard if your prices change — no code changes needed (just update the Price IDs)
