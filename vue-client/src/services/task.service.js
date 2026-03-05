import api from "./api.js";

const taskService = {
	getMyTasks() {
		return api.get('/tasks')
	},
	createTasks(taskData){
		return api.post('/tasks', taskData)
	},
	updateTasks(taskId, taskData){
		return api.patch(`/tasks/${taskId}`)
	},
	deleteTasks(taskId){
		return api.delete(`/tasks/${tadkId}`)
	}
}