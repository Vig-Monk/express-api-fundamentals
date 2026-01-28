<script setup>
import { authState } from "../stores/auth.js";
</script>
<template>
    <h2>Dashboard</h2>
    <h2>Hi, {[useState.user?.name}}</h2>
    <div v-if="authState.user?.role === 'admin'">
    	Admin panel 
    </div>
</template>
<style></style>
