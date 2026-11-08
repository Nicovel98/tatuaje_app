import axios from "axios";

// Variable inyectada directamente durante el build desde las variables de Railway / .env
const rawBaseUrl = import.meta.env.VITE_API_URL;

const cleanBaseUrl = rawBaseUrl
  ? (rawBaseUrl.endsWith("/api") || rawBaseUrl.endsWith("/api/")
      ? rawBaseUrl
      : `${rawBaseUrl.replace(/\/+$/, "")}/api`)
  : "/api";

console.log("🔗 API Base URL configurada:", cleanBaseUrl);

const api = axios.create({
  baseURL: cleanBaseUrl,
});

export default api;
