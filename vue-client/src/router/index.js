import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import UserProfileView from "../views/UserProfileView.vue";
import DashboardView from "../views/DashboardView.vue";
import TasksView from "../views/TasksView.vue";
import TaskDetailsView from "../views/TaskDetailsView.vue";
import { authState } from "../stores/auth.js";

const routes = [
    {
        path: "/login",
        component: LoginView
    },
    {
    	path:'/tasks',
    	name:'tasks',
    	component: TasksView,
    	meta:{requiresAuth: true}
    }, 
    {
    	path: '/tasks/:id',
    	name: 'task-detail',
    	component:TaskDetailsView,
    	meta: {requiresAuth: true}
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
    },
    {
        path: "/admin",
        component: () => import("../views/Admin.vue"),
        meta: {
            requiresAuth: true,
            requiresRole: "admin"
        }
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes
});
router.beforeEach((to, from, next) => {
    if (!authState.initialized) {
        return next(false);
    }

    if (to.meta.requiresAuth && !authState.user) {
        return next("/login");
    }
    if (to.meta.requiresRole && useTransition.role && to.meta.requiresRole) {
        return next("/dashboard");
    }
    next();
});

export default router;
