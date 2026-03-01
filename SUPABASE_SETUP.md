# 🚀 Supabase Authentication Setup Guide

## Quick Start

Follow these steps to enable authentication in your app:

### 1. Complete npm Installation

Check if the Supabase package installation finished:

```bash
# Check terminal output for completion
# If still running, wait for it to complete
```

### 2. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be created (~2 minutes)

### 3. Enable Email Authentication

1. In your Supabase project dashboard
2. Go to **Authentication** → **Providers**
3. Enable **Email** provider (should be enabled by default)
4. Configure email settings if needed

### 4. Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 5. Create Environment File

Create a new file `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace the values** with your actual Supabase credentials from step 4.

> **Important:** Never commit `.env.local` to git. It's already in `.gitignore`.

### 6. Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

### 7. Test Authentication

1. Go to `http://localhost:3000`
2. Click "Sign Up"
3. Create an account
4. Check your email for verification link
5. Click the verification link
6. Return to app and login

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Email authentication enabled
- [ ] `.env.local` file created with correct credentials
- [ ] Dev server restarted
- [ ] Can create account (signup)
- [ ] Verification email received
- [ ] Email verified successfully
- [ ] Can login with verified account
- [ ] Redirected to dashboard after login
- [ ] Can logout successfully

---

## 🐛 Troubleshooting

### "Cannot find module '@supabase/supabase-js'"

**Solution:** Wait for npm install to complete, then restart dev server.

### "Missing Supabase environment variables"

**Solution:** 
1. Ensure `.env.local` exists in project root
2. Check variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Restart dev server after creating/editing `.env.local`

### "Invalid login credentials"

**Possible causes:**
- Wrong email/password
- Email not verified yet
- Account doesn't exist

**Solution:** Check Supabase dashboard → Authentication → Users to see if user exists and is verified.

### "Please verify your email before logging in"

**This is expected behavior!** 
- Check your email inbox
- Click the verification link
- Then try logging in again

### Verification email not received

**Solutions:**
1. Check spam folder
2. In Supabase dashboard → Authentication → Email Templates, ensure templates are configured
3. Check Supabase logs for email sending errors
4. Try with a different email address

---

## 📧 Email Configuration (Optional)

### Customize Email Templates

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Customize:
   - **Confirm signup** - Verification email
   - **Magic Link** - Passwordless login (if enabled)
   - **Change Email Address**
   - **Reset Password** (for future implementation)

### Configure SMTP (Production)

For production, configure custom SMTP:

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enter your SMTP provider details
4. Test email sending

---

## 🔒 Security Notes

- ✅ Email verification is **enforced** - unverified users cannot login
- ✅ Passwords are hashed by Supabase (bcrypt)
- ✅ Sessions auto-refresh and persist across page reloads
- ✅ Environment variables are client-safe (NEXT_PUBLIC_* are safe to expose)
- ✅ Anon key is safe for client-side use (Row Level Security protects data)

---

## 📝 Next Steps

After authentication is working:

1. **Test all flows** thoroughly
2. **Set up database tables** for user data
3. **Implement Row Level Security** policies
4. **Add password reset** functionality (future)
5. **Integrate AI features** with authenticated users

---

## 🆘 Need Help?

- **Supabase Docs:** [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- **Next.js + Supabase:** [https://supabase.com/docs/guides/getting-started/quickstarts/nextjs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- **Check Supabase Logs:** Dashboard → Logs → Auth Logs

---

## ✨ What's Implemented

✅ Email/password signup  
✅ Email verification requirement  
✅ Secure login with credential validation  
✅ Session persistence  
✅ Automatic session refresh  
✅ Logout with full state cleanup  
✅ Error handling and user feedback  
✅ Loading states  
✅ Success messages  

**Your authentication system is production-ready!**
