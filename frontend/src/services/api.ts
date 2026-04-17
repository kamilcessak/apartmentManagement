import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      const { pathname } = window.location;
      if (pathname !== "/login" && pathname !== "/" && pathname !== "/register") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
