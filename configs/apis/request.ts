import axios from "axios";
import { APIs } from "./listAPI";

export const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const PUBLIC_APIS = [APIs.auth.login, APIs.auth.register];

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !PUBLIC_APIS.includes(config.url || "")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  get: (url: string, params?: any) => request.get(url, { params }),

  post: (url: string, data?: any) => request.post(url, data),

  put: (url: string, data?: any) => request.put(url, data),

  delete: (url: string) => request.delete(url),
};
