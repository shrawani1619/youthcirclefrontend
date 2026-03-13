import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { getProducts } from "../../api/productApi";
import { useCart } from "../../context/CartContext";
import { resolveProductTaxonomy } from "../../data/productCategories";
import formatPrice from "../../utils/formatPrice";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const kidsFallbackProducts = [
  {
    _id: "kids-1",
    name: "Rainbow Play Set",
    brand: "Mini Mode",
    price: 1899,
    rating: 4.8,
    category: "Clothing",
    age: "3-5",
    size: "S",
    color: "Yellow",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "kids-2",
    name: "Star Runner Sneakers",
    brand: "Tiny Steps",
    price: 2299,
    rating: 4.7,
    category: "Shoes",
    age: "6-8",
    size: "30",
    color: "Blue",
    badge: "Best for School",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "kids-3",
    name: "Cloud Hoodie",
    brand: "Cozy Cub",
    price: 1599,
    rating: 4.9,
    category: "Clothing",
    age: "9-12",
    size: "M",
    color: "Pink",
    badge: "New",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "kids-4",
    name: "Little Explorer Cap",
    brand: "Playyard",
    price: 699,
    rating: 4.5,
    category: "Accessories",
    age: "3-5",
    size: "Free",
    color: "Green",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "kids-5",
    name: "Comfy Day Dress",
    brand: "Mini Mode",
    price: 1749,
    rating: 4.8,
    category: "Clothing",
    age: "6-8",
    size: "M",
    color: "Lavender",
    badge: "New",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "kids-6",
    name: "Playground Backpack",
    brand: "Tiny Steps",
    price: 1399,
    rating: 4.6,
    category: "Accessories",
    age: "9-12",
    size: "Free",
    color: "Red",
    badge: "Best for School",
    image: "https://images.unsplash.com/photo-1542291026-a547e7a4d8a3?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "kids-7",
    name: "Sunshine Sandals",
    brand: "Cozy Cub",
    price: 1199,
    rating: 4.4,
    category: "Shoes",
    age: "0-2",
    size: "22",
    color: "Cream",
    badge: "New",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "kids-8",
    name: "Weekend Denim Jacket",
    brand: "Playyard",
    price: 2099,
    rating: 4.9,
    category: "Clothing",
    age: "9-12",
    size: "L",
    color: "Blue",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
  },
];

const filterGroups = {
  category: ["All", "Clothing", "Shoes", "Accessories"],
  age: ["All", "0-2", "3-5", "6-8", "9-12"],
  size: ["All", "S", "M", "L", "22", "30", "Free"],
  price: ["All", "Under 1000", "1000-2000", "2000+"],
  brand: ["All", "Mini Mode", "Tiny Steps", "Cozy Cub", "Playyard"],
  color: ["All", "Yellow", "Blue", "Pink", "Green", "Lavender", "Red", "Cream"],
};

const badgeStyles = {
  New: "bg-pink-100 text-pink-700",
  Popular: "bg-amber-100 text-amber-700",
  "Best for School": "bg-indigo-100 text-indigo-700",
};

const FloatingIcon = ({ children, className = "" }) => (
  <div
    className={`absolute flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-xl shadow-soft backdrop-blur ${className}`}
  >
    {children}
  </div>
);

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-soft">
    <div className="aspect-[4/5] rounded-[20px] animate-shimmer" />
    <div className="mt-4 h-4 w-20 rounded-full animate-shimmer" />
    <div className="mt-3 h-5 w-3/4 rounded-full animate-shimmer" />
    <div className="mt-3 h-4 w-1/2 rounded-full animate-shimmer" />
    <div className="mt-4 h-10 rounded-full animate-shimmer" />
  </div>
);

const renderStars = (rating = 4.7) =>
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

const matchesPrice = (price, filter) => {
  if (filter === "Under 1000") {
    return price < 1000;
  }

  if (filter === "1000-2000") {
    return price >= 1000 && price <= 2000;
  }

  if (filter === "2000+") {
    return price > 2000;
  }

  return true;
};

