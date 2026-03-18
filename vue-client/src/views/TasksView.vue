
<script setup>
import { ref, onMounted, computed } from "vue";
import taskService from "../services/task.service.js";

// ── State ──────────────────────────────────────────────────────────────────────
const tasks      = ref([]);
const loading    = ref(true);
const error      = ref("");
const submitting = ref(false);

// ── Create ─────────────────────────────────────────────────────────────────────
const newTaskTitle = ref("");

// ── Edit ───────────────────────────────────────────────────────────────────────
const editingTaskId   = ref(null);
const editTitle       = ref("");
const editDescription = ref("");
const editSaving      = ref(false);
const editError       = ref("");

// ── Fetch ──────────────────────────────────────────────────────────────────────
const fetchTasks = async () => {
    loading.value = true;
    error.value = "";
    try {
        const res = await taskService.getMyTasks();
        tasks.value = res.data.data.tasks;
    } catch {
        error.value = "Failed to load tasks.";
    } finally {
        loading.value = false;
    }
};

onMounted(fetchTasks);

// ── Create task ────────────────────────────────────────────────────────────────
const createTask = async () => {
    if (!newTaskTitle.value.trim()) return;
    submitting.value = true;
    error.value = "";
    try {
        await taskService.createTask({ title: newTaskTitle.value.trim() });
        newTaskTitle.value = "";
        await fetchTasks();
    } catch {
        error.value = "Failed to create task.";
    } finally {
        submitting.value = false;
    }
};

// ── Edit handlers ──────────────────────────────────────────────────────────────
const startEdit = (task) => {
    editingTaskId.value   = task._id;
    editTitle.value       = task.title;
    editDescription.value = task.description ?? "";
    editError.value       = "";
};

const cancelEdit = () => {
    editingTaskId.value   = null;
    editTitle.value       = "";
    editDescription.value = "";
    editError.value       = "";
};

const saveEdit = async () => {
    if (!editTitle.value.trim()) {
        editError.value = "Title cannot be empty.";
        return;
    }
    editSaving.value = true;
    editError.value  = "";
    try {
        await taskService.updateTask(editingTaskId.value, {
            title:       editTitle.value.trim(),
            description: editDescription.value.trim(),
        });
        const task = tasks.value.find(t => t._id === editingTaskId.value);
        if (task) {
            task.title       = editTitle.value.trim();
            task.description = editDescription.value.trim();
        }
        cancelEdit();
    } catch {
        editError.value = "Failed to save changes.";
    } finally {
        editSaving.value = false;
    }
};

// ── Toggle complete ────────────────────────────────────────────────────────────
const toggleComplete = async (task) => {
    const original = task.completed;
    task.completed = !task.completed;
    try {
        await taskService.updateTask(task._id, { completed: task.completed });
    } catch {
        task.completed = original;
    }
};

// ── Delete ─────────────────────────────────────────────────────────────────────
const deleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
        await taskService.deleteTask(taskId);
        tasks.value = tasks.value.filter(t => t._id !== taskId);
    } catch {
        error.value = "Failed to delete task.";
    }
};

// ── Stats ──────────────────────────────────────────────────────────────────────
const totalCount     = computed(() => tasks.value.length);
const completedCount = computed(() => tasks.value.filter(t => t.completed).length);
const pendingCount   = computed(() => tasks.value.filter(t => !t.completed).length);
const progressPct    = computed(() =>
    totalCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100)
);
</script>

