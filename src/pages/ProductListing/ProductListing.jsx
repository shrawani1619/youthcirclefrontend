import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";

import { getProducts } from "../../api/productApi";
import CollectionFilterPanel from "../../components/Storefront/CollectionFilterPanel";
import CollectionProductCard from "../../components/Storefront/CollectionProductCard";
import {
  getAllFilterOptions,
  getCollectionPageConfig,
  getStorefrontProducts,
} from "../../data/storefrontCollections";

const PRODUCTS_PER_PAGE = 8;

const defaultFilters = {
  search: "",
  category: "All",
  subcategory: "All",
  priceRange: "All",
  brand: "All",
  size: "All",
  color: "All",
  rating: "All",
  availability: "All",
};

const sortOptions = [
  { value: "popular", label: "Recommended" },
  { value: "price-low", label: "Price Low to High" },
  { value: "price-high", label: "Price High to Low" },
  { value: "new-arrivals", label: "New Arrivals" },
];

const topFilterChips = [
  { key: "category", label: "Category" },
  { key: "subcategory", label: "Subcategory" },
  { key: "brand", label: "Brand" },
  { key: "size", label: "Size" },
  { key: "priceRange", label: "Price" },
];

const getFinalPrice = (product) => Number(product.price || 0) * (1 - Number(product.discount || 0) / 100);

const matchesPriceRange = (price, range) => {
  if (range === "Under 2000") {
    return price < 2000;
  }

  if (range === "2000 to 4000") {
    return price >= 2000 && price <= 4000;
  }

  if (range === "4000 to 6000") {
    return price > 4000 && price <= 6000;
  }

  if (range === "6000+") {
    return price > 6000;
  }

  return true;
};

const matchesRating = (rating, selectedRating) => {
  if (selectedRating === "4+ stars") {
    return rating >= 4;
  }

  if (selectedRating === "3+ stars") {
    return rating >= 3;
  }

  return true;
};

const ProductSkeletonCard = () => (
  <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-soft">
    <div className="aspect-[4/5] animate-pulse bg-slate-200" />
    <div className="space-y-3 p-5">
      <div className="h-3 w-20 rounded-full bg-slate-200" />
      <div className="h-6 w-3/4 rounded-full bg-slate-200" />
      <div className="h-4 w-1/2 rounded-full bg-slate-100" />
      <div className="h-4 w-full rounded-full bg-slate-100" />
      <div className="h-4 w-5/6 rounded-full bg-slate-100" />
      <div className="h-11 rounded-full bg-slate-200" />
    </div>
  </div>
);

