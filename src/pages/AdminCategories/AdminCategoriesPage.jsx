import { useEffect, useMemo, useState } from "react";

import { DashboardLayout } from "../../components/Layout/AppLayout";
import { useProductTaxonomy } from "../../context/ProductTaxonomyContext";
import { adminPanelLinks } from "../../data/dashboardNavigation";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400";
const sectionClass =
  "rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]";

const AdminCategoriesPage = () => {
  const { categoryTree, categories, getSubcategories, addCategory, addSubcategory, resetCategories } =
    useProductTaxonomy();
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    firstSubcategory: "",
  });
  const [subcategoryForm, setSubcategoryForm] = useState({
    category: categories[0] || "",
    name: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalSubcategories = useMemo(
    () => Object.values(categoryTree).reduce((count, subcategories) => count + subcategories.length, 0),
    [categoryTree]
  );

  useEffect(() => {
    if (!categories.includes(subcategoryForm.category)) {
      setSubcategoryForm((current) => ({
        ...current,
        category: categories[0] || "",
      }));
    }
  }, [categories, subcategoryForm.category]);

  const handleAddCategory = (event) => {
    event.preventDefault();

    const result = addCategory(categoryForm.name, categoryForm.firstSubcategory);

    if (!result.ok) {
      setError(result.message);
      setMessage("");
      return;
    }

    setMessage(result.message);
    setError("");
    setSubcategoryForm((current) => ({
      ...current,
      category: categoryForm.name.trim(),
    }));
    setCategoryForm({ name: "", firstSubcategory: "" });
  };

  const handleAddSubcategory = (event) => {
    event.preventDefault();

    const result = addSubcategory(subcategoryForm.category, subcategoryForm.name);

    if (!result.ok) {
      setError(result.message);
      setMessage("");
      return;
    }

    setMessage(result.message);
    setError("");
    setSubcategoryForm((current) => ({ ...current, name: "" }));
  };

  const handleReset = () => {
    resetCategories();
    setCategoryForm({ name: "", firstSubcategory: "" });
    setSubcategoryForm({
      category: "Men",
      name: "",
    });
    setMessage("Categories reset to the default list for this browser.");
    setError("");
  };

  return (
    <DashboardLayout
      title="Categories"
      subtitle="Create category and sub category options for product forms"
      links={adminPanelLinks}
      panelLabel="Admin Panel"
      topBarSearchPlaceholder="Search categories"
      hideHeroSection
    >
      <div className="space-y-6">
        <section className="grid gap-6 lg:grid-cols-3">
          <article className={sectionClass}>
            <p className="text-sm font-medium text-slate-500">Categories</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {categories.length}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Product categories available in admin and vendor forms.
            </p>
          </article>

          <article className={sectionClass}>
            <p className="text-sm font-medium text-slate-500">Sub categories</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {totalSubcategories}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Each category should keep at least one sub category option.
            </p>
          </article>

          <article className={sectionClass}>
            <p className="text-sm font-medium text-slate-500">Storage</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Browser saved
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Changes are saved in this browser and used immediately in product forms.
            </p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <form onSubmit={handleAddCategory} className={sectionClass}>
            <p className="text-sm font-medium text-slate-500">Add category</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Create a new category
            </h2>

            <label className="mt-6 block">
              <span className="text-sm font-medium text-slate-700">Category name</span>
              <input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Example: Ethnic Wear"
                className={fieldClass}
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-700">First sub category</span>
              <input
                value={categoryForm.firstSubcategory}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    firstSubcategory: event.target.value,
                  }))
                }
                placeholder="Example: Kurtas"
                className={fieldClass}
              />
            </label>

            <button
              type="submit"
              className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Add category
            </button>
          </form>

          <form onSubmit={handleAddSubcategory} className={sectionClass}>
            <p className="text-sm font-medium text-slate-500">Add sub category</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Extend an existing category
            </h2>

            <label className="mt-6 block">
              <span className="text-sm font-medium text-slate-700">Select category</span>
              <select
                value={subcategoryForm.category}
                onChange={(event) =>
                  setSubcategoryForm((current) => ({ ...current, category: event.target.value }))
                }
                className={fieldClass}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-700">Sub category name</span>
              <input
                value={subcategoryForm.name}
                onChange={(event) =>
                  setSubcategoryForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Example: Party Wear"
                className={fieldClass}
              />
            </label>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Add sub category
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Reset defaults
              </button>
            </div>
          </form>
        </section>

        {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <section className={sectionClass}>
          <p className="text-sm font-medium text-slate-500">Current structure</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Category and sub category list
          </h2>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {categories.map((category) => (
              <article key={category} className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-lg font-semibold text-slate-900">{category}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {getSubcategories(category).map((subcategory) => (
                    <span
                      key={`${category}-${subcategory}`}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600"
                    >
                      {subcategory}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AdminCategoriesPage;