<template>
    <div class="page">

        <!-- ── Page header ──────────────────────────────────────────────────── -->
        <header class="page-header">
            <div class="page-header__left">
                <span class="page-eyebrow">Workspace</span>
                <h1 class="page-title">My Tasks</h1>
            </div>
            <div class="page-header__dot" />
        </header>

        <!-- ── Bento grid ───────────────────────────────────────────────────── -->
        <div class="bento">

            <!-- Tile: Total -->
            <div class="bento-tile bento-tile--stat" style="animation-delay:.05s">
                <span class="tile-label">Total</span>
                <span class="tile-number">{{ totalCount }}</span>
                <span class="tile-sub">tasks created</span>
            </div>

            <!-- Tile: Completed -->
            <div class="bento-tile bento-tile--stat bento-tile--amber" style="animation-delay:.1s">
                <span class="tile-label">Done</span>
                <span class="tile-number">{{ completedCount }}</span>
                <span class="tile-sub">completed</span>
            </div>

            <!-- Tile: Pending -->
            <div class="bento-tile bento-tile--stat" style="animation-delay:.15s">
                <span class="tile-label">Pending</span>
                <span class="tile-number">{{ pendingCount }}</span>
                <span class="tile-sub">remaining</span>
            </div>

            <!-- Tile: Progress -->
            <div class="bento-tile bento-tile--progress" style="animation-delay:.2s">
                <div class="progress-header">
                    <span class="tile-label">Progress</span>
                    <span class="progress-pct">{{ progressPct }}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" :style="{ width: progressPct + '%' }" />
                </div>
                <span class="tile-sub">{{ completedCount }} of {{ totalCount }} done</span>
            </div>

            <!-- Tile: Add task -->
            <div class="bento-tile bento-tile--create" style="animation-delay:.25s">
                <span class="tile-label">New task</span>
                <form class="create-form" @submit.prevent="createTask">
                    <input
                        v-model="newTaskTitle"
                        class="create-input"
                        placeholder="What needs doing?"
                        :disabled="submitting"
                        maxlength="200"
                        autocomplete="off"
                    />
                    <button class="create-btn" type="submit" :disabled="submitting || !newTaskTitle.trim()">
                        <span v-if="submitting" class="spinner" />
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                </form>
                <p v-if="error" class="create-error">{{ error }}</p>
            </div>

            <!-- Tile: Task list -->
            <div class="bento-tile bento-tile--list" style="animation-delay:.3s">
                <span class="tile-label">All tasks</span>

                <!-- Loading skeletons -->
                <div v-if="loading" class="skeleton-list">
                    <div v-for="n in 5" :key="n" class="skeleton-row" :style="`animation-delay:${n * 0.07}s`" />
                </div>

                <!-- Empty state -->
                <div v-else-if="tasks.length === 0" class="empty-state">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12l3 3 5-5"/></svg>
                    <p>No tasks yet — add one above</p>
                </div>

                <!-- Task list -->
                <ul v-else class="task-list">
                    <li
                        v-for="(task, i) in tasks"
                        :key="task._id"
                        class="task-item"
                        :class="{ 'task-item--done': task.completed }"
                        :style="`animation-delay: ${0.3 + i * 0.055}s`"
                    >
                        <!-- Read view -->
                        <template v-if="editingTaskId !== task._id">
                            <button
                                class="check-btn"
                                :class="{ 'check-btn--checked': task.completed }"
                                @click="toggleComplete(task)"
                                :aria-label="task.completed ? 'Mark incomplete' : 'Mark complete'"
                            >
                                <svg v-if="task.completed" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                            </button>

                            <div class="task-content">
                                <router-link :to="`/tasks/${task._id}`" class="task-title">{{ task.title }}</router-link>
                                <span v-if="task.description" class="task-desc">{{ task.description }}</span>
                            </div>

                            <div class="task-actions">
                                <button class="action-btn" @click="startEdit(task)" aria-label="Edit">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button class="action-btn action-btn--danger" @click="deleteTask(task._id)" aria-label="Delete">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                </button>
                            </div>
                        </template>

                        <!-- Edit view -->
                        <template v-else>
                            <div class="edit-form">
                                <input
                                    v-model="editTitle"
                                    class="edit-input"
                                    :class="{ 'edit-input--error': editError }"
                                    placeholder="Task title"
                                    maxlength="200"
                                    autocomplete="off"
                                    @keydown.enter.prevent="saveEdit"
                                    @keydown.escape="cancelEdit"
                                />
                                <textarea
                                    v-model="editDescription"
                                    class="edit-textarea"
                                    placeholder="Description (optional)"
                                    rows="2"
                                    maxlength="2000"
                                />
                                <p v-if="editError" class="edit-error-msg">{{ editError }}</p>
                                <div class="edit-actions">
                                    <button class="edit-btn edit-btn--cancel" type="button" @click="cancelEdit" :disabled="editSaving">Cancel</button>
                                    <button class="edit-btn edit-btn--save" type="button" @click="saveEdit" :disabled="editSaving">
                                        <span v-if="editSaving" class="spinner spinner--dark" />
                                        {{ editSaving ? "Saving…" : "Save" }}
                                    </button>
                                </div>
                            </div>
                        </template>

                    </li>
                </ul>
            </div>

        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Manrope:wght@400;500;600&display=swap');

