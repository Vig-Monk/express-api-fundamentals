<script setup>
import { ref, onMounted, computed } from 'vue';
import { authState } from '../stores/auth.js';
import taskService from '../services/task.service.js';

const tasks = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const res = await taskService.getMyTasks();
        tasks.value = res.data.data.tasks;
    } finally {
        loading.value = false;
    }
});

const total     = computed(() => tasks.value.length);
const done      = computed(() => tasks.value.filter(t => t.completed).length);
const pending   = computed(() => total.value - done.value);
const pct       = computed(() =>
    total.value === 0 ? 0 : Math.round((done.value / total.value) * 100)
);

// Recent 5 tasks (newest first)
const recent = computed(() =>
    [...tasks.value]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
);

const greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
});

const firstName = computed(() =>
    authState.user?.name?.split(' ')[0] ?? 'there'
);

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
</script>

<template>
    <div class="page">

        <!-- Hero greeting -->
        <header class="hero" :class="{ 'hero--loaded': !loading }">
            <div class="hero__left">
                <span class="eyebrow">Dashboard</span>
                <h1 class="hero-title">
                    {{ greeting }},<br>
                    <span class="hero-name">{{ firstName }}.</span>
                </h1>
                <p class="hero-sub" v-if="!loading">
                    You have
                    <strong class="highlight">{{ pending }} task{{ pending !== 1 ? 's' : '' }}</strong>
                    left to complete.
                </p>
                <div class="sk sk--sub" v-else />
            </div>

            <!-- Circular progress ring -->
            <div class="ring-wrap">
                <svg class="ring" viewBox="0 0 120 120" width="120" height="120">
                    <circle class="ring-track" cx="60" cy="60" r="52" />
                    <circle
                        class="ring-fill"
                        cx="60" cy="60" r="52"
                        :style="{ strokeDashoffset: loading ? 327 : 327 - (327 * pct / 100) }"
                    />
                </svg>
                <div class="ring-label">
                    <span class="ring-pct">{{ loading ? '—' : pct + '%' }}</span>
                    <span class="ring-sub">done</span>
                </div>
            </div>
        </header>

        <!-- Bento grid -->
        <div class="bento">

            <!-- Stat: Total -->
            <div class="tile tile--stat" style="animation-delay:.05s">
                <span class="tile-label">Total</span>
                <div v-if="loading" class="sk sk--num" />
                <span v-else class="tile-number">{{ total }}</span>
                <span class="tile-sub">tasks</span>
            </div>

            <!-- Stat: Done -->
            <div class="tile tile--stat tile--amber" style="animation-delay:.1s">
                <span class="tile-label">Done</span>
                <div v-if="loading" class="sk sk--num" />
                <span v-else class="tile-number">{{ done }}</span>
                <span class="tile-sub">completed</span>
            </div>

            <!-- Stat: Pending -->
            <div class="tile tile--stat" style="animation-delay:.15s">
                <span class="tile-label">Pending</span>
                <div v-if="loading" class="sk sk--num" />
                <span v-else class="tile-number">{{ pending }}</span>
                <span class="tile-sub">remaining</span>
            </div>

            <!-- Progress bar tile -->
            <div class="tile tile--progress" style="animation-delay:.2s">
                <div class="progress-header">
                    <span class="tile-label">Progress</span>
                    <span class="progress-pct">{{ loading ? '…' : pct + '%' }}</span>
                </div>
                <div class="progress-track">
                    <div
                        class="progress-fill"
                        :style="{ width: (loading ? 0 : pct) + '%' }"
                    />
                </div>
                <span class="tile-sub">{{ done }} of {{ total }} complete</span>
            </div>

            <!-- Recent tasks tile -->
            <div class="tile tile--recent" style="animation-delay:.25s">
                <div class="tile-head">
                    <span class="tile-label">Recent activity</span>
                    <router-link to="/tasks" class="view-all">View all →</router-link>
                </div>

                <!-- Skeletons -->
                <div v-if="loading" class="sk-list">
                    <div v-for="n in 4" :key="n" class="sk sk--row" :style="`animation-delay:${n*.06}s`" />
                </div>

                <!-- Empty -->
                <div v-else-if="recent.length === 0" class="empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <path d="M8 12l3 3 5-5"/>
                    </svg>
                    <p>No tasks yet</p>
                </div>

                <!-- List -->
                <ul v-else class="recent-list">
                    <li
                        v-for="(t, i) in recent"
                        :key="t._id"
                        class="recent-item"
                        :style="`animation-delay:${.25 + i * .06}s`"
                    >
                        <span
                            class="recent-dot"
                            :class="t.completed ? 'recent-dot--done' : 'recent-dot--pending'"
                        />
                        <div class="recent-body">
                            <router-link :to="`/tasks/${t._id}`" class="recent-title" :class="{ 'recent-title--done': t.completed }">
                                {{ t.title }}
                            </router-link>
                            <span class="recent-date">{{ formatDate(t.createdAt) }}</span>
                        </div>
                    </li>
                </ul>
            </div>

            <!-- Quick-nav tile -->
            <div class="tile tile--nav" style="animation-delay:.3s">
                <span class="tile-label">Quick links</span>
                <div class="nav-links">
                    <router-link to="/tasks" class="nav-card">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <rect x="3" y="3" width="18" height="18" rx="3"/>
                            <path d="M8 12l3 3 5-5"/>
                        </svg>
                        <span>My Tasks</span>
                    </router-link>
                    <router-link :to="`/users/${authState.user?._id || authState.user?.id}`" class="nav-card">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>Profile</span>
                    </router-link>
                    <router-link v-if="authState.user?.role === 'admin'" to="/admin" class="nav-card nav-card--admin">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                        </svg>
                        <span>Admin</span>
                    </router-link>
                </div>
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
    --green:     #22c55e;
    --text-1:    #eef1f8;
    --text-2:    #7c8aa0;
    --text-3:    #404e63;
    --r:         18px;
    --r-sm:      10px;

    min-height: 100vh;
    background: var(--bg);
    background-image:
        radial-gradient(ellipse 70% 50% at 70% -5%, rgba(245,158,11,.08) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 5% 95%, rgba(99,102,241,.05) 0%, transparent 55%);
    padding: 48px 32px 80px;
    font-family: 'Manrope', system-ui, sans-serif;
    color: var(--text-1);
    box-sizing: border-box;
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
.hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
    gap: 24px;
    animation: fadeUp .5s ease both;
}

