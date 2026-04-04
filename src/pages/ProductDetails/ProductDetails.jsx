import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ProductGallery from "../../components/ProductGallery/ProductGallery";
import ProductTabs from "../../components/ProductTabs/ProductTabs";
import Loader from "../../components/Loader/Loader";
import CollectionProductCard from "../../components/Storefront/CollectionProductCard";
import { useCart } from "../../context/CartContext";
import { getProductById, getProducts } from "../../api/productApi";
import { getProductReviews } from "../../api/reviewApi";
import { normalizeLiveProduct, storefrontFallbackProducts } from "../../data/storefrontCollections";
import formatPrice from "../../utils/formatPrice";

const PRODUCT_SIZES = ["S", "M", "L", "XL"];
const RECENTLY_VIEWED_STORAGE_KEY = "youth-circle-recently-viewed";

const trustPoints = [
  "100% Original product.",
  "Cash on delivery is available on this product.",
  "Easy return and exchange policy within 7 days.",
];

const fallbackReviews = [
  {
    _id: "fallback-review-1",
    userId: { name: "Aarav S." },
    rating: 5,
    comment: "The fit feels premium and the finish looks even better in person. Exactly the clean fashion aesthetic I was hoping for.",
  },
  {
    _id: "fallback-review-2",
    userId: { name: "Mia T." },
    rating: 4,
    comment: "Love the elevated styling and the quality of the fabric. The page experience also feels beautifully polished.",
  },
  {
    _id: "fallback-review-3",
    userId: { name: "Kabir M." },
    rating: 5,
    comment: "Minimal, luxe, and easy to style. Delivery was smooth and the product presentation feels premium throughout.",
  },
];

const colorPaletteByCategory = {
  Dresses: [
    { name: "Ivory", className: "bg-stone-100 border border-stone-300" },
    { name: "Rose", className: "bg-rose-300" },
    { name: "Black", className: "bg-slate-900" },
    { name: "Lavender", className: "bg-violet-300" },
  ],
  Shoes: [
    { name: "White", className: "bg-white border border-slate-300" },
    { name: "Black", className: "bg-slate-900" },
    { name: "Navy", className: "bg-slate-800" },
    { name: "Tan", className: "bg-amber-700" },
  ],
  default: [
    { name: "Charcoal", className: "bg-slate-900" },
    { name: "Stone", className: "bg-stone-200 border border-stone-300" },
    { name: "Olive", className: "bg-lime-700" },
    { name: "Navy", className: "bg-slate-800" },
  ],
};

const lifestyleImageByCategory = {
  Dresses:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
  Shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80",
  Jackets:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
  "T-Shirts":
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80",
  default:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
};

