<script setup>
import { ref } from "vue";
import { signup } from "../services/auth.service";
import { setAuth } from "../stores/auth";
import { useRouter } from "vue-router";

const router   = useRouter();
const name     = ref("");
const email    = ref("");
const password = ref("");
const error    = ref("");
const loading  = ref(false);

const handleSignup = async () => {
    loading.value = true;
    error.value   = "";
    try {
        const res = await signup({ name: name.value, email: email.value, password: password.value });
        setAuth(res.token, res.data.user);
        router.push("/tasks");
    } catch (err) {
        error.value = err.response?.data?.message || "Something went wrong. Please try again.";
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="auth-page">
        <div class="auth-card">

            <!-- Brand mark -->
            <div class="brand">
                <span class="brand-dot" />
                <span class="brand-name">Taskr</span>
            </div>

            <h1 class="auth-title">Create account</h1>
            <p class="auth-sub">Get started — it's free</p>

            <form @submit.prevent="handleSignup" class="auth-form">

                <div class="field">
                    <label class="field-label" for="name">Full Name</label>
                    <input
                        id="name"
                        v-model="name"
                        type="text"
                        class="field-input"
                        placeholder="Jane Doe"
                        required
                        autocomplete="name"
                        :disabled="loading"
                    />
                </div>

                <div class="field">
                    <label class="field-label" for="email">Email</label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        class="field-input"
                        placeholder="you@example.com"
                        required
                        autocomplete="email"
                        :disabled="loading"
                    />
                </div>

                <div class="field">
                    <label class="field-label" for="password">Password</label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        class="field-input"
                        placeholder="Min. 8 characters"
                        required
                        minlength="8"
                        autocomplete="new-password"
                        :disabled="loading"
                    />
                </div>

                <div v-if="error" class="error-msg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {{ error }}
                </div>

                <button type="submit" class="submit-btn" :disabled="loading">
                    <span v-if="loading" class="spinner spinner--dark" />
                    {{ loading ? "Creating account…" : "Sign Up" }}
                </button>

                <p class="auth-footer">
                    Already have an account?
                    <router-link to="/login">Log in</router-link>
                </p>

            </form>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Manrope:wght@400;500;600&display=swap');

.auth-page {
    --bg:        #080c18;
    --surface:   #111827;
    --surface-2: #1a2235;
    --border:    rgba(255,255,255,.07);
    --amber:     #f59e0b;
    --text-1:    #eef1f8;
    --text-2:    #7c8aa0;
    --text-3:    #404e63;
    --danger:    #ef4444;
    --r:         18px;
    --r-sm:      10px;

    min-height: 100vh;
    background: var(--bg);
    background-image:
        radial-gradient(ellipse 60% 45% at 50% -10%, rgba(245,158,11,.09) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 100% 100%, rgba(99,102,241,.05) 0%, transparent 55%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: 'Manrope', system-ui, sans-serif;
    color: var(--text-1);
    box-sizing: border-box;
}

.auth-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 40px 40px 36px;
    width: 100%;
    max-width: 420px;
    animation: fadeUp .5s ease both;
    box-shadow: 0 32px 80px rgba(0,0,0,.5);
}

@keyframes fadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
}

.brand {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 28px;
}

.brand-dot {
    width: 9px; height: 9px;
    border-radius: 50%;
    background: var(--amber);
    box-shadow: 0 0 14px var(--amber);
    animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:.4; transform:scale(.65); }
}

.brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--text-1);
    letter-spacing: -.02em;
}

.auth-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.9rem;
    font-weight: 800;
    color: var(--text-1);
    margin: 0 0 6px;
    letter-spacing: -.025em;
    line-height: 1.1;
}

.auth-sub {
    font-size: 0.85rem;
    color: var(--text-2);
    margin: 0 0 28px;
}

.auth-form { display: flex; flex-direction: column; gap: 18px; }

.field { display: flex; flex-direction: column; gap: 7px; }

.field-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--text-3);
}

.field-input {
    padding: 12px 14px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    font-size: 0.9rem;
    font-family: 'Manrope', sans-serif;
    color: var(--text-1);
    outline: none;
    transition: border-color .15s, box-shadow .15s;
}
.field-input::placeholder { color: var(--text-3); }
.field-input:focus {
    border-color: rgba(245,158,11,.4);
    box-shadow: 0 0 0 3px rgba(245,158,11,.07);
}
.field-input:disabled { opacity: .4; cursor: not-allowed; }

.error-msg {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 14px;
    background: rgba(239,68,68,.07);
    border: 1px solid rgba(239,68,68,.2);
    border-radius: var(--r-sm);
    color: var(--danger);
    font-size: 0.82rem;
}

.submit-btn {
    padding: 13px 24px;
    background: var(--amber);
    color: #080c18;
    border: none;
    border-radius: var(--r-sm);
    font-size: 0.92rem;
    font-weight: 700;
    font-family: 'Manrope', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background .15s, box-shadow .15s, transform .1s;
    margin-top: 4px;
}
.submit-btn:hover:not(:disabled) {
    background: #fbbf24;
    box-shadow: 0 0 28px rgba(245,158,11,.4);
}
.submit-btn:active:not(:disabled) { transform: scale(.97); }
.submit-btn:disabled { opacity: .4; cursor: not-allowed; }

.auth-footer {
    text-align: center;
    font-size: 0.82rem;
    color: var(--text-2);
    margin: 0;
}
.auth-footer a {
    color: var(--amber);
    text-decoration: none;
    font-weight: 600;
}
.auth-footer a:hover { text-decoration: underline; }

.spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(255,255,255,.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .6s linear infinite;
    flex-shrink: 0;
}
.spinner--dark { border-color: rgba(8,12,24,.2); border-top-color: #080c18; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 480px) {
    .auth-card { padding: 30px 22px; }
    .auth-title { font-size: 1.6rem; }
}
</style>