.eyebrow {
    display: block;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--amber);
    margin-bottom: 6px;
}

.hero-title {
    font-family: 'Syne', sans-serif;
    font-size: 2.8rem;
    font-weight: 800;
    color: var(--text-1);
    margin: 0 0 10px;
    line-height: 1.1;
    letter-spacing: -.03em;
}

.hero-name { color: var(--amber); }

.hero-sub { font-size: 0.9rem; color: var(--text-2); margin: 0; }

.highlight { color: var(--text-1); font-weight: 700; }

/* ── Ring ──────────────────────────────────────────────────────────────────── */
.ring-wrap {
    position: relative;
    flex-shrink: 0;
}

.ring { transform: rotate(-90deg); }

.ring-track {
    fill: none;
    stroke: var(--surface-2);
    stroke-width: 8;
}

.ring-fill {
    fill: none;
    stroke: var(--amber);
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 327;
    stroke-dashoffset: 327;
    filter: drop-shadow(0 0 8px rgba(245,158,11,.5));
    transition: stroke-dashoffset 1s cubic-bezier(.4,0,.2,1) .3s;
}

.ring-label {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
}

.ring-pct {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--amber);
    line-height: 1;
}

.ring-sub { font-size: 0.62rem; color: var(--text-3); text-transform: uppercase; letter-spacing: .1em; }

/* ── Bento ─────────────────────────────────────────────────────────────────── */
.bento {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

/* ── Tile base ─────────────────────────────────────────────────────────────── */
.tile {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    animation: fadeUp .55s ease both;
    transition: border-color .2s, box-shadow .2s, transform .2s;
}
.tile::after {
    content:'';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(ellipse 80% 60% at 0% 0%, rgba(245,158,11,.05), transparent 70%);
    opacity: 0;
    transition: opacity .3s;
    pointer-events: none;
}
.tile:hover { border-color: rgba(245,158,11,.22); box-shadow: 0 12px 40px rgba(0,0,0,.4); transform: translateY(-3px); }
.tile:hover::after { opacity: 1; }

@keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
}

/* ── Stat tile ─────────────────────────────────────────────────────────────── */
.tile--stat { grid-column: span 1; display: flex; flex-direction: column; gap: 4px; }

