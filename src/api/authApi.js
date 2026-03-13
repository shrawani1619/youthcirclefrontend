import apiClient, { getAuthConfig } from "./client";

export const registerCustomer = async (payload) => {
  const { data } = await apiClient.post("/auth/register/customer", payload);
  return data;
};

export const registerVendor = async (payload) => {
  const { data } = await apiClient.post("/auth/register/vendor", payload);
  return data;
};

export const registerAdmin = async (payload) => {
  const { data } = await apiClient.post("/auth/register/admin", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
};

export const getMyProfile = async (token) => {
  const { data } = await apiClient.get("/auth/me", getAuthConfig(token));
  return data;
};

export const getPendingVendors = async (token) => {
  const { data } = await apiClient.get("/auth/vendors/pending", getAuthConfig(token));
  return data;
};

export const getAllVendors = async (token) => {
  const { data } = await apiClient.get("/auth/vendors", getAuthConfig(token));
  return data;
};

export const approveVendor = async (token, vendorId) => {
  const { data } = await apiClient.patch(
    `/auth/vendors/${vendorId}/approve`,
    {},
    getAuthConfig(token)
  );
  return data;
};

export const getAdminCustomers = async (token) => {
  const { data } = await apiClient.get("/auth/customers", getAuthConfig(token));
  return data;
};
