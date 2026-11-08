import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const cleanBaseUrl =
  rawBaseUrl.endsWith("/api") || rawBaseUrl.endsWith("/api/")
    ? rawBaseUrl
    : `${rawBaseUrl.replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL: cleanBaseUrl,
});

export default api;
