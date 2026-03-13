import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  defaultProductCategoryTree,
  getProductCategories,
  getProductCategoryTree,
  getSubcategoryOptions,
  persistProductCategoryTree,
  sanitizeProductCategoryTree,
} from "../data/productCategories";

const ProductTaxonomyContext = createContext(null);

const normalizeName = (value = "") => value.trim().toLowerCase();

export const ProductTaxonomyProvider = ({ children }) => {
  const [categoryTree, setCategoryTree] = useState(() => getProductCategoryTree());

  useEffect(() => {
    persistProductCategoryTree(categoryTree);
  }, [categoryTree]);

  const addCategory = (categoryName, firstSubcategory) => {
    const nextCategory = categoryName.trim();
    const nextSubcategory = firstSubcategory.trim();

    if (!nextCategory || !nextSubcategory) {
      return { ok: false, message: "Category and first sub category are required." };
    }

    const exists = getProductCategories(categoryTree).some(
      (category) => normalizeName(category) === normalizeName(nextCategory)
    );

    if (exists) {
      return { ok: false, message: "Category already exists." };
    }

    setCategoryTree((current) =>
      sanitizeProductCategoryTree({
        ...current,
        [nextCategory]: [nextSubcategory],
      })
    );

    return { ok: true, message: "Category added successfully." };
  };

  const addSubcategory = (categoryName, subcategoryName) => {
    const nextCategory = categoryName.trim();
    const nextSubcategory = subcategoryName.trim();

    if (!nextCategory || !nextSubcategory) {
      return { ok: false, message: "Choose a category and enter a sub category." };
    }

    const currentSubcategories = getSubcategoryOptions(nextCategory, categoryTree);
    const exists = currentSubcategories.some(
      (subcategory) => normalizeName(subcategory) === normalizeName(nextSubcategory)
    );

    if (exists) {
      return { ok: false, message: "Sub category already exists in this category." };
    }

    setCategoryTree((current) =>
      sanitizeProductCategoryTree({
        ...current,
        [nextCategory]: [...getSubcategoryOptions(nextCategory, current), nextSubcategory],
      })
    );

    return { ok: true, message: "Sub category added successfully." };
  };

  const resetCategories = () => {
    setCategoryTree(defaultProductCategoryTree);
  };

  const value = useMemo(
    () => ({
      categoryTree,
      categories: getProductCategories(categoryTree),
      getSubcategories: (category) => getSubcategoryOptions(category, categoryTree),
      addCategory,
      addSubcategory,
      resetCategories,
    }),
    [categoryTree]
  );

  return <ProductTaxonomyContext.Provider value={value}>{children}</ProductTaxonomyContext.Provider>;
};

export const useProductTaxonomy = () => {
  const context = useContext(ProductTaxonomyContext);

  if (!context) {
    throw new Error("useProductTaxonomy must be used within ProductTaxonomyProvider");
  }

  return context;
};
