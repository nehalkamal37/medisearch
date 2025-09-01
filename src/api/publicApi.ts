// src/api/publicApi.ts  (dev proxy → /api)
import axios from "axios";

const api = axios.create({
  baseURL: "/api",           // Vite dev proxy to your backend
  withCredentials: true,
});

// attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
