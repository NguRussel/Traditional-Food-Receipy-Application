<template>
    <div class="auth-container">
    <div class="auth-card">
        <div class="auth-header">
        <h1 class="auth-title">Setup 2FA</h1>
        <p class="auth-subtitle">Secure your account with two-factor authentication</p>
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
        <div class="step active">
            <div class="step-number">3</div>
            <span>Security</span>
        </div>
        <div class="step inactive">
            <div class="step-number">4</div>
            <span>Profile</span>
        </div>
        </div>

        <div v-if="error" class="error-message">
        {{ error }}
        </div>

        <div v-if="!qrGenerated">
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin-bottom: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
            <p style="color: #6b7280; line-height: 1.6;">
                Two-factor authentication adds an extra layer of security to your account.
                We'll generate a QR code for you to scan with your authenticator app.
            </p>
            </div>
        </div>

        <button 
            @click="generateQR" 
            class="btn btn-primary" 
            :disabled="loading"
            style="margin-bottom: 1rem;"
        >
            {{ loading ? 'Generating...' : 'Generate QR Code' }}
        </button>
        </div>

        <div v-else>
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="background: #CFA911FF; border-radius: 12px; padding: 2rem; margin-bottom: 1rem;">
            <div style="font-size: 8rem; margin-bottom: 1rem;">📱</div>
            <p style="color: #6b7280; margin-bottom: 1rem;">
                Scan this QR code with your authenticator app
            </p>
            <div style="background: white; padding: 1rem; border-radius: 8px; display: inline-block;">
                <div style="width: 150px; height: 150px; background: #485151FF; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280;">
                QR Code
                </div>
            </div>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <p style="color: #92400e; font-size: 0.875rem; margin-bottom: 0.5rem;">
                <strong>Manual Entry Code:</strong>
            </p>
            <code style="background: white; padding: 0.5rem; border-radius: 4px; font-family: monospace;">
                {{ secret }}
            </code>
            </div>
        </div>

        <router-link to="/2fa-verify" class="btn btn-primary">
            Continue to Verification
        </router-link>
        </div>

        <div class="auth-link">
        <router-link to="/profile-setup">Skip for now</router-link>
        </div>
    </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
    name: 'TwoFactorSetup',
    setup() {
    const authStore = useAuthStore()
    
    const qrGenerated = ref(false)
    const secret = ref('')

    const generateQR = async () => {
        const result = await authStore.setupTwoFactor()
        
        if (result.success) {
        qrGenerated.value = true
        secret.value = result.secret
        }
    }

    return {
        qrGenerated,
        secret,
        generateQR,
        loading: authStore.loading,
        error: authStore.error
    }
    }
}
</script>