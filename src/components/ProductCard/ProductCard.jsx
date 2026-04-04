import { useState } from "react";
import { Link } from "react-router-dom";

import formatPrice from "../../utils/formatPrice";
import { resolveImageUrl, localFallbackImage } from "../../utils/resolveImageUrl";

const ProductCard = ({ product }) => {
  const finalPrice = Number(product.price || 0) * (1 - Number(product.discount || 0) / 100);
  const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(product.images?.[0]));

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1">
      <Link to={`/products/${product._id}`} className="block">
        <div className="aspect-[4/5] bg-slate-100">
          <img
            src={imgSrc}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgSrc(localFallbackImage)}
          />
        </div>
      </Link>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {product.category}
        </p>
        <Link to={`/products/${product._id}`} className="mt-2 block text-lg font-semibold text-slate-900">
          {product.name}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">{formatPrice(finalPrice)}</span>
            {product.discount ? (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>

          <Link
            to={`/products/${product._id}`}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
