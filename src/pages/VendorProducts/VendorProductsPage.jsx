import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { DashboardLayout } from "../../components/Layout/AppLayout";
import Loader from "../../components/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import { useProductTaxonomy } from "../../context/ProductTaxonomyContext";
import { vendorPanelLinks } from "../../data/dashboardNavigation";
import { resolveProductTaxonomy } from "../../data/productCategories";
import { resolveImageUrl } from "../../utils/resolveImageUrl";
import {
  createProduct,
  deleteProduct,
  getMyProducts,
  updateProduct,
} from "../../api/productApi";

const SIZE_TYPES = [
  { value: "", label: "No sizes" },
  { value: "letter", label: "Letter (S, M, L, XL)" },
  { value: "number", label: "Number (30–40)" },
  { value: "kids", label: "Kids (year-wise)" },
];
const LETTER_SIZES = ["S", "M", "L", "XL", "XXL"];
const NUMBER_SIZES = Array.from({ length: 11 }, (_, i) => String(30 + i)); // 30 to 40
const KIDS_SIZES = ["2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y", "11Y", "12Y"];

const emptyForm = {
  name: "",
  description: "",
  category: "Men",
  subcategory: "Shirts",
  price: "",
  discount: "",
  stock: "",
  sizeType: "",
  availableSizes: [],
  imageOne: "",
  imageTwo: "",
  imageThree: "",
  imageFour: "",
  tryOnModel: "",
};

const fieldClass =
  "w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900";
const imageFieldKeys = ["imageOne", "imageTwo", "imageThree", "imageFour"];

