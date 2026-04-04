import { detectPose } from "../api/tryonApi";

const createDefaultGarmentSvg = () =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="520" height="720" viewBox="0 0 520 720">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4F46E5" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M136 74c23-28 57-42 124-42 65 0 101 14 124 42l72 82-54 44-44-48-20 508H182L162 152l-44 48-54-44 72-82z" fill="url(#g)" />
      <path d="M180 98c20 22 46 34 80 34 34 0 60-12 80-34" fill="none" stroke="#EC4899" stroke-width="16" stroke-linecap="round" />
      <circle cx="260" cy="332" r="16" fill="#FFFFFF" fill-opacity="0.82" />
      <circle cx="260" cy="402" r="16" fill="#FFFFFF" fill-opacity="0.82" />
      <circle cx="260" cy="472" r="16" fill="#FFFFFF" fill-opacity="0.82" />
    </svg>
  `)}`;

export const defaultGarmentUrl = createDefaultGarmentSvg();

const stopStream = (stream) => {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => track.stop());
};

const waitForMetadata = (videoElement) =>
  new Promise((resolve) => {
    if (videoElement.readyState >= 1 && videoElement.videoWidth > 0) {
      resolve();
      return;
    }

    const onLoadedMetadata = () => {
      videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
      resolve();
    };

    videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
  });

const sleep = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const ensureCanvasSize = (canvas, width, height) => {
  if (canvas.width !== width) {
    canvas.width = width;
  }

  if (canvas.height !== height) {
    canvas.height = height;
  }
};

/** Capture current video frame as base64 (for pose API). */
const canvasToDataUrl = (canvas) => canvas.toDataURL("image/jpeg", 0.85);

/** Load garment image from URL or data URL. */
const loadGarmentImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src || defaultGarmentUrl;
  });

/**
 * Compute garment bounding box in **video pixel** coordinates from pose landmarks.
 * @param {object} landmarks - leftShoulder, rightShoulder, leftHip, rightHip, neck (optional)
 * @param {'top'|'bottom'|'jewellery'|'shoes'} layerKind
 * @param {number} scaleFactor - multiplier (e.g. from UI slider)
 * @returns {{ x: number, y: number, width: number, height: number } | null}
 */
export function computeGarmentLayoutFromLandmarks(landmarks, layerKind = "top", scaleFactor = 1) {
  const { leftShoulder, rightShoulder, leftHip, rightHip, neck } = landmarks;
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;

  const shoulderWidth = Math.hypot(
    rightShoulder.x - leftShoulder.x,
    rightShoulder.y - leftShoulder.y
  );
  const torsoLeft = Math.hypot(leftHip.x - leftShoulder.x, leftHip.y - leftShoulder.y);
  const torsoRight = Math.hypot(rightHip.x - rightShoulder.x, rightHip.y - rightShoulder.y);
  const torsoHeight = (torsoLeft + torsoRight) / 2;

  const centerX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;

  if (layerKind === "top") {
    const drawWidth = shoulderWidth * 1.4 * scaleFactor;
    const drawHeight = torsoHeight * 2.2 * scaleFactor;
    const x = centerX - drawWidth / 2;
    const y = (neck ? neck.y : shoulderY) - drawHeight * 0.15;
    return { x, y, width: drawWidth, height: drawHeight };
  }

  if (layerKind === "bottom") {
    const drawWidth = shoulderWidth * 1.25 * scaleFactor;
    const drawHeight = torsoHeight * 2.0 * scaleFactor;
    const midHipY = (leftHip.y + rightHip.y) / 2;
    const x = centerX - drawWidth / 2;
    const y = midHipY - drawHeight * 0.15;
    return { x, y, width: drawWidth, height: drawHeight };
  }

  if (layerKind === "jewellery") {
    const neckX = neck ? neck.x : centerX;
    const neckY = neck ? neck.y : shoulderY - shoulderWidth * 0.12;
    const s = shoulderWidth * 0.38 * scaleFactor;
    return { x: neckX - s / 2, y: neckY - s * 0.35, width: s, height: s };
  }

  if (layerKind === "shoes") {
    const drawWidth = shoulderWidth * 0.95 * scaleFactor;
    const drawHeight = torsoHeight * 0.85 * scaleFactor;
    const footY = Math.max(leftHip.y, rightHip.y) + torsoHeight * 0.55;
    const x = centerX - drawWidth / 2;
    const y = footY - drawHeight * 0.5;
    return { x, y, width: drawWidth, height: drawHeight };
  }

  return null;
}

/**
 * Map a rectangle in **video** pixel space to Konva coordinates inside a **horizontally mirrored** stage
 * (same setup as `object-cover` video + `scaleX(-1)` overlay).
 */
export function mapVideoRectToMirroredStage(rect, vw, vh, stageW, stageH) {
  if (!vw || !vh || !stageW || !stageH) return { ...rect };
  const coverScale = Math.max(stageW / vw, stageH / vh);
  const offsetX = (stageW - vw * coverScale) / 2;
  const offsetY = (stageH - vh * coverScale) / 2;
  const coverLeft = rect.x * coverScale + offsetX;
  const coverTop = rect.y * coverScale + offsetY;
  const dw = rect.width * coverScale;
  const dh = rect.height * coverScale;
  return {
    x: stageW - coverLeft - dw,
    y: coverTop,
    width: dw,
    height: dh,
  };
}

/** Draw garment on overlay canvas using pose landmarks (live video overlay). */
const drawGarmentFromLandmarks = (ctx, garmentImg, landmarks, scaleFactor, videoWidth, videoHeight) => {
  const rect = computeGarmentLayoutFromLandmarks(landmarks, "top", scaleFactor);
  if (!rect) return;

  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.drawImage(garmentImg, rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
};

/** Check if camera (getUserMedia) is available. Requires HTTPS or localhost. */
export const isCameraSupported = () =>
  typeof navigator !== "undefined" &&
  navigator.mediaDevices != null &&
  typeof navigator.mediaDevices.getUserMedia === "function";

export const createTryOnSession = async ({
  videoElement,
  overlayCanvas,
  garmentUrl,
  initialScale = 1,
  onStatus,
  onPoseState,
}) => {
  onStatus?.("Requesting camera access...");

  if (!isCameraSupported()) {
    const isSecure = typeof window !== "undefined" && (window.isSecureContext || window.location?.protocol === "https:" || /^localhost$|^127\.0\.0\.1$/i.test(window.location?.hostname || ""));
    throw new Error(
      isSecure
        ? "Camera is not supported in this browser."
        : "Camera access requires a secure connection (HTTPS) or opening the app from this device at http://localhost:3000. When using the app from your phone at an IP address (e.g. 192.168.0.69), the browser blocks the camera on HTTP. Use try-on on your computer, or serve the app over HTTPS."
    );
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });

  videoElement.srcObject = stream;
  videoElement.muted = true;
  videoElement.playsInline = true;
  await videoElement.play();
  await waitForMetadata(videoElement);

  const captureCanvas = document.createElement("canvas");
  const width = videoElement.videoWidth || 1280;
  const height = videoElement.videoHeight || 720;

  ensureCanvasSize(captureCanvas, width, height);
  ensureCanvasSize(overlayCanvas, width, height);

  let scaleFactor = initialScale;
  let isDisposed = false;
  let activeAbortController = null;

  const garmentImg = await loadGarmentImage(garmentUrl || defaultGarmentUrl);
  const overlayCtx = overlayCanvas.getContext("2d");

  const processFrame = async () => {
    if (videoElement.readyState < 2 || isDisposed) return;

    const context = captureCanvas.getContext("2d");
    context.drawImage(videoElement, 0, 0, captureCanvas.width, captureCanvas.height);

    const frameBase64 = canvasToDataUrl(captureCanvas);

    try {
      activeAbortController = new AbortController();
      const result = await detectPose(frameBase64);

      if (isDisposed) return;

      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      const hasPose =
        result.success &&
        (result.leftShoulder || result.rightShoulder) &&
        (result.leftHip || result.rightHip);

      if (hasPose) {
        drawGarmentFromLandmarks(
          overlayCtx,
          garmentImg,
          {
            leftShoulder: result.leftShoulder,
            rightShoulder: result.rightShoulder,
            leftHip: result.leftHip,
            rightHip: result.rightHip,
            neck: result.neck,
          },
          scaleFactor,
          overlayCanvas.width,
          overlayCanvas.height
        );
        onStatus?.("Live camera: pose detected. Outfit overlay active.");
      } else {
        onStatus?.("Live camera: position your shoulders and torso in frame.");
      }

      onPoseState?.({ detected: !!hasPose });
    } catch (error) {
      if (!isDisposed && error.name !== "AbortError" && error.name !== "CanceledError") {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        onStatus?.("Waiting for pose service… Keep camera in frame.");
        onPoseState?.({ detected: false });
      }
    } finally {
      activeAbortController = null;
    }
  };

  const processLoop = async () => {
    while (!isDisposed) {
      await processFrame();
      await sleep(200);
    }
  };

  onStatus?.("Live camera on. Detecting pose and overlaying outfit.");
  processLoop();

  const handleResize = () => {
    const nextWidth = videoElement.videoWidth || width;
    const nextHeight = videoElement.videoHeight || height;

    ensureCanvasSize(captureCanvas, nextWidth, nextHeight);
    ensureCanvasSize(overlayCanvas, nextWidth, nextHeight);
  };

  window.addEventListener("resize", handleResize);

  return {
    setScale(nextScale) {
      scaleFactor = nextScale;
    },
    capture() {
      const w = overlayCanvas.width;
      const h = overlayCanvas.height;
      const temp = document.createElement("canvas");
      temp.width = w;
      temp.height = h;
      const tctx = temp.getContext("2d");
      tctx.drawImage(videoElement, 0, 0, w, h);
      tctx.drawImage(overlayCanvas, 0, 0, w, h);
      return temp.toDataURL("image/png");
    },
    stop() {
      if (isDisposed) {
        return;
      }

      isDisposed = true;
      window.removeEventListener("resize", handleResize);
      activeAbortController?.abort();
      stopStream(stream);
      videoElement.srcObject = null;
    },
  };
};
