<script setup>
import { ref } from "vue";
import { signup } from "../services/auth.service";
import { setAuth } from "../stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleSignup = async () => {
    loading.value = true;
    error.value = "";

    try {
        const res = await signup({
            name: name.value,
            email: email.value,
            password: password.value
        });
        setAuth(res.token, res.data.user);
        router.push("/dashboard");
    } catch (err) {
        console.error("signup error", err);
        error.value = err.response?.data?.message || "Something went wrong";
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>Create Account</h1>
                <p>Sign up to get started</p>
            </div>

            <form @submit.prevent="handleSignup" class="auth-form">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input
                        id="name"
                        v-model="name"
                        type="text"
                        placeholder="Enter your full name"
                        required
                        :disabled="loading"
                    />
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        :disabled="loading"
                    />
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        placeholder="Enter your password (min 8 characters)"
                        required
                        minlength="8"
                        :disabled="loading"
                    />
                </div>

                <p v-if="error" class="error-message">{{ error }}</p>

                <button type="submit" class="submit-btn" :disabled="loading">
                    <span v-if="!loading">Sign Up</span>
                    <span v-else>Creating account...</span>
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
.auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.auth-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 420px;
    padding: 40px;
}

.auth-header {
    text-align: center;
    margin-bottom: 32px;
}

.auth-header h1 {
    color: #1a202c;
    font-size: 28px;
    margin: 0 0 8px 0;
    font-weight: 700;
}

.auth-header p {
    color: #718096;
    font-size: 14px;
    margin: 0;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    color: #2d3748;
    font-size: 14px;
    font-weight: 600;
}

.form-group input {
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
    background: white;
    color: #1a202c;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
    background: #f7fafc;
    cursor: not-allowed;
}

.form-group input::placeholder {
    color: #a0aec0;
}

.error-message {
    color: #e53e3e;
    font-size: 14px;
    margin: 0;
    padding: 12px;
    background: #fff5f5;
    border-radius: 8px;
    border-left: 4px solid #e53e3e;
}

.submit-btn {
    padding: 14px 24px;
    background:hsl(190.3,0%,11.8%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:active:not(:disabled) {
    transform: translateY(0);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.auth-footer {
    text-align: center;
    color: #718096;
    font-size: 14px;
    margin-top: 8px;
}

.auth-footer a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
}

.auth-footer a:hover {
    text-decoration: underline;
}
</style>
