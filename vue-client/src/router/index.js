import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import UserProfileView from "../views/UserProfileView.vue";
import DashboardView from "../views/DashboardView.vue";
const routes = [
    {
        path: "/login",
        component: LoginView
    },
    {
        path: "/dashboard",
        component: DashboardView,
        meta: { requiresAuth: true }
    },
    {
        path: "/signup",
        component: SignupView
    },
    {
        path: "/users/:id",
        component: UserProfileView
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes
});
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isLoggedIn) {
        next("/login")
    } else {
        next()
    }
})


export default router;
