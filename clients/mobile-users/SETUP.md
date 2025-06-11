# AFRI-Plates Mobile App Setup Guide

## Quick Start (Development Mode)

The app is currently running in **offline mode** with placeholder Supabase credentials. You can explore the UI and basic functionality without authentication features.

## Setting Up Supabase (Required for Full Functionality)

To enable authentication, user profiles, and backend features, you need to set up Supabase:

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `afri-plates-mobile`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location

### 2. Get Your Project Credentials

Once your project is created:

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghijk.supabase.co`)
   - **anon public** key (starts with `eyJhbG...`)

### 3. Update Environment Variables

1. Open the `.env` file in the `clients/mobile-users` directory
2. Replace the placeholder values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 4. Restart the Development Server

```bash
npx expo start --clear
```

## Features Available in Offline Mode

- ✅ App navigation and UI
- ✅ Recipe browsing (mock data)
- ✅ Basic app functionality
- ❌ User authentication
- ❌ User profiles
- ❌ Recipe saving/favorites
- ❌ Chef profiles
- ❌ Real-time features

## Features Available with Supabase

- ✅ All offline features
- ✅ User registration and login
- ✅ User profiles and preferences
- ✅ Recipe favorites and meal planning
- ✅ Chef profiles and following
- ✅ Reviews and ratings
- ✅ Real-time notifications

## Troubleshooting

### "Network request failed" Error

This is normal when running in offline mode. The app is trying to connect to placeholder Supabase URLs. Set up real Supabase credentials to resolve this.

### "WebCrypto API is not supported" Warning

This warning appears when using placeholder credentials and can be ignored in development.

### App Won't Start

1. Make sure you're in the correct directory: `clients/mobile-users`
2. Install dependencies: `npm install`
3. Clear Expo cache: `npx expo start --clear`

## Next Steps

1. Set up Supabase credentials (follow steps above)
2. Set up the backend services (see main project README)
3. Configure database schemas
4. Test authentication features

## Need Help?

- Check the main project documentation
- Review Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Check Expo documentation: [https://docs.expo.dev](https://docs.expo.dev) 