.tile--amber {
    background: linear-gradient(145deg, #1c1508 0%, #221b09 100%);
    border-color: rgba(245,158,11,.18);
}
.tile--amber .tile-number { color: var(--amber); }

.tile-label {
    font-size: 0.67rem;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--text-2);
    margin-bottom: 2px;
}

.tile-number {
    font-family: 'Syne', sans-serif;
    font-size: 2.8rem;
    font-weight: 800;
    color: var(--text-1);
    line-height: 1;
    letter-spacing: -.03em;
}

.tile-sub { font-size: 0.73rem; color: var(--text-3); }

/* ── Progress tile ─────────────────────────────────────────────────────────── */
.tile--progress { grid-column: span 1; display: flex; flex-direction: column; gap: 10px; }

.progress-header { display: flex; justify-content: space-between; align-items: center; }

.progress-pct {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--amber);
}

.progress-track { height: 5px; background: var(--surface-2); border-radius: 99px; overflow: hidden; }

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #d97706, var(--amber), #fbbf24);
    border-radius: 99px;
    transition: width .8s cubic-bezier(.4,0,.2,1) .3s;
    box-shadow: 0 0 10px rgba(245,158,11,.55);
}

/* ── Recent tile ───────────────────────────────────────────────────────────── */
.tile--recent { grid-column: span 3; display: flex; flex-direction: column; gap: 14px; }

.tile-head { display: flex; justify-content: space-between; align-items: center; }

.view-all {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--amber);
    text-decoration: none;
    opacity: .7;
    transition: opacity .15s;
}
.view-all:hover { opacity: 1; }

.sk-list { display: flex; flex-direction: column; gap: 8px; }
.sk { border-radius: 8px; background: linear-gradient(90deg, var(--surface-2) 25%, #1e2b40 50%, var(--surface-2) 75%); background-size: 200% 100%; animation: shimmer 1.6s infinite; }
.sk--num  { height: 42px; width: 56px; }
.sk--row  { height: 44px; }
.sk--sub  { height: 16px; width: 200px; border-radius: 6px; }
@keyframes shimmer { to { background-position: -200% 0; } }

.empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 0; color: var(--text-3); }
.empty p { font-size: 0.82rem; margin: 0; }

.recent-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }

.recent-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: var(--r-sm);
    background: var(--surface-2);
    border: 1px solid var(--border);
    animation: fadeUp .4s ease both;
    transition: border-color .15s;
}
.recent-item:hover { border-color: rgba(245,158,11,.15); }

.recent-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.recent-dot--pending { background: var(--amber); box-shadow: 0 0 8px rgba(245,158,11,.5); }
.recent-dot--done    { background: var(--green); box-shadow: 0 0 8px rgba(34,197,94,.4); }

.recent-body { flex: 1; display: flex; justify-content: space-between; align-items: center; min-width: 0; gap: 12px; }

.recent-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-1);
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color .15s;
}
.recent-title:hover { color: var(--amber); }
.recent-title--done { text-decoration: line-through; color: var(--text-3); }

.recent-date { font-size: 0.72rem; color: var(--text-3); flex-shrink: 0; }

/* ── Nav tile ──────────────────────────────────────────────────────────────── */
.tile--nav { grid-column: span 1; display: flex; flex-direction: column; gap: 14px; }

.nav-links { display: flex; flex-direction: column; gap: 8px; }

.nav-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border-radius: var(--r-sm);
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-2);
    text-decoration: none;
    font-size: 0.83rem;
    font-weight: 600;
    transition: all .15s;
}
.nav-card:hover { color: var(--text-1); border-color: rgba(245,158,11,.2); background: #1c2540; }
.nav-card--admin:hover { color: var(--amber); }

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
    .bento { grid-template-columns: repeat(2, 1fr); }
    .tile--stat     { grid-column: span 1; }
    .tile--progress { grid-column: span 1; }
    .tile--recent   { grid-column: span 2; }
    .tile--nav      { grid-column: span 2; }
    .nav-links { flex-direction: row; flex-wrap: wrap; }
    .nav-card { flex: 1; min-width: 120px; }
}

@media (max-width: 600px) {
    .page { padding: 28px 16px 60px; }
    .hero { flex-direction: column; align-items: flex-start; }
    .hero-title { font-size: 2.2rem; }
    .bento { grid-template-columns: 1fr; }
    .tile { grid-column: span 1 !important; }
}
</style>
