<template>
    <div class="auth-container">
    <div class="auth-card">
        <div class="auth-header">
        <h1 class="auth-title">Complete Your Profile</h1>
        <p class="auth-subtitle">Tell us a bit about yourself</p>
        </div>

        <div class="onboarding-steps">
        <div class="step inactive">
            <div class="step-number">1</div>
            <span>Welcome</span>
        </div>
        <div class="step inactive">
            <div class="step-number">2</div>
            <span>Account</span>
        </div>
        <div class="step inactive">
            <div class="step-number">3</div>
            <span>Security</span>
        </div>
        <div class="step active">
            <div class="step-number">4</div>
            <span>Profile</span>
        </div>
        </div>

        <div v-if="error" class="error-message">
        {{ error }}
        </div>

        <form @submit.prevent="handleProfileUpdate" :class="{ loading: loading }">
        <div class="form-group">
            <div class="profile-avatar">
            {{ getInitials(firstName, lastName) }}
            </div>
        </div>

        <div class="form-group">
            <label for="firstName" class="form-label">First Name</label>
            <input
            id="firstName"
            v-model="firstName"
            type="text"
            class="form-input"
            placeholder="Enter your first name"
            required
            />
        </div>

        <div class="form-group">
            <label for="lastName" class="form-label">Last Name</label>
            <input
            id="lastName"
            v-model="lastName"
            type="text"
            class="form-input"
            placeholder="Enter your last name"
            required
            />
        </div>

        <div class="form-group">
            <label for="phone" class="form-label">Phone Number (Optional)</label>
            <input
            id="phone"
            v-model="phone"
            type="tel"
            class="form-input"
            placeholder="Enter your phone number"
            />
        </div>

        <div class="form-group">
            <label for="company" class="form-label">Company (Optional)</label>
            <input
            id="company"
            v-model="company"
            type="text"
            class="form-input"
            placeholder="Enter your company name"
            />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Saving...' : 'Complete Setup' }}
        </button>
        </form>

        <div class="auth-link">
        <router-link to="/dashboard">Skip for now</router-link>
        </div>
    </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
    name: 'ProfileSetup',
    setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const firstName = ref('')
    const lastName = ref('')
    const phone = ref('')
    const company = ref('')

    const getInitials = (first, last) => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '??'
    }

    const handleProfileUpdate = async () => {
        const profileData = {
        firstName: firstName.value,
        lastName: lastName.value,
        phone: phone.value,
        company: company.value,
        name: `${firstName.value} ${lastName.value}`.trim()
        }

        const result = await authStore.updateProfile(profileData)
        
        if (result.success) {
        router.push('/dashboard')
        }
    }

    return {
        firstName,
        lastName,
        phone,
        company,
        getInitials,
        handleProfileUpdate,
        loading: authStore.loading,
        error: authStore.error
    }
    }
}
</script>