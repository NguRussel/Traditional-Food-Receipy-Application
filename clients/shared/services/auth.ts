import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'chef';

interface AuthResponse {
  success: boolean;
  error?: string;
  user?: any;
  role?: UserRole;
}

export const auth = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const role = data.user?.user_metadata?.role;
      
      // Verify role-specific access
      if (!role || (role !== 'admin' && role !== 'chef')) {
        throw new Error('Unauthorized access');
      }

      // Set role-specific token
      const tokenName = `${role}-token`;
      document.cookie = `${tokenName}=authenticated; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;

      return {
        success: true,
        user: data.user,
        role: role as UserRole,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  },

  async signUpChef(data: {
    email: string;
    password: string;
    fullName: string;
    specialties: string[];
    phoneNumber?: string;
  }): Promise<AuthResponse> {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: 'chef',
            full_name: data.fullName,
            specialties: data.specialties,
            phone_number: data.phoneNumber,
            registration_status: 'pending',
            registration_date: new Date().toISOString(),
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create chef profile
      const { error: profileError } = await supabase
        .from('chef_profiles')
        .insert([
          {
            full_name: data.fullName,
            email: data.email,
            specialties: data.specialties,
            phone_number: data.phoneNumber,
            status: 'pending_verification',
            registration_date: new Date().toISOString(),
          },
        ]);

      if (profileError) throw profileError;

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    // Clear all auth cookies
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'chef-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  },

  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  },

  async verifySession(): Promise<AuthResponse> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) throw new Error('No active session');

      const role = session.user?.user_metadata?.role;
      if (!role || (role !== 'admin' && role !== 'chef')) {
        throw new Error('Invalid role');
      }

      return {
        success: true,
        user: session.user,
        role: role as UserRole,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Session verification failed',
      };
    }
  },
}; 