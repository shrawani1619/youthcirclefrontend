const LOCAL_FALLBACK_IMAGE = "/images/placeholder-product.svg";

const isAbsoluteUrl = (value) =>
  /^(?:https?:)?\/\//.test(value) || value.startsWith("data:") || value.startsWith("blob:");

const normalizePublicPath = (value) => {
  if (!value) {
    return LOCAL_FALLBACK_IMAGE;
  }

  if (isAbsoluteUrl(value) || value.startsWith("/")) {
    return value;
  }

  return `/${value.replace(/^\.?\//, "")}`;
};

export const resolveImageUrl = (value, fallback = LOCAL_FALLBACK_IMAGE) =>
  value ? normalizePublicPath(value) : fallback;

export const localFallbackImage = LOCAL_FALLBACK_IMAGE;
