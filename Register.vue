<template>
    <div class="auth-container">
    <div class="auth-card">
        <div class="auth-header">
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Join our secure platform</p>
        </div>

        <div v-if="error" class="error-message">
        {{ error }}
        </div>

        <form @submit.prevent="handleRegister" :class="{ loading: loading }">
        <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
            required
            />
        </div>

        <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Create a password"
            required
            />
        </div>

        <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="form-input"
            placeholder="Confirm your password"
            required
            />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>
        </form>

        <div class="auth-link">
        Already have an account? 
        <router-link to="/login">Sign in</router-link>
        </div>
    </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
    name: 'Register',
    setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')

    const handleRegister = async () => {
        const result = await authStore.register(email.value, password.value, confirmPassword.value)
        
        if (result.success) {
        router.push('/2fa-setup')
        }
    }

    return {
        email,
        password,
        confirmPassword,
        handleRegister,
        loading: authStore.loading,
        error: authStore.error
    }
    }
}
</script>