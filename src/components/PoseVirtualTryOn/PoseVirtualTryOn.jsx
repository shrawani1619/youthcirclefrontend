import React, { useEffect, useRef, useState, useMemo } from "react";
import { Pose } from "@mediapipe/pose";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { Camera } from "@mediapipe/camera_utils";

const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
};

// Simple demo catalog. Images should be PNGs with transparent background.
const DEFAULT_ITEMS = [
  { id: "dress1", label: "Dress 1", src: "/products/dress1.png" },
  { id: "top1", label: "Top 1", src: "/products/top1.png" },
  { id: "tshirt1", label: "T‑Shirt", src: "/products/tshirt1.png" },
];

const PoseVirtualTryOn = ({ items = DEFAULT_ITEMS, initialItemId }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const segmentationRef = useRef(null);
  const productImageRef = useRef(null);
  const [imagesCache] = useState(() => new Map());

  const [error, setError] = useState("");
  const [status, setStatus] = useState("Initializing camera…");
  const [poseInfo, setPoseInfo] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(
    initialItemId || items[0]?.id
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) || items[0],
    [items, selectedItemId]
  );

  // Load clothing/product image whenever selection changes
  useEffect(() => {
    if (!selectedItem) return;

    const cached = imagesCache.get(selectedItem.src);
    if (cached) {
      productImageRef.current = cached;
      return;
    }

    const img = new Image();
    img.src = selectedItem.src;
    img.onload = () => {
      imagesCache.set(selectedItem.src, img);
      productImageRef.current = img;
    };
    img.onerror = () => {
      setError("Failed to load product image.");
    };
  }, [selectedItem, imagesCache]);

  // Initialize MediaPipe Pose
  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(handlePoseResults);
    poseRef.current = pose;

    return () => {
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
    };
  }, []);

  // Initialize Selfie Segmentation for basic occlusion handling
  useEffect(() => {
    const segmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    segmentation.setOptions({
      modelSelection: 1,
    });

    segmentation.onResults((results) => {
      // We only need the mask; we will use it inside handlePoseResults via results.segmentationMask if available.
      // Store the latest mask canvas on the ref for reuse.
      segmentationRef.current = results.segmentationMask || null;
    });

    return () => {
      segmentation.close();
      segmentationRef.current = null;
    };
  }, []);

  // Start camera
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !poseRef.current) return;

    const camera = new Camera(videoEl, {
      onFrame: async () => {
        if (videoEl.readyState < 2) return;

        if (poseRef.current) {
          await poseRef.current.send({ image: videoEl });
        }
      },
      width: 640,
      height: 480,
    });

    camera
      .start()
      .then(() => {
        setStatus("Camera ready. Detecting body…");
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError(
          "Could not access camera. Please allow permission and use HTTPS or localhost."
        );
        setStatus("Camera access failed.");
      });

    cameraRef.current = camera;

    return () => {
      const el = videoRef.current;
      if (el && el.srcObject) {
        const tracks = el.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
        el.srcObject = null;
      }
      cameraRef.current = null;
    };
  }, []);

  const handlePoseResults = (results) => {
    const canvasEl = canvasRef.current;
    const ctx = canvasEl?.getContext("2d");
    const videoEl = videoRef.current;
    const productImage = productImageRef.current;

    if (!canvasEl || !ctx || !videoEl) return;

    canvasEl.width = videoEl.videoWidth || 640;
    canvasEl.height = videoEl.videoHeight || 480;

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    // Draw the video frame as the background
    ctx.save();
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    ctx.restore();

    if (!results.poseLandmarks || !productImage) {
      setStatus("Align your upper body in the frame.");
      return;
    }

    const landmarks = results.poseLandmarks;
    const nose = landmarks[POSE_LANDMARKS.NOSE];
    const ls = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rs = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const lh = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rh = landmarks[POSE_LANDMARKS.RIGHT_HIP];

    if (!ls || !rs || !lh || !rh) {
      setStatus("Move back a little so shoulders and hips are visible.");
      return;
    }

    const shoulderLeft = {
      x: ls.x * canvasEl.width,
      y: ls.y * canvasEl.height,
    };
    const shoulderRight = {
      x: rs.x * canvasEl.width,
      y: rs.y * canvasEl.height,
    };
    const hipLeft = {
      x: lh.x * canvasEl.width,
      y: lh.y * canvasEl.height,
    };
    const hipRight = {
      x: rh.x * canvasEl.width,
      y: rh.y * canvasEl.height,
    };

    const centerX =
      (shoulderLeft.x + shoulderRight.x + hipLeft.x + hipRight.x) / 4;
    const centerY =
      (shoulderLeft.y + shoulderRight.y + hipLeft.y + hipRight.y) / 4;

    const shoulderWidth = distance(shoulderLeft, shoulderRight);
    const hipWidth = distance(hipLeft, hipRight);
    const torsoCenterY =
      (shoulderLeft.y + shoulderRight.y + hipLeft.y + hipRight.y) / 4;

    const torsoHeight = Math.abs(
      (hipLeft.y + hipRight.y) / 2 - (shoulderLeft.y + shoulderRight.y) / 2
    );

    const baseWidth = Math.max(shoulderWidth, hipWidth) * 1.7;
    const baseHeight = torsoHeight * 2.2 || baseWidth * 1.4;

    const aspect = productImage.width / productImage.height || 1;

    let drawWidth = baseWidth;
    let drawHeight = baseWidth / aspect;

    if (drawHeight < baseHeight) {
      drawHeight = baseHeight;
      drawWidth = baseHeight * aspect;
    }

    const angle = Math.atan2(
      shoulderRight.y - shoulderLeft.y,
      shoulderRight.x - shoulderLeft.x
    );

    // Basic pose info for debugging / UX
    const orientationDegrees = (angle * 180) / Math.PI;
    setPoseInfo({
      shoulderWidth: Math.round(shoulderWidth),
      torsoHeight: Math.round(torsoHeight),
      orientation: Math.round(orientationDegrees),
      distanceEstimate: Math.round(canvasEl.height / (torsoHeight || 1)),
    });

    setStatus("Pose detected. Outfit following your movement.");

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    const neckY =
      (nose ? nose.y * canvasEl.height : torsoCenterY) - drawHeight * 0.05;

    ctx.drawImage(
      productImage,
      -drawWidth / 2,
      neckY - centerY - drawHeight * 0.1,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  };

  const distance = (a, b) => {
    if (!a || !b) return 0;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4 py-6">
      <h1 className="text-2xl font-semibold mb-3">
        AI Virtual Trial Room (Pose)
      </h1>

      {error && (
        <p className="mb-2 text-sm text-rose-300 max-w-md text-center">
          {error}
        </p>
      )}

      <p className="mb-3 text-xs text-slate-300 max-w-md text-center">
        {status}
      </p>

      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
        <video
          ref={videoRef}
          className="hidden"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="block max-w-[90vw] max-h-[70vh]"
        />
      </div>

      <p className="mt-3 text-sm text-slate-300 max-w-md text-center">
        Stand so your upper body is visible. The clothing overlay will align
        automatically with your shoulders and torso and follow your movement
        in real time.
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedItemId(item.id)}
            className={`rounded-full px-4 py-2 text-xs font-medium border ${
              selectedItemId === item.id
                ? "bg-indigo-500 border-indigo-400 text-white"
                : "bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {poseInfo && (
        <div className="mt-3 text-[11px] text-slate-400">
          <span className="mr-3">
            Shoulder width: {poseInfo.shoulderWidth}px
          </span>
          <span className="mr-3">
            Torso height: {poseInfo.torsoHeight}px
          </span>
          <span>Orientation: {poseInfo.orientation}°</span>
        </div>
      )}
    </div>
  );
};

export default PoseVirtualTryOn;

