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
};

const apiClient = axios.create({
  baseURL:process.env.REACT_APP_API_URL || "http://localhost:5001/api/v1",
});

export const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default apiClient;
