import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for live camera access via navigator.mediaDevices.getUserMedia.
 * Returns video ref, stream status, start/stop functions, and ensures
 * proper cleanup of the media stream on unmount so the camera light turns off.
 *
 * Camera is NOT reinitialized when other state (e.g. selected products) changes—
 * only when start() is called or component unmounts (cleanup).
 */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | starting | active | error
  const [error, setError] = useState(null);

  const stop = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus("idle");
    setError(null);
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera API not available. Use HTTPS or localhost.");
      setStatus("error");
      return;
    }

    setError(null);
    setStatus("starting");

    try {
      // Stop any existing stream before requesting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStatus("active");
    } catch (err) {
      const message =
        err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permission."
          : err.message || "Could not start camera.";
      setError(message);
      setStatus("error");
    }
  }, []);

  // Cleanup: stop all tracks when the component unmounts so the camera light turns off
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    status,
    error,
    start,
    stop,
    isActive: status === "active",
  };
}

export default useCamera;
