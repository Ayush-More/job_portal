# Quick Start Guide

Get JobPortal Pro running locally in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- PostgreSQL installed and running
- Git

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

**Start PostgreSQL** (if not already running):

```bash
# macOS with Homebrew
brew services start postgresql

# Linux
sudo service postgresql start

# Windows
# Use PostgreSQL service manager
```

**Create Database:**

```bash
# Login to PostgreSQL
psql postgres

# Create database
CREATE DATABASE jobportal;

# Exit
\q
```

### 3. Configure Environment

Copy the example env file:

```bash
cp .env.example .env
```

**Update `.env` with your local settings:**

```env
# For local development, this should work:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobportal?schema=public"

# Generate a secret (run: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"

# Leave other values as-is for development
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe test keys (get from stripe.com/dashboard)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Will configure later

# Resend (optional for development)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@example.com"
```

> **Note**: You can start without Stripe/Resend keys. Payment and email features won't work but you can still test the UI.

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Name the migration (e.g., "init")
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## First Steps

### 1. Create Accounts

**Register as a Job Seeker:**
1. Click "Get Started" or "Register"
2. Select "Job Seeker"
3. Fill in details
4. Sign in

**Register as a Company:**
1. Log out
2. Register again
3. Select "Company"
4. Fill in details
5. Sign in

### 2. Create Admin Account

Connect to your database:

```bash
psql postgresql://postgres:postgres@localhost:5432/jobportal
```

```sql
-- Find your user ID
SELECT id, email, role FROM users;

-- Make yourself admin
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';

-- Exit
\q
```

### 3. Test Features

**As Company:**
- Update company profile
- Post a job with guarantee terms
- Set application fee (minimum $1)

**As Job Seeker:**
- Update profile
- Browse jobs
- Apply to a job (payment will fail without Stripe)

**As Admin:**
- View dashboard statistics
- Check refund requests

## Enable Payments (Optional)

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account (it's free)
3. Stay in "Test mode"

### 2. Get API Keys

1. Dashboard → Developers → API keys
2. Copy:
   - Publishable key (`pk_test_...`)
   - Secret key (`sk_test_...`)
3. Update `.env`

### 3. Set Up Webhook (Local Testing)

Install Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows/Linux - download from stripe.com/docs/stripe-cli
```

Forward webhooks:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Copy the webhook signing secret and update `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Keep this terminal running while testing payments!

### 4. Test Payment

Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any billing ZIP code

## Enable Email (Optional)

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Create free account
3. Verify your domain OR use Resend's domain for testing

### 2. Get API Key

1. Dashboard → API Keys
2. Create new key
3. Copy and update `.env`:

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="onboarding@resend.dev"  # Or your verified domain
```

### 3. Test Email

Register a new account and check email!

## Development Tools

### Prisma Studio (Database GUI)

```bash
npm run db:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

### View Logs

```bash
# Terminal running dev server shows:
# - API requests
# - Database queries
# - Errors
```

## Troubleshooting

### "Connection refused" - Database

```bash
# Check PostgreSQL is running
pg_isready

# Start if not running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

### "Prisma Client not generated"

```bash
npm run db:generate
```

### Port 3000 already in use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or run on different port
npm run dev -- -p 3001
```

### Database migration errors

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Confirm with 'y'
```

### Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Common Tasks

### Reset Database

```bash
npx prisma migrate reset
```

### View Database

```bash
# Via Prisma Studio
npm run db:studio

# Or via psql
psql postgresql://postgres:postgres@localhost:5432/jobportal
```

### Add Test Data

```bash
# Coming soon: seed script
npm run db:seed
```

### Check for TypeScript Errors

```bash
npm run build
```

### Format Code

```bash
npx prettier --write .
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages (login, register)
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   │   ├── admin/        # Admin pages
│   │   ├── company/      # Company pages
│   │   └── job-seeker/   # Job seeker pages
│   └── jobs/             # Job listings
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── shared/           # Shared components
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client
│   ├── stripe.ts        # Stripe utilities
│   ├── email.ts         # Email utilities
│   └── validations.ts   # Zod schemas
├── prisma/              # Database
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## Next Steps

1. ✅ Read [README.md](./README.md) for full documentation
2. ✅ Check [DEPLOYMENT.md](./DEPLOYMENT.md) when ready to deploy
3. ✅ Explore the code and customize!

## Need Help?

- Check the [README.md](./README.md)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- Check Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
- Check Prisma docs: [prisma.io/docs](https://www.prisma.io/docs)

---

Happy coding! 🚀

