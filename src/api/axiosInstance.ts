import axios from 'axios';

//"API_BASE_URL": " https://medi-dev-api.hanna-west.com/"
const API_BASE_URL = "https://medi-dev-api.hanna-west.com/";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI2MSIsImVtYWlsIjoid2FlbEBnbWFpbC5jb20iLCJyb2xlIjoiU3VwZXJBZG1pbiIsIkJyYW5jaElkIjoiMSIsIm5iZiI6MTc1NjQxMzg0NSwiZXhwIjoxNzU2NDEzOTA1LCJpYXQiOjE3NTY0MTM4NDUsImlzcyI6Imh0dHBzOi8vYXBpLnNlYXJjaHRvb2wubG9jYWwiLCJhdWQiOiJTZWFyY2hUb29sQVBJIn0.EloTFVWV2ITi979RPLZW-NJJCpM9fSm0Ez12PdpBoUI"}`,
});

const axiosInstance = axios.create({
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

axiosInstance.interceptors.request.use(
  config => {
    const authHeader = getAuthHeader();
    Object.entries(authHeader).forEach(([key, value]) => {
      config.headers?.set(key, value);
    });
    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Token expired, refreshing...');
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/user/access-token`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        return axiosInstance(originalRequest);
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

export default axiosInstance;
