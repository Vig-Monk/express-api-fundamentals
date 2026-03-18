<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api.js';

const loading   = ref(true);
const error     = ref('');

const taskStats     = ref([]);   // [{_id: true/false, totalTasks: N}]
const perUser       = ref([]);   // [{userId, totalTasks, user: {...}}]
const perDay        = ref([]);   // [{date, totalTasks}]

onMounted(async () => {
    try {
        const [statsRes, perUserRes, perDayRes] = await Promise.all([
            api.get('/api/v1/tasks/stats'),
            api.get('/api/v1/tasks/stats/tasks-per-user'),
            api.get('/api/v1/tasks/stats/tasks-per-day'),
        ]);
        taskStats.value = statsRes.data.data.stats;
        perUser.value   = perUserRes.data.data.stats;
        perDay.value    = perDayRes.data.data.stats;
    } catch {
        error.value = 'Failed to load admin stats. Make sure you have admin access.';
    } finally {
        loading.value = false;
    }
});

// Derive completed / pending counts from taskStats
const completedCount = computed(() =>
    taskStats.value.find(s => s._id === true)?.totalTasks ?? 0
);
const pendingCount = computed(() =>
    taskStats.value.find(s => s._id === false)?.totalTasks ?? 0
);
const totalCount = computed(() => completedCount.value + pendingCount.value);

// Total users with tasks
const userCount = computed(() => perUser.value.length);

// Most productive user
const topUser = computed(() =>
    [...perUser.value].sort((a, b) => b.totalTasks - a.totalTasks)[0] ?? null
);

// Format date for per-day list
const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Bar chart: max tasks in a day
const maxPerDay = computed(() =>
    Math.max(...perDay.value.map(d => d.totalTasks), 1)
);
</script>

<template>
    <div class="page">

        <!-- Header -->
        <header class="page-header">
            <div>
                <span class="eyebrow">Admin</span>
                <h1 class="page-title">Control Panel</h1>
            </div>
            <span class="admin-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                </svg>
                admin
            </span>
        </header>

        <!-- Error -->
        <div v-if="error" class="error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
        </div>

        <!-- Bento grid -->
        <div class="bento" v-if="!error">

            <!-- Tile: Total tasks (30 days) -->
            <div class="tile tile--stat" style="animation-delay:.05s">
                <span class="tile-label">Total (30d)</span>
                <div v-if="loading" class="sk sk--num" />
                <span v-else class="tile-number">{{ totalCount }}</span>
                <span class="tile-sub">tasks created</span>
            </div>

            <!-- Tile: Completed -->
            <div class="tile tile--stat tile--amber" style="animation-delay:.1s">
                <span class="tile-label">Completed</span>
                <div v-if="loading" class="sk sk--num" />
                <span v-else class="tile-number">{{ completedCount }}</span>
                <span class="tile-sub">done</span>
            </div>

            <!-- Tile: Pending -->
            <div class="tile tile--stat" style="animation-delay:.15s">
                <span class="tile-label">Pending</span>
                <div v-if="loading" class="sk sk--num" />
                <span v-else class="tile-number">{{ pendingCount }}</span>
                <span class="tile-sub">remaining</span>
            </div>

            <!-- Tile: Active users -->
            <div class="tile tile--stat tile--indigo" style="animation-delay:.2s">
                <span class="tile-label">Users</span>
                <div v-if="loading" class="sk sk--num" />
                <span v-else class="tile-number">{{ userCount }}</span>
                <span class="tile-sub">with tasks</span>
            </div>

            <!-- Tile: Tasks per day bar chart -->
            <div class="tile tile--chart" style="animation-delay:.25s">
                <div class="tile-head">
                    <span class="tile-label">Tasks created per day</span>
                </div>

                <div v-if="loading" class="sk-bars">
                    <div v-for="n in 10" :key="n" class="sk-bar" :style="`height:${20 + n*5}px; animation-delay:${n*.04}s`" />
                </div>

                <div v-else-if="perDay.length === 0" class="empty">
                    <p>No data available</p>
                </div>

                <div v-else class="bar-chart">
                    <div
                        v-for="(day, i) in perDay.slice(-14)"
                        :key="i"
                        class="bar-col"
                        :title="`${formatDate(day.date)}: ${day.totalTasks} task${day.totalTasks !== 1 ? 's' : ''}`"
                    >
                        <span class="bar-count">{{ day.totalTasks }}</span>
                        <div
                            class="bar"
                            :style="`height: ${Math.max(6, (day.totalTasks / maxPerDay) * 100)}px`"
                        />
                        <span class="bar-label">{{ new Date(day.date).getDate() }}</span>
                    </div>
                </div>
            </div>

            <!-- Tile: Top user -->
            <div class="tile tile--top-user" style="animation-delay:.3s">
                <span class="tile-label">Top contributor</span>

                <div v-if="loading">
                    <div class="sk sk--name" />
                    <div class="sk sk--email" style="margin-top:8px" />
                </div>

                <div v-else-if="!topUser" class="empty"><p>No users yet</p></div>

                <div v-else class="top-user-body">
                    <div class="top-user-avatar">
                        {{ topUser.user?.name?.[0]?.toUpperCase() ?? '?' }}
                    </div>
                    <div class="top-user-info">
                        <span class="top-user-name">{{ topUser.user?.name ?? 'Unknown' }}</span>
                        <span class="top-user-email">{{ topUser.user?.email ?? '—' }}</span>
                    </div>
                    <div class="top-user-count">
                        <span class="top-count-num">{{ topUser.totalTasks }}</span>
                        <span class="top-count-label">tasks</span>
                    </div>
                </div>
            </div>

            <!-- Tile: Users leaderboard -->
            <div class="tile tile--leaderboard" style="animation-delay:.35s">
                <span class="tile-label">User leaderboard</span>

                <div v-if="loading" class="sk-list">
                    <div v-for="n in 5" :key="n" class="sk sk--row" :style="`animation-delay:${n*.05}s`" />
                </div>

                <div v-else-if="perUser.length === 0" class="empty"><p>No users with tasks</p></div>

                <ol v-else class="leaderboard">
                    <li
                        v-for="(entry, i) in [...perUser].sort((a,b) => b.totalTasks - a.totalTasks).slice(0, 8)"
                        :key="entry.userId"
                        class="lb-item"
                        :class="{ 'lb-item--gold': i === 0 }"
                        :style="`animation-delay:${.35 + i * .05}s`"
                    >
                        <span class="lb-rank">{{ i + 1 }}</span>
                        <div class="lb-user">
                            <span class="lb-name">{{ entry.user?.name ?? 'Unknown' }}</span>
                            <span class="lb-email">{{ entry.user?.email ?? '—' }}</span>
                        </div>
                        <div class="lb-bar-wrap">
                            <div
                                class="lb-bar"
                                :style="`width: ${Math.round((entry.totalTasks / (topUser?.totalTasks || 1)) * 100)}%`"
                            />
                        </div>
                        <span class="lb-count">{{ entry.totalTasks }}</span>
                    </li>
                </ol>
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
    --gold:      #fbbf24;
    --text-1:    #eef1f8;
    --text-2:    #7c8aa0;
    --text-3:    #404e63;
    --danger:    #ef4444;
    --r:         18px;
    --r-sm:      10px;

    min-height: 100vh;
    background: var(--bg);
    background-image:
        radial-gradient(ellipse 65% 45% at 80% -5%, rgba(99,102,241,.1) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 5% 95%, rgba(245,158,11,.05) 0%, transparent 55%);
    padding: 48px 32px 80px;
    font-family: 'Manrope', system-ui, sans-serif;
    color: var(--text-1);
    box-sizing: border-box;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 36px;
    animation: fadeUp .45s ease both;
}

