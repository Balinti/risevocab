# RiseVocab

Business communication microtraining web app that helps non-native professionals write more naturally at work using 10-minute scenario drills, instant AI feedback, and lightweight spaced repetition.

## Features

- **Try without login**: Start practicing immediately with the free Office Basics track
- **Scenario Drills**: Rewrite, tone adjustment, cloze collocations, and short reply exercises
- **AI Feedback**: Instant feedback with tone analysis, scores, and multiple rewrite suggestions
- **Message Repair**: Paste any message and get a professional rewrite (metered usage)
- **Spaced Repetition**: Lightweight SRS for reviewing phrases at optimal intervals
- **Phrasebook**: Save and organize professional phrases for quick reference

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (auth + database)
- Stripe (subscriptions)
- OpenAI (AI feedback)

## Environment Variables

### Required (from shared team)

```env
# App Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# OpenAI (optional - fallback feedback works without it)
OPENAI_API_KEY=

# Database URL (for migrations)
DATABASE_URL=
```

### Project-Specific

```env
# App URL
NEXT_PUBLIC_APP_URL=https://risevocab.vercel.app

# Stripe Price IDs (optional - upgrade buttons hidden if missing)
NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=
```

### Hardcoded (do not change)

- Shared Auth Supabase URL: `https://api.srv936332.hstgr.cloud`
- App Slug: `risevocab`

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Database Migrations

Run migrations against your Supabase database:

```bash
# Using psql
psql $DATABASE_URL -f supabase/migrations/0001_schema.sql
psql $DATABASE_URL -f supabase/migrations/0002_rls.sql
```

## Deployment

The app is deployed to Vercel:

```bash
# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Landing page
│   ├── app/
│   │   ├── page.tsx        # Main practice dashboard
│   │   ├── drill/[id]/     # Individual drill pages
│   │   ├── review/         # SRS review queue
│   │   ├── message-repair/ # Message repair tool
│   │   └── phrasebook/     # Saved phrases
│   ├── pricing/            # Pricing page
│   ├── account/            # Account management
│   └── api/
│       ├── feedback/       # AI feedback endpoint
│       ├── srs/grade/      # SRS grading endpoint
│       ├── stripe/         # Stripe checkout & webhook
│       └── subscription/   # Subscription status
├── components/
│   ├── GoogleAuth.tsx      # Google OAuth button
│   ├── Header.tsx          # Site header
│   ├── DrillCard.tsx       # Drill input component
│   ├── FeedbackDisplay.tsx # Feedback display
│   ├── SoftSavePrompt.tsx  # Sign-in prompt modal
│   ├── PaywallModal.tsx    # Upgrade prompt modal
│   └── TonePicker.tsx      # Tone selection
└── lib/
    ├── AuthContext.tsx     # Auth state management
    ├── authSharedClient.ts # Shared auth Supabase client
    ├── supabaseAppClient.ts# App database client
    ├── localStore.ts       # localStorage utilities
    ├── srs.ts              # Spaced repetition logic
    ├── contentSeed.ts      # Fallback content data
    ├── entitlements.ts     # Subscription features
    └── stripe.ts           # Stripe utilities
```

## License

Proprietary - All rights reserved
