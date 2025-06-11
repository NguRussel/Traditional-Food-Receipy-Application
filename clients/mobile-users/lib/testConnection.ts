import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('⚠️ Database connection test failed:', error.message);
      if (error.message.includes('relation "users" does not exist')) {
        console.log('📝 Database tables need to be created. Please run the database setup scripts.');
        return { success: false, needsSetup: true, error };
      }
      return { success: false, needsSetup: false, error };
    }
    
    console.log('✅ Supabase connection successful!');
    return { success: true, needsSetup: false, data };
    
  } catch (error) {
    console.log('❌ Connection error:', error);
    return { success: false, needsSetup: false, error };
  }
}

export async function testAuth() {
  try {
    console.log('🔐 Testing authentication setup...');
    
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current auth user:', user ? 'Logged in' : 'Not logged in');
    
    return { success: true, user };
  } catch (error) {
    console.log('❌ Auth test error:', error);
    return { success: false, error };
  }
} 