<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import taskService from '../services/task.service.js';

const route = useRoute();
const router = useRouter();
const task = ref(null);
const loading = ref(true);
const error = ref('');
const editing = ref(false);
const editTitle = ref('');
const editDesc = ref('');
const saving = ref(false);
const saveError = ref('');
const deleting = ref(false);

onMounted(async () => {
    try {
        const res = await taskService.getTask(route.params.id);
        task.value = res.data.data.task;
    } catch {
        error.value = 'Task not found or you don\'t have access.';
    } finally {
        loading.value = false;
    }
});

const startEdit = () => {
    editTitle.value = task.value.title;
    editDesc.value = task.value.description ?? '';
    saveError.value = '';
    editing.value = true;
};

const cancelEdit = () => {
    editing.value = false;
    saveError.value = '';
};

const saveEdit = async () => {
    if (!editTitle.value.trim()) {
        saveError.value = 'Title cannot be empty.';
        return;
    }
    saving.value = true;
    saveError.value = '';
    try {
        await taskService.updateTask(task.value._id, {
            title: editTitle.value.trim(),
            description: editDesc.value.trim(),
        });
        task.value.title = editTitle.value.trim();
        task.value.description = editDesc.value.trim();
        editing.value = false;
    } catch {
        saveError.value = 'Failed to save changes.';
    } finally {
        saving.value = false;
    }
};

const toggleComplete = async () => {
    const original = task.value.completed;
    task.value.completed = !task.value.completed;
    try {
        await taskService.updateTask(task.value._id, { completed: task.value.completed });
    } catch {
        task.value.completed = original;
    }
};

const deleteTask = async () => {
    if (!confirm('Permanently delete this task?')) return;
    deleting.value = true;
    try {
        await taskService.deleteTask(task.value._id);
        router.push('/tasks');
    } catch {
        error.value = 'Failed to delete task.';
        deleting.value = false;
    }
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
};
</script>

<template>
    <div class="page">

        <!-- Back link -->
        <router-link to="/tasks" class="back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
            All tasks
        </router-link>

        <!-- Loading skeleton -->
        <div v-if="loading" class="skeleton-wrap">
            <div class="sk sk--title" />
            <div class="sk sk--meta" />
            <div class="sk sk--body" />
            <div class="sk sk--body sk--short" />
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{{ error }}</p>
            <router-link to="/tasks" class="btn btn--amber">Back to tasks</router-link>
        </div>

        <!-- Task card -->
        <div v-else-if="task" class="detail-card" :class="{ 'detail-card--done': task.completed }">

            <!-- Card top bar -->
            <div class="card-top">
                <span class="status-badge" :class="task.completed ? 'status-badge--done' : 'status-badge--pending'">
                    <span class="status-dot" />
                    {{ task.completed ? 'Completed' : 'Pending' }}
                </span>
                <div class="card-actions">
                    <button class="icon-btn" @click="startEdit" title="Edit" v-if="!editing">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="icon-btn icon-btn--danger" @click="deleteTask" :disabled="deleting" title="Delete">
                        <span v-if="deleting" class="spinner" />
                        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Read mode -->
            <template v-if="!editing">
                <h1 class="task-title">{{ task.title }}</h1>

                <p class="task-desc" v-if="task.description">{{ task.description }}</p>
                <p class="task-desc task-desc--empty" v-else>No description provided.</p>

                <div class="meta-row">
                    <div class="meta-item">
                        <span class="meta-label">Created</span>
                        <span class="meta-value">{{ formatDate(task.createdAt) }}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Updated</span>
                        <span class="meta-value">{{ formatDate(task.updatedAt) }}</span>
                    </div>
                </div>

                <div class="card-footer">
                    <button
                        class="btn"
                        :class="task.completed ? 'btn--ghost' : 'btn--amber'"
                        @click="toggleComplete"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline v-if="!task.completed" points="20 6 9 17 4 12"/>
                            <polyline v-else points="3 12 8 17 21 6"/>
                        </svg>
                        {{ task.completed ? 'Mark as pending' : 'Mark as complete' }}
                    </button>
                </div>
            </template>

            <!-- Edit mode -->
            <template v-else>
                <div class="edit-section">
                    <label class="field-label">Title</label>
                    <input
                        v-model="editTitle"
                        class="field-input"
                        :class="{ 'field-input--error': saveError && !editTitle.trim() }"
                        placeholder="Task title"
                        maxlength="200"
                        autocomplete="off"
                        @keydown.escape="cancelEdit"
                    />

                    <label class="field-label" style="margin-top:16px">Description</label>
                    <textarea
                        v-model="editDesc"
                        class="field-input field-textarea"
                        placeholder="Add a description… (optional)"
                        rows="5"
                        maxlength="2000"
                    />

                    <p v-if="saveError" class="field-error">{{ saveError }}</p>

                    <div class="edit-actions">
                        <button class="btn btn--ghost" @click="cancelEdit" :disabled="saving">Cancel</button>
                        <button class="btn btn--amber" @click="saveEdit" :disabled="saving">
                            <span v-if="saving" class="spinner spinner--dark" />
                            {{ saving ? 'Saving…' : 'Save changes' }}
                        </button>
                    </div>
                </div>
            </template>

        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Manrope:wght@400;500;600&display=swap');

