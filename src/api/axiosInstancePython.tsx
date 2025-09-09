import axios from 'axios';
import BaseUrlLoader, { loadConfig } from '../BaseUrlLoader';

await loadConfig(); 
const API_BASE_URL = "https://store.medisearchtool.com/sharepoint";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
});

const axiosInstancePython = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies (refresh token)
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

axiosInstancePython.interceptors.request.use(
  config => {
    const authHeader = getAuthHeader();
    Object.entries(authHeader).forEach(([key, value]) => {
      config.headers?.set(key, value);
    });
    return config;
  },
  error => Promise.reject(error)
);

axiosInstancePython.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(axiosInstancePython(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        axiosInstancePython.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        return axiosInstancePython(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstancePython;