const renderStars = (rating = 0) =>
  Array.from({ length: 5 }, (_, index) => (
    <svg
      key={`${rating}-${index}`}
      viewBox="0 0 20 20"
      className={`h-4 w-4 ${index < Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
      fill="currentColor"
    >
      <path d="m10 1.7 2.5 5.1 5.6.8-4 4 1 5.6L10 14.6 5 17.2l1-5.6-4-4 5.6-.8L10 1.7Z" />
    </svg>
  ));

const isMongoObjectId = (value = "") => /^[a-f0-9]{24}$/i.test(value);

const normalizeDemoProduct = (product) => ({
  _id: product._id,
  name: product.name,
  category: product.category,
  price: Number(product.price || 0),
  discount: Number(product.discount || 0),
  description: product.description,
  images: [product.image],
  vendorId: { businessName: product.brand },
  stock: product.availability === "Low stock" ? 2 : 12,
});

const saveRecentlyViewedProduct = (product) => {
  if (!product?._id) {
    return;
  }

  const entry = {
    _id: product._id,
    name: product.name,
    category: product.category || "Essentials",
    price: Number(product.price || 0),
    discount: Number(product.discount || 0),
    rating: 4.8,
    brand: product.vendorId?.businessName || "YouthCircle",
    description:
      product.description ||
      "A premium marketplace selection curated for a clean and elevated wardrobe.",
    image: product.images?.[0] || "",
    sizeOptions: PRODUCT_SIZES,
    availability: Number(product.stock || 12) > 3 ? "In stock" : "Low stock",
    badge: Number(product.discount || 0) > 0 ? "Sale" : "Popular",
  };

  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const next = [entry, ...(Array.isArray(parsed) ? parsed : []).filter((item) => item._id !== entry._id)].slice(0, 8);
    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next));
  } catch (_error) {
    // Ignore storage failures so product viewing never breaks.
  }
};

const getRelatedProductsFromData = (currentProduct, catalog = []) => {
  const normalizedProducts = catalog
    .filter((item) => item._id !== currentProduct._id)
    .map((item, index) => normalizeLiveProduct(item, index))
    .sort((firstItem, secondItem) => {
      const firstScore =
        (firstItem.category === currentProduct.category ? 2 : 0) +
        (firstItem.brand === (currentProduct.vendorId?.businessName || "YouthCircle") ? 1 : 0);
      const secondScore =
        (secondItem.category === currentProduct.category ? 2 : 0) +
        (secondItem.brand === (currentProduct.vendorId?.businessName || "YouthCircle") ? 1 : 0);

      return secondScore - firstScore;
    })
    .slice(0, 6);

  if (normalizedProducts.length) {
    return normalizedProducts;
  }

  const curatedFallback = storefrontFallbackProducts
    .filter((item) => item._id !== currentProduct._id)
    .filter((item) => item.category === currentProduct.category || item.brand === currentProduct.vendorId?.businessName)
    .slice(0, 6);

  return curatedFallback.length
    ? curatedFallback
    : storefrontFallbackProducts.filter((item) => item._id !== currentProduct._id).slice(0, 6);
};

const ProductDetails = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Charcoal");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const demoProduct = storefrontFallbackProducts.find((item) => item._id === productId);

        if (demoProduct) {
          const relatedResult = await Promise.allSettled([getProducts({ limit: 18 })]);
          const relatedData =
            relatedResult[0].status === "fulfilled" ? relatedResult[0].value : { products: [] };
          const normalizedDemo = normalizeDemoProduct(demoProduct);

          setProduct(normalizedDemo);
          setReviews([]);
          setRelatedProducts(getRelatedProductsFromData(normalizedDemo, relatedData.products || []));
          setError("");
          return;
        }

        if (!isMongoObjectId(productId)) {
          setProduct(null);
          setReviews([]);
          setRelatedProducts([]);
          setError("Product not found.");
          return;
        }

        const [productResult, reviewResult, relatedResult] = await Promise.allSettled([
          getProductById(productId),
          getProductReviews(productId),
          getProducts({ limit: 18 }),
        ]);

        if (productResult.status !== "fulfilled") {
          throw productResult.reason;
        }

        const productData = productResult.value;
        const reviewData = reviewResult.status === "fulfilled" ? reviewResult.value : { reviews: [] };
        const relatedData = relatedResult.status === "fulfilled" ? relatedResult.value : { products: [] };

        setProduct(productData);
        setReviews(reviewData.reviews || []);
        setRelatedProducts(getRelatedProductsFromData(productData, relatedData.products || []));
        setError("");
      } catch (requestError) {
        setProduct(null);
        setReviews([]);
        setRelatedProducts([]);
        setError(
          requestError.response?.data?.message ||
            "Could not load this product. Check that backend-node is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setMessage(""), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  const showcaseReviews = useMemo(() => (reviews.length ? reviews : fallbackReviews), [reviews]);

  const averageRating = useMemo(() => {
    if (!showcaseReviews.length) {
      return 4.8;
    }

    const total = showcaseReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return total / showcaseReviews.length;
  }, [showcaseReviews]);

  const finalPrice = useMemo(() => {
    if (!product) {
      return 0;
    }

    return Number(product.price) * (1 - Number(product.discount || 0) / 100);
  }, [product]);

  const colorOptions = useMemo(() => {
    if (!product) {
      return colorPaletteByCategory.default;
    }

    return colorPaletteByCategory[product.category] || colorPaletteByCategory.default;
  }, [product]);

  useEffect(() => {
    if (!colorOptions.length) {
      return;
    }

    setSelectedColor(colorOptions[0].name);
  }, [colorOptions, productId]);

  useEffect(() => {
    if (product) {
      saveRecentlyViewedProduct(product);
    }
  }, [product]);

  const lifestyleImage = lifestyleImageByCategory[product?.category] || lifestyleImageByCategory.default;
  const brandName = product?.vendorId?.businessName || "YouthCircle";
  const stockLabel = Number(product?.stock || 12) > 3 ? "In stock" : "Limited stock";

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    setMessage("Added to cart.");
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    navigate("/checkout");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <Loader label="Loading product details..." />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <p className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-soft">
          {error || "Product not found."}
        </p>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 lg:px-6 lg:py-10">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <ProductGallery images={product.images} productName={product.name} />

          <section className="max-w-[460px] pt-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  {[product.category, product.subcategory].filter(Boolean).join(" / ") ||
                    "Fashion Essential"}
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  {product.name}
                </h1>
                <p className="mt-2 text-sm text-slate-500">{brandName}</p>
              </div>
              <button
                type="button"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => setWishlisted((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-900 hover:text-rose-500"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M12 20.5s-7-4.6-7-10.3A4.2 4.2 0 0 1 9.2 6c1.2 0 2.3.5 2.8 1.4C12.5 6.5 13.6 6 14.8 6A4.2 4.2 0 0 1 19 10.2c0 5.7-7 10.3-7 10.3Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5">{renderStars(averageRating)}</div>
              <span className="text-slate-500">({showcaseReviews.length})</span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-4xl font-semibold text-slate-900">{formatPrice(finalPrice)}</span>
              {product.discount ? (
                <span className="text-sm font-medium text-rose-600">-{product.discount}%</span>
              ) : null}
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              {product.description ||
                "A lightweight premium wardrobe essential with a clean silhouette and an elevated everyday finish."}
            </p>

            <div className="mt-7">
              <p className="text-sm font-medium text-slate-900">Select Size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRODUCT_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] border px-4 py-3 text-sm font-medium transition ${
                      selectedSize === size
                        ? "border-slate-900 bg-slate-100 text-slate-900"
                        : "border-slate-200 bg-[#f4f4f4] text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center border border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="h-11 w-10 text-lg text-slate-700 transition hover:bg-slate-50"
                >
                  -
                </button>
                <span className="min-w-10 text-center text-sm font-medium text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="h-11 w-10 text-lg text-slate-700 transition hover:bg-slate-50"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-black px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800"
              >
                Add to Cart
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <button
                type="button"
                onClick={handleBuyNow}
                className="font-medium text-slate-700 transition hover:text-slate-900"
              >
                Buy Now
              </button>
              <Link
                to="/virtual-trial-room"
                state={{ product }}
                className="font-medium text-slate-700 transition hover:text-indigo-600"
              >
                Try This Look
              </Link>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                {stockLabel}
              </span>
            </div>

            {colorOptions.length ? (
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-900">Select Color</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`inline-flex items-center gap-2 text-sm ${
                        selectedColor === color.name ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full ${color.className} ${
                          selectedColor === color.name ? "ring-1 ring-slate-900 ring-offset-2" : ""
                        }`}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {message ? <p className="mt-4 text-sm font-medium text-emerald-600">{message}</p> : null}

            <div className="mt-8 border-t border-slate-200 pt-5">
              <div className="space-y-2 text-sm leading-7 text-slate-500">
                {trustPoints.map((point) => (
                  <p key={point}>{point}</p>
                ))}
              </div>
            </div>
          </section>
        </section>

        <ProductTabs product={product} reviews={showcaseReviews} />

        <section
          className="relative overflow-hidden rounded-[40px] px-6 py-12 text-white shadow-soft sm:px-8 lg:px-10"
          style={{
            backgroundImage: `linear-gradient(110deg, rgba(17,24,39,0.88), rgba(17,24,39,0.34)), url(${lifestyleImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_28%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_280px] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/60">Lifestyle Edit</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                Styled for a modern luxury wardrobe.
              </h2>
              <p className="mt-5 text-sm leading-8 text-white/78 md:text-base">
                {product.name} pairs fashion-forward styling with refined simplicity, creating a product page experience inspired by premium editorial commerce.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Style note</p>
              <p className="mt-3 text-xl font-semibold">{selectedColor} tone with {selectedSize} fit</p>
              <p className="mt-3 text-sm leading-7 text-white/75">
                Designed to layer effortlessly with tailored separates, premium denim, or clean sneakers.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Related Products</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Complete the look</h2>
            </div>
            <Link
              to="/products?nav=shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-indigo-600"
            >
              Explore all products
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <CollectionProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductDetails;