const ProductListing = () => {
  const [searchParams] = useSearchParams();
  const rawCollectionKey = searchParams.get("nav") || "shop";
  const requestedSearch = searchParams.get("search") || "";
  const requestedCategory = searchParams.get("category") || "All";
  const requestedSubcategory = searchParams.get("subcategory") || "All";
  const collectionKey = ["shop", "men", "women", "sports"].includes(rawCollectionKey)
    ? rawCollectionKey
    : "shop";
  const pageConfig = getCollectionPageConfig(collectionKey);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState("popular");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);

      try {
        const data = await getProducts({ limit: 36 });
        setProducts(data.products || []);
        setError("");
      } catch (requestError) {
        setProducts([]);
        setError(
          requestError.response?.data?.message ||
            "Live catalogue data is unavailable right now, so curated storefront items are being shown."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const storefrontProducts = useMemo(
    () => getStorefrontProducts(products, collectionKey),
    [collectionKey, products]
  );

  const filterOptions = useMemo(() => getAllFilterOptions(storefrontProducts), [storefrontProducts]);
  const initialCategory = filterOptions.category.includes(requestedCategory) ? requestedCategory : "All";
  const initialSubcategory = filterOptions.subcategory.includes(requestedSubcategory)
    ? requestedSubcategory
    : "All";

  useEffect(() => {
    setFilters({
      ...defaultFilters,
      search: requestedSearch,
      category: initialCategory,
      subcategory: initialSubcategory,
    });
    setSortBy("popular");
    setVisibleCount(PRODUCTS_PER_PAGE);
    setMobileFiltersOpen(false);
  }, [collectionKey, initialCategory, initialSubcategory, requestedSearch]);

  const filteredProducts = useMemo(() => {
    const filtered = storefrontProducts.filter((product) => {
      const searchTerm = filters.search.trim().toLowerCase();
      const matchesSearch =
        !searchTerm ||
        `${product.name} ${product.brand} ${product.category} ${product.subcategory} ${product.description}`
          .toLowerCase()
          .includes(searchTerm);

      const matchesCategory = filters.category === "All" || product.category === filters.category;
      const matchesSubcategory =
        filters.subcategory === "All" || product.subcategory === filters.subcategory;
      const matchesBrand = filters.brand === "All" || product.brand === filters.brand;
      const matchesSize =
        filters.size === "All" || (product.sizeOptions || []).includes(filters.size);
      const matchesColor = filters.color === "All" || product.color === filters.color;
      const matchesAvailability =
        filters.availability === "All" || product.availability === filters.availability;
      const priceMatch = matchesPriceRange(getFinalPrice(product), filters.priceRange);
      const ratingMatch = matchesRating(product.rating || 0, filters.rating);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesBrand &&
        matchesSize &&
        matchesColor &&
        matchesAvailability &&
        priceMatch &&
        ratingMatch
      );
    });

    return filtered.sort((firstProduct, secondProduct) => {
      if (sortBy === "price-low") {
        return getFinalPrice(firstProduct) - getFinalPrice(secondProduct);
      }

      if (sortBy === "price-high") {
        return getFinalPrice(secondProduct) - getFinalPrice(firstProduct);
      }

      if (sortBy === "new-arrivals") {
        return secondProduct.badge === "New" ? 1 : firstProduct.badge === "New" ? -1 : 0;
      }

      const firstScore = Number(firstProduct.rating || 0) + Number(firstProduct.discount || 0) / 10;
      const secondScore = Number(secondProduct.rating || 0) + Number(secondProduct.discount || 0) / 10;

      return secondScore - firstScore;
    });
  }, [filters, sortBy, storefrontProducts]);

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [filters, sortBy, collectionKey]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;
  const activeChipValues = topFilterChips.map((chip) => ({
    ...chip,
    value: filters[chip.key],
  }));

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <main className="bg-white pb-14">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        {error ? (
          <section className="mb-6 border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-indigo-700">
            {error}
          </section>
        ) : null}

        <section className="border-b border-slate-200 pb-5">
          <p className="text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-900">
              Home
            </Link>{" "}
            / <span>{pageConfig.title}</span>
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{pageConfig.title}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {filteredProducts.length} items
              </p>
            </div>

            <label className="relative w-full max-w-[260px]">
              <span className="sr-only">Sort products</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full appearance-none border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort by : {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </label>
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-3 border-b border-slate-200 py-4">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 lg:hidden"
          >
            Filters
          </button>
          {activeChipValues.map((chip) => (
            <div
              key={chip.key}
              className="inline-flex items-center gap-2 border border-slate-200 px-4 py-2 text-sm text-slate-600"
            >
              <span>{chip.label}</span>
              <span className="text-slate-400">{chip.value === "All" ? "" : chip.value}</span>
            </div>
          ))}
        </section>

        <div className="grid items-start gap-6 pt-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <CollectionFilterPanel
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={updateFilter}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <section className="space-y-6">
            {loading ? (
              <section className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <ProductSkeletonCard key={index} />
                ))}
              </section>
            ) : visibleProducts.length ? (
              <>
                <motion.section
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.07,
                      },
                    },
                  }}
                  className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 2xl:grid-cols-4"
                >
                  {visibleProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      variants={{
                        hidden: { opacity: 0, y: 18 },
                        show: { opacity: 1, y: 0 },
                      }}
                    >
                      <CollectionProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.section>

                {hasMoreProducts ? (
                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((current) => current + PRODUCTS_PER_PAGE)}
                      className="border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-900"
                    >
                      Load More Products
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <section className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-900">
                  <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M6 6h15l-1.2 8.2a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.6L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="10" cy="20" r="1.4" />
                    <circle cx="18" cy="20" r="1.4" />
                  </svg>
                </div>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">No products match these filters</h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Adjust the filter selections or reset the panel to explore the full collection again.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 bg-[#111827] px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Reset filters
                </button>
              </section>
            )}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/45 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-[#F9FAFB] p-4 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.6)] lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Mobile filters</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Refine collection</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Close
                </button>
              </div>

              <CollectionFilterPanel
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={updateFilter}
                onReset={resetFilters}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </main>
  );
};

export default ProductListing;
