import axios from "axios"
const API_URL = "http://localhost:3000/api/v1/auth"
export const login = async (payload)=> {
	const res = await axios.push(`${API_URL}/login`,payload)
	return res.data
}
export const signup =async (payload)=>{
	const res = await axios.push(`${API_URL}/signup`, payload)
	return res.data
}