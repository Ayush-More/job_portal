# Deployment Guide - JobPortal Pro

Complete guide for deploying JobPortal Pro to production.

## Prerequisites

- GitHub account
- Vercel account (recommended) or other hosting
- PostgreSQL database (Neon, Supabase, or Railway recommended)
- Stripe account with API keys
- Resend account with verified domain

## Step 1: Prepare Your Database

### Option A: Neon (Recommended - Free Tier)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. It will look like: `postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require`

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (Transaction mode)

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the connection string from Variables tab

## Step 2: Set Up Stripe

1. Go to [stripe.com/dashboard](https://dashboard.stripe.com)
2. Switch to "Test mode" for initial deployment
3. Get your API keys:
   - Developers → API keys
   - Copy "Publishable key" (pk_test_...)
   - Copy "Secret key" (sk_test_...)

4. Set up webhooks:
   - Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/webhook`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the "Signing secret" (whsec_...)

## Step 3: Set Up Resend

1. Go to [resend.com](https://resend.com)
2. Create account and verify your domain (or use resend's domain for testing)
3. Go to API Keys
4. Create new API key
5. Copy the key (re_...)

## Step 4: Generate Secrets

Generate a secure NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

Copy the output for your environment variables.

## Step 5: Deploy to Vercel

### Via GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/jobportal.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select "Next.js" framework (auto-detected)

3. **Configure Environment Variables**

   Add these in Vercel project settings → Environment Variables:

   ```env
   # Database
   DATABASE_URL=your_production_database_url

   # NextAuth
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_generated_secret

   # Stripe
   STRIPE_PUBLIC_KEY=pk_test_your_key
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Resend
   RESEND_API_KEY=re_your_key
   EMAIL_FROM=noreply@yourdomain.com

   # App
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_APP_NAME=JobPortal Pro
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
# Follow prompts
vercel --prod
```

## Step 6: Run Database Migrations

After deployment, run migrations:

```bash
# Install Vercel CLI if not already
npm install -g vercel

# Link to your project
vercel link

# Run migrations
vercel env pull .env.production
DATABASE_URL="your_production_url" npx prisma migrate deploy
```

Or use Vercel's terminal in the dashboard.

## Step 7: Create Admin Account

Connect to your production database and run:

```sql
-- First, register normally through the app as a job seeker or company
-- Then update the role in database

UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'youradmin@email.com';
```

## Step 8: Update Stripe Webhook

1. Go back to Stripe Dashboard → Webhooks
2. Update the endpoint URL to your production domain:
   `https://your-actual-domain.vercel.app/api/payments/webhook`

## Step 9: Configure Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL in environment variables

## Step 10: Switch to Production Mode

### Stripe Production Keys

1. In Stripe Dashboard, toggle to "Live mode"
2. Get new production keys
3. Update environment variables in Vercel
4. Re-create webhook with production endpoint

### Resend Production

1. Verify your domain in Resend
2. Update EMAIL_FROM to use your domain
3. Consider upgrading plan if needed

## Verification Checklist

- [ ] App loads at production URL
- [ ] Can register new users
- [ ] Can log in
- [ ] Database is connected (check user creation)
- [ ] Job postings work
- [ ] Payment flow works (test mode initially)
- [ ] Emails are being sent
- [ ] Webhooks are receiving events
- [ ] Admin panel accessible
- [ ] No console errors

## Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- Track performance and errors

### Database Monitoring
- Check connection pool limits
- Monitor query performance
- Set up backups

### Stripe Dashboard
- Monitor payment events
- Check webhook delivery
- Review failed payments

### Error Tracking (Optional)

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Posthog for analytics

## Scaling Considerations

### Database
- Enable connection pooling (Prisma Accelerate or PgBouncer)
- Add read replicas for read-heavy workloads
- Regular backups and point-in-time recovery

### File Uploads
- Implement cloud storage (AWS S3, Cloudflare R2, UploadThing)
- Current setup uses local storage (not suitable for Vercel)

### Email
- Monitor Resend limits
- Upgrade plan as needed
- Consider rate limiting

### Performance
- Enable Vercel Edge caching where appropriate
- Optimize images with Next.js Image component
- Add Redis for caching (Upstash)

## Rollback Procedure

If deployment fails:

1. In Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

## Backup Strategy

### Database
```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Automated Backups
- Neon: Automatic daily backups
- Supabase: Daily backups on Pro plan
- Railway: Configure backups in settings

## Security Checklist

- [ ] All secrets are in environment variables (not committed)
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database has strong password
- [ ] CORS is properly configured
- [ ] Rate limiting implemented (consider Upstash)
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection (React handles this)
- [ ] HTTPS enabled (Vercel handles this)

## Cost Estimates (Monthly)

### Free Tier Setup
- Vercel: Free (Hobby)
- Neon: Free (0.5GB storage)
- Resend: Free (100 emails/day)
- Stripe: No monthly fee (2.9% + 30¢ per transaction)

### Production Setup
- Vercel Pro: $20/month (or stay on free)
- Database: $10-25/month
- Resend: $20/month (50k emails)
- Total: ~$50-65/month

## Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Resend Documentation](https://resend.com/docs)

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Ensure all dependencies in package.json
- Verify TypeScript errors locally first

### Database Connection Errors
- Verify DATABASE_URL format
- Check database is accessible from Vercel
- Enable connection pooling if needed

### Webhook Not Working
- Verify webhook URL is correct
- Check Stripe webhook logs
- Ensure endpoint is publicly accessible
- Verify STRIPE_WEBHOOK_SECRET

### Emails Not Sending
- Check Resend dashboard for errors
- Verify API key is correct
- Ensure sender domain is verified
- Check spam folder

---

For additional help, refer to the main README.md or create an issue.

