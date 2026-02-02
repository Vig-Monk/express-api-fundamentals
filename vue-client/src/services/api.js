import axios from 'axios'
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL
})
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token")
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
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
			console.warn("unauthorised - token invalid or expired")
		}
		if (status === 403) {
			console.warn("Forbidden-You don't have sufficienjt permissions")
		}
		return Promise.reject(err)
	}
)
export default api