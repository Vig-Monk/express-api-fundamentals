import { reactive } from "vue";
export const authState = reactive({
    token: null,
    user: null,
    isAuthenticatef: false
});
