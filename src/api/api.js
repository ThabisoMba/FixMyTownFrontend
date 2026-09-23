import axios from "axios";

const appBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const productionApiUrl = `${window.location.origin}${appBase}/api`;

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    : productionApiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("fixmytown_token") ||
      sessionStorage.getItem("fixmytown_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fixmytown_token");
      localStorage.removeItem("fixmytown_user");
      sessionStorage.removeItem("fixmytown_token");
      sessionStorage.removeItem("fixmytown_user");

      const loginPath = `${appBase}/login`;

      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);

export default api;