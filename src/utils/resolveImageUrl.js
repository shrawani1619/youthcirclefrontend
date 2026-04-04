const LOCAL_FALLBACK_IMAGE = "/images/placeholder-product.svg";

const isAbsoluteUrl = (value) =>
  /^(?:https?:)?\/\//.test(value) || value.startsWith("data:") || value.startsWith("blob:");

const backendPort = process.env.REACT_APP_API_PORT || "5001";

/** Rewrite backend URLs (localhost / 127.0.0.1) to current host so images work on phone */
const rewriteBackendUrl = (url) => {
  if (typeof window === "undefined" || !window.location?.hostname) return url;
  try {
    const parsed = new URL(url);
    const isLocalBackend =
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
      parsed.port === backendPort;
    if (!isLocalBackend) return url;
    return `${parsed.protocol}//${window.location.hostname}:${backendPort}${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
};

const normalizePublicPath = (value) => {
  if (!value) {
    return LOCAL_FALLBACK_IMAGE;
  }

  if (value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  if (isAbsoluteUrl(value)) {
    return rewriteBackendUrl(value);
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value.replace(/^\.?\//, "")}`;
};

export const resolveImageUrl = (value, fallback = LOCAL_FALLBACK_IMAGE) =>
  value ? normalizePublicPath(value) : fallback;

export const localFallbackImage = LOCAL_FALLBACK_IMAGE;
