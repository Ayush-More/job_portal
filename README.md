# JobPortal Pro

A revolutionary job portal platform with a pay-to-apply model and placement guarantees. Built with Next.js 14, TypeScript, Prisma, PostgreSQL, and Stripe.

## Deployment Status
✅ Fixed middleware size issue  
✅ Fixed Next.js 15 compatibility  
✅ Ready for production deployment

## 🚀 Features

### MVP Features (Implemented)

1. **User Registration & Authentication**
   - Role-based authentication (Job Seekers, Companies, Admin)
   - Secure login with NextAuth.js
   - Email verification support

2. **Company Features**
   - Company profile management
   - Job posting creation with guarantee terms
   - Application management dashboard
   - Applicant communication system

3. **Job Seeker Features**
   - Professional profile with resume upload
   - Job search and filtering
   - Application submission with payment
   - Application tracking
   - Guarantee protection

4. **Payment Processing**
   - Stripe integration for application fees
   - Secure payment handling
   - Transaction history
   - Receipt generation

5. **Guarantee & Refund System**
   - Configurable guarantee terms per job
   - Automated guarantee tracking
   - Refund request processing
   - Admin dispute resolution

6. **Admin Panel**
   - Platform statistics dashboard
   - User management
   - Refund request handling
   - Financial overview

7. **Communication**
   - Email notifications (Resend)
   - In-app messaging between companies and applicants
   - Status update notifications

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe
- **Email**: Resend
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Forms**: React Hook Form

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)
- Resend account (for emails)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd ittihadplacement
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jobportal?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Resend (Email)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="noreply@yourjobportal.com"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="JobPortal Pro"
```

4. **Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The application uses the following main models:

- **User**: Authentication and base user data
- **Company**: Company profiles
- **JobSeeker**: Job seeker profiles
- **Job**: Job postings with guarantee terms
- **Application**: Job applications
- **Payment**: Payment records with Stripe integration
- **Guarantee**: Placement guarantee tracking
- **Refund**: Refund request management
- **Message**: Communication between parties

## 🔐 Authentication & Authorization

The app implements role-based access control:

- **JOB_SEEKER**: Can browse jobs, apply, track applications
- **COMPANY**: Can post jobs, manage applications, communicate with applicants
- **ADMIN**: Full platform access, user management, refund processing

Middleware protects routes based on user roles.

## 💳 Payment Flow

1. Job seeker selects a job and clicks "Apply"
2. Application is created in "pending" state
3. Payment intent created via Stripe
4. User completes payment
5. Webhook confirms payment
6. Application status updated
7. Guarantee created automatically
8. Email notifications sent

## 🛡️ Guarantee System

Each job posting includes:
- Application fee amount
- Guarantee terms (custom text)
- Guarantee period (days)

If conditions aren't met:
1. Job seeker requests refund
2. Admin reviews request
3. Refund approved/rejected
4. Stripe refund processed
5. Notifications sent

## 📧 Email Notifications

Automated emails sent for:
- Welcome/registration
- Application submission
- Application status updates
- Payment confirmation
- Refund processing

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Ensure you set:
- Production database URL
- Production Stripe keys
- Production Resend API key
- Secure NEXTAUTH_SECRET
- Correct NEXTAUTH_URL

### Database Migration

```bash
npx prisma migrate deploy
```

### Stripe Webhooks

Set up webhook endpoint in Stripe dashboard:
```
https://yourdomain.com/api/payments/webhook
```

Events to listen for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## 📱 API Routes

### Public Routes
- `POST /api/auth/register` - User registration
- `GET /api/jobs` - List jobs
- `GET /api/jobs/[id]` - Job details

### Protected Routes (Job Seekers)
- `POST /api/applications` - Submit application
- `GET /api/applications` - List applications
- `PATCH /api/profile/job-seeker` - Update profile
- `POST /api/payments/create-intent` - Create payment

### Protected Routes (Companies)
- `POST /api/jobs` - Create job posting
- `PATCH /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job
- `PATCH /api/applications/[id]` - Update application status
- `PATCH /api/profile/company` - Update profile

### Protected Routes (Admin)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/refunds` - List refund requests
- `PATCH /api/admin/refunds/[id]` - Process refund

### Webhooks
- `POST /api/payments/webhook` - Stripe webhook handler

## 🧪 Testing

Create test accounts for each role:

```sql
-- Admin account (manually in database)
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 📝 Development Workflow

1. **Database changes**: Update `prisma/schema.prisma`
2. **Create migration**: `npx prisma migrate dev`
3. **Generate client**: `npx prisma generate`
4. **View database**: `npx prisma studio`

## 🎨 Customization

### Styling
- Modify Tailwind config: `tailwind.config.ts`
- Update UI components: `components/ui/`
- Adjust theme colors in component files

### Business Logic
- Validation schemas: `lib/validations.ts`
- Email templates: `lib/email.ts`
- Utility functions: `lib/utils.ts`

## 🐛 Troubleshooting

### Database connection issues
- Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Ensure database exists

### Payment testing issues
- Use Stripe test mode keys
- Check webhook secret is correct
- Verify webhook events are being sent

### Email not sending
- Verify RESEND_API_KEY
- Check email address is verified in Resend
- Review Resend dashboard for errors

## 📄 License

This project is for educational/demonstration purposes.

## 🤝 Contributing

This is a private project, but feel free to fork and customize for your needs.

## 📞 Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ using Next.js and modern web technologies.
