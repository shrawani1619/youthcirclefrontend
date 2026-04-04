import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";

import { detectPose } from "../../api/tryonApi";
import { useCamera } from "../../hooks/useCamera";
import ProductLayer from "../ProductLayer/ProductLayer";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import {
  computeGarmentLayoutFromLandmarks,
  mapVideoRectToMirroredStage,
} from "../../utils/tryOnHelpers";

// Z-order: render first = back, last = front. So bottom → top → jewellery → shoes.
const LAYER_ORDER = ["bottom", "top", "jewellery", "shoes"];

// Multiplier to make overlays match the camera framing on different phones.
// If outfits look too small, increase this value (e.g. 1.25 → 1.35).
const AI_OVERLAY_SCALE = 1.25;

// Initial placeholder until first pose frame (hidden off-stage until AI updates)
const defaultPlacement = (index) => ({
  position: { x: -9999, y: -9999 },
  width: 220,
  height: 280,
});

/**
 * AI Virtual Trial Room: camera + overlays positioned from body pose (TensorFlow MoveNet via backend).
 * No manual drag — placement is fully driven by live pose detection.
 */
function VirtualTrialRoom({
  initialProducts = {},
  catalog = {},
  stageWidth = 640,
  stageHeight = 480,
}) {
  const containerRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const [size, setSize] = useState({ width: stageWidth, height: stageHeight });
  const { videoRef, status, error, start, stop, isActive } = useCamera();

  useEffect(() => {
    captureCanvasRef.current = document.createElement("canvas");
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {};
      if (width > 0 && height > 0) setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [layers, setLayers] = useState(() => {
    const initial = {};
    LAYER_ORDER.forEach((key) => {
      const product = initialProducts[key];
      if (product) {
        const imageUrl = resolveImageUrl(
          product.images?.[0] || product.image || product.tryOnModel
        );
        initial[key] = {
          id: product._id || key,
          name: product.name || key,
          imageUrl,
          ...defaultPlacement(LAYER_ORDER.indexOf(key)),
        };
      } else {
        initial[key] = null;
      }
    });
    return initial;
  });

  const setProduct = useCallback((layerKey, product) => {
    if (!product) {
      setLayers((prev) => ({ ...prev, [layerKey]: null }));
      return;
    }
    const imageUrl = resolveImageUrl(
      product.images?.[0] || product.image || product.tryOnModel
    );
    const index = LAYER_ORDER.indexOf(layerKey);
    setLayers((prev) => ({
      ...prev,
      [layerKey]: {
        id: product._id || `${layerKey}-${Date.now()}`,
        name: product.name || layerKey,
        imageUrl,
        ...defaultPlacement(index),
      },
    }));
  }, []);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    let cancelled = false;
    const sleep = (ms) =>
      new Promise((resolve) => {
        window.setTimeout(resolve, ms);
      });

    const tick = async () => {
      while (!cancelled) {
        const video = videoRef.current;
        const canvas = captureCanvasRef.current;
        if (
          !video ||
          !canvas ||
          video.readyState < 2 ||
          size.width < 32 ||
          size.height < 32
        ) {
          await sleep(180);
          continue;
        }

        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh) {
          await sleep(180);
          continue;
        }

        const ctx = canvas.getContext("2d");
        canvas.width = vw;
        canvas.height = vh;
        ctx.drawImage(video, 0, 0, vw, vh);
        const frameBase64 = canvas.toDataURL("image/jpeg", 0.85);

        try {
          const result = await detectPose(frameBase64);
          if (cancelled) return;

          const hasPose =
            result.success &&
            (result.leftShoulder || result.rightShoulder) &&
            (result.leftHip || result.rightHip);

          const landmarks = {
            leftShoulder: result.leftShoulder,
            rightShoulder: result.rightShoulder,
            leftHip: result.leftHip,
            rightHip: result.rightHip,
            neck: result.neck,
          };

          if (hasPose) {
            setLayers((prev) => {
              const next = { ...prev };
              let changed = false;
              for (const layerKey of LAYER_ORDER) {
                const p = prev[layerKey];
                if (!p) continue;
                const layout = computeGarmentLayoutFromLandmarks(
                  landmarks,
                  layerKey,
                  AI_OVERLAY_SCALE
                );
                if (!layout) continue;
                const mapped = mapVideoRectToMirroredStage(
                  layout,
                  vw,
                  vh,
                  size.width,
                  size.height
                );
                const dx = Math.abs(mapped.x - p.position.x);
                const dy = Math.abs(mapped.y - p.position.y);
                const dw = Math.abs(mapped.width - p.width);
                const dh = Math.abs(mapped.height - p.height);
                if (dx > 1.5 || dy > 1.5 || dw > 1.5 || dh > 1.5) {
                  next[layerKey] = {
                    ...p,
                    position: { x: mapped.x, y: mapped.y },
                    width: mapped.width,
                    height: mapped.height,
                  };
                  changed = true;
                }
              }
              return changed ? next : prev;
            });
          }
        } catch {
          // Ignore transient pose-detection failures; user keeps the camera open.
        }

        await sleep(240);
      }
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [isActive, size.width, size.height, videoRef]);

  const catalogByLayer = useMemo(() => {
    const byLayer = { top: [], bottom: [], jewellery: [], shoes: [] };
    if (catalog.top) byLayer.top = catalog.top;
    if (catalog.bottom) byLayer.bottom = catalog.bottom;
    if (catalog.jewellery) byLayer.jewellery = catalog.jewellery;
    if (catalog.shoes) byLayer.shoes = catalog.shoes;
    return byLayer;
  }, [catalog]);

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:gap-6">
      <div className="flex-1">
        <div
          ref={containerRef}
          className="relative h-[70dvh] min-h-[360px] w-full overflow-hidden bg-slate-900 shadow-none lg:h-[calc(100dvh-170px)] lg:min-h-[520px] lg:rounded-2xl rounded-none"
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          {isActive && (
            <div
              className="absolute inset-0"
              style={{ transform: "scaleX(-1)" }}
            >
              <Stage width={size.width} height={size.height}>
                <Layer>
                  {LAYER_ORDER.map((layerKey) => {
                    const layer = layers[layerKey];
                    if (!layer) return null;
                    return (
                      <ProductLayer
                        key={layer.id}
                        imageUrl={layer.imageUrl}
                        position={layer.position}
                        width={layer.width}
                        height={layer.height}
                      />
                    );
                  })}
                </Layer>
              </Stage>
            </div>
          )}

          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/90 p-6 text-center">
              <button
                type="button"
                onClick={start}
                disabled={status === "starting"}
                className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-70"
              >
                {status === "starting"
                  ? "Starting..."
                  : status === "active"
                    ? "Camera on"
                    : "Start AI try-on"}
              </button>
              {status === "error" && error ? (
                <p className="mt-3 text-center text-xs text-rose-200">{error}</p>
              ) : null}
            </div>
          )}

          {isActive && (
            <button
              type="button"
              onClick={stop}
              className="absolute right-3 top-3 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/80"
            >
              Stop camera
            </button>
          )}
        </div>
      </div>

      <aside className="w-full shrink-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-80 lg:max-h-[calc(100dvh-200px)] max-h-[28dvh]">
        {LAYER_ORDER.map((layerKey) => (
          <div
            key={layerKey}
            className="mt-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
          >
            <span className="sr-only">{layerKey}</span>
            <div className="flex flex-wrap gap-2">
              {catalogByLayer[layerKey]?.length > 0
                ? catalogByLayer[layerKey].slice(0, 4).map((product) => {
                    const selected = layers[layerKey]?.id === product._id;
                    return (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => setProduct(layerKey, product)}
                        className={
                          selected
                            ? "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-indigo-500 transition"
                            : "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-slate-200 transition hover:border-indigo-400 hover:opacity-90"
                        }
                        aria-label={`Select ${product.name} for ${layerKey}`}
                      >
                        <img
                          src={resolveImageUrl(
                            product.images?.[0] || product.image
                          )}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })
                : layers[layerKey] ? (
                  <div className="h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <img
                      src={layers[layerKey].imageUrl}
                      alt={layers[layerKey].name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}

export default VirtualTrialRoom;
