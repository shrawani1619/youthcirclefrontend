import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import formatPrice from "../../utils/formatPrice";

const renderReviewStars = (rating = 0) =>
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

const ratingDistributionStyles = {
  5: "bg-teal-500",
  4: "bg-emerald-500",
  3: "bg-amber-400",
  2: "bg-amber-500",
  1: "bg-rose-500",
};

const ProductTabs = ({ product, reviews }) => {
  const [activeTab, setActiveTab] = useState("description");
  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const ratingCounts = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: reviews.filter((review) => Math.round(review.rating || 0) === rating).length,
      })),
    [reviews]
  );

  const reviewPhotoItems = useMemo(
    () =>
      reviews.slice(0, 3).map((review, index) => ({
        id: `${review._id}-photo`,
        image:
          product.images?.[(index + 1) % (product.images?.length || 1)] || product.images?.[0] || "",
      })),
    [product.images, reviews]
  );

  const tabItems = useMemo(
    () => [
      {
        key: "description",
        label: "Description",
        content: (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Designed for elevated everyday wear</h3>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                {product.description ||
                  "This YouthCircle piece blends fashion-forward styling with a refined premium finish for day-to-night versatility."}
              </p>
            </div>
            <div className="rounded-[28px] bg-slate-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Highlights</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Premium finish with clean, minimal construction.</p>
                <p>Balanced silhouette for contemporary styling.</p>
                <p>Curated for YouthCircle&apos;s elevated marketplace aesthetic.</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "specifications",
        label: "Specifications",
        content: (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Category", product.category || "Essentials"],
              ["Brand", product.vendorId?.businessName || "YouthCircle"],
              ["Price", formatPrice(product.price)],
              ["Discount", product.discount ? `${product.discount}%` : "No active offer"],
              ["Material", "Premium blended fabric"],
              ["Fit", "Modern regular fit"],
              ["Care", "Gentle machine wash"],
              ["Stock", Number(product.stock || 12) > 0 ? `${product.stock || 12} available` : "Made to order"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
                <p className="mt-3 text-base font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "reviews",
        label: `Reviews (${reviews.length})`,
        content: reviews.length ? (
          <div className="space-y-8">
            <section className="border-b border-slate-200 pb-8">
              <h3 className="text-xl font-semibold uppercase tracking-[0.04em] text-slate-900">Ratings</h3>
              <div className="mt-6 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                <div className="border-r border-slate-200 pr-8">
                  <div className="flex items-center gap-3">
                    <span className="text-6xl font-light tracking-tight text-slate-900">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-3xl text-teal-400">★</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{reviews.length} Verified Buyers</p>
                </div>

                <div className="space-y-3">
                  {ratingCounts.map((item) => {
                    const width = reviews.length ? `${(item.count / reviews.length) * 100}%` : "0%";

                    return (
                      <div key={item.rating} className="grid grid-cols-[24px_minmax(0,1fr)_44px] items-center gap-3 text-sm text-slate-500">
                        <span>{item.rating}★</span>
                        <div className="h-1.5 bg-slate-100">
                          <div
                            className={`h-full ${ratingDistributionStyles[item.rating]}`}
                            style={{ width }}
                          />
                        </div>
                        <span className="text-right text-slate-700">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {reviewPhotoItems.length ? (
              <section className="border-b border-slate-200 pb-8">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Customer Photos ({reviewPhotoItems.length})
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {reviewPhotoItems.map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt="Customer upload"
                      className="h-20 w-20 object-cover"
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                Customer Reviews ({reviews.length})
              </h3>
              <div className="mt-5 space-y-6">
                {reviews.map((review, index) => (
                  <article key={review._id} className="border-b border-slate-200 pb-6 last:border-b-0">
                    <div className="inline-flex items-center gap-2 bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-700">
                      <span>{Math.round(review.rating || 0)}★</span>
                    </div>
                    <p className="mt-4 text-sm leading-8 text-slate-700">{review.comment}</p>

                    {reviewPhotoItems[index % reviewPhotoItems.length]?.image ? (
                      <div className="mt-4 flex gap-3">
                        <img
                          src={reviewPhotoItems[index % reviewPhotoItems.length].image}
                          alt="Review media"
                          className="h-20 w-20 object-cover"
                        />
                        <img
                          src={product.images?.[0] || reviewPhotoItems[index % reviewPhotoItems.length].image}
                          alt="Review media"
                          className="h-20 w-20 object-cover"
                        />
                    </div>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                      <div>
                        <span className="font-medium text-slate-800">
                          {review.userId?.name || "Customer"}
                        </span>
                        <span className="mx-2">|</span>
                        <span>Verified Buyer</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400">
                        <span>Helpful</span>
                        <span>Report</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No reviews yet for this product.</p>
        ),
      },
      {
        key: "shipping",
        label: "Shipping Information",
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Delivery", "Free delivery on premium orders across major cities."],
              ["Returns", "Easy returns and exchanges within 7 days of delivery."],
              ["Payments", "Secure checkout with cards, UPI, netbanking, and COD."],
              ["Processing", "Orders are usually dispatched within 24 to 48 hours."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-base font-semibold text-slate-900">{title}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        ),
      },
    ],
    [product, reviews]
  );

  const activeItem = tabItems.find((item) => item.key === activeTab) || tabItems[0];

  return (
    <section className="rounded-[36px] border border-slate-200 bg-white p-4 shadow-soft sm:p-6 lg:p-8">
      <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-5">
        {tabItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveTab(item.key)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeTab === item.key
                ? "bg-slate-900 text-white shadow-soft"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            {activeItem.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProductTabs;
