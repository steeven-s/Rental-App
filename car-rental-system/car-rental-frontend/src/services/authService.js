
import axiosInstance from "../api/axiosInstance";

const authService = {

    async register(userData) {
        const response = await axiosInstance.post(
            "/auth/register",
            userData
        );

        return response.data;
    },

    async login(credentials) {
        const response = await axiosInstance.post(
            "/auth/login",
            credentials
        );

        sessionStorage.setItem(
            "accessToken",
            response.data.accessToken
        );

        sessionStorage.setItem(
            "user",
            JSON.stringify({
                userId: response.data.userId,
                fullName: response.data.fullName,
                email: response.data.email,
                role: response.data.role
            })
        );

        return response.data;
    },

    async getCurrentUser() {
        const response = await axiosInstance.get("/auth/me");
        return response.data;
    },

    logout() {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");
    }

};

export default authService;
