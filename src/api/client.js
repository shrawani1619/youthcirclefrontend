import axios from "axios";

const PRODUCTION_API_BASE = "https://youthcirclebackend.onrender.com/api/v1";

const getBaseURL = () => {
  const fromEnv = process.env.REACT_APP_API_URL?.trim();
  if (fromEnv) {
    // Avoid double slashes when joining paths in axios
    return fromEnv.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location?.protocol === "https:") {
    return PRODUCTION_API_BASE;
  }

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
