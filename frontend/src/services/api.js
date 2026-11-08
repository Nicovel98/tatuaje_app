import axios from "axios";

// Si se define VITE_API_URL se usa; si no, en producción apunta al backend de Railway
const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://tatuajeapp-dev.up.railway.app/api"
    : "http://localhost:5000/api");

const cleanBaseUrl =
  rawBaseUrl.endsWith("/api") || rawBaseUrl.endsWith("/api/")
    ? rawBaseUrl
    : `${rawBaseUrl.replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL: cleanBaseUrl,
});

export default api;
