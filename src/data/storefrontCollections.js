import { resolveProductTaxonomy } from "./productCategories";

const collectionPageConfigs = {
  shop: {
    key: "shop",
    eyebrow: "YouthCircle Marketplace",
    title: "Explore All Collections",
    description:
      "Discover refined essentials, statement silhouettes, and performance layers curated with a premium fashion editorial feel.",
    heroImage:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
    accent: "The complete edit",
  },
  men: {
    key: "men",
    eyebrow: "Menswear Edit",
    title: "Men's Fashion",
    description:
      "Shop tailored basics, elevated outerwear, and everyday staples with a modern minimalist edge.",
    heroImage:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    accent: "Tailored for daily style",
  },
  women: {
    key: "women",
    eyebrow: "Womenswear Edit",
    title: "Women's Fashion",
    description:
      "Browse polished dresses, modern textures, and premium essentials inspired by contemporary luxury fashion.",
    heroImage:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80",
    accent: "Refined statement dressing",
  },
  sports: {
    key: "sports",
    eyebrow: "Performance Edit",
    title: "Sportswear Collection",
    description:
      "Move through every day in streamlined athleisure, training layers, and sport-driven essentials with a premium finish.",
    heroImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80",
    accent: "Performance with polish",
  },
};

const fallbackProducts = [
  {
    _id: "seed-shop-1",
    name: "Midnight Overshirt",
    brand: "Atelier YC",
    price: 4299,
    discount: 10,
    rating: 4.8,
    category: "Men",
    subcategory: "Shirts",
    sizeOptions: ["S", "M", "L", "XL"],
    color: "Black",
    availability: "In stock",
    badge: "Best Seller",
    description: "A structured overshirt cut for layered city dressing.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "men"],
  },
  {
    _id: "seed-shop-2",
    name: "Studio Pleated Dress",
    brand: "Noir Edit",
    price: 5199,
    discount: 12,
    rating: 4.9,
    category: "Women",
    subcategory: "Dresses",
    sizeOptions: ["XS", "S", "M", "L"],
    color: "Ivory",
    availability: "In stock",
    badge: "New",
    description: "Fluid tailoring with a soft drape and elevated finish.",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "women"],
  },
  {
    _id: "seed-shop-3",
    name: "Motion Track Jacket",
    brand: "Active Form",
    price: 3899,
    discount: 15,
    rating: 4.7,
    category: "Sports",
    subcategory: "Jackets",
    sizeOptions: ["S", "M", "L", "XL"],
    color: "Navy",
    availability: "In stock",
    badge: "Performance",
    description: "Lightweight technical comfort for training and travel.",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "men", "sports"],
  },
  {
    _id: "seed-shop-4",
    name: "Everyday Luxe Tote",
    brand: "Maison YC",
    price: 4599,
    discount: 0,
    rating: 4.6,
    category: "Accessories",
    subcategory: "Bags",
    sizeOptions: ["Free"],
    color: "Tan",
    availability: "Low stock",
    badge: "Editor's Pick",
    description: "Minimal carry-all crafted to finish every look cleanly.",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "women"],
  },
  {
    _id: "seed-shop-5",
    name: "Cloud Knit Polo",
    brand: "Frame Eight",
    price: 2799,
    discount: 0,
    rating: 4.5,
    category: "Men",
    subcategory: "Polos",
    sizeOptions: ["S", "M", "L", "XL"],
    color: "Cream",
    availability: "In stock",
    badge: "New",
    description: "A lightweight knit polo with relaxed luxury proportions.",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "men"],
  },
  {
    _id: "seed-shop-6",
    name: "Court Flow Leggings",
    brand: "Active Form",
    price: 2499,
    discount: 8,
    rating: 4.8,
    category: "Sports",
    subcategory: "Leggings",
    sizeOptions: ["XS", "S", "M", "L"],
    color: "Slate",
    availability: "In stock",
    badge: "Performance",
    description: "Soft compression support built for low-impact movement.",
    image:
      "https://images.unsplash.com/photo-1506629905607-c52b1ab5f7a3?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "women", "sports"],
  },
  {
    _id: "seed-shop-7",
    name: "Urban Runner Sneakers",
    brand: "Stride Lab",
    price: 5499,
    discount: 6,
    rating: 4.9,
    category: "Sports",
    subcategory: "Shoes",
    sizeOptions: ["7", "8", "9", "10"],
    color: "White",
    availability: "In stock",
    badge: "Popular",
    description: "Cushioned movement with a sleek lifestyle silhouette.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "men", "women", "sports"],
  },
  {
    _id: "seed-shop-8",
    name: "Signature Satin Blouse",
    brand: "Noir Edit",
    price: 3399,
    discount: 10,
    rating: 4.7,
    category: "Women",
    subcategory: "Blouses",
    sizeOptions: ["XS", "S", "M", "L"],
    color: "Rose",
    availability: "In stock",
    badge: "Trending",
    description: "A clean satin blouse designed for day-to-evening styling.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "women"],
  },
  {
    _id: "seed-shop-9",
    name: "Relaxed Denim Jacket",
    brand: "Atelier YC",
    price: 4999,
    discount: 14,
    rating: 4.6,
    category: "Men",
    subcategory: "Jackets",
    sizeOptions: ["S", "M", "L", "XL"],
    color: "Blue",
    availability: "Low stock",
    badge: "Sale",
    description: "Clean lines and vintage character in a premium denim wash.",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "men", "women"],
  },
  {
    _id: "seed-shop-10",
    name: "Sprint Performance Tee",
    brand: "Velocity Club",
    price: 1999,
    discount: 0,
    rating: 4.4,
    category: "Sports",
    subcategory: "T-Shirts",
    sizeOptions: ["S", "M", "L", "XL"],
    color: "Red",
    availability: "In stock",
    badge: "Training",
    description: "Breathable stretch jersey engineered for fast sessions.",
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "men", "sports"],
  },
  {
    _id: "seed-shop-11",
    name: "Contour Knit Set",
    brand: "Maison YC",
    price: 4699,
    discount: 9,
    rating: 4.8,
    category: "Women",
    subcategory: "Co-ords",
    sizeOptions: ["XS", "S", "M", "L"],
    color: "Lavender",
    availability: "In stock",
    badge: "New",
    description: "A coordinated set with effortless polish and soft texture.",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "women"],
  },
  {
    _id: "seed-shop-12",
    name: "Flex Training Shorts",
    brand: "Velocity Club",
    price: 2299,
    discount: 5,
    rating: 4.5,
    category: "Sports",
    subcategory: "Shorts",
    sizeOptions: ["S", "M", "L", "XL"],
    color: "Green",
    availability: "In stock",
    badge: "Performance",
    description: "Technical mobility with streamlined all-day comfort.",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    collectionKeys: ["shop", "men", "sports"],
  },
];