const VendorProductsPage = ({ mode = "list" }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const { categories, getSubcategories } = useProductTaxonomy();
  const isAddView = mode === "add";
  const addPath = "/vendor/products/add";
  const listPath = "/vendor/products/list";
  const editProductId = searchParams.get("edit") || "";

  const loadProducts = async () => {
    setLoading(true);

    try {
      const data = await getMyProducts(token);
      setProducts(data.products || []);
      setError("");
    } catch (requestError) {
      setProducts([]);
      setError(
        requestError.response?.data?.message || "Could not load vendor products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [token]);

  useEffect(() => {
    if (!isAddView || !editProductId) {
      return;
    }

    const product = products.find((item) => item._id === editProductId);
    if (!product) {
      return;
    }

    setEditingId(product._id);
    const taxonomy = resolveProductTaxonomy(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: taxonomy.category,
      subcategory: taxonomy.subcategory,
      price: product.price || "",
      discount: product.discount || "",
      stock: product.stock || "",
      sizeType: product.sizeType || "",
      availableSizes: Array.isArray(product.availableSizes) ? product.availableSizes : [],
      imageOne: product.images?.[0] || "",
      imageTwo: product.images?.[1] || "",
      imageThree: product.images?.[2] || "",
      imageFour: product.images?.[3] || "",
      tryOnModel: product.tryOnModel || "",
    });
  }, [editProductId, isAddView, products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const taxonomy = resolveProductTaxonomy(product);
      const matchesCategory =
        categoryFilter === "All categories" || taxonomy.category === categoryFilter;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [product.name, taxonomy.category, taxonomy.subcategory, product.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [categoryFilter, products, searchQuery]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory,
      price: Number(form.price),
      discount: Number(form.discount || 0),
      stock: Number(form.stock),
      sizeType: form.sizeType || undefined,
      availableSizes: form.sizeType ? (form.availableSizes || []) : [],
      images: [form.imageOne, form.imageTwo, form.imageThree, form.imageFour].filter(Boolean),
      tryOnModel: form.tryOnModel,
    };

    try {
      if (editingId) {
        await updateProduct(token, editingId, payload);
        setMessage("Product updated.");
        navigate(listPath);
      } else {
        await createProduct(token, payload);
        setMessage("Product created.");
        setForm(emptyForm);
      }

      loadProducts();
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save the product.");
    } finally {
      setSaving(false);
    }
  };

  const handleStartCreate = () => {
    setForm(emptyForm);
    setEditingId("");
    navigate(addPath);
  };

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(token, productId);
      setError("");
      loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the product.");
    }
  };

  const handleImageUpload = async (index, file) => {
    if (!file) {
      return;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read image file."));
      reader.readAsDataURL(file);
    });

    setForm((current) => ({
      ...current,
      [imageFieldKeys[index]]: dataUrl,
    }));
  };

  const handleRemoveImage = (index) => {
    setForm((current) => {
      const currentImages = imageFieldKeys.map((key) => current[key]).filter(Boolean);
      const nextImages = currentImages.filter((_, imageIndex) => imageIndex !== index);

      return imageFieldKeys.reduce(
        (nextForm, key, imageIndex) => ({
          ...nextForm,
          [key]: nextImages[imageIndex] || "",
        }),
        { ...current }
      );
    });
  };

  const formImages = imageFieldKeys.map((key) => form[key]).filter(Boolean);
  const categoryOptions = useMemo(() => ["All categories", ...categories], [categories]);
  const subcategoryOptions = useMemo(
    () => getSubcategories(form.category),
    [form.category, getSubcategories]
  );

  return (
    <DashboardLayout
      title={isAddView ? "Add Product" : "List Products"}
      subtitle={
        isAddView
          ? "Create a new product with a simple vendor form layout."
          : "Manage and review the products in your store."
      }
      links={vendorPanelLinks}
      panelLabel="Vendor Panel"
      topBarAction={{ label: isAddView ? "List Product" : "Add Product", to: isAddView ? listPath : addPath }}
      hideHeroSection
    >
      {!isAddView ? (
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft lg:p-8">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Vendor catalog</p>
                <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
                  Product registry
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Manage {filteredProducts.length} products from your store.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 xl:max-w-2xl xl:flex-row">
                <label className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                  </svg>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search your products"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  {editingId ? "Continue Editing" : "Add Product"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {categoryOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategoryFilter(option)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    categoryFilter === option
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="mt-6">
              <Loader label="Loading products..." />
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
              <div className="hidden grid-cols-[2.4fr_1.1fr_0.8fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 lg:grid">
                <span>Product</span>
                <span>Category</span>
                <span>Stock</span>
                <span>Price</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <article
                    key={product._id}
                    className="grid gap-4 px-5 py-5 lg:grid-cols-[2.4fr_1.1fr_0.8fr_1fr_1fr] lg:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {product.description || "No description added yet."}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600">
                      {(() => {
                        const taxonomy = resolveProductTaxonomy(product);
                        return [taxonomy.category, taxonomy.subcategory].filter(Boolean).join(" / ");
                      })()}
                    </p>
                    <p className="text-sm text-slate-600">{product.stock}</p>
                    <div className="text-sm text-slate-600">
                      <p>Rs. {product.price}</p>
                      <p className="mt-1 text-xs text-slate-400">{product.discount || 0}% off</p>
                    </div>
                    <div className="flex items-center gap-3 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => navigate(`${addPath}?edit=${product._id}`)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
                        className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}

                {!filteredProducts.length ? (
                  <div className="px-5 py-12 text-center text-sm text-slate-500">
                    No products match the current filters.
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="border-r border-slate-200 pr-6">
              <div className="space-y-2">
                {vendorPanelLinks
                  .find((link) => link.label === "Products")
                  ?.children?.map((item) => (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => navigate(item.to)}
                      className={`flex w-full items-center justify-between border px-4 py-3 text-left text-sm transition ${
                        item.to === addPath
                          ? "border-pink-200 bg-pink-50 text-slate-900"
                          : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Upload image</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {formImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="group relative h-32 w-32 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    <label className="block h-full w-full cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImageUpload(index, event.target.files?.[0])}
                        className="hidden"
                      />
                      <img
                        src={resolveImageUrl(image)}
                        alt={`Product preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
                    >
                      x
                    </button>
                  </div>
                ))}

                {formImages.length < imageFieldKeys.length ? (
                  <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500 transition hover:border-slate-400 hover:text-slate-700">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageUpload(formImages.length, event.target.files?.[0])}
                      className="hidden"
                    />
                    <span className="text-3xl font-light">+</span>
                    <span className="mt-2 text-xs font-medium uppercase tracking-[0.16em]">
                      {formImages.length ? "Add more" : "Add image"}
                    </span>
                  </label>
                ) : null}
              </div>

              <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Product name</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Type here"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Product description</label>
                  <textarea
                    placeholder="Write content here"
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    rows={5}
                    className={fieldClass}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                    <select
                      value={form.category}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          category: event.target.value,
                          subcategory: getSubcategories(event.target.value)[0] || "",
                        }))
                      }
                      className={fieldClass}
                    >
                      {categories.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Sub category</label>
                    <select
                      value={form.subcategory}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, subcategory: event.target.value }))
                      }
                      className={fieldClass}
                    >
                      {subcategoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
                    <input
                      value={form.price}
                      onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Discount</label>
                    <input
                      value={form.discount}
                      onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Stock</label>
                    <input
                      value={form.stock}
                      onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Size type</label>
                  <select
                    value={form.sizeType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sizeType: event.target.value,
                        availableSizes: [],
                      }))
                    }
                    className={fieldClass}
                  >
                    {SIZE_TYPES.map((opt) => (
                      <option key={opt.value || "none"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {form.sizeType && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">Available sizes (select all that apply)</p>
                      <div className="flex flex-wrap gap-2">
                        {(form.sizeType === "letter"
                          ? LETTER_SIZES
                          : form.sizeType === "number"
                            ? NUMBER_SIZES
                            : KIDS_SIZES
                        ).map((size) => {
                          const selected = (form.availableSizes || []).includes(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() =>
                                setForm((current) => ({
                                  ...current,
                                  availableSizes: selected
                                    ? (current.availableSizes || []).filter((s) => s !== size)
                                    : [...(current.availableSizes || []), size],
                                }))
                              }
                              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                selected
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                      {(form.availableSizes || []).length > 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          Selected: {form.availableSizes.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Try-on model</label>
                  <input
                    placeholder="Optional model image URL"
                    value={form.tryOnModel}
                    onChange={(event) => setForm((current) => ({ ...current, tryOnModel: event.target.value }))}
                    className={fieldClass}
                  />
                </div>

                {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}
                {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Add"}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </DashboardLayout>
  );
};

export default VendorProductsPage;
