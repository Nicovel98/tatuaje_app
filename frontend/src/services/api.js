import axios from "axios";

// Variable inyectada durante el build o toma por defecto el backend desplegado en Railway
const rawBaseUrl =
  import.meta.env.VITE_API_URL || "https://tatuajeapp-dev.up.railway.app/api";

const cleanBaseUrl =
  rawBaseUrl.endsWith("/api") || rawBaseUrl.endsWith("/api/")
    ? rawBaseUrl
    : `${rawBaseUrl.replace(/\/+$/, "")}/api`;

console.log("🔗 API Base URL configurada:", cleanBaseUrl);

const api = axios.create({
  baseURL: cleanBaseUrl,
});

export default api;
