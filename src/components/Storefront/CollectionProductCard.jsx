import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import formatPrice from "../../utils/formatPrice";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const renderStars = (rating = 4.7) =>
  Array.from({ length: 5 }, (_, index) => {
    const filled = index < Math.round(rating);

    return (
      <svg
        key={`${rating}-${index}`}
        viewBox="0 0 20 20"
        className={`h-4 w-4 ${filled ? "text-amber-400" : "text-slate-200"}`}
        fill="currentColor"
      >
        <path d="m10 1.7 2.5 5.1 5.6.8-4 4 1 5.6L10 14.6 5 17.2l1-5.6-4-4 5.6-.8L10 1.7Z" />
      </svg>
    );
  });

const CollectionProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const finalPrice = useMemo(
    () => Number(product.price || 0) * (1 - Number(product.discount || 0) / 100),
    [product.discount, product.price]
  );

  return (
    <article className="group bg-white transition duration-300 hover:-translate-y-0.5">
      <div className="relative overflow-hidden bg-slate-100">
        <Link to={`/products/${product._id}`} className="block">
          <img
            src={resolveImageUrl(product.image || product.images?.[0])}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>
      </div>

      <div className="space-y-2 px-1 pb-2 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="flex items-center gap-1">{renderStars(product.rating)}</span>
          <span>{product.rating.toFixed(1)}</span>
        </div>
        <Link to={`/products/${product._id}`} className="block text-base font-medium text-slate-900">
          {product.name}
        </Link>
        <p className="line-clamp-1 text-sm text-slate-500">{product.description}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-900">{formatPrice(finalPrice)}</span>
          {product.discount ? (
            <span className="text-slate-400 line-through">{formatPrice(product.price)}</span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() =>
            addToCart(
              {
                _id: product._id,
                name: product.name,
                images: [product.image || product.images?.[0] || ""],
                price: Number(product.price || 0),
                discount: Number(product.discount || 0),
                vendorId: product.brand,
              },
              1,
              product.sizeOptions?.[0] || "M"
            )
          }
          className="mt-2 w-full border border-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 transition hover:bg-slate-900 hover:text-white"
        >
          Add to Cart
        </button>
        <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
          {[product.category, product.subcategory, product.brand].filter(Boolean).join(" / ")}
        </div>
      </div>
    </article>
  );
};

export default CollectionProductCard;
