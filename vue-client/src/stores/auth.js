import { reactive } from "vue";
export const authState = reactive({
    token: localStorage.getItem("token"),
    user: JSON.parse(localStorage.getItem("user"))
});
export const setAuth = (token, user) => {
    (authState.token = token), (authState.user = user);
    localStorage.setItem("token", token);
    localStorage.setItem('user',JSON.stringify(user));
};
export const logout = () => {
    authState.token = null;
    authState.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
