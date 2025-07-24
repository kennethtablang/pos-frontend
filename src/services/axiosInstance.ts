// src/services/axiosInstance.js
import axios from "axios";

const API = "https://localhost:7118/api"; // Or use: import.meta.env.VITE_API_URL

const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
