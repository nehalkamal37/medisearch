import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const API_BASE_URL = "http://localhost:5107";

export async function tryRefreshAccess(): Promise<boolean> {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/user/access-token`,
      {},
      { withCredentials: true } // send refresh cookie
    );
    const newToken = res.data?.accessToken as string | undefined;
    if (!newToken) return false;
    localStorage.setItem("accessToken", newToken);
    // set default header so next calls use it
    (axiosInstance.defaults.headers as any).common = {
      ...(axiosInstance.defaults.headers?.common || {}),
      Authorization: `Bearer ${newToken}`,
    };
    return true;
  } catch {
    return false;
  }
}
