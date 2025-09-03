// src/api/axiosInstance.ts
import axios from 'axios';

const isDev = import.meta.env.DEV;

const axiosInstance = axios.create({
  baseURL: isDev
    ? '/api'                                   // goes through Vite proxy
    : (import.meta.env.VITE_API_BASE_URL || 'https://store.medisearchtool.com'),
  withCredentials: true,                       // send/receive cookies (refresh)
  headers: { 'Content-Type': 'application/json' },
});

// attach bearer from localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// refresh on 401 once, then retry
let refreshing = false;
let queue: Array<(t: string) => void> = [];

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original?._retry) {
      original._retry = true;

      if (refreshing) {
        const token = await new Promise<string>((resolve) => queue.push(resolve));
        original.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(original);
      }

      refreshing = true;
      try {
        const { data } = await axiosInstance.post('/user/access-token', {}); // via proxy
        const newToken = data?.accessToken;
        if (!newToken) throw new Error('No accessToken in refresh response');

        localStorage.setItem('accessToken', newToken);
        queue.forEach((resolve) => resolve(newToken));
        queue = [];

        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(original);
      } catch (e) {
        queue = [];
        localStorage.removeItem('accessToken');
        // redirect to login if refresh failed
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
