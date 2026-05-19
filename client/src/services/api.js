import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "https://flim.atmaengi.com/api";

const api = axios.create({ baseURL: API_URL });

const readCookie = (key) => {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((item) => item.startsWith(`${key}=`));
  if (!entry) return null;
  try {
    return JSON.parse(decodeURIComponent(entry.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
};

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("streamwave_user") || sessionStorage.getItem("streamwave_user") || "null") || readCookie("streamwave_user");
  } catch {
    return readCookie("streamwave_user");
  }
};

const parseJson = (value, fallback = null) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value ?? fallback;
  } catch {
    return fallback;
  }
};

api.interceptors.request.use((config) => {
  const user = readStoredUser();
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

api.interceptors.response.use((response) => {
  const method = response.config?.method?.toLowerCase();
  const url = response.config?.url || "";
  const content = response.data?.content;
  if (method === "post" && url.includes("/watchlist/") && content?._id) {
    const body = parseJson(response.config.data, {});
    const cacheKey = `streamwave_watchlist_${body?.profile || "default"}`;
    const cached = parseJson(localStorage.getItem(cacheKey), []) || [];
    const next = [content, ...cached.filter((item) => item?._id !== content._id)];
    localStorage.setItem(cacheKey, JSON.stringify(next));
  }
  return response;
});

const inferUploadPath = (url = "", kind = "") => {
  const value = String(url).trim();
  if (!value) return "";
  const uploadIndex = value.indexOf("/uploads/");
  if (uploadIndex >= 0) return value.slice(uploadIndex);
  if (value.startsWith("/uploads/")) return value;
  if (value.startsWith("uploads/")) return `/${value}`;
  if (value.startsWith("/")) return value;

  const lower = value.toLowerCase();
  if (kind === "banner" || lower.startsWith("banner-")) return `/uploads/banners/${value}`;
  if (kind === "thumbnail" || lower.startsWith("thumbnail-")) return `/uploads/thumbnails/${value}`;
  if (kind === "video" || lower.startsWith("video-") || /\.(mp4|webm|mov|m4v)$/i.test(value)) return `/uploads/movies/${value}`;
  if (kind === "poster" || lower.startsWith("poster-") || /\.(jpe?g|png|webp)$/i.test(value)) return `/uploads/posters/${value}`;
  return value;
};

export const toMediaUrl = (url, kind = "") => {
  if (!url) return "";
  const path = inferUploadPath(url, kind);
  if (path.startsWith("/uploads/")) return `${API_URL}${path}`;
  if (url.startsWith("http")) return url.replace(/^http:\/\//i, "https://");
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
};

export default api;
