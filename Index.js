import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "../stores/auth"

// Import components
import Welcome from "../views/Welcome.vue"
import Login from "../views/Login.vue"
import Register from "../views/Register.vue"
import TwoFactorSetup from "../views/TwoFactorSetup.vue"
import TwoFactorVerify from "../views/TwoFactorVerify.vue"
import ProfileSetup from "../views/ProfileSetup.vue"
import Dashboard from "../views/Dashboard.vue"

const routes = [
{
    path: "/",
    name: "Welcome",
    component: Welcome,
},
{
    path: "/login",
    name: "Login",
    component: Login,
},
{
    path: "/register",
    name: "Register",
    component: Register,
},
{
    path: "/2fa-setup",
    name: "TwoFactorSetup",
    component: TwoFactorSetup,
    meta: { requiresAuth: true },
},
{
    path: "/2fa-verify",
    name: "TwoFactorVerify",
    component: TwoFactorVerify,
    meta: { requiresAuth: true },
},
{
    path: "/profile-setup",
    name: "ProfileSetup",
    component: ProfileSetup,
    meta: { requiresAuth: true },
},
{
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, requiresComplete: true },
},
]

const router = createRouter({
history: createWebHistory(),
routes,
})

router.beforeEach((to, from, next) => {
const authStore = useAuthStore()

if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login")
} else if (to.meta.requiresComplete && !authStore.user?.profileComplete) {
    next("/profile-setup")
} else if (authStore.isAuthenticated && (to.name === "Login" || to.name === "Register" || to.name === "Welcome")) {
    next("/dashboard")
} else {
    next()
}
})

export default router