const normalizeLiveProduct = (product, index = 0) => {
  const taxonomy = resolveProductTaxonomy(product, index);

  if (taxonomy.category !== "Kids") {
    return null;
  }

  return {
    _id: product._id,
    name: product.name,
    brand: product.vendorId?.businessName || "YouthCircle Kids",
    price: Number(product.price || 0),
    rating: 4.7,
    category: taxonomy.subcategory || "Clothing",
    age: "6-8",
    size: "M",
    color: "Blue",
    badge: "Popular",
    image: resolveImageUrl(product.images?.[0]),
    tryOnId: product._id,
  };
};

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const KidsCollectionPage = () => {
  const [searchParams] = useSearchParams();
  const requestedSearch = searchParams.get("search") || "";
  const requestedCategory = searchParams.get("category") || "All";
  const requestedAge = searchParams.get("age") || "All";
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    age: "All",
    size: "All",
    price: "All",
    brand: "All",
    color: "All",
  });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);

      try {
        const data = await getProducts({ limit: 24 });
        const liveProducts = (data.products || [])
          .map((product, index) => normalizeLiveProduct(product, index))
          .filter(Boolean);
        setProducts(liveProducts.length ? liveProducts : kidsFallbackProducts);
      } catch (_error) {
        setProducts(kidsFallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    setFilters({
      search: requestedSearch,
      category: filterGroups.category.includes(requestedCategory) ? requestedCategory : "All",
      age: filterGroups.age.includes(requestedAge) ? requestedAge : "All",
      size: "All",
      price: "All",
      brand: "All",
      color: "All",
    });
    setMobileFiltersOpen(false);
  }, [requestedAge, requestedCategory, requestedSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.brand.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        filters.category === "All" || product.category === filters.category;
      const matchesAge = filters.age === "All" || product.age === filters.age;
      const matchesSize = filters.size === "All" || product.size === filters.size;
      const matchesBrand = filters.brand === "All" || product.brand === filters.brand;
      const matchesColor = filters.color === "All" || product.color === filters.color;
      const priceMatch = matchesPrice(product.price, filters.price);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAge &&
        matchesSize &&
        matchesBrand &&
        matchesColor &&
        priceMatch
      );
    });
  }, [filters, products]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "All",
      age: "All",
      size: "All",
      price: "All",
      brand: "All",
      color: "All",
    });
  };

  const filterControls = (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_repeat(5,minmax(0,1fr))]">
        <div className="lg:col-span-1">
          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search products"
            className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 shadow-soft outline-none transition focus:border-indigo-400"
          />
        </div>

        {[
          { key: "category", label: "Category" },
          { key: "age", label: "Age" },
          { key: "size", label: "Size" },
          { key: "price", label: "Price" },
          { key: "brand", label: "Brand" },
        ].map((filter) => (
          <select
            key={filter.key}
            value={filters[filter.key]}
            onChange={(event) => updateFilter(filter.key, event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-soft outline-none transition focus:border-indigo-400"
          >
            {filterGroups[filter.key].map((option) => (
              <option key={option} value={option}>
                {filter.label}: {option}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filters.color}
          onChange={(event) => updateFilter("color", event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-soft outline-none transition focus:border-indigo-400"
        >
          {filterGroups.color.map((option) => (
            <option key={option} value={option}>
              Color: {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-soft transition hover:border-slate-900 hover:text-slate-900"
        >
          Reset filters
        </button>
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-6">
      <motion.section
        initial="hidden"
        animate="show"
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-rose-100 via-indigo-50 to-sky-100 px-6 py-10 shadow-soft sm:px-8 lg:px-10"
      >
        <FloatingIcon className="left-6 top-6">⭐</FloatingIcon>
        <FloatingIcon className="right-8 top-10">☁</FloatingIcon>
        <FloatingIcon className="bottom-8 right-24 hidden sm:flex">🧸</FloatingIcon>

        <div className="relative z-10 max-w-3xl pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-indigo-500">
            YouthCircle Kids
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Kids Collection
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Comfortable, colorful styles for little stars.
          </p>
        </div>
      </motion.section>

      <section className="sticky top-20 z-30 rounded-[28px] border border-slate-200 bg-slate-50/90 p-4 shadow-soft backdrop-blur md:static md:bg-white md:p-6">
        <div className="flex items-center justify-between gap-4 md:hidden">
          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search products"
            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 shadow-soft outline-none transition focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Filters
          </button>
        </div>

        <div className="hidden md:block">{filterControls}</div>
      </section>

      <AnimatePresence>
        {mobileFiltersOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 240 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-[32px] bg-white p-5 shadow-luxe md:hidden"
            >
              <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-slate-200" />
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-slate-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Close
                </button>
              </div>
              <div className="mt-5 overflow-y-auto pb-6">{filterControls}</div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <section className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            Kids products
          </p>
        </div>
        <p className="text-sm text-slate-500">{filteredProducts.length} products</p>
      </section>

      {loading ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      ) : filteredProducts.length ? (
        <motion.section
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          {filteredProducts.map((product) => (
            <motion.article
              key={product._id}
              variants={fadeInUp}
              transition={{ duration: 0.45 }}
              whileHover={{ y: -8 }}
              className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-soft"
            >
              <div className="relative overflow-hidden">
                <span
                  className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold ${
                    badgeStyles[product.badge] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {product.badge}
                </span>
                <img
                  src={resolveImageUrl(product.image)}
                  alt={product.name}
                  className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">{product.brand}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <div className="mt-3 flex items-center gap-1">{renderStars(product.rating)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    {formatPrice(product.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      addToCart(
                        {
                          _id: product._id,
                          name: product.name,
                          images: [product.image],
                          price: product.price,
                          discount: 0,
                          vendorId: "kids-demo-vendor",
                        },
                        1,
                        product.size === "Free" ? "M" : product.size
                      )
                    }
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:scale-[1.03] hover:bg-violet-700"
                  >
                    Add to cart
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-full bg-slate-100 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {product.age}
                  </div>
                  <Link
                    to={product.tryOnId ? `/try-on/${product.tryOnId}` : "/try-on/demo"}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Try Virtual Try-On
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.section>
      ) : (
        <section className="rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-soft">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-4xl shadow-inner">
            🧸
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold text-slate-900">No products found</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            No products found. Try adjusting filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Reset filters
          </button>
        </section>
      )}
    </main>
  );
};

export default KidsCollectionPage;
