<template>
    <div class="dashboard">
    <header class="dashboard-header">
        <div>
        <h1 style="font-size: 1.5rem; font-weight: 600; color: #1f2937;">
            Welcome, {{ user?.name || user?.email }}!
        </h1>
        <p style="color: #6b7280; font-size: 0.875rem;">
            Your secure dashboard
        </p>
        </div>
        <button @click="handleLogout" class="btn btn-secondary" style="width: auto; padding: 0.5rem 1rem;">
        Sign Out
        </button>
    </header>

    <main class="dashboard-content">
        <div class="profile-card">
        <div class="profile-avatar">
            {{ getInitials() }}
        </div>
        <h2 style="text-align: center; color: #1f2937; margin-bottom: 2rem;">
            Profile Information
        </h2>
        
        <div style="display: grid; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #BEE09EFF; border-radius: 8px;">
            <span style="font-weight: 500; color: #374151;">Email:</span>
            <span style="color: #6b7280;">{{ user?.email }}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f9fafb; border-radius: 8px;">
            <span style="font-weight: 500; color: #374151;">Name:</span>
            <span style="color: #6b7280;">{{ user?.name || 'Not set' }}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #DDB485FF; border-radius: 8px;">
            <span style="font-weight: 500; color: #374151;">Phone:</span>
            <span style="color: #6b7280;">{{ user?.phone || 'Not set' }}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #E0F5ABFF; border-radius: 8px;">
            <span style="font-weight: 500; color: #374151;">Company:</span>
            <span style="color: #6b7280;">{{ user?.company || 'Not set' }}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #A2C6EAFF; border-radius: 8px;">
            <span style="font-weight: 500; color: #374151;">2FA Status:</span>
            <span :style="{ color: user?.twoFactorEnabled ? '#16a34a' : '#dc2626' }">
                {{ user?.twoFactorEnabled ? '✓ Enabled' : '✗ Disabled' }}
            </span>
            </div>
        </div>
        </div>

        <div class="profile-card">
        <h3 style="color: #1f2937; margin-bottom: 1rem;">Security Features</h3>
        <div style="display: grid; gap: 1rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div>
                <h4 style="color: #374151; margin-bottom: 0.25rem;">Two-Factor Authentication</h4>
                <p style="color: #6b7280; font-size: 0.875rem;">Add an extra layer of security</p>
            </div>
            <div :style="{ color: user?.twoFactorEnabled ? '#16a34a' : '#dc2626', fontWeight: '600' }">
                {{ user?.twoFactorEnabled ? 'ON' : 'OFF' }}
            </div>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div>
                <h4 style="color: #374151; margin-bottom: 0.25rem;">Profile Complete</h4>
                <p style="color: #6b7280; font-size: 0.875rem;">All required information filled</p>
            </div>
            <div :style="{ color: user?.profileComplete ? '#16a34a' : '#dc2626', fontWeight: '600' }">
                {{ user?.profileComplete ? 'YES' : 'NO' }}
            </div>
            </div>
        </div>
        </div>

        <div class="profile-card">
        <h3 style="color: #1f2937; margin-bottom: 1rem;">Quick Actions</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <button class="btn btn-secondary" style="padding: 1rem;">
            Edit Profile
            </button>
            <button class="btn btn-secondary" style="padding: 1rem;">
            Security Settings
            </button>
            <button class="btn btn-secondary" style="padding: 1rem;">
            Account Settings
            </button>
            <button class="btn btn-secondary" style="padding: 1rem;">
            Help & Support
            </button>
        </div>
        </div>
    </main>
    </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
    name: 'Dashboard',
    setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const getInitials = () => {
        const user = authStore.user
        if (user?.firstName && user?.lastName) {
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
        }
        if (user?.name) {
        const names = user.name.split(' ')
        return names.length > 1 
            ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
            : names[0].charAt(0).toUpperCase()
        }
        return user?.email?.charAt(0).toUpperCase() || '?'
    }

const handleLogout = () => {
        authStore.logout()
        router.push('/')
}

return {
        user: authStore.user,
        getInitials,
        handleLogout
}
    }
}
</script>
