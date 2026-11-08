import axios from "axios";

// Variable inyectada directamente durante el build desde las variables de Railway / .env
const rawBaseUrl = import.meta.env.VITE_API_URL;

if (!rawBaseUrl) {
  console.warn("⚠️ VITE_API_URL no fue provista durante el build.");
}

const cleanBaseUrl = rawBaseUrl
  ? (rawBaseUrl.endsWith("/api") || rawBaseUrl.endsWith("/api/")
      ? rawBaseUrl
      : `${rawBaseUrl.replace(/\/+$/, "")}/api`)
  : "/api";

const api = axios.create({
  baseURL: cleanBaseUrl,
});

export default api;
