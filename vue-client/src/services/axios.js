import axios from 'axios'
import { authState, logout } from '../stores/auth.js'
import router from "../router"
const api = axios.create({
	baseURL: '/api/v1/'
})
api.interceptors.request.use((config) => {
	if (authState.token) {
		config.headers.Authorization = `Bearer ${authState.token}`
	}
	return config
})
api.interceptors.response.use(
	(res) => {
		return res;
	},
	(err) => {
		const status = err.response?.status;
		if (status === 401) {
			logout()
			router.push("/login")
		}
		if (status === 403) {
			alert("Access denied")
		}
		return Promise.reject(err)
	}
)
export default api