<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { authState } from '../stores/auth.js';
import api from '../services/api.js';

const route   = useRoute();
const user    = ref(null);
const loading = ref(true);
const error   = ref('');

// authState.user may have _id (raw Mongo) or id (toJSON virtual) — handle both
const currentUserId = computed(() =>
    authState.user?._id ?? authState.user?.id ?? null
);

const isOwner = computed(() =>
    currentUserId.value !== null &&
    String(currentUserId.value) === String(route.params.id)
);

onMounted(async () => {
    try {
        const res = await api.get(`/api/v1/user/${route.params.id}`);
        user.value = res.data.data.user;
    } catch (err) {
        const status = err.response?.status;
        const msg    = err.response?.data?.message;

        if (status === 401) {
            error.value = 'You must be logged in to view this profile.';
        } else if (status === 403) {
            error.value = "You don't have permission to view this profile.";
        } else if (status === 404) {
            error.value = 'User not found.';
        } else {
            error.value = msg ?? `Request failed (${status ?? 'network error'}).`;
        }
    } finally {
        loading.value = false;
    }
});

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

const initials = computed(() => {
    if (!user.value?.name) return '?';
    return user.value.name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');
});
</script>

<template>
    <div class="page">

        <!-- Loading -->
        <div v-if="loading" class="skeleton-wrap">
            <div class="sk-avatar" />
            <div class="sk-info">
                <div class="sk sk--name" />
                <div class="sk sk--email" />
                <div class="sk sk--role" />
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="error-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{{ error }}</p>
            <router-link to="/tasks" class="btn btn--ghost">Back to tasks</router-link>
        </div>

        <!-- Profile card -->
        <div v-else-if="user" class="profile-card">

            <div class="profile-header">
                <div class="avatar" :class="user.role === 'admin' ? 'avatar--admin' : ''">
                    {{ initials }}
                </div>

                <div class="profile-info">
                    <div class="profile-name-row">
                        <h1 class="profile-name">{{ user.name }}</h1>
                        <span class="role-badge" :class="user.role === 'admin' ? 'role-badge--admin' : 'role-badge--user'">
                            {{ user.role }}
                        </span>
                    </div>
                    <p class="profile-email">{{ user.email }}</p>
                    <p class="profile-since">Member since {{ formatDate(user.createdAt) }}</p>
                </div>

                <button v-if="isOwner" class="edit-btn" disabled title="Edit profile (coming soon)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Profile
                </button>
            </div>

            <div class="divider" />

            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Full name</span>
                    <span class="detail-value">{{ user.name }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email address</span>
                    <span class="detail-value">{{ user.email }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Account role</span>
                    <span class="detail-value">{{ user.role }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Member since</span>
                    <span class="detail-value">{{ formatDate(user.createdAt) }}</span>
                </div>
                <div class="detail-item" v-if="user.updatedAt">
                    <span class="detail-label">Last updated</span>
                    <span class="detail-value">{{ formatDate(user.updatedAt) }}</span>
                </div>
            </div>

            <div class="actions" v-if="isOwner">
                <router-link to="/tasks" class="action-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <path d="M8 12l3 3 5-5"/>
                    </svg>
                    My Tasks
                </router-link>
                <router-link to="/dashboard" class="action-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    Dashboard
                </router-link>
            </div>

        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Manrope:wght@400;500;600&display=swap');

.page {
    --bg:        #080c18;
    --surface:   #111827;
    --surface-2: #1a2235;
    --border:    rgba(255,255,255,.07);
    --amber:     #f59e0b;
    --indigo:    #6366f1;
    --text-1:    #eef1f8;
    --text-2:    #7c8aa0;
    --text-3:    #404e63;
    --danger:    #ef4444;
    --r:         18px;
    --r-sm:      10px;

    min-height: 100vh;
    background: var(--bg);
    background-image:
        radial-gradient(ellipse 55% 40% at 85% 5%, rgba(99,102,241,.08) 0%, transparent 55%),
        radial-gradient(ellipse 40% 30% at 10% 90%, rgba(245,158,11,.05) 0%, transparent 55%);
    padding: 48px 32px 80px;
    font-family: 'Manrope', system-ui, sans-serif;
    color: var(--text-1);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.skeleton-wrap {
    display: flex; gap: 24px; align-items: flex-start;
    max-width: 600px; width: 100%; margin-top: 20px;
}

.sk-avatar {
    width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(90deg, var(--surface-2) 25%, #1e2b40 50%, var(--surface-2) 75%);
    background-size: 200% 100%; animation: shimmer 1.6s infinite;
}

.sk-info { flex: 1; display: flex; flex-direction: column; gap: 10px; padding-top: 8px; }

.sk {
    border-radius: 8px;
    background: linear-gradient(90deg, var(--surface-2) 25%, #1e2b40 50%, var(--surface-2) 75%);
    background-size: 200% 100%; animation: shimmer 1.6s infinite;
}
.sk--name  { height: 28px; width: 55%; }
.sk--email { height: 16px; width: 70%; }
.sk--role  { height: 14px; width: 25%; }
@keyframes shimmer { to { background-position: -200% 0; } }

.error-state {
    display: flex; flex-direction: column; align-items: center;
    gap: 14px; padding: 80px 0; color: var(--text-3);
}
.error-state p { font-size: 0.9rem; margin: 0; color: var(--text-2); }

.btn {
    display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px;
    border-radius: var(--r-sm); font-size: 0.84rem; font-weight: 700;
    font-family: 'Manrope', sans-serif; cursor: pointer; border: none;
    transition: all .15s; text-decoration: none;
}
.btn--ghost { background: transparent; border: 1px solid var(--border); color: var(--text-2); }
.btn--ghost:hover { background: rgba(255,255,255,.04); color: var(--text-1); }

.profile-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 36px 40px;
    max-width: 600px; width: 100%;
    animation: fadeUp .5s ease both; transition: border-color .2s;
}
.profile-card:hover { border-color: rgba(99,102,241,.2); }

@keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
}

.profile-header { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 28px; }

.avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, #1e2b4a, #2a3a5c);
    border: 2px solid rgba(99,102,241,.3);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800;
    color: var(--indigo); flex-shrink: 0;
    box-shadow: 0 0 24px rgba(99,102,241,.15);
}
.avatar--admin {
    background: linear-gradient(135deg, #1c1508, #2a1f06);
    border-color: rgba(245,158,11,.35); color: var(--amber);
    box-shadow: 0 0 24px rgba(245,158,11,.15);
}

.profile-info { flex: 1; min-width: 0; }

.profile-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }

.profile-name {
    font-family: 'Syne', sans-serif; font-size: 1.6rem;
    font-weight: 800; color: var(--text-1); margin: 0; letter-spacing: -.02em;
}

.role-badge {
    font-size: 0.65rem; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; padding: 3px 9px; border-radius: 99px; border: 1px solid;
}
.role-badge--user  { color: var(--indigo); border-color: rgba(99,102,241,.3);  background: rgba(99,102,241,.08); }
.role-badge--admin { color: var(--amber);  border-color: rgba(245,158,11,.3); background: rgba(245,158,11,.08); }

.profile-email { font-size: 0.85rem; color: var(--text-2); margin: 0 0 4px; }
.profile-since { font-size: 0.75rem; color: var(--text-3); margin: 0; }

.edit-btn {
    display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px;
    border-radius: var(--r-sm); border: 1px solid var(--border); background: transparent;
    color: var(--text-2); font-size: 0.78rem; font-weight: 600;
    font-family: 'Manrope', sans-serif; cursor: not-allowed; flex-shrink: 0; opacity: .45;
}

.divider { height: 1px; background: var(--border); margin-bottom: 28px; }

.detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 28px; }

.detail-item { display: flex; flex-direction: column; gap: 4px; }

.detail-label {
    font-size: 0.66rem; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; color: var(--text-3);
}

.detail-value { font-size: 0.88rem; color: var(--text-1); font-weight: 500; word-break: break-all; }

.actions {
    display: flex; gap: 10px; flex-wrap: wrap;
    padding-top: 20px; border-top: 1px solid var(--border);
}

.action-link {
    display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px;
    border-radius: var(--r-sm); border: 1px solid var(--border); background: var(--surface-2);
    color: var(--text-2); text-decoration: none; font-size: 0.8rem; font-weight: 600; transition: all .15s;
}
.action-link:hover { color: var(--text-1); border-color: rgba(99,102,241,.25); background: #1c2540; }

@media (max-width: 600px) {
    .page { padding: 28px 16px 60px; }
    .profile-card { padding: 24px 20px; }
    .profile-header { flex-direction: column; }
    .edit-btn { align-self: flex-start; }
    .detail-grid { grid-template-columns: 1fr; }
    .profile-name { font-size: 1.4rem; }
}
</style>
