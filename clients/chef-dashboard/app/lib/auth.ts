import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear any local storage or cookies if needed
    localStorage.clear()
    
    // Redirect to login page
    window.location.href = '/login'
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
} 