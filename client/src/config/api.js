import axios from "axios";

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

axios.defaults.baseURL = API_URL;
axios.interceptors.request.use((config) => {
  if (typeof config.url === "string") {
    config.url = config.url.replace(/^http:\/\/localhost:5000/, API_URL);
  }
  return config;
});
