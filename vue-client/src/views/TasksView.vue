<script setup>
import { ref, onMounted } from "vue";
import taskService from "../services/task.service.js";
const tasks = ref([]);
const error = ref("");
const loading = ref(true);

const newTaskTitle = ref("");
const submitting = ref(false);

const editingTaskId = ref(null);

const fetchTasks = async () => {
    try {
        const res = await taskService.getMyTasks();
        tasks.value = res.data.data.tasks;
    } catch (err) {
        error.value = "failed to load tasks";
    } finally {
        loading.value = false;
    }
};
onMounted(fetchTasks);
const createTask = async () => {
    if (!newTaskTitle.value.trim()) return;
    submitting.value = true;
    try {
        await taskService.createTask({
            title: newTaskTitle.value
        });
        newTaskTitle.value = "";
        await fetchTasks;
    } catch (err) {
        error.value = "failed to create Task";
    } finally {
        submitting.value = false;
    }
};
const startEdit = task => {
editingTaskId.value  = task._id
newTaskTitle.value = task.tittle
};
const saveTask = async ()=>{
if(!newTaskTitle.value.trim())return;
submitting.value = true;
if(editingTaskId.value){
await taskService.updateTask(editingTaskId.value, {
title:newTaskTitle.value
})
}
}
</script>
<template>
    <section>
        <h1>My tasks</h1>
        <form @submit.prevent="createTask">
            <input v-model="newTaskTitle" placeholder="New Task Title" />
            <button>{{ submitting ? "Adding..." : "Add Task" }}</button>
        </form>
        <p v-if="loading">Loading tasks...</p>
        <p v-if="error">{{ error }}</p>
        <ul v-if="!error && !loading">
            <li v-for="task in tasks" :key="task._id">{{ task.title }}</li>
        </ul>
    </section>
</template>