.page {
    --bg:           #080c18;
    --surface:      #111827;
    --surface-2:    #1a2235;
    --border:       rgba(255,255,255,.07);
    --border-hover: rgba(245,158,11,.28);
    --amber:        #f59e0b;
    --text-1:       #eef1f8;
    --text-2:       #7c8aa0;
    --text-3:       #404e63;
    --danger:       #ef4444;
    --green:        #22c55e;
    --r:            18px;
    --r-sm:         10px;

    min-height: 100vh;
    background: var(--bg);
    background-image:
        radial-gradient(ellipse 60% 40% at 80% 0%, rgba(245,158,11,.07) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 10% 95%, rgba(99,102,241,.05) 0%, transparent 55%);
    padding: 40px 32px 80px;
    font-family: 'Manrope', system-ui, sans-serif;
    color: var(--text-1);
    box-sizing: border-box;
}

/* ── Back link ─────────────────────────────────────────────────────────────── */
.back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--text-2);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: .05em;
    text-transform: uppercase;
    margin-bottom: 32px;
    transition: color .15s;
}
.back-link:hover { color: var(--amber); }

/* ── Skeletons ─────────────────────────────────────────────────────────────── */
.skeleton-wrap { display: flex; flex-direction: column; gap: 14px; max-width: 700px; }
.sk {
    border-radius: 10px;
    background: linear-gradient(90deg, var(--surface-2) 25%, #1e2b40 50%, var(--surface-2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s infinite;
}
.sk--title  { height: 48px; width: 60%; }
.sk--meta   { height: 22px; width: 35%; }
.sk--body   { height: 18px; }
.sk--short  { width: 75%; }
@keyframes shimmer { to { background-position: -200% 0; } }

/* ── Error state ───────────────────────────────────────────────────────────── */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 80px 0;
    color: var(--text-3);
}
.error-state p { font-size: 0.9rem; margin: 0; }

/* ── Detail card ───────────────────────────────────────────────────────────── */
.detail-card {
    max-width: 700px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 32px 36px 36px;
    animation: fadeUp .5s ease both;
    transition: border-color .2s;
}
.detail-card:hover { border-color: var(--border-hover); }
.detail-card--done { opacity: .75; }

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Card top ──────────────────────────────────────────────────────────────── */
.card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 99px;
    border: 1px solid;
}
.status-badge--pending {
    color: var(--amber);
    border-color: rgba(245,158,11,.25);
    background: rgba(245,158,11,.06);
}
.status-badge--done {
    color: var(--green);
    border-color: rgba(34,197,94,.25);
    background: rgba(34,197,94,.06);
}
.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 2.2s ease-in-out infinite;
}
@keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:.4; transform:scale(.6); }
}

