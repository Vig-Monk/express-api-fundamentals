import api from "./axios.js"
const API_URL = "auth"
export const login = async (payload) => {
	const res = await api.post(`${API_URL}/login`, payload)
	return res.data
}
export const signup = async (payload) => {
	const res = await api.post(`${API_URL}/signup`, payload)
	return res.data
}