import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Determine active role and token
  const activeRole =
    localStorage.getItem("activeRole") ||
    (localStorage.getItem("adminToken")
      ? "admin"
      : localStorage.getItem("token_organizer")
      ? "organizer"
      : "user");

  let token = null;
  if (activeRole === "admin") token = localStorage.getItem("adminToken");
  else if (activeRole === "organizer")
    token = localStorage.getItem("token_organizer");
  else token = localStorage.getItem("token_user");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith("/admin");
      const hasAnyToken =
        !!localStorage.getItem("adminToken") ||
        !!localStorage.getItem("token_organizer") ||
        !!localStorage.getItem("token_user");

      if (
        !isAdminRoute &&
        !localStorage.getItem("adminToken") &&
        !hasAnyToken
      ) {
        // clear any stale session and redirect to login
        localStorage.removeItem("token_user");
        localStorage.removeItem("user_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
