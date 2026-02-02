import api from "./api.js"
const API_URL = "auth"
export const login = async (payload) => {
	const res = await api.post(`/api/v1/auth/login`, payload)
	return res.data
}
export const signup = async (payload) => {
	const res = await api.post(`/api/v1/auth/signup`, payload)
	return res.data
}