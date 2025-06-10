import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserRole, UserPermissions, isPlaceholder } from '../lib/supabase';
import RBACManager, { DEFAULT_PERMISSIONS } from '../lib/rbac';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  // Basic Authentication
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  
  // OAuth Authentication
  signInWithGoogle: () => Promise<{ error: any }>;
  
  // OTP Verification
  verifyOTP: (email: string, token: string, type: 'signup' | 'recovery' | 'email_change') => Promise<{ error: any }>;
  resendOTP: (email: string, type: 'signup' | 'recovery') => Promise<{ error: any }>;
  
  // Two-Factor Authentication
  enableTwoFactor: () => Promise<{ error: any; qrCode?: string; secret?: string }>;
  disableTwoFactor: () => Promise<{ error: any }>;
  verifyTwoFactor: (code: string) => Promise<{ error: any }>;
  getTwoFactorStatus: () => Promise<{ enabled: boolean; error?: any }>;
  
  // Profile Management
  updateProfile: (updates: any) => Promise<{ error: any }>;
  updateProfilePhoto: (photoUri: string) => Promise<{ error: any; url?: string }>;
  deleteAccount: () => Promise<{ error: any }>;
  
  // Role & Permissions (Enhanced RBAC)
  userRole: UserRole | null;
  userPermissions: UserPermissions | null;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  canAccessScreen: (screenName: string) => boolean;
  canManageRecipe: (recipeOwnerId: string, action: 'create' | 'edit' | 'delete' | 'approve') => boolean;
  canManageUser: (targetUserId: string, action: 'view' | 'edit' | 'ban' | 'verify') => boolean;
  getRoleDisplayName: () => string;
  getAllowedRoutes: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);

  useEffect(() => {
    if (isPlaceholder) {
      // Offline mode - no Supabase calls
      console.log('🔌 Running in offline mode - Supabase features disabled');
      setSession(null);
      setUser(null);
      setUserRole(null);
      setUserPermissions(null);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      const role = session?.user?.user_metadata?.role as UserRole | null;
      setUserRole(role);
      setUserPermissions(role ? DEFAULT_PERMISSIONS[role] : null);
      setLoading(false);
    }).catch((error) => {
      console.warn('Supabase connection failed:', error.message);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        const role = session?.user?.user_metadata?.role as UserRole | null;
        setUserRole(role);
        setUserPermissions(role ? DEFAULT_PERMISSIONS[role] : null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isPlaceholder) {
      return { error: new Error('Authentication is disabled in offline mode. Please configure Supabase credentials.') };
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    if (isPlaceholder) {
      return { error: new Error('Authentication is disabled in offline mode. Please configure Supabase credentials.') };
    }
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const updateProfile = async (updates: any) => {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    });
    return { error };
  };

  const updateProfilePhoto = async (photoUri: string) => {
    try {
      if (!user) {
        return { error: new Error('User not authenticated') };
      }

      // Create a unique filename
      const fileName = `profile_${user.id}_${Date.now()}.jpg`;
      
      // Convert image to blob for upload
      const response = await fetch(photoUri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { error: uploadError };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;

      // Update user metadata with new photo URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          avatar_url: photoUrl,
          profile_photo: photoUrl,
        },
      });

      if (updateError) {
        console.error('Profile update error:', updateError);
        return { error: updateError };
      }

      return { error: null, url: photoUrl };
    } catch (error) {
      console.error('Photo upload error:', error);
      return { error: error as Error };
    }
  };

  const deleteAccount = async () => {
    try {
      // First, delete user data from custom tables
      if (user) {
        // Delete user profile data
        await supabase
          .from('users')
          .delete()
          .eq('id', user.id);
        
        // Delete any user-related data (favorites, meal plans, etc.)
        // This would be expanded based on your database schema
      }

      // Then delete the auth user account
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      if (error) {
        // If admin delete fails, try regular account deletion
        // Note: Regular users cannot delete their own accounts via Supabase auth
        // This would typically be handled by a server-side function
        console.error('Account deletion failed:', error);
        return { error: new Error('Account deletion failed. Please contact support.') };
      }

      // Sign out after successful deletion
      await signOut();
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { error: error as Error };
    }
  };

  // OAuth Authentication
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'afriplates://auth/callback',
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // OTP Verification
  const verifyOTP = async (email: string, token: string, type: 'signup' | 'recovery' | 'email_change') => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resendOTP = async (email: string, type: 'signup' | 'recovery') => {
    try {
      if (type === 'recovery') {
        // For password recovery
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return { error };
      } else {
        // For signup confirmation
        const { error } = await supabase.auth.resend({
          email,
          type: 'signup',
        });
        return { error };
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Two-Factor Authentication
  const enableTwoFactor = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'AFRI-Plates 2FA',
      });
      
      if (error) return { error };
      
      return { 
        error: null, 
        qrCode: data?.totp?.qr_code,
        secret: data?.totp?.secret 
      };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const disableTwoFactor = async () => {
    try {
      // Get current factors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      
      if (factors && factors.totp && factors.totp.length > 0) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: factors.totp[0].id,
        });
        return { error };
      }
      
      return { error: new Error('No 2FA factors found') };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const verifyTwoFactor = async (code: string) => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      
      if (factors && factors.totp && factors.totp.length > 0) {
        // First create a challenge
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: factors.totp[0].id,
        });
        
        if (challengeError) return { error: challengeError };
        
        // Then verify with the challenge ID
        const { error } = await supabase.auth.mfa.verify({
          factorId: factors.totp[0].id,
          challengeId: challenge.id,
          code,
        });
        return { error };
      }
      
      return { error: new Error('No 2FA factors found') };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const getTwoFactorStatus = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const enabled = !!(factors && factors.totp && factors.totp.length > 0);
      return { enabled, error: null };
    } catch (error) {
      return { enabled: false, error: error as Error };
    }
  };

  // Enhanced RBAC Methods
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!userRole || !userPermissions) return false;
    return RBACManager.hasPermission(userRole, userPermissions, permission);
  };

  const canAccessScreen = (screenName: string): boolean => {
    if (!userRole) return false;
    return RBACManager.canAccessScreen(userRole, screenName);
  };

  const canManageRecipe = (recipeOwnerId: string, action: 'create' | 'edit' | 'delete' | 'approve'): boolean => {
    if (!userRole || !user) return false;
    return RBACManager.canManageRecipe(userRole, userPermissions, recipeOwnerId, user.id, action);
  };

  const canManageUser = (targetUserId: string, action: 'view' | 'edit' | 'ban' | 'verify'): boolean => {
    if (!userRole || !user) return false;
    return RBACManager.canManageUser(userRole, userPermissions, targetUserId, user.id, action);
  };

  const getRoleDisplayName = (): string => {
    if (!userRole) return 'Guest';
    const roleNames = {
      user: 'Food Lover',
      chef: 'Chef',
      admin: 'Administrator'
    };
    return roleNames[userRole] || 'Unknown';
  };

  const getAllowedRoutes = (): string[] => {
    if (!userRole) return ['Home', 'Login', 'Register'];
    return RBACManager.getAllowedRoutes(userRole);
  };

  const value = {
    session,
    user,
    loading,
    userRole,
    userPermissions,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    verifyOTP,
    resendOTP,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
    getTwoFactorStatus,
    updateProfile,
    updateProfilePhoto,
    deleteAccount,
    hasPermission,
    canAccessScreen,
    canManageRecipe,
    canManageUser,
    getRoleDisplayName,
    getAllowedRoutes,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 