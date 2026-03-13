import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Loader from "../../components/Loader/Loader";
import { getProducts } from "../../api/productApi";
import { useCart } from "../../context/CartContext";
import formatPrice from "../../utils/formatPrice";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const heroSlides = [
  {
    id: "street-luxe",
    eyebrow: "Just dropped",
    title: "Street Luxe",
    subtitle: "Men's Essentials",
    description: "Tailored layers, polished jackets, and clean everyday pieces built for modern menswear.",
    primaryLabel: "Shop Men",
    primaryLink: "/products?nav=men",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "minimal-edit",
    eyebrow: "New season edit",
    title: "New Arrivals",
    subtitle: "2024 Collection",
    description: "Discover premium dresses, co-ords, and refined silhouettes curated for elevated daily style.",
    primaryLabel: "Shop Women",
    primaryLink: "/products?nav=women",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "sport-tailored",
    eyebrow: "Performance ready",
    title: "Move Faster",
    subtitle: "Sports Collection",
    description: "Explore active layers, technical tops, and movement-first essentials with a premium finish.",
    primaryLabel: "Shop Sports",
    primaryLink: "/products?nav=sports",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80",
  },
];

const categoryCards = [
  {
    title: "Men",
    subtitle: "Tailored layers and everyday essentials.",
    link: "/products?nav=men",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Women",
    subtitle: "Refined silhouettes for statement dressing.",
    link: "/products?nav=women",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Kids",
    subtitle: "Comfortable style for playful energy.",
    link: "/kids",
    image:
      "https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Sports",
    subtitle: "Performance-first pieces with a premium edge.",
    link: "/products?nav=sports",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Accessories",
    subtitle: "Finish every look with elevated details.",
    link: "/products?nav=shop",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
  },
];

const fallbackProducts = [
  {
    _id: "fallback-1",
    name: "Midnight Overshirt",
    price: 4299,
    discount: 10,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80",
    ],
    vendorId: "demo-vendor",
  },
  {
    _id: "fallback-2",
    name: "Studio Wide-Leg Trousers",
    price: 3899,
    discount: 0,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1506629905607-c52b1ab5f7a3?auto=format&fit=crop&w=1000&q=80",
    ],
    vendorId: "demo-vendor",
  },
  {
    _id: "fallback-3",
    name: "Violet Street Hoodie",
    price: 3199,
    discount: 12,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=80",
    ],
    vendorId: "demo-vendor",
  },
  {
    _id: "fallback-4",
    name: "Minimalist Sneaker",
    price: 5499,
    discount: 8,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
    ],
    vendorId: "demo-vendor",
  },
  {
    _id: "fallback-5",
    name: "Cloud Knit Polo",
    price: 2799,
    discount: 0,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80",
    ],
    vendorId: "demo-vendor",
  },
  {
    _id: "fallback-6",
    name: "Motion Sports Jacket",
    price: 4699,
    discount: 15,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80",
    ],
    vendorId: "demo-vendor",
  },
  {
    _id: "fallback-7",
    name: "Everyday Leather Tote",
    price: 4999,
    discount: 5,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80",
    ],
    vendorId: "demo-vendor",
  },
  {
    _id: "fallback-8",
    name: "Essential Kids Set",
    price: 2299,
    discount: 0,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=1000&q=80",
    ],
    vendorId: "demo-vendor",
  },
];

const renderRating = (rating = 4.7) =>
  Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < Math.round(rating);

    return (
      <svg
        key={`${rating}-${index}`}
        viewBox="0 0 20 20"
        className={`h-4 w-4 ${isFilled ? "text-amber-400" : "text-slate-200"}`}
        fill="currentColor"
      >
        <path d="m10 1.7 2.5 5.1 5.6.8-4 4 1 5.6L10 14.6 5 17.2l1-5.6-4-4 5.6-.8L10 1.7Z" />
      </svg>
    );
  });

