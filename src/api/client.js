import axios from "axios";

const getBaseURL = () => {
  // Prefer explicit API URL (supports HTTPS in production).
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  // Production-safe fallback (prevents mixed-content on HTTPS deployments like Vercel).
  if (typeof window !== "undefined" && window.location?.protocol === "https:") {
    return "https://youthcirclebackend.onrender.com/api/v1";
  }

  // Local dev fallback (supports running backend on same LAN for phone testing).
  const apiPort = process.env.REACT_APP_API_PORT || "5001";
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:${apiPort}/api/v1`;
  }
  return `http://localhost:${apiPort}/api/v1`;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
});

export const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default apiClient;
