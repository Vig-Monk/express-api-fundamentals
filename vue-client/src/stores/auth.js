import { reactive } from "vue";
export const authState = reactive({
    token: localStorage.getItem('token'),
    user: null,

});
export const setAuth = (token, user) => {
    authState.token = token,
        authState.user = user
    localStorage.setItem("token", token)

}
export const logout = () => {
    authState.token = null
    authState.user = null
    localStorage.removeItem("token")
}