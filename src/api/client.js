import axios from "axios";

// Use current host so the same build works on PC (localhost) and phone (192.168.x.x)
const apiPort = process.env.REACT_APP_API_PORT || "5001";
const getBaseURL = () => {
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:${apiPort}/api/v1`;
  }
  return process.env.REACT_APP_API_URL || `http://localhost:${apiPort}/api/v1`;
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
