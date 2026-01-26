<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "../services/authService.js";
import { authState } from "../stores/auth.js";

const email = ref("");
const password = ref("");
const router = useRouter();
const handleLogin = async () => {
    const data = await login(email.value, password.value);
    localstorage.setItem("token", data.token);
    authState.token = data.token;
    authState.user = data.data.user;
    authState.isAuthenticated = true;

    router.push("/");
};
</script>
<template>
    <div>
        <form @submit.prevent="handleLogin">
            <input v-model="email" placeholder="enail" />
            <input v-model="password" type="password" placeholder="password" />
            <button>Login</button>
        </form>
    </div>
</template>
