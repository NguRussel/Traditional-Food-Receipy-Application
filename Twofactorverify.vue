<template>
    <div class="auth-container">
    <div class="auth-card">
        <div class="auth-header">
        <h1 class="auth-title">Verify 2FA</h1>
        <p class="auth-subtitle">Enter the 6-digit code from your authenticator app</p>
        </div>

        <div v-if="error" class="error-message">
        {{ error }}
        </div>

        <div v-if="success" class="success-message">
        Two-factor authentication has been successfully enabled!
        </div>

        <form @submit.prevent="handleVerify" :class="{ loading: loading }">
        <div class="form-group">
            <label id="verification-code-label" class="form-label">Verification Code</label>
            <div class="two-factor-grid" role="group" aria-labelledby="verification-code-label">
            <input
                v-for="(digit, index) in code"
                :key="index"
                :ref="el => inputs[index] = el"
                v-model="code[index]"
                type="text"
                maxlength="1"
                class="two-factor-input"
                :id="`code-input-${index}`"
                :aria-label="`Digit ${index + 1} of verification code`"
                @input="handleInput(index, $event)"
                @keydown="handleKeydown(index, $event)"
                @paste="handlePaste"
            />
            </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading || !isCodeComplete">
            {{ loading ? 'Verifying...' : 'Verify Code' }}
        </button>
        </form>

        <div class="auth-link">
        <router-link to="/2fa-setup">Back to setup</router-link>
        </div>
    </div>
    </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
    name: 'TwoFactorVerify',
    setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const code = ref(['', '', '', '', '', ''])
    const inputs = ref([])
    const success = ref(false)

    const isCodeComplete = computed(() => {
        return code.value.every(digit => digit !== '')
    })

    const handleInput = async (index, event) => {
        const value = event.target.value
        
        if (value && index < 5) {
        await nextTick()
        inputs.value[index + 1]?.focus()
        }
    }

    const handleKeydown = async (index, event) => {
        if (event.key === 'Backspace' && !code.value[index] && index > 0) {
        await nextTick()
        inputs.value[index - 1]?.focus()
        }
    }

    const handlePaste = (event) => {
        event.preventDefault()
        const pastedData = event.clipboardData.getData('text').slice(0, 6)
        
        for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) {
            code.value[i] = pastedData[i]
        }
        }
    }

    const handleVerify = async () => {
        const verificationCode = code.value.join('')
        const result = await authStore.verifyTwoFactor(verificationCode)
        
        if (result.success) {
        success.value = true
        setTimeout(() => {
            router.push('/profile-setup')
        }, 2000)
        }
    }

    return {
        code,
        inputs,
        success,
        isCodeComplete,
        handleInput,
        handleKeydown,
        handlePaste,
        handleVerify,
        loading: authStore.loading,
        error: authStore.error
    }
    }
}
</script>