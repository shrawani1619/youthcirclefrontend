import { createContext, useContext, useMemo, useState } from "react";

import { getVendorDashboard, getVendorOrders } from "../api/vendorApi";

const VendorContext = createContext(null);

export const VendorProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async (token) => {
    setLoading(true);

    try {
      const data = await getVendorDashboard(token);
      setDashboard(data.dashboard);
      return data.dashboard;
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (token, params = {}) => {
    setLoading(true);

    try {
      const data = await getVendorOrders(token, params);
      setOrders(data.orders || []);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      dashboard,
      orders,
      loading,
      loadDashboard,
      loadOrders,
      setDashboard,
      setOrders,
    }),
    [dashboard, orders, loading]
  );

  return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
};

export const useVendor = () => {
  const context = useContext(VendorContext);

  if (!context) {
    throw new Error("useVendor must be used within VendorProvider");
  }

  return context;
};
