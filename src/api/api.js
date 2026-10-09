import axios from "axios";

const appBase = (
  import.meta.env.BASE_URL || "/"
).replace(/\/$/, "");

const configuredApiUrl =
  import.meta.env.VITE_API_URL?.trim();

const localApiUrl =
  "http://localhost:5000/api";

const productionApiUrl =
  `${window.location.origin}${appBase}/api`;

function getApiBaseUrl() {
  /*
   * If VITE_API_URL exists, use it.
   *
   * Examples:
   *
   * http://localhost:5000/api
   *
   * https://your-server.com/api
   */
  if (configuredApiUrl) {
    return configuredApiUrl.replace(
      /\/$/,
      ""
    );
  }

  /*
   * Local development fallback.
   */
  if (import.meta.env.DEV) {
    return localApiUrl;
  }

  /*
   * Production fallback for deployments where
   * frontend and backend share the same host.
   */
  return productionApiUrl;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),

  headers: {
    Accept: "application/json"
  }
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "fixmytown_token"
      ) ||
      sessionStorage.getItem(
        "fixmytown_token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) =>
    response,

  (error) => {
    if (
      error.response?.status ===
      401
    ) {
      localStorage.removeItem(
        "fixmytown_token"
      );

      localStorage.removeItem(
        "fixmytown_user"
      );

      sessionStorage.removeItem(
        "fixmytown_token"
      );

      sessionStorage.removeItem(
        "fixmytown_user"
      );

      const loginPath =
        `${appBase}/login`;

      if (
        window.location.pathname !==
        loginPath
      ) {
        window.location.href =
          loginPath;
      }
    }

    return Promise.reject(
      error
    );
  }
);

export default api;