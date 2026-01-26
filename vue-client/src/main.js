import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router/index.js"
import {authState} from "./stores/auth.js"
const token = localStorage.getItem('token')
if(token){
	authState.token = token,
	authState.isAuthenticated= true
}

createApp(App).use(router).mount('#app')
