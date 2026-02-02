import { reactive } from "vue";
export const authState = reactive({
    user: null,
    token: null,
    initialized: false
});
export const restoreAuth = () => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
        authState.user = JSON.parse(user)
        authState.token = token
    }
    authState.initialized = true;
}
export const setAuth = (token, user) => {
    authState.token = token
    authState.user = user;
    localStorage.setItem("token", token);
    localStorage.setItem('user', JSON.stringify(user));
};
export const logout = () => {
    authState.token = null;
    authState.user = null;
    authState.initialized = true;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
