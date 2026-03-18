import { createRouter, createWebHistory } from "vue-router";
import { authState, restoreAuth } from "../stores/auth.js";

// Lazy-load all views — only auth pages are eager since they're the entry point
import LoginView    from "../views/LoginView.vue";
import SignupView   from "../views/SignupView.vue";

const routes = [
    // ── Root redirect ────────────────────────────────────────────────────────
    {
        path: "/",
        redirect: () => (authState.user ? "/tasks" : "/login"),
    },

    // ── Guest-only ───────────────────────────────────────────────────────────
    {
        path: "/login",
        name: "login",
        component: LoginView,
        meta: { guestOnly: true },
    },
    {
        path: "/signup",
        name: "signup",
        component: SignupView,
        meta: { guestOnly: true },
    },

    // ── Auth-required ────────────────────────────────────────────────────────
    {
        path: "/tasks",
        name: "tasks",
        component: () => import("../views/TasksView.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/tasks/:id",
        name: "task-detail",
        component: () => import("../views/TaskDetailsView.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("../views/DashboardView.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/users/:id",
        name: "user-profile",
        component: () => import("../views/UserProfileView.vue"),
        meta: { requiresAuth: true },
    },

    // ── Admin-only ───────────────────────────────────────────────────────────
    {
        path: "/admin",
        name: "admin",
        component: () => import("../views/Admin.vue"),
        meta: { requiresAuth: true, requiresRole: "admin" },
    },

    // ── Catch-all ────────────────────────────────────────────────────────────
    {
        path: "/:pathMatch(.*)*",
        redirect: "/",
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    // Scroll to top on every navigation
    scrollBehavior: () => ({ top: 0, behavior: "smooth" }),
});

// ── Navigation guard ─────────────────────────────────────────────────────────
router.beforeEach((to, from, next) => {
    // Ensure localStorage has been read before we make auth decisions.
    // restoreAuth() is idempotent — safe to call multiple times.
    if (!authState.initialized) {
        restoreAuth();
    }

    const user = authState.user;

    // Redirect logged-in users away from guest-only pages
    if (to.meta.guestOnly && user) {
        return next({ name: "tasks" });
    }

    // Redirect unauthenticated users to login, preserving intended destination
    if (to.meta.requiresAuth && !user) {
        return next({ name: "login", query: { redirect: to.fullPath } });
    }

    // Redirect users who lack the required role
    if (to.meta.requiresRole && (!user || user.role !== to.meta.requiresRole)) {
        return next({ name: "tasks" });
    }

    next();
});

export default router;
