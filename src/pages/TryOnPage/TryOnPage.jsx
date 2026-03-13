import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import TryOnRoom from "../../components/TryOnRoom/TryOnRoom";
import { getProductById, getProductTryOnModel } from "../../api/productApi";
import { defaultGarmentUrl } from "../../utils/tryOnHelpers";
import { localFallbackImage, resolveImageUrl } from "../../utils/resolveImageUrl";

const demoProduct = {
  _id: "demo",
  name: "Deep Indigo Overshirt",
  category: "Shirts",
  description:
    "A sample try-on garment used while backend product data is still being connected to the React storefront.",
  price: 2499,
  discount: 10,
  images: [localFallbackImage],
  tryOnModel: defaultGarmentUrl,
  vendorId: {
    businessName: "Youth Circle Studio",
  },
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const TryOnPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(demoProduct);
  const [loading, setLoading] = useState(productId !== "demo");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId || productId === "demo") {
      setProduct(demoProduct);
      setLoading(false);
      setError("");
      return;
    }

    let isMounted = true;

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const [data, tryOnData] = await Promise.all([
          getProductById(productId),
          getProductTryOnModel(productId),
        ]);

        if (isMounted) {
          setProduct({
            ...demoProduct,
            ...data,
            tryOnModel: tryOnData.tryOnModel || data.tryOnModel || demoProduct.tryOnModel,
          });
        }
      } catch (requestError) {
        if (isMounted) {
          setProduct(demoProduct);
          setError("Unable to fetch this product right now. Demo garment loaded instead.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const finalPrice = useMemo(() => {
    const basePrice = Number(product.price || 0);
    const discount = Number(product.discount || 0);
    return basePrice * (1 - discount / 100);
  }, [product.discount, product.price]);

  const garmentUrl = resolveImageUrl(product.tryOnModel, defaultGarmentUrl);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-6">
        <section className="space-y-6">
          <div className="rounded-[32px] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
              Virtual Trial Room
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Try before you buy.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Launch your camera, stream frames to the dedicated Python AI service, and preview
              the selected outfit through remote pose detection and clothing overlay processing.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                "Camera permission and live video stream",
                "Frame processing through a FastAPI AI microservice",
                "Realtime size adjustment and preview capture",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <TryOnRoom garmentUrl={garmentUrl} productName={product.name} />
        </section>

        <aside className="space-y-6">
          <div className="rounded-[32px] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <div className="aspect-[4/5] overflow-hidden rounded-[24px] bg-gradient-to-br from-indigo-100 via-white to-pink-100">
              <img
                src={resolveImageUrl(product.images?.[0], localFallbackImage)}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {product.category}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? "Loading product..." : product.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>

              <div className="mt-5 flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-900">{formatPrice(finalPrice)}</span>
                {product.discount ? (
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">
                    {product.discount}% off
                  </span>
                ) : null}
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Vendor
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {product.vendorId?.businessName || "Youth Circle Studio"}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  The Node API provides the try-on asset reference, while the Python service
                  handles pose detection, body tracking, and garment overlay.
                </p>
              </div>

              {error ? (
                <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[32px] bg-slate-900 p-6 text-white shadow-soft">
            <h3 className="text-lg font-semibold">How this MVP works</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>React opens the webcam and captures frames in the browser.</li>
              <li>FastAPI receives each frame and runs MediaPipe-based body analysis.</li>
              <li>The Python service returns a processed image that React displays in a canvas.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default TryOnPage;
