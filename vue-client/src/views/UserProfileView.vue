<script setup>
    import {computed} from "vue"
import {useRoute, useRouter} from "vue-router"
const router = useRouter()
const route = useRoute()
const userId = computed(()=>route.params.id)
const navigateToUser = () => {
  router.push("/users/12")
}
console.log(userId)
</script>
<template>
<h1>User area {{ userId }}
<button @click="navigateToUser">Go now</button>

</h1>
</template>
<style>

</style>