.eyebrow {
    display: block;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--indigo);
    margin-bottom: 5px;
}

.page-title {
    font-family: 'Syne', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-1);
    margin: 0;
    letter-spacing: -.025em;
    line-height: 1;
}

.admin-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--indigo);
    border: 1px solid rgba(99,102,241,.3);
    background: rgba(99,102,241,.08);
    padding: 6px 12px;
    border-radius: 99px;
}

/* ── Error banner ──────────────────────────────────────────────────────────── */
.error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    background: rgba(239,68,68,.07);
    border: 1px solid rgba(239,68,68,.2);
    border-radius: var(--r-sm);
    color: var(--danger);
    font-size: 0.85rem;
    margin-bottom: 24px;
    animation: fadeUp .4s ease both;
}

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
    content:''; position:absolute; inset:0; border-radius:inherit;
    background: radial-gradient(ellipse 80% 60% at 0% 0%, rgba(99,102,241,.05), transparent 70%);
    opacity:0; transition:opacity .3s; pointer-events:none;
}
.tile:hover { border-color:rgba(99,102,241,.2); box-shadow:0 12px 40px rgba(0,0,0,.4); transform:translateY(-3px); }
.tile:hover::after { opacity:1; }

@keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
}

/* ── Stat tiles ────────────────────────────────────────────────────────────── */
.tile--stat { grid-column: span 1; display: flex; flex-direction: column; gap: 4px; }

