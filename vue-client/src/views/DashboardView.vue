<script setup>
import { authState } from "../stores/auth.js";
</script>
<template>
    <h2>Dashboard</h2>
    <h2>Hi {{ authState.user?.name }}</h2>
    <div>
        Admin panel
    </div>
</template>
<style></style>
