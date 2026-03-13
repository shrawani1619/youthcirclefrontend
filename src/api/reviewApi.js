import apiClient, { getAuthConfig } from "./client";

export const getProductReviews = async (productId) => {
  const { data } = await apiClient.get(`/reviews/product/${productId}`);
  return data;
};

export const createOrUpdateReview = async (token, productId, payload) => {
  const { data } = await apiClient.post(
    `/reviews/product/${productId}`,
    payload,
    getAuthConfig(token)
  );
  return data;
};

export const deleteReview = async (token, reviewId) => {
  const { data } = await apiClient.delete(`/reviews/${reviewId}`, getAuthConfig(token));
  return data;
};
