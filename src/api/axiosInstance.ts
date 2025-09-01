import axios from "axios";
import BaseUrlLoader, { loadConfig } from "../BaseUrlLoader";

await loadConfig();

// 👇 اختار baseURL حسب البيئة
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev ? "/api" : BaseUrlLoader.API_BASE_URL;

// نضيف نوع اختياري للـ config عشان نخلي الredirect قابل للتعطيل
type ExtraAxiosConfig = {
  // لو true ما نعملش redirect للّوجن لما يحصل 401 أو فشل refresh
  skipAuthRedirect?: boolean;
};

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
});

const axiosInstance = axios.create({
//  baseURL: API_BASE_URL,
  //withCredentials: true, // محتاجه لو بتستخدم كوكي ريفريش
  //headers: { "Content-Type": "application/json" },
  baseURL: isDev ? "/api" : (import.meta.env.VITE_API_BASE_URL || "https://store.medisearchtool.com"),
  // Disable cookies for now to avoid CORS-cookie tangles while testing:
  withCredentials: false,
  headers: { "Content-Type": "application/json" },


});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

// Request interceptor: حط الـ Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const authHeader = getAuthHeader();
    Object.entries(authHeader).forEach(([k, v]) => {
      // Axios v1: set header via plain assign
      (config.headers as any)[k] = v;
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: refresh + “سويتش” منع الredirect
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & ExtraAxiosConfig);

    // لو 401 ومش معلم إننا عملنا retry قبل كده
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // لو في refresh شغال، استنى نتيجته
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              (originalRequest.headers as any)["Authorization"] = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
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
        const newToken = res.data?.accessToken;
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          (axiosInstance.defaults.headers as any)["Authorization"] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        } else {
          throw new Error("No accessToken in refresh response");
        }
      } catch (err) {
        processQueue(err, null);

        // 👇 هنا بقى: ما تعملش redirect لو الطلب معلّم skipAuthRedirect
        if (!originalRequest.skipAuthRedirect) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