.card-actions { display: flex; gap: 6px; }

.icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s;
}
.icon-btn:hover { background: rgba(255,255,255,.04); color: var(--text-1); border-color: rgba(255,255,255,.14); }
.icon-btn--danger:hover { background: rgba(239,68,68,.08); color: var(--danger); border-color: rgba(239,68,68,.25); }
.icon-btn:disabled { opacity: .35; cursor: not-allowed; }

/* ── Task title ────────────────────────────────────────────────────────────── */
.task-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.9rem;
    font-weight: 800;
    color: var(--text-1);
    margin: 0 0 16px;
    line-height: 1.15;
    letter-spacing: -.02em;
}

/* ── Description ───────────────────────────────────────────────────────────── */
.task-desc {
    font-size: 0.9rem;
    color: var(--text-2);
    line-height: 1.7;
    margin: 0 0 28px;
    white-space: pre-wrap;
    word-break: break-word;
}
.task-desc--empty { color: var(--text-3); font-style: italic; }

/* ── Meta row ──────────────────────────────────────────────────────────────── */
.meta-row {
    display: flex;
    gap: 32px;
    margin-bottom: 28px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
}

.meta-item { display: flex; flex-direction: column; gap: 3px; }

.meta-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--text-3);
}

.meta-value {
    font-size: 0.82rem;
    color: var(--text-2);
    font-weight: 500;
}

/* ── Card footer ───────────────────────────────────────────────────────────── */
.card-footer {
    padding-top: 20px;
    border-top: 1px solid var(--border);
}

/* ── Buttons ───────────────────────────────────────────────────────────────── */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 20px;
    border-radius: var(--r-sm);
    font-size: 0.84rem;
    font-weight: 700;
    font-family: 'Manrope', sans-serif;
    cursor: pointer;
    border: none;
    transition: all .15s;
    text-decoration: none;
}
.btn:disabled { opacity: .35; cursor: not-allowed; }

.btn--amber { background: var(--amber); color: #080c18; }
.btn--amber:hover:not(:disabled) { background: #fbbf24; box-shadow: 0 0 22px rgba(245,158,11,.4); }

.btn--ghost {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-2);
}
.btn--ghost:hover:not(:disabled) { background: rgba(255,255,255,.04); color: var(--text-1); }

/* ── Edit section ──────────────────────────────────────────────────────────── */
.edit-section { display: flex; flex-direction: column; }

.field-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--text-3);
    margin-bottom: 7px;
}

.field-input {
    padding: 12px 14px;
    background: var(--surface-2);
    border: 1px solid rgba(245,158,11,.2);
    border-radius: var(--r-sm);
    font-size: 0.9rem;
    font-family: 'Manrope', sans-serif;
    color: var(--text-1);
    outline: none;
    width: 100%;
    box-sizing: border-box;
    transition: border-color .15s, box-shadow .15s;
}
.field-input::placeholder { color: var(--text-3); }
.field-input:focus {
    border-color: rgba(245,158,11,.45);
    box-shadow: 0 0 0 3px rgba(245,158,11,.07);
}
.field-input--error { border-color: var(--danger) !important; }
.field-textarea { resize: vertical; min-height: 120px; }

.field-error { font-size: 0.78rem; color: var(--danger); margin: 6px 0 0; }

.edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
}

/* ── Spinner ───────────────────────────────────────────────────────────────── */
.spinner {
    width: 12px; height: 12px;
    border: 2px solid rgba(255,255,255,.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .6s linear infinite;
}
.spinner--dark { border-color: rgba(8,12,24,.2); border-top-color: #080c18; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
    .page { padding: 24px 16px 60px; }
    .detail-card { padding: 22px 20px 26px; }
    .task-title { font-size: 1.5rem; }
    .meta-row { flex-direction: column; gap: 14px; }
}
</style>
