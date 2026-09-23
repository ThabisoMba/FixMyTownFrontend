import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    `${window.location.origin}/grp-03-39/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fixmytown_token");

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

      const loginPath = `${import.meta.env.BASE_URL}login`;

      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);

export default api;