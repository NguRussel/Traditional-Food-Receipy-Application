# 🔐 Supabase Setup Guide for AFRI-Plates

This guide will walk you through setting up Supabase for the AFRI-Plates mobile app with authentication, RBAC, Google OAuth, and Two-Factor Authentication.

## 📋 Prerequisites

- Supabase account ([sign up here](https://supabase.com))
- Google Cloud Console account (for OAuth)
- Basic understanding of SQL and database concepts

## 🚀 Step 1: Create Supabase Project

1. **Go to [Supabase Dashboard](https://app.supabase.com)**
2. **Click "New Project"**
3. **Fill in project details:**
   - Organization: Select or create
   - Name: `afri-plates-mobile`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. **Click "Create new project"**
5. **Wait for project initialization** (2-3 minutes)

## 🔑 Step 2: Get Project Credentials

1. **Go to Settings > API**
2. **Copy the following values:**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. **Update your `.env` file** with these values

## 🗄️ Step 3: Database Schema Setup

### Create User Profiles Table

```sql
-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'chef', 'admin')),
  preferences JSONB DEFAULT '{}',
  favorites TEXT[] DEFAULT '{}',
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned')),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Create Chef Profiles Table

```sql
-- Create chef profiles table
CREATE TABLE public.chef_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  bio TEXT,
  specialization TEXT[] DEFAULT '{}',
  experience INTEGER DEFAULT 0,
  region TEXT,
  tribe TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_documents TEXT[] DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  statistics JSONB DEFAULT '{
    "total_recipes": 0,
    "total_views": 0,
    "total_followers": 0,
    "average_rating": 0,
    "total_reviews": 0
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_chef_profiles_updated_at
  BEFORE UPDATE ON public.chef_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Create Recipes Table

```sql
-- Create recipes table
CREATE TABLE public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  chef_id UUID REFERENCES auth.users(id) NOT NULL,
  chef_name TEXT NOT NULL,
  cooking_time INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  servings INTEGER DEFAULT 1,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  tags JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  ratings JSONB DEFAULT '{"average": 0, "count": 0}',
  nutrition_info JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 🔐 Step 4: Row Level Security (RLS) Policies

### Enable RLS on Tables

```sql
-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chef_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
```

### User Profiles Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Chef Profiles Policies

```sql
-- Chefs can manage their own profile
CREATE POLICY "Chefs can manage own profile" ON public.chef_profiles
  FOR ALL USING (auth.uid() = id);

-- Anyone can view chef profiles
CREATE POLICY "Anyone can view chef profiles" ON public.chef_profiles
  FOR SELECT USING (true);
```

### Recipe Policies

```sql
-- Anyone can view approved recipes
CREATE POLICY "Anyone can view approved recipes" ON public.recipes
  FOR SELECT USING (status = 'approved' AND is_active = true);

-- Chefs can manage their own recipes
CREATE POLICY "Chefs can manage own recipes" ON public.recipes
  FOR ALL USING (auth.uid() = chef_id);

-- Admins can manage all recipes
CREATE POLICY "Admins can manage all recipes" ON public.recipes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 🔧 Step 5: Authentication Configuration

### Enable Email Authentication

1. **Go to Authentication > Settings**
2. **Configure Site URL:**
   - Site URL: `afriplates://auth/callback`
   - Additional Redirect URLs: `exp://localhost:8081/--/auth/callback`
3. **Enable Email Confirmations:**
   - Confirm email: `Enabled`
   - Email change confirmations: `Enabled`

### Configure Email Templates

1. **Go to Authentication > Email Templates**
2. **Customize the templates:**

**Confirm Signup Template:**
```html
<h2>Welcome to AFRI-Plates! 🍽️</h2>
<p>Thank you for joining our community of Cameroonian food lovers!</p>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>Or enter this code in the app: <strong>{{ .Token }}</strong></p>
```

**Reset Password Template:**
```html
<h2>Reset Your AFRI-Plates Password 🔐</h2>
<p>We received a request to reset your password.</p>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>Or enter this code in the app: <strong>{{ .Token }}</strong></p>
```

## 🔐 Step 6: Google OAuth Setup

### Configure Google OAuth in Supabase

1. **Go to Authentication > Providers**
2. **Enable Google provider**
3. **Add your Google OAuth credentials:**
   - Client ID: From Google Cloud Console
   - Client Secret: From Google Cloud Console

### Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Create a new project or select existing**
3. **Enable Google+ API:**
   - Go to APIs & Services > Library
   - Search for "Google+ API"
   - Click Enable
4. **Create OAuth 2.0 credentials:**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
5. **Copy Client ID and Secret to Supabase**

## 🔒 Step 7: Multi-Factor Authentication (MFA)

### Enable MFA in Supabase

1. **Go to Authentication > Settings**
2. **Scroll to Multi-Factor Authentication**
3. **Enable MFA:**
   - Add new factor: `TOTP`
   - Verify URL: `afriplates://auth/verify`
   - Issuer: `AFRI-Plates`

### Configure TOTP Settings

```sql
-- Create MFA factors table (if not exists)
CREATE TABLE IF NOT EXISTS auth.mfa_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friendly_name TEXT,
  factor_type TEXT NOT NULL CHECK (factor_type IN ('totp', 'webauthn')),
  status TEXT NOT NULL CHECK (status IN ('unverified', 'verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Step 8: Database Functions

### Create User Profile Function

```sql
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  
  -- Create chef profile if role is chef
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'chef' THEN
    INSERT INTO public.chef_profiles (id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Create Role Management Functions

```sql
-- Function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.user_profiles
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.user_profiles WHERE id = user_id;
  
  -- Admin has all permissions
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Chef permissions
  IF user_role = 'chef' AND permission IN ('create_recipe', 'edit_recipe', 'view_analytics') THEN
    RETURN TRUE;
  END IF;
  
  -- User permissions
  IF user_role = 'user' AND permission IN ('view_recipes', 'save_favorites', 'create_reviews') THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🧪 Step 9: Test Your Setup

### Test Authentication

```typescript
// Test basic signup
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'Test User',
      role: 'user'
    }
  }
});

// Test Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'afriplates://auth/callback'
  }
});
```

### Test RLS Policies

```sql
-- Test as different users
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';

-- Try to access data
SELECT * FROM public.user_profiles;
SELECT * FROM public.recipes WHERE status = 'approved';
```

## 🔧 Step 10: Environment Configuration

### Update Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce', // Enable PKCE for better security
  },
});
```

## 🚨 Security Best Practices

### Environment Variables
- **Never commit** `.env` files to version control
- **Use different projects** for development and production
- **Rotate keys regularly** in production

### Database Security
- **Always use RLS** for data protection
- **Validate user input** in database functions
- **Use prepared statements** to prevent SQL injection
- **Audit database access** regularly

### Authentication Security
- **Enable email confirmation** for all signups
- **Use strong password policies**
- **Implement rate limiting** for auth endpoints
- **Monitor suspicious login attempts**

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa)
- [OAuth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)

## 🆘 Troubleshooting

### Common Issues

**OAuth redirect not working:**
- Check redirect URLs in both Supabase and Google Console
- Ensure deep linking is configured in `app.json`

**RLS policies blocking access:**
- Test policies with different user roles
- Check JWT claims are being set correctly

**MFA setup failing:**
- Verify TOTP configuration in Supabase
- Check authenticator app time synchronization

**Email confirmations not working:**
- Check email template configuration
- Verify SMTP settings in Supabase

---

**🎉 Congratulations!** Your Supabase setup is now complete with enhanced authentication, RBAC, and security features for AFRI-Plates!