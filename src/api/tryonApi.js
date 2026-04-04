import apiClient from "./client";

/**
 * Estimate body size from a camera/image frame (base64).
 * Uses pose detection to suggest XS/S/M/L/XL for product size recommendation.
 * @param {string} imageBase64 - Base64 image string or data URL (e.g. from canvas.toDataURL())
 * @returns {Promise<{ success: boolean, suggestedSize?: string, measurements?: object }>}
 */
export const estimateBodySize = async (imageBase64) => {
  const { data } = await apiClient.post("/tryon/estimate-size", {
    image: imageBase64,
  });
  return data;
};

/**
 * Detect pose landmarks from a camera/image frame (base64).
 * Returns body points and, when pose is detected, bodySize (suggestedSize + measurements).
 * @param {string} imageBase64 - Base64 image string or data URL
 * @returns {Promise<{ success: boolean, leftShoulder?, rightShoulder?, leftHip?, rightHip?, neck?, bodySize? }>}
 */
export const detectPose = async (imageBase64) => {
  const { data } = await apiClient.post("/tryon/detect-pose", {
    image: imageBase64,
  });
  return data;
};
