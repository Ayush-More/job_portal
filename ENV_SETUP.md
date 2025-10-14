# Environment Variables Setup

This application requires several environment variables to function properly. Follow these steps to set them up:

## Step 1: Create .env.local file

Create a file named `.env.local` in the root directory of the project and add the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ittihadplacement?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (Get these from https://dashboard.stripe.com)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_your_stripe_publishable_key"

# Email (Get from https://resend.com - Optional for development)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="noreply@yourdomain.com"
```

## Step 2: Configure Each Service

### Database (Required)

You need a PostgreSQL database. You have two options:

**Option A: Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create a database named `ittihadplacement`
3. Update the `DATABASE_URL` with your local credentials

**Option B: Cloud Database (Recommended for quick setup)**
1. Sign up for a free account at [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Create a new PostgreSQL database
3. Copy the connection string and replace `DATABASE_URL`

Example:
```
DATABASE_URL="postgresql://user:password@db.example.com:5432/ittihadplacement"
```

### NextAuth Secret (Required)

Generate a secure random secret:

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

Replace `NEXTAUTH_SECRET` with the generated value.

### Stripe (Required for payments)

1. Sign up for a free account at [Stripe](https://stripe.com)
2. Go to the [Stripe Dashboard](https://dashboard.stripe.com)
3. Click "Developers" → "API keys"
4. Copy the "Publishable key" → replace `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
5. Click "Reveal test key" → replace `STRIPE_SECRET_KEY`
6. For webhook secret:
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - URL: `http://localhost:3000/api/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Click "Add endpoint"
   - Click "Reveal" under "Signing secret" → replace `STRIPE_WEBHOOK_SECRET`

### Email (Optional - for development)

The app will work without email configured. Emails will just be logged to the console.

If you want to enable email sending:

1. Sign up for a free account at [Resend](https://resend.com)
2. Go to API Keys
3. Create a new API key
4. Replace `RESEND_API_KEY` with your key
5. Update `EMAIL_FROM` with a verified domain email (or use `onboarding@resend.dev` for testing)

## Step 3: Initialize the Database

After setting up your environment variables, run:

```bash
# Generate Prisma client
npm run db:generate

# Push the schema to your database
npm run db:push
```

## Step 4: Restart the Development Server

Stop your current dev server (Ctrl+C) and start it again:

```bash
npm run dev
```

## Quick Setup (Minimum Configuration)

If you want to get started quickly with just the essentials:

1. Set up a database (Supabase/Neon recommended)
2. Generate a NextAuth secret
3. Set placeholder values for Stripe (payment features won't work until configured)

```env
DATABASE_URL="postgresql://your-db-connection-string"
NEXTAUTH_SECRET="generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_placeholder"
STRIPE_WEBHOOK_SECRET="whsec_placeholder"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_placeholder"
```

The app will run with this configuration, but payment features will show errors until Stripe is properly configured.

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Make sure `.env.local` is in the root directory (same level as `package.json`)
- Restart your dev server after creating/modifying `.env.local`

### "Invalid credentials" when logging in
- Make sure you've run `npm run db:push` to create the database tables
- Check that your database connection string is correct

### Email errors
- This is normal if you haven't configured Resend
- Emails will be logged to the console instead
- The app will continue to work normally

## Production Deployment

For production (e.g., Vercel):

1. Use the same environment variables
2. Update `NEXTAUTH_URL` to your production URL
3. Use production Stripe keys instead of test keys
4. Ensure your database allows connections from your hosting provider

