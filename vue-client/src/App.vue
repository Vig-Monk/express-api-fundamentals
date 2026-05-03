<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authState, logout } from "./stores/auth.js";

const router   = useRouter();
const route    = useRoute();
const menuOpen = ref(false);

const profilePath = computed(() => {
    const id = authState.user?._id ?? authState.user?.id;
    return id ? `/users/${id}` : "/";
});

const handleLogout = () => {
    menuOpen.value = false;
    logout();
    router.push("/login");
};

const closeMenu = () => { menuOpen.value = false; };
</script>

<template>
    <!-- Nav only shows when logged in -->
    <nav v-if="authState.user" class="nav">
        <div class="nav-inner">

            <!-- Brand -->
            <router-link to="/tasks" class="nav-brand" @click="closeMenu">
                <span class="brand-dot" />
                <span class="brand-name">Tasky</span>
            </router-link>

            <!-- Desktop links -->
            <div class="nav-links">
                <router-link to="/tasks" class="nav-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <path d="M8 12l3 3 5-5"/>
                    </svg>
                    Tasks
                </router-link>

                <router-link to="/dashboard" class="nav-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    Dashboard
                </router-link>

                <router-link
                    v-if="authState.user?.role === 'admin'"
                    to="/admin"
                    class="nav-link nav-link--admin"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                    </svg>
                    Admin
                </router-link>
            </div>

            <!-- Desktop right side -->
            <div class="nav-right">
                <!-- Profile pill -->
                <router-link :to="profilePath" class="profile-pill">
                    <span class="profile-avatar">
                        {{ authState.user?.name?.[0]?.toUpperCase() ?? '?' }}
                    </span>
                    <span class="profile-name">{{ authState.user?.name?.split(' ')[0] }}</span>
                </router-link>

                <!-- Logout -->
                <button class="logout-btn" @click="handleLogout" title="Log out">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span class="logout-label">Logout</span>
                </button>
            </div>

            <!-- Mobile hamburger -->
            <button
                class="hamburger"
                @click="menuOpen = !menuOpen"
                :aria-expanded="menuOpen"
                aria-label="Toggle menu"
            >
                <span class="ham-line" :class="{ 'ham-line--open-1': menuOpen }" />
                <span class="ham-line" :class="{ 'ham-line--open-2': menuOpen }" />
                <span class="ham-line" :class="{ 'ham-line--open-3': menuOpen }" />
            </button>

        </div>

        <!-- Mobile drawer -->
        <div class="mobile-menu" :class="{ 'mobile-menu--open': menuOpen }">
            <router-link to="/tasks"     class="mobile-link" @click="closeMenu">Tasks</router-link>
            <router-link to="/dashboard" class="mobile-link" @click="closeMenu">Dashboard</router-link>
            <router-link
                v-if="authState.user?.role === 'admin'"
                to="/admin"
                class="mobile-link mobile-link--admin"
                @click="closeMenu"
            >
                Admin
            </router-link>
            <router-link :to="profilePath" class="mobile-link" @click="closeMenu">Profile</router-link>
            <div class="mobile-divider" />
            <button class="mobile-logout" @click="handleLogout">Log out</button>
        </div>
    </nav>

    <!-- Page content -->
    <router-view />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@500;600&display=swap');

/* ── Tokens ───────────────────────────────────────────────────────────────── */
.nav {
    --nav-bg:     #0d1120;
    --border:     rgba(255,255,255,.07);
    --amber:      #f59e0b;
    --indigo:     #6366f1;
    --text-1:     #eef1f8;
    --text-2:     #7c8aa0;
    --text-3:     #404e63;
    --danger:     #ef4444;
    --h:          56px;

    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--nav-bg);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    font-family: 'Manrope', system-ui, sans-serif;
}

/* ── Inner row ────────────────────────────────────────────────────────────── */
.nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    height: var(--h);
    display: flex;
    align-items: center;
    gap: 8px;
}

/* ── Brand ────────────────────────────────────────────────────────────────── */
.nav-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    margin-right: 16px;
    flex-shrink: 0;
}

.brand-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--amber);
    box-shadow: 0 0 10px var(--amber);
    animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.4; transform:scale(.6); }
}

.brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-1);
    letter-spacing: -.02em;
}

/* ── Desktop nav links ────────────────────────────────────────────────────── */
.nav-links {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1;
}

.nav-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-2);
    text-decoration: none;
    transition: color .15s, background .15s;
    white-space: nowrap;
}

.nav-link:hover {
    color: var(--text-1);
    background: rgba(255,255,255,.05);
}

.nav-link.router-link-active {
    color: var(--text-1);
    background: rgba(245,158,11,.08);
}

/* Amber dot on active link */
.nav-link.router-link-active::after {
    content: '';
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--amber);
    margin-left: 2px;
}

.nav-link--admin { color: var(--text-3); }
.nav-link--admin:hover { color: var(--indigo); background: rgba(99,102,241,.07); }
.nav-link--admin.router-link-active {
    color: var(--indigo);
    background: rgba(99,102,241,.08);
}
.nav-link--admin.router-link-active::after { background: var(--indigo); }

/* ── Right side ───────────────────────────────────────────────────────────── */
.nav-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

/* ── Profile pill ─────────────────────────────────────────────────────────── */
.profile-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px 4px 4px;
    border-radius: 99px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,.03);
    text-decoration: none;
    transition: border-color .15s, background .15s;
}

.profile-pill:hover {
    border-color: rgba(245,158,11,.2);
    background: rgba(245,158,11,.04);
}

.profile-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1c1508, #2a1f06);
    border: 1px solid rgba(245,158,11,.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--amber);
    flex-shrink: 0;
}

.profile-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-2);
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ── Logout button ────────────────────────────────────────────────────────── */
.logout-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-3);
    font-size: 0.8rem;
    font-weight: 600;
    font-family: 'Manrope', sans-serif;
    cursor: pointer;
    transition: color .15s, border-color .15s, background .15s;
}

.logout-btn:hover {
    color: var(--danger);
    border-color: rgba(239,68,68,.25);
    background: rgba(239,68,68,.05);
}

/* ── Hamburger (hidden on desktop) ───────────────────────────────────────── */
.hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 36px;
    height: 36px;
    padding: 0 6px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    margin-left: auto;
    transition: background .15s;
}
.hamburger:hover { background: rgba(255,255,255,.05); }

.ham-line {
    display: block;
    height: 1.5px;
    background: var(--text-2);
    border-radius: 2px;
    transition: transform .25s ease, opacity .2s ease;
    transform-origin: center;
}

.ham-line--open-1 { transform: translateY(6.5px) rotate(45deg); }
.ham-line--open-2 { opacity: 0; transform: scaleX(0); }
.ham-line--open-3 { transform: translateY(-6.5px) rotate(-45deg); }

/* ── Mobile drawer ────────────────────────────────────────────────────────── */
.mobile-menu {
    display: none;
    flex-direction: column;
    padding: 8px 16px 16px;
    border-top: 1px solid var(--border);
    background: var(--nav-bg);
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height .3s ease, opacity .25s ease, padding .3s ease;
}

.mobile-menu--open {
    max-height: 400px;
    opacity: 1;
}

.mobile-link {
    display: block;
    padding: 11px 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-2);
    text-decoration: none;
    transition: color .15s, background .15s;
}
.mobile-link:hover             { color: var(--text-1); background: rgba(255,255,255,.04); }
.mobile-link.router-link-active { color: var(--amber); }
.mobile-link--admin:hover       { color: var(--indigo); }
.mobile-link--admin.router-link-active { color: var(--indigo); }

.mobile-divider {
    height: 1px;
    background: var(--border);
    margin: 8px 0;
}

.mobile-logout {
    padding: 11px 12px;
    border-radius: 8px;
    border: none;
    background: transparent;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: 'Manrope', sans-serif;
    color: var(--danger);
    text-align: left;
    cursor: pointer;
    transition: background .15s;
}
.mobile-logout:hover { background: rgba(239,68,68,.07); }

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
    .nav-links,
    .nav-right { display: none; }

    .hamburger { display: flex; }

    .mobile-menu { display: flex; }
}

@media (max-width: 480px) {
    .nav-inner { padding: 0 16px; }
}
</style>
