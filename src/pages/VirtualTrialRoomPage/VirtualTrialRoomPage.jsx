import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import VirtualTrialRoom from "../../components/VirtualTrialRoom/VirtualTrialRoom";
import { getProducts } from "../../api/productApi";

// Map API category/subcategory to our layer keys for the trial room
const CATEGORY_TO_LAYER = {
  "T-Shirts": "top",
  Shirts: "top",
  Polos: "top",
  Hoodies: "top",
  Blouses: "top",
  Dresses: "top",
  Jackets: "top",
  Jeans: "bottom",
  Shorts: "bottom",
  Leggings: "bottom",
  "Co-ords": "top",
  Jewellery: "jewellery",
  Watches: "jewellery",
  Sunglasses: "jewellery",
  Belts: "jewellery",
  Bags: "jewellery",
  Shoes: "shoes",
  Clothing: "top",
  Accessories: "jewellery",
};

function mapProductToLayer(product) {
  const sub = (product.subcategory || product.category || "").trim();
  const cat = (product.category || "").trim();
  return CATEGORY_TO_LAYER[sub] || CATEGORY_TO_LAYER[cat] || "top";
}

/**
 * AI Virtual Trial Room page. Reads optional initial product(s) from
 * location.state (e.g. from ProductDetails "Try This Look"), loads a small catalog
 * for the right panel, and renders pose-driven overlays (no manual drag).
 */
function VirtualTrialRoomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState({ top: [], bottom: [], jewellery: [], shoes: [] });

  // Build initial products from location.state: { product, layerKey } or { initialProducts: { top?, bottom?, ... } }
  const initialProducts = useMemo(() => {
    const state = location.state || {};
    if (state.initialProducts && typeof state.initialProducts === "object") {
      return state.initialProducts;
    }
    if (state.product && state.layerKey) {
      return { [state.layerKey]: state.product };
    }
    if (state.product) {
      const layerKey = mapProductToLayer(state.product);
      return { [layerKey]: state.product };
    }
    return {};
  }, [location.state]);

  useEffect(() => {
    let isMounted = true;
    const loadCatalog = async () => {
      try {
        const res = await getProducts({ limit: 24 });
        const products = res.products || res || [];
        const byLayer = { top: [], bottom: [], jewellery: [], shoes: [] };
        products.forEach((p) => {
          const key = mapProductToLayer(p);
          if (byLayer[key]) byLayer[key].push(p);
        });
        if (isMounted) setCatalog(byLayer);
      } catch (_e) {
        // Fallback: no catalog; user can still use initial product from state
      }
    };
    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  return (
    <motion.main
      className="min-h-[100dvh] bg-slate-50 p-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between px-4 pt-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-slate-900">
            AI Virtual Trial Room
          </h1>
          <div className="w-12" />
        </div>

        <VirtualTrialRoom
          initialProducts={initialProducts}
          catalog={catalog}
          // Initial portrait sizing; will be updated immediately by ResizeObserver.
          stageWidth={360}
          stageHeight={640}
        />
      </div>
    </motion.main>
  );
}

export default VirtualTrialRoomPage;
