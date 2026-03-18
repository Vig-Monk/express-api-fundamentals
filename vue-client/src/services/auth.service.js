import api from "./api.js"
export const login = async (payload) => {
	const res = await api.post(`/api/v1/auth/login`, payload)
	return res.data
}
export const signup = async (payload) => {
	const res = await api.post(`/api/v1/auth/signup`, payload)
	return res.data
}