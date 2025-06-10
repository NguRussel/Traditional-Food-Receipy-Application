# Database Setup for AFRI-Plates

Your Supabase credentials are correct, but you need to set up the database tables for the app to work properly.

## Quick Setup Steps

### 1. Access your Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your account
3. Select your project: `ukgqlevdgxwjezfjpjpk`

### 2. Set up Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add your app URLs:
   - `exp://192.168.1.100:8087` (replace with your actual IP from Expo QR code)
   - `afriplates://`
   - `localhost:8087`

3. Under **Redirect URLs**, add:
   - `exp://192.168.1.100:8087`
   - `afriplates://auth/callback`

### 3. Run Database Setup Scripts

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the content from `../../setup_database.sql`
4. Click **Run** to execute the script
5. Do the same for `../../supabase_auth_setup.sql`

### 4. Enable Row Level Security (RLS)

After running the setup scripts, make sure RLS is enabled:

1. Go to **Database** → **Tables**
2. For each table (`users`, `recipes`, `chefs`, etc.), click on the table
3. Go to **Settings** tab
4. Enable **Row Level Security**

### 5. Test the Setup

1. Restart your Expo app
2. Try creating an account
3. Check the console for success messages

## Alternative: Use Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Navigate to project root
cd ../../

# Initialize Supabase project
supabase init

# Link to your remote project
supabase link --project-ref ukgqlevdgxwjezfjpjpk

# Push the database schema
supabase db push
```

## Troubleshooting

### If you see "relation does not exist" errors:
- The database tables haven't been created yet
- Run the SQL setup scripts in your Supabase dashboard

### If you see "Authentication disabled in offline mode":
- Make sure your .env file has the correct credentials
- Restart the Expo development server
- Check the console for environment variable debug logs

### If signup still fails:
- Check Authentication settings in Supabase dashboard
- Ensure email confirmation is disabled for testing
- Check the Network tab in browser dev tools for specific error messages

## Manual Table Creation (Backup Option)

If the SQL scripts don't work, you can create the essential tables manually:

### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
```

After setting up the database, your authentication should work properly! 