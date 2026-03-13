import { useEffect, useMemo, useState } from "react";

import { localFallbackImage, resolveImageUrl } from "../../utils/resolveImageUrl";

const ProductGallery = ({ images = [], productName }) => {
  const gallery = useMemo(() => {
    const resolvedImages = (images.length ? images : [localFallbackImage]).map((image) =>
      resolveImageUrl(image)
    );

    if (resolvedImages.length >= 4) {
      return resolvedImages;
    }

    return [...resolvedImages, ...Array.from({ length: 4 - resolvedImages.length }, () => resolvedImages[0])];
  }, [images]);

  const [activeImage, setActiveImage] = useState(gallery[0]);

  useEffect(() => {
    setActiveImage(gallery[0]);
  }, [gallery]);

  return (
    <section className="grid gap-4 md:grid-cols-[74px_minmax(0,1fr)] md:items-start">
      <div className="flex gap-3 md:flex-col">
        {gallery.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(image)}
            className={`overflow-hidden border bg-[#f7f7f7] transition ${
              activeImage === image ? "border-slate-900" : "border-slate-200 hover:border-slate-400"
            }`}
          >
            <img
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              className="h-[88px] w-[74px] object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden bg-[#f5f5f5]">
        <div className="group overflow-hidden">
          <img
            src={activeImage}
            alt={productName}
            className="aspect-[4/4.9] w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
};

export default ProductGallery;
