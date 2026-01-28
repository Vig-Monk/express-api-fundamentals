<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authState } from "../stores/auth.js";
const route = useRoute();
const requestedId = route.params.id;
const isOwner = authState.user && requestedId === authState.user.id;
</script>
<template>
    <h2>
        user profile
    </h2>
    <button v-if="isOwner">
    	Edit profile 
    </button>
</template>
<style></style>
