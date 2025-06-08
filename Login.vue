<template>
    <div class="auth-container">
    <div class="auth-card">
        <div class="auth-header">
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to your account</p>
        </div>

        <div v-if="error" class="error-message">
        {{ error }}
        </div>

        <form @submit.prevent="handleLogin" :class="{ loading: loading }">
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
            placeholder="Enter your password"
            required
            />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
        </form>

        <div class="auth-link">
        Don't have an account? 
        <router-link to="/register">Sign up</router-link>
        </div>
    </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
    name: 'Login',
    setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const email = ref('')
    const password = ref('')

    const handleLogin = async () => {
        const result = await authStore.login(email.value, password.value)
        
        if (result.success) {
        if (!authStore.user.twoFactorEnabled) {
            router.push('/2fa-setup')
        } else if (!authStore.user.profileComplete) {
            router.push('/profile-setup')
        } else {
            router.push('/dashboard')
        }
        }
    }

    return {
        email,
        password,
        handleLogin,
        loading: authStore.loading,
        error: authStore.error
    }
    }
}
</script>