const Home = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts({ limit: 8 });
        setProducts(data.products || []);
        setError("");
      } catch (requestError) {
        setProducts([]);
        setError(
          requestError.response?.data?.message ||
            "The product API is currently unavailable. Start backend-node to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const storefrontProducts = useMemo(
    () => (products.length ? products : fallbackProducts),
    [products]
  );
  const currentHeroSlide = heroSlides[activeSlide];

  const trendingProducts = storefrontProducts.slice(0, 8);
  const bestSellerProducts = storefrontProducts.slice(0, 6);

  const handleAddToCart = (product) => {
    addToCart(product, 1, "M");
  };

  return (
    <main className="pb-14">
      <section className="pb-8 pt-0">
        <div
          className="relative overflow-hidden shadow-luxe"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.76) 0%, rgba(0, 0, 0, 0.5) 34%, rgba(0, 0, 0, 0.16) 68%, rgba(0, 0, 0, 0.06) 100%), url(${currentHeroSlide.image})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_26%)]" />
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10">
            <div className="relative grid min-h-[680px] gap-10 py-10 lg:grid-cols-[minmax(0,1.2fr)_380px] lg:py-14">
              <div className="relative z-10 flex flex-col justify-between text-center lg:text-left">
              <div
                key={currentHeroSlide.id}
                className="max-w-2xl px-1 [text-shadow:0_4px_18px_rgba(0,0,0,0.45)]"
              >
                <p className="animate-fade-up inline-flex w-fit rounded-full border border-white/18 bg-black/28 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-sm">
                  {currentHeroSlide.eyebrow}
                </p>
                <h1 className="animate-fade-up animate-delay-100 mt-6 max-w-2xl font-sans text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white md:text-6xl xl:text-[5.5rem]">
                  <span className="block">{currentHeroSlide.title}</span>
                  <span className="mt-1 block">{currentHeroSlide.subtitle}</span>
                </h1>
                <p className="animate-fade-up animate-delay-200 mt-6 max-w-xl text-base leading-8 text-white/90 md:text-lg">
                  {currentHeroSlide.description}
                </p>
                <div className="animate-fade-up animate-delay-300 mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                  <Link
                    to={currentHeroSlide.primaryLink}
                    className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#111111] shadow-[0_16px_40px_-18px_rgba(255,255,255,0.55)] transition duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-[#f3f4f6]"
                  >
                    {currentHeroSlide.primaryLabel}
                  </Link>
                  <Link
                    to="/try-on/demo"
                    className="rounded-full border border-white/25 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_-24px_rgba(15,23,42,0.9)] backdrop-blur-md transition duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/14"
                  >
                    Try AI Virtual Dressing Room
                  </Link>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-center gap-3 lg:justify-start">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Show hero slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      activeSlide === index ? "w-10 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full space-y-12 px-4 py-6 lg:px-8 xl:px-10">
        <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-soft">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                Featured Categories
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 md:text-3xl">
                Shop the edits that define the season.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-500">
              Explore elevated categories curated for modern everyday dressing across every age and
              style.
            </p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-5 xl:p-8">
            {categoryCards.map((category) => (
              <Link
                key={category.title}
                to={category.link}
                className="group overflow-hidden rounded-[28px] bg-slate-100 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-luxe"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={resolveImageUrl(category.image)}
                    alt={category.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-display text-2xl font-semibold text-white">{category.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/75">{category.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Trending Products
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
                New-season picks with premium appeal
              </h2>
            </div>
            <Link
              to="/products?nav=shop"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-600 hover:text-violet-700"
            >
              View all
            </Link>
          </div>

          {loading && !products.length ? (
            <Loader label="Loading featured products..." />
          ) : (
            <div className="space-y-4">
              {error && !products.length ? (
                <p className="text-sm text-slate-500">
                  Live products are unavailable right now, so previewing curated demo items instead.
                </p>
              ) : null}
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {trendingProducts.map((product) => {
                  const finalPrice = Number(product.price || 0) * (1 - Number(product.discount || 0) / 100);

                  return (
                    <article
                      key={product._id}
                      className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-luxe"
                    >
                      <Link to={`/products/${product._id}`} className="block">
                        <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                          <img
                            src={resolveImageUrl(product.images?.[0])}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                          />
                        </div>
                      </Link>

                      <div className="space-y-4 p-5">
                        <div>
                          <div className="flex items-center gap-1">{renderRating(product.rating || 4.7)}</div>
                          <Link
                            to={`/products/${product._id}`}
                            className="mt-3 block font-display text-xl font-semibold text-slate-900"
                          >
                            {product.name}
                          </Link>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-900">
                              {formatPrice(finalPrice)}
                            </span>
                            {product.discount ? (
                              <span className="text-sm text-slate-400 line-through">
                                {formatPrice(product.price)}
                              </span>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>

      <section className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-600 py-10 text-white shadow-luxe lg:py-14">
        <div className="w-full px-4 lg:px-8 xl:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/65">
                AI Virtual Try-On
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Try Before You Buy
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-white/78">
                Upload your photo and see how outfits look on you using our AI virtual dressing
                room.
              </p>
              <Link
                to="/try-on/demo"
                className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Try Virtual Dressing Room
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Live camera preview",
                "AI outfit overlay",
                "FastAPI powered processing",
                "Confidence before checkout",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-5 text-sm font-medium text-white/85 backdrop-blur-md"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full space-y-12 px-4 py-6 lg:px-8 xl:px-10">
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Best Sellers
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-900 md:text-2xl">
                Popular now
              </h2>
            </div>
            <p className="text-xs text-slate-500">Scroll to explore</p>
          </div>

          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {bestSellerProducts.map((product) => {
              const finalPrice = Number(product.price || 0) * (1 - Number(product.discount || 0) / 100);

              return (
                <article
                  key={`best-${product._id}`}
                  className="min-w-[180px] snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-luxe"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-slate-100">
                    <img
                      src={resolveImageUrl(product.images?.[0])}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Bestseller
                    </p>
                    <h3 className="mt-1.5 line-clamp-2 font-display text-sm font-semibold text-slate-900">
                      {product.name}
                    </h3>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{formatPrice(finalPrice)}</span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-violet-600 hover:text-violet-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[34px] border border-slate-200 bg-white px-6 py-10 shadow-soft lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Newsletter
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
                Stay updated with new fashion drops.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
                Get seasonal edits, exclusive launches, and premium offers delivered directly to
                your inbox.
              </p>
            </div>

            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 rounded-full border border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:bg-white"
              />
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </section>
      </section>
    </main>
  );
};

export default Home;
