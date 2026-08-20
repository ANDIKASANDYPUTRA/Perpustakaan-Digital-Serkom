import axios from "axios";
import Cookies from "js-cookie";

const TOKEN_KEY = "auth_token";

/**
 * Pre-configured Axios instance for the Laravel Sanctum API.
 * - Attaches Bearer token from cookies on every request.
 * - Redirects to /login on 401 responses.
 */
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor: Attach Token ───────────
api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Handle 401 ────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove(TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default api;
