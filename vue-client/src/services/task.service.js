import api from "./api.js";

const taskService = {
    getMyTasks() {
        return api.get("/api/v1/tasks");
    },
    getTask(taskId) {
        return api.get(`/api/v1/tasks/${taskId}`);
    },
    createTask(taskData) {
        return api.post("/api/v1/tasks", taskData);
    },
    updateTask(taskId, taskData) {
        return api.patch(`/api/v1/tasks/${taskId}`, taskData);
    },
    deleteTask(taskId) {
        return api.delete(`/api/v1/tasks/${taskId}`);
    },
};

export default taskService;