.tile--amber {
    background: linear-gradient(145deg, #1c1508, #221b09);
    border-color: rgba(245,158,11,.18);
}
.tile--amber .tile-number { color: var(--amber); }
.tile--amber::after { background: radial-gradient(ellipse 80% 60% at 0% 0%, rgba(245,158,11,.06), transparent 70%); }
.tile--amber:hover { border-color: rgba(245,158,11,.3); }

.tile--indigo {
    background: linear-gradient(145deg, #0e0e1e, #13133a);
    border-color: rgba(99,102,241,.18);
}
.tile--indigo .tile-number { color: var(--indigo); }
.tile--indigo:hover { border-color: rgba(99,102,241,.35); }

.tile-label {
    font-size: 0.67rem; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; color: var(--text-2); margin-bottom: 2px;
}

.tile-number {
    font-family: 'Syne', sans-serif; font-size: 2.8rem;
    font-weight: 800; color: var(--text-1); line-height: 1; letter-spacing: -.03em;
}

.tile-sub { font-size: 0.73rem; color: var(--text-3); }

/* ── Chart tile ────────────────────────────────────────────────────────────── */
.tile--chart { grid-column: span 4; display: flex; flex-direction: column; gap: 16px; }

.tile-head { display: flex; justify-content: space-between; align-items: center; }

.sk { border-radius: 8px; background: linear-gradient(90deg, var(--surface-2) 25%, #1e2b40 50%, var(--surface-2) 75%); background-size: 200% 100%; animation: shimmer 1.6s infinite; }
.sk--num   { height: 42px; width: 56px; }
.sk--name  { height: 18px; width: 50%; }
.sk--email { height: 14px; width: 65%; }
.sk--row   { height: 42px; }
@keyframes shimmer { to { background-position: -200% 0; } }

.sk-bars { display: flex; align-items: flex-end; gap: 6px; height: 100px; }
.sk-bar  { flex: 1; border-radius: 4px; background: linear-gradient(90deg, var(--surface-2) 25%, #1e2b40 50%, var(--surface-2) 75%); background-size: 200% 100%; animation: shimmer 1.6s infinite; }

.empty { padding: 24px 0; color: var(--text-3); }
.empty p { font-size: 0.82rem; margin: 0; }

.bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    height: 120px;
}

.bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: default;
}

.bar-count {
    font-size: 0.62rem;
    color: var(--text-3);
    line-height: 1;
}

.bar {
    width: 100%;
    background: linear-gradient(180deg, var(--indigo), #4f46e5);
    border-radius: 4px 4px 0 0;
    transition: height .6s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 0 12px rgba(99,102,241,.3);
    min-height: 6px;
}

.bar-col:hover .bar {
    background: linear-gradient(180deg, #818cf8, var(--indigo));
    box-shadow: 0 0 20px rgba(99,102,241,.5);
}

.bar-label {
    font-size: 0.62rem;
    color: var(--text-3);
    line-height: 1;
}

/* ── Top user tile ─────────────────────────────────────────────────────────── */
.tile--top-user { grid-column: span 2; display: flex; flex-direction: column; gap: 16px; }

.top-user-body {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: var(--surface-2);
    border: 1px solid rgba(245,158,11,.12);
    border-radius: var(--r-sm);
}

.top-user-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, #1c1508, #2a1f06);
    border: 1.5px solid rgba(245,158,11,.35);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800;
    color: var(--amber); flex-shrink: 0;
}

.top-user-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }

.top-user-name {
    font-size: 0.9rem; font-weight: 700; color: var(--text-1);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.top-user-email { font-size: 0.75rem; color: var(--text-2); }

.top-user-count { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }

.top-count-num {
    font-family: 'Syne', sans-serif; font-size: 1.6rem;
    font-weight: 800; color: var(--amber); line-height: 1;
}

.top-count-label { font-size: 0.65rem; color: var(--text-3); text-transform: uppercase; letter-spacing: .1em; }

/* ── Leaderboard tile ──────────────────────────────────────────────────────── */
.tile--leaderboard { grid-column: span 2; display: flex; flex-direction: column; gap: 12px; }

.sk-list { display: flex; flex-direction: column; gap: 6px; }

.leaderboard { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }

.lb-item {
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
.lb-item:hover { border-color: rgba(99,102,241,.15); }
.lb-item--gold { border-color: rgba(245,158,11,.2); background: rgba(245,158,11,.04); }

.lb-rank {
    font-family: 'Syne', sans-serif;
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--text-3);
    width: 18px;
    text-align: center;
    flex-shrink: 0;
}
.lb-item--gold .lb-rank { color: var(--gold); }

.lb-user { display: flex; flex-direction: column; gap: 1px; min-width: 0; width: 130px; flex-shrink: 0; }

.lb-name {
    font-size: 0.8rem; font-weight: 600; color: var(--text-1);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.lb-email {
    font-size: 0.68rem; color: var(--text-3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.lb-bar-wrap {
    flex: 1;
    height: 5px;
    background: rgba(255,255,255,.05);
    border-radius: 99px;
    overflow: hidden;
}

.lb-bar {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5, var(--indigo), #818cf8);
    border-radius: 99px;
    transition: width .7s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 0 8px rgba(99,102,241,.4);
}
.lb-item--gold .lb-bar {
    background: linear-gradient(90deg, #d97706, var(--amber), var(--gold));
    box-shadow: 0 0 8px rgba(245,158,11,.4);
}

.lb-count {
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--text-2);
    flex-shrink: 0;
    width: 28px;
    text-align: right;
}

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
    .bento { grid-template-columns: repeat(2, 1fr); }
    .tile--stat { grid-column: span 1; }
    .tile--chart { grid-column: span 2; }
    .tile--top-user { grid-column: span 2; }
    .tile--leaderboard { grid-column: span 2; }
}

@media (max-width: 600px) {
    .page { padding: 28px 16px 60px; }
    .page-title { font-size: 2rem; }
    .bento { grid-template-columns: 1fr; }
    .tile { grid-column: span 1 !important; }
    .bar-chart { height: 80px; }
}
</style>
