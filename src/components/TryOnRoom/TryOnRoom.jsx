import { useEffect, useRef, useState } from "react";

import { createTryOnSession, isCameraSupported } from "../../utils/tryOnHelpers";

const TryOnRoom = ({ garmentUrl, productName }) => {
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const sessionRef = useRef(null);

  const [cameraSupported] = useState(() => isCameraSupported());
  const [status, setStatus] = useState("Camera is off.");
  const [error, setError] = useState("");
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [poseDetected, setPoseDetected] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState("");

  const stopSession = () => {
    sessionRef.current?.stop();
    sessionRef.current = null;
    setIsActive(false);
    setPoseDetected(false);
    setStatus("Camera is off.");
  };

  const startSession = async () => {
    if (!videoRef.current || !overlayCanvasRef.current) {
      return;
    }

    setError("");
    setCapturedFrame("");
    setIsLoading(true);

    try {
      const session = await createTryOnSession({
        videoElement: videoRef.current,
        overlayCanvas: overlayCanvasRef.current,
        garmentUrl,
        initialScale: scale,
        onStatus: setStatus,
        onPoseState: ({ detected }) => {
          setPoseDetected(Boolean(detected));
        },
      });

      sessionRef.current = session;
      setIsActive(true);
    } catch (sessionError) {
      setError(sessionError.message || "Unable to start the virtual try-on room.");
      setStatus("Camera access failed.");
      stopSession();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    sessionRef.current?.setScale(scale);
  }, [scale]);

  useEffect(() => stopSession, []);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    stopSession();

    return undefined;
  }, [garmentUrl]);

  const capturePreview = () => {
    const nextFrame = sessionRef.current?.capture();

    if (nextFrame) {
      setCapturedFrame(nextFrame);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-slate-200">
        <div className="relative overflow-hidden rounded-[24px] bg-slate-950">
          <video
            ref={videoRef}
            className="aspect-[4/5] w-full bg-slate-950 object-cover"
            autoPlay
            muted
            playsInline
          />
          <canvas
            ref={overlayCanvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {!isActive ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 p-6 text-center">
              <div className="max-w-sm space-y-3">
                <p className="text-lg font-semibold text-white">Virtual Trial Room</p>
                <p className="text-sm text-slate-300">
                  {cameraSupported
                    ? `Start your camera to preview how ${productName || "this outfit"} aligns on your body in real time.`
                    : "Camera is not available on this page. Use the app at http://localhost:3000 on your computer, or over HTTPS, to enable the try-on camera."}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-[22px] bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Live status</p>
            <p className="text-sm text-slate-600">{status}</p>
            <p className="mt-1 text-xs text-slate-500">
              {poseDetected
                ? "Pose detected by the AI service. Adjust the fit and capture a preview."
                : "Keep your shoulders and upper torso inside the frame for the AI service."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={isActive ? stopSession : startSession}
              disabled={isLoading || !cameraSupported}
              className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isLoading ? "Starting..." : isActive ? "Stop Camera" : "Start Try-On"}
            </button>
            <button
              type="button"
              onClick={capturePreview}
              disabled={!isActive}
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Capture Preview
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-[22px] border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <label htmlFor="fitScale" className="text-sm font-semibold text-slate-900">
              Outfit size adjustment
            </label>
            <span className="text-sm text-slate-500">{Math.round(scale * 100)}%</span>
          </div>
          <input
            id="fitScale"
            type="range"
            min="0.75"
            max="1.35"
            step="0.01"
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
            className="mt-3 h-2 w-full cursor-pointer accent-pink-500"
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      {capturedFrame ? (
        <div className="rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Captured preview</h3>
              <p className="text-sm text-slate-500">
                Snapshot of your current virtual try-on alignment.
              </p>
            </div>
            <a
              href={capturedFrame}
              download="try-on-preview.png"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Download
            </a>
          </div>

          <img
            src={capturedFrame}
            alt="Captured virtual try-on preview"
            className="mt-4 w-full rounded-[22px] object-cover"
          />
        </div>
      ) : null}
    </section>
  );
};

export default TryOnRoom;
