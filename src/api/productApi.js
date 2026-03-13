import apiClient, { getAuthConfig } from "./client";

export const getProducts = async (params = {}) => {
  const { data } = await apiClient.get("/products", { params });
  return data;
};

export const getProductById = async (productId) => {
  const { data } = await apiClient.get(`/products/${productId}`);
  return data.product;
};

export const getProductTryOnModel = async (productId) => {
  const { data } = await apiClient.get(`/products/${productId}/tryon-model`);
  return data;
};

export const getMyProducts = async (token) => {
  const { data } = await apiClient.get("/products/mine", getAuthConfig(token));
  return data;
};

export const createProduct = async (token, payload) => {
  const { data } = await apiClient.post("/products", payload, getAuthConfig(token));
  return data;
};

export const updateProduct = async (token, productId, payload) => {
  const { data } = await apiClient.put(`/products/${productId}`, payload, getAuthConfig(token));
  return data;
};

export const deleteProduct = async (token, productId) => {
  const { data } = await apiClient.delete(`/products/${productId}`, getAuthConfig(token));
  return data;
};

export default apiClient;
