# 📧 Email Troubleshooting Guide

## Issue: Verification emails not being received

### ✅ What I Fixed:
1. **Updated Email Library**: Changed from Resend to Gmail SMTP with nodemailer
2. **Configured Gmail SMTP**: Using your provided Gmail credentials
3. **Added Test Functionality**: Created test routes to verify email sending

### 🔧 Current Configuration:
```env
EMAIL_USER="ayushmore8652@gmail.com"
EMAIL_PASS="prhd fhxa vnlb xodc"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
```

## 🧪 Test Email Functionality

### Method 1: Use Test Page
1. Go to `http://localhost:3001/test-email`
2. Enter your email address
3. Click "Send Test Email"
4. Check for success/error messages

### Method 2: Test Registration
1. Go to `http://localhost:3001/register`
2. Register with a test email
3. Check server logs for email sending status
4. Check your email inbox (including spam folder)

## 🚨 Common Issues & Solutions

### Issue 1: Gmail App Password Required
**Problem**: Gmail blocks regular passwords for SMTP
**Solution**: Use App-Specific Password

#### Steps to Create Gmail App Password:
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled
4. Under "Signing in to Google", click "App passwords"
5. Select "Mail" and "Other (Custom name)"
6. Enter "JobPortal Pro" as the app name
7. Copy the generated 16-character password
8. Update your `.env.local` file:
   ```env
   EMAIL_PASS="your-16-character-app-password"
   ```

### Issue 2: Gmail Security Settings
**Problem**: Gmail blocks "less secure apps"
**Solution**: Enable IMAP and allow less secure apps

#### Steps:
1. Go to [Gmail Settings](https://mail.google.com/mail/u/0/#settings/general)
2. Click "Forwarding and POP/IMAP"
3. Enable IMAP access
4. Save changes

### Issue 3: Firewall/Network Issues
**Problem**: SMTP port 587 blocked
**Solution**: Try alternative ports

#### Alternative Configuration:
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="465"
EMAIL_SECURE="true"
```

Or try:
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="2525"
EMAIL_SECURE="false"
```

### Issue 4: Check Server Logs
Look for these messages in your terminal:

**Success:**
```
📧 Email sent successfully: <message-id>
```

**Error:**
```
📧 Email send error: [error details]
```

**Not Configured:**
```
📧 Email would be sent (SMTP not configured):
```

## 🔄 Testing Steps

### Step 1: Test Basic Email
1. Visit `http://localhost:3001/test-email`
2. Enter your email address
3. Click "Send Test Email"
4. Check for success message

### Step 2: Test Registration Flow
1. Go to `http://localhost:3001/register`
2. Register with a new email address
3. Check server logs for email sending status
4. Check email inbox (including spam/promotions folder)

### Step 3: Check Server Logs
Look for these indicators in your terminal:
- `📧 Email sent successfully:` = Email sent
- `📧 Email send error:` = Email failed
- `📧 Email would be sent (SMTP not configured):` = SMTP not working

## 🛠️ Alternative Email Services

If Gmail SMTP doesn't work, here are alternatives:

### Option 1: Use Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Update `.env.local`:
   ```env
   RESEND_API_KEY="re_your_api_key"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

### Option 2: Use SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get API key
3. Update email configuration

### Option 3: Use Mailgun
1. Sign up at [mailgun.com](https://mailgun.com)
2. Get API key and domain
3. Update email configuration

## 📋 Quick Fix Checklist

- [ ] Restart development server after changes
- [ ] Check `.env.local` file exists and has correct values
- [ ] Verify Gmail app password (16 characters)
- [ ] Enable 2-factor authentication on Gmail
- [ ] Enable IMAP in Gmail settings
- [ ] Check spam/promotions folder
- [ ] Test with `/test-email` page first
- [ ] Check server logs for error messages

## 🎯 Expected Behavior

### Successful Email Sending:
1. Server logs show: `📧 Email sent successfully: <message-id>`
2. Email appears in inbox within 1-2 minutes
3. Test page shows: `✅ Test email sent successfully!`

### Failed Email Sending:
1. Server logs show: `📧 Email send error: [details]`
2. Test page shows: `❌ Failed to send email: [details]`
3. Check the error details for specific issues

---

**Next Steps:**
1. Test email functionality using the test page
2. Check server logs for specific error messages
3. Update Gmail app password if needed
4. Try alternative email service if Gmail doesn't work

Last Updated: October 16, 2025
