import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router/index.js"
import { restoreAuth } from "./stores/auth.js"
restoreAuth()
createApp(App)
    .use(router)
    .mount('#app')