const fallbackColors = ["Black", "White", "Blue", "Olive", "Grey", "Navy"];

const getBaseSizeOptions = (subcategory = "") => {
  const normalizedCategory = subcategory.toLowerCase();

  if (normalizedCategory.includes("shoe")) {
    return ["7", "8", "9", "10"];
  }

  if (normalizedCategory.includes("access")) {
    return ["Free"];
  }

  if (normalizedCategory.includes("dress") || normalizedCategory.includes("blouse")) {
    return ["XS", "S", "M", "L"];
  }

  return ["S", "M", "L", "XL"];
};

export const getCollectionPageConfig = (collectionKey) =>
  collectionPageConfigs[collectionKey] || collectionPageConfigs.shop;

export const normalizeLiveProduct = (product, index = 0) => {
  const taxonomy = resolveProductTaxonomy(product, index);

  return {
    _id: product._id,
    name: product.name,
    brand: product.vendorId?.businessName || "YouthCircle",
    price: Number(product.price || 0),
    discount: Number(product.discount || 0),
    rating: 4.4 + ((index % 6) * 0.1),
    category: taxonomy.category,
    subcategory: taxonomy.subcategory,
    sizeOptions: getBaseSizeOptions(taxonomy.subcategory),
    color: fallbackColors[index % fallbackColors.length],
    availability: Number(product.stock || 12) > 3 ? "In stock" : "Low stock",
    badge: Number(product.discount || 0) > 0 ? "Sale" : index % 3 === 0 ? "New" : "Popular",
    description:
      product.description ||
      "A premium marketplace selection curated for a clean and elevated wardrobe.",
    image: product.images?.[0] || "",
    collectionKeys: taxonomy.collectionKeys,
  };
};

export const getStorefrontProducts = (liveProducts, collectionKey) => {
  const normalizedLiveProducts = liveProducts.map(normalizeLiveProduct);
  const combinedProducts = [...normalizedLiveProducts, ...fallbackProducts];

  return combinedProducts.filter((product) => product.collectionKeys.includes(collectionKey));
};

export const getAllFilterOptions = (products) => ({
  category: ["All", ...new Set(products.map((product) => product.category).filter(Boolean))],
  subcategory: ["All", ...new Set(products.map((product) => product.subcategory).filter(Boolean))],
  brand: ["All", ...new Set(products.map((product) => product.brand).filter(Boolean))],
  size: ["All", ...new Set(products.flatMap((product) => product.sizeOptions || []))],
  color: ["All", ...new Set(products.map((product) => product.color).filter(Boolean))],
  priceRange: ["All", "Under 2000", "2000 to 4000", "4000 to 6000", "6000+"],
  rating: ["All", "4+ stars", "3+ stars"],
  availability: ["All", ...new Set(products.map((product) => product.availability).filter(Boolean))],
});

export const storefrontFallbackProducts = fallbackProducts;

export default collectionPageConfigs;