/* ── Tokens ───────────────────────────────────────────────────────────────── */
.page {
    --bg:           #080c18;
    --surface:      #111827;
    --surface-2:    #1a2235;
    --border:       rgba(255,255,255,.07);
    --border-hover: rgba(245,158,11,.28);
    --amber:        #f59e0b;
    --amber-glow:   rgba(245,158,11,.06);
    --text-1:       #eef1f8;
    --text-2:       #7c8aa0;
    --text-3:       #404e63;
    --danger:       #ef4444;
    --r-tile:       18px;
    --r-sm:         10px;
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
.page {
    min-height: 100vh;
    background: var(--bg);
    background-image:
        radial-gradient(ellipse 70% 50% at 75% -5%, rgba(245,158,11,.08) 0%, transparent 65%),
        radial-gradient(ellipse 45% 35% at 5% 90%, rgba(99,102,241,.05) 0%, transparent 60%);
    padding: 48px 32px 80px;
    font-family: 'Manrope', system-ui, sans-serif;
    color: var(--text-1);
    box-sizing: border-box;
}

/* ── Page header ──────────────────────────────────────────────────────────── */
.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 36px;
    animation: fadeUp .5s ease both;
}

.page-header__left { display: flex; flex-direction: column; gap: 4px; }

.page-eyebrow {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--amber);
}

.page-title {
    font-family: 'Syne', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-1);
    margin: 0;
    line-height: 1;
    letter-spacing: -.025em;
}

.page-header__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--amber);
    box-shadow: 0 0 18px var(--amber);
    animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: .4; transform: scale(.65); }
}

/* ── Bento grid ───────────────────────────────────────────────────────────── */
.bento {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

/* ── Tile base ────────────────────────────────────────────────────────────── */
.bento-tile {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-tile);
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: border-color .22s, box-shadow .22s, transform .22s;
    animation: fadeUp .55s ease both;
}

.bento-tile::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(ellipse 80% 60% at 0% 0%, var(--amber-glow), transparent 70%);
    opacity: 0;
    transition: opacity .3s;
    pointer-events: none;
}

.bento-tile:hover {
    border-color: var(--border-hover);
    box-shadow: 0 0 0 1px rgba(245,158,11,.08), 0 12px 40px rgba(0,0,0,.45);
    transform: translateY(-3px);
}

.bento-tile:hover::after { opacity: 1; }

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Stat tiles ───────────────────────────────────────────────────────────── */
.bento-tile--stat {
    grid-column: span 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.bento-tile--amber {
    background: linear-gradient(145deg, #1c1508 0%, #221b09 100%);
    border-color: rgba(245,158,11,.18);
}
.bento-tile--amber .tile-number { color: var(--amber); }

.tile-label {
    font-size: 0.68rem;
    font-weight: 600;
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
    letter-spacing: -.035em;
}

.tile-sub {
    font-size: 0.74rem;
    color: var(--text-3);
    margin-top: 2px;
}

/* ── Progress tile ────────────────────────────────────────────────────────── */
.bento-tile--progress {
    grid-column: span 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.progress-pct {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--amber);
}

.progress-track {
    height: 5px;
    background: var(--surface-2);
    border-radius: 99px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #d97706, var(--amber), #fbbf24);
    border-radius: 99px;
    transition: width .7s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 0 12px rgba(245,158,11,.6);
}

/* ── Create tile ──────────────────────────────────────────────────────────── */
.bento-tile--create {
    grid-column: span 4;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.create-form { display: flex; gap: 10px; }

.create-input {
    flex: 1;
    padding: 12px 16px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    font-size: 0.9rem;
    font-family: 'Manrope', sans-serif;
    color: var(--text-1);
    outline: none;
    transition: border-color .15s, box-shadow .15s;
}
.create-input::placeholder { color: var(--text-3); }
.create-input:focus {
    border-color: rgba(245,158,11,.4);
    box-shadow: 0 0 0 3px rgba(245,158,11,.07);
}
.create-input:disabled { opacity: .4; cursor: not-allowed; }

.create-btn {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: var(--r-sm);
    border: none;
    background: var(--amber);
    color: #080c18;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    transition: background .15s, box-shadow .15s, transform .1s;
}
.create-btn:hover:not(:disabled) {
    background: #fbbf24;
    box-shadow: 0 0 24px rgba(245,158,11,.45);
}
.create-btn:active:not(:disabled) { transform: scale(.93); }
.create-btn:disabled { opacity: .3; cursor: not-allowed; }

.create-error { font-size: 0.78rem; color: var(--danger); margin: 0; }

/* ── List tile ────────────────────────────────────────────────────────────── */
.bento-tile--list {
    grid-column: span 4;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* ── Skeletons ────────────────────────────────────────────────────────────── */
.skeleton-list { display: flex; flex-direction: column; gap: 8px; }

.skeleton-row {
    height: 52px;
    border-radius: var(--r-sm);
    background: linear-gradient(90deg, var(--surface-2) 25%, #1e2b40 50%, var(--surface-2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s infinite;
    opacity: 0;
    animation: shimmer 1.6s infinite, fadeUp .4s ease both;
}

@keyframes shimmer { to { background-position: -200% 0; } }

/* ── Empty state ──────────────────────────────────────────────────────────── */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 48px 0;
    color: var(--text-3);
}
.empty-state p { font-size: 0.85rem; margin: 0; }

/* ── Task list ────────────────────────────────────────────────────────────── */
.task-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.task-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 13px 15px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    animation: fadeUp .4s ease both;
    transition: border-color .15s, background .15s;
}
.task-item:hover {
    border-color: rgba(245,158,11,.15);
    background: #1c2540;
}
.task-item--done { opacity: .45; }

/* ── Checkbox ─────────────────────────────────────────────────────────────── */
.check-btn {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    border: 1.5px solid var(--text-3);
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color .15s, background .15s, box-shadow .15s;
    color: #080c18;
}
.check-btn:hover { border-color: var(--amber); }
.check-btn--checked {
    background: var(--amber);
    border-color: var(--amber);
    box-shadow: 0 0 12px rgba(245,158,11,.4);
}

/* ── Task content ─────────────────────────────────────────────────────────── */
.task-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.task-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-1);
    word-break: break-word;
    text-decoration: none;
    transition: color .15s;
}
.task-title:hover { color: var(--amber); }
.task-item--done .task-title { text-decoration: line-through; color: var(--text-3); }
.task-item--done .task-title:hover { color: var(--text-3); }

.task-desc { font-size: 0.78rem; color: var(--text-2); }

/* ── Row action buttons ───────────────────────────────────────────────────── */
.task-actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity .15s;
    flex-shrink: 0;
}
.task-item:hover .task-actions { opacity: 1; }

