import apiClient, { getAuthConfig } from "./client";

export const getVendorDashboard = async (token) => {
  const { data } = await apiClient.get("/vendors/dashboard", getAuthConfig(token));
  return data;
};

export const getVendorOrders = async (token, params = {}) => {
  const { data } = await apiClient.get("/vendors/orders", {
    ...getAuthConfig(token),
    params,
  });
  return data;
};

export const updateVendorOrderStatus = async (token, orderId, orderStatus) => {
  const { data } = await apiClient.patch(
    `/vendors/orders/${orderId}/status`,
    { orderStatus },
    getAuthConfig(token)
  );
  return data;
};
