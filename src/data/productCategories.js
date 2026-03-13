export const defaultProductCategoryTree = {
  Men: ["Shirts", "T-Shirts", "Polos", "Hoodies", "Jeans", "Jackets", "Shorts", "Shoes"],
  Women: ["Dresses", "Blouses", "Co-ords", "Leggings", "Jackets", "Shoes"],
  Kids: ["Clothing", "Shoes", "Accessories"],
  Sports: ["T-Shirts", "Jackets", "Leggings", "Shorts", "Shoes"],
  Accessories: ["Bags", "Watches", "Jewellery", "Sunglasses", "Belts"],
};

export const PRODUCT_CATEGORY_STORAGE_KEY = "youth-circle-product-categories";

const collectionKeysByCategory = {
  Men: ["shop", "men"],
  Women: ["shop", "women"],
  Kids: ["shop"],
  Sports: ["shop", "sports"],
  Accessories: ["shop", "women"],
};

const womenKeywords = [
  "dress",
  "blouse",
  "skirt",
  "heel",
  "tote",
  "bag",
  "handbag",
  "satin",
  "women",
  "gown",
  "coord",
];

const menKeywords = [
  "shirt",
  "overshirt",
  "polo",
  "trouser",
  "jacket",
  "hoodie",
  "jean",
  "denim",
  "men",
  "loafer",
  "sneaker",
];

const sportsKeywords = [
  "sport",
  "sports",
  "track",
  "training",
  "running",
  "runner",
  "performance",
  "athletic",
  "active",
  "gym",
  "leggings",
  "shorts",
];

const kidsKeywords = [
  "kids",
  "kid",
  "children",
  "child",
  "boys",
  "girls",
  "toddler",
  "play",
  "school",
];

const legacySubcategoryDefaults = {
  Shirts: "Men",
  Polos: "Men",
  Hoodies: "Men",
  Jeans: "Men",
  Dresses: "Women",
  Blouses: "Women",
  "Co-ords": "Women",
  Accessories: "Kids",
};

const includesKeyword = (value, keywords) => keywords.some((keyword) => value.includes(keyword));

const uniqueValues = (values = []) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

export const sanitizeProductCategoryTree = (tree = defaultProductCategoryTree) => {
  const nextTree = Object.entries(tree).reduce((accumulator, [category, subcategories]) => {
    const trimmedCategory = String(category || "").trim();

    if (!trimmedCategory) {
      return accumulator;
    }

    const cleanedSubcategories = uniqueValues(
      Array.isArray(subcategories) ? subcategories.map((item) => String(item || "")) : []
    );

    if (!cleanedSubcategories.length) {
      return accumulator;
    }

    accumulator[trimmedCategory] = cleanedSubcategories;
    return accumulator;
  }, {});

  return Object.keys(nextTree).length ? nextTree : defaultProductCategoryTree;
};

export const getProductCategoryTree = () => {
  if (typeof window === "undefined") {
    return defaultProductCategoryTree;
  }

  try {
    const raw = window.localStorage.getItem(PRODUCT_CATEGORY_STORAGE_KEY);

    if (!raw) {
      return defaultProductCategoryTree;
    }

    return sanitizeProductCategoryTree(JSON.parse(raw));
  } catch (_error) {
    return defaultProductCategoryTree;
  }
};

export const persistProductCategoryTree = (tree) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PRODUCT_CATEGORY_STORAGE_KEY,
    JSON.stringify(sanitizeProductCategoryTree(tree))
  );
};

export const getProductCategories = (tree = getProductCategoryTree()) => Object.keys(tree);

export const getSubcategoryOptions = (category = "", tree = getProductCategoryTree()) => tree[category] || [];

export const getDefaultSubcategory = (category = "", tree = getProductCategoryTree()) =>
  getSubcategoryOptions(category, tree)[0] || "";

export const getCollectionKeysForCategory = (category = "") => collectionKeysByCategory[category] || ["shop"];

export const resolveProductTaxonomy = (product = {}, fallbackIndex = 0, tree = getProductCategoryTree()) => {
  const currentCategory = String(product.category || "").trim();
  const currentSubcategory = String(product.subcategory || "").trim();

  if (currentCategory) {
    const knownSubcategories = getSubcategoryOptions(currentCategory, tree);

    if (knownSubcategories.length) {
      return {
        category: currentCategory,
        subcategory:
          knownSubcategories.includes(currentSubcategory)
            ? currentSubcategory
            : currentSubcategory || getDefaultSubcategory(currentCategory, tree),
        collectionKeys: getCollectionKeysForCategory(currentCategory),
      };
    }

    return {
      category: currentCategory,
      subcategory: currentSubcategory,
      collectionKeys: getCollectionKeysForCategory(currentCategory),
    };
  }

  const legacySubcategory = currentSubcategory || currentCategory || "";
  const text = `${product.name || ""} ${legacySubcategory} ${product.description || ""}`.toLowerCase();

  let category = legacySubcategoryDefaults[legacySubcategory] || "";

  if (!category && includesKeyword(text, kidsKeywords)) {
    category = "Kids";
  } else if (!category && includesKeyword(text, sportsKeywords)) {
    category = "Sports";
  } else if (!category && includesKeyword(text, womenKeywords)) {
    category = "Women";
  } else if (!category && includesKeyword(text, menKeywords)) {
    category = "Men";
  }

  const availableCategories = getProductCategories(tree);

  if (!category) {
    if (availableCategories.includes("Men") && availableCategories.includes("Women")) {
      category = fallbackIndex % 2 === 0 ? "Men" : "Women";
    } else {
      category = availableCategories[0] || "Men";
    }
  }

  const subcategory = getSubcategoryOptions(category, tree).includes(legacySubcategory)
    ? legacySubcategory
    : getDefaultSubcategory(category, tree);

  return {
    category,
    subcategory,
    collectionKeys: getCollectionKeysForCategory(category),
  };
};

export const productCategoryTree = getProductCategoryTree();
export const productCategories = getProductCategories();
