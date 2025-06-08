<template>
    <div id="app">
    <router-view />
    </div>
</template>

<script>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

export default {
    name: 'App',
    setup() {
    const authStore = useAuthStore()
    
    onMounted(() => {
        authStore.checkAuthState()
    })
    
    return {}
    }
}
</script>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

#app {
    min-height: 100vh;
}

.auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.auth-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
}

.auth-header {
    text-align: center;
    margin-bottom: 2rem;
}

.auth-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.auth-subtitle {
    color: #6b7280;
    font-size: 0.875rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
}

.form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-block;
    text-align: center;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-secondary:hover {
    background: #e5e7eb;
}

.auth-link {
    text-align: center;
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.auth-link a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
}

.auth-link a:hover {
    text-decoration: underline;
}

.error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
}

.success-message {
    background: #8CD3A2FF;
    border: 1px solid #bbf7d0;
    color: #16a34a;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
}

.loading {
    opacity: 0.6;
    pointer-events: none;
}

.dashboard {
    min-height: 100vh;
    background: #86E0D1FF;
}

.dashboard-header {
    background: rgb(188, 136, 136);
    border-bottom: 1px solid #9ADBE2FF;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dashboard-content {
    padding: 2rem;
}

.profile-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    font-weight: 600;
    margin: 0 auto 1rem;
}

.two-factor-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
    margin: 1rem 0;
}

.two-factor-input {
    width: 100%;
    height: 3rem;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    transition: border-color 0.2s;
}

.two-factor-input:focus {
    outline: none;
    border-color: #667eea;
}

.onboarding-steps {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.step {
    display: flex;
    align-items: center;
    margin: 0 1rem;
}

.step-number {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 0.5rem;
}

.step.active .step-number {
    background: #667eea;
    color: rgb(184, 198, 164);
}

.step.inactive .step-number {
    background: #6178A7FF;
    color: #6b7280;
}

@media (max-width: 640px) {
    .auth-card {
    padding: 1.5rem;
    margin: 1rem;
    }
    
    .dashboard-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    }
    
    .dashboard-content {
    padding: 1rem;
    }
}
</style>