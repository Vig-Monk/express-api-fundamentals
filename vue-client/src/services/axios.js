import axios from 'axios'
import {authState} from '../stores/auth.js'
const api = axios.create({
	baseURL:'http://localhost:3000/api/v1/'
})
api.interceptors.request.use((config)=>{
	if (authState.token){
		config.headers.Authorization =`Bearer ${authState.token}`
	}
return config	
})
export default api