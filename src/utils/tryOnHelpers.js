const TRYON_API_URL = process.env.REACT_APP_TRYON_API_URL || "http://localhost:8000";

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

const canvasToBlob = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to capture the current camera frame."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      0.92
    );
  });

const drawProcessedBlob = async (overlayCanvas, blob) => {
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = objectUrl;
    });

    const context = overlayCanvas.getContext("2d");
    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    context.drawImage(image, 0, 0, overlayCanvas.width, overlayCanvas.height);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const createTryOnSession = async ({
  videoElement,
  overlayCanvas,
  garmentUrl,
  initialScale = 1,
  onStatus,
  onPoseState,
}) => {
  onStatus?.("Requesting camera access...");

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

  const processFrame = async () => {
    if (videoElement.readyState < 2) {
      return;
    }

    const context = captureCanvas.getContext("2d");
    context.drawImage(videoElement, 0, 0, captureCanvas.width, captureCanvas.height);

    const blob = await canvasToBlob(captureCanvas);
    const formData = new FormData();

    formData.append("file", blob, "frame.jpg");
    formData.append("model", garmentUrl || defaultGarmentUrl);
    formData.append("scale", String(scaleFactor));

    activeAbortController = new AbortController();

    const response = await fetch(`${TRYON_API_URL}/tryon/process-frame`, {
      method: "POST",
      body: formData,
      signal: activeAbortController.signal,
    });

    if (!response.ok) {
      throw new Error("Python try-on service could not process the frame.");
    }

    const imageBlob = await response.blob();
    await drawProcessedBlob(overlayCanvas, imageBlob);

    const poseDetected = response.headers.get("X-Pose-Detected") === "true";

    onStatus?.("AI service connected. Processing camera frames.");
    onPoseState?.({
      detected: poseDetected,
    });
  };

  const processLoop = async () => {
    while (!isDisposed) {
      try {
        await processFrame();
      } catch (error) {
        if (!isDisposed && error.name !== "AbortError") {
          onStatus?.("Waiting for Python AI service on port 8000...");
          onPoseState?.({ detected: false });
        }
      } finally {
        activeAbortController = null;
      }

      await sleep(180);
    }
  };

  onStatus?.("Camera ready. Sending frames to the Python AI service.");
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
      return overlayCanvas.toDataURL("image/png");
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