.action-btn {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    border: none;
    background: none;
    color: var(--text-3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .12s, color .12s;
}
.action-btn:hover { background: rgba(255,255,255,.05); color: var(--text-1); }
.action-btn--danger:hover { background: rgba(239,68,68,.1); color: var(--danger); }

/* ── Inline edit form ─────────────────────────────────────────────────────── */
.edit-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.edit-input,
.edit-textarea {
    padding: 9px 12px;
    background: var(--surface);
    border: 1px solid rgba(245,158,11,.22);
    border-radius: 8px;
    font-size: 0.875rem;
    font-family: 'Manrope', sans-serif;
    color: var(--text-1);
    outline: none;
    width: 100%;
    box-sizing: border-box;
    transition: border-color .15s, box-shadow .15s;
}
.edit-input:focus,
.edit-textarea:focus {
    border-color: rgba(245,158,11,.5);
    box-shadow: 0 0 0 3px rgba(245,158,11,.07);
}
.edit-input--error { border-color: var(--danger) !important; }
.edit-textarea { resize: vertical; min-height: 54px; }

.edit-error-msg { font-size: 0.78rem; color: var(--danger); margin: 0; }

.edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.edit-btn {
    padding: 7px 16px;
    border-radius: 7px;
    font-size: 0.8rem;
    font-weight: 600;
    font-family: 'Manrope', sans-serif;
    cursor: pointer;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all .15s;
}
.edit-btn:disabled { opacity: .35; cursor: not-allowed; }

.edit-btn--cancel {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-2);
}
.edit-btn--cancel:hover:not(:disabled) { background: rgba(255,255,255,.04); color: var(--text-1); }

.edit-btn--save { background: var(--amber); color: #080c18; }
.edit-btn--save:hover:not(:disabled) {
    background: #fbbf24;
    box-shadow: 0 0 18px rgba(245,158,11,.35);
}

/* ── Spinner ──────────────────────────────────────────────────────────────── */
.spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255,255,255,.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .6s linear infinite;
    flex-shrink: 0;
}
.spinner--dark {
    border-color: rgba(8,12,24,.2);
    border-top-color: #080c18;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
    .page { padding: 28px 16px 60px; }
    .page-title { font-size: 2rem; }
    .bento { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .bento-tile--stat   { grid-column: span 1; }
    .bento-tile--progress { grid-column: span 1; }
    .bento-tile--create,
    .bento-tile--list   { grid-column: span 2; }
}

@media (max-width: 480px) {
    .bento { grid-template-columns: 1fr; }
    .bento-tile { grid-column: span 1 !important; }
    .tile-number { font-size: 2.2rem; }
}
</style>
