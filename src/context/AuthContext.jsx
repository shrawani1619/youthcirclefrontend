import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  getMyProfile,
  loginUser,
  registerAdmin,
  registerCustomer,
  registerVendor,
} from "../api/authApi";

const STORAGE_KEY = "youth-circle-auth";

const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => readStoredSession()?.token || "");
  const [user, setUser] = useState(() => readStoredSession()?.user || null);
  const [vendor, setVendor] = useState(() => readStoredSession()?.vendor || null);
  const [loading, setLoading] = useState(Boolean(readStoredSession()?.token));

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user, vendor }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token, user, vendor]);

  const setSession = (payload) => {
    setToken(payload.token || "");
    setUser(payload.user || null);
    setVendor(payload.vendor || null);
  };

  const clearSession = () => {
    setToken("");
    setUser(null);
    setVendor(null);
  };

  const refreshProfile = async (providedToken = token) => {
    if (!providedToken) {
      clearSession();
      setLoading(false);
      return null;
    }

    setLoading(true);

    try {
      const data = await getMyProfile(providedToken);
      setSession({
        token: providedToken,
        user: data.user,
        vendor: data.vendor,
      });
      return data;
    } catch (error) {
      clearSession();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    refreshProfile(token).catch(() => {
      clearSession();
    });
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setSession(data);
    return data;
  };

  const register = async ({ role, ...payload }) => {
    if (role === "vendor") {
      return registerVendor(payload);
    }

    if (role === "admin") {
      const data = await registerAdmin(payload);
      setSession(data);
      return data;
    }

    const data = await registerCustomer(payload);
    setSession(data);
    return data;
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      token,
      user,
      vendor,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshProfile,
      setSession,
    }),
    [token, user, vendor, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
