const colorSwatches = {
  Black: "bg-slate-900",
  White: "bg-white border border-slate-300",
  Blue: "bg-blue-500",
  Olive: "bg-lime-700",
  Grey: "bg-slate-400",
  Gray: "bg-slate-400",
  Navy: "bg-slate-800",
  Ivory: "bg-stone-100 border border-stone-200",
  Tan: "bg-amber-700",
  Slate: "bg-slate-600",
  Rose: "bg-rose-300",
  Lavender: "bg-violet-300",
  Red: "bg-rose-500",
  Green: "bg-emerald-500",
  Cream: "bg-amber-100 border border-amber-200",
};

const sectionOrder = [
  ["category", "Category"],
  ["subcategory", "Subcategory"],
  ["priceRange", "Price range"],
  ["brand", "Brand"],
  ["size", "Size"],
  ["color", "Color"],
  ["rating", "Rating"],
  ["availability", "Availability"],
];

const FilterSection = ({ title, children, defaultOpen = true }) => (
  <details open={defaultOpen} className="group border-b border-slate-200 py-5 last:border-b-0">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
      <span className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-900">{title}</span>
      <span className="text-slate-400 transition group-open:rotate-180">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </summary>
    <div className="mt-4">{children}</div>
  </details>
);

const FilterOption = ({ active, onClick, children, swatchClass }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3 text-left text-sm text-slate-600 transition hover:text-slate-900"
  >
    <span
      className={`inline-flex h-4 w-4 flex-none items-center justify-center rounded-sm border ${
        active ? "border-pink-500 bg-pink-500" : "border-slate-300 bg-white"
      }`}
    >
      {active ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
    </span>
    {swatchClass ? <span className={`h-3 w-3 rounded-full ${swatchClass}`} /> : null}
    <span>{children}</span>
  </button>
);

const CollectionFilterPanel = ({ filters, filterOptions, onFilterChange, onReset }) => (
  <div className="border border-slate-200 bg-white">
    <div className="border-b border-slate-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold uppercase tracking-[0.04em] text-slate-900">Filters</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-500 transition hover:text-pink-600"
        >
          Clear All
        </button>
      </div>
      <label className="mt-4 block">
        <input
          value={filters.search}
          onChange={(event) => onFilterChange("search", event.target.value)}
          placeholder="Search category"
          className="w-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        />
      </label>
    </div>

    <div className="px-5">
      {sectionOrder.map(([key, title], index) => (
        <FilterSection key={key} title={title} defaultOpen={index < 3}>
          <div className="space-y-3">
          {filterOptions[key].map((option) => {
            return (
              <FilterOption
                key={option}
                active={filters[key] === option}
                onClick={() => onFilterChange(key, option)}
                swatchClass={key === "color" && option !== "All" ? colorSwatches[option] || "bg-slate-300" : ""}
              >
                {option}
              </FilterOption>
            );
          })}
          </div>
        </FilterSection>
      ))}
    </div>
  </div>
);

export default CollectionFilterPanel;
