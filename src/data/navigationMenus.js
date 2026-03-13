const buildLink = (pathname, params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
};

const shopLink = (params = {}) => buildLink("/products", { nav: "shop", ...params });
const menLink = (params = {}) => buildLink("/products", { nav: "men", ...params });
const womenLink = (params = {}) => buildLink("/products", { nav: "women", ...params });
const sportsLink = (params = {}) => buildLink("/products", { nav: "sports", ...params });
const kidsLink = (params = {}) => buildLink("/kids", params);

export const navigationLinks = [
  { label: "Home", to: "/" },
  {
    label: "Shop",
    to: shopLink(),
    description: "Browse the full YouthCircle marketplace with quick shortcuts into popular departments.",
    featured: {
      eyebrow: "New-season edit",
      title: "Shop curated styles",
      description: "Jump straight into the pieces customers browse most across the full storefront.",
      to: shopLink(),
      ctaLabel: "Shop all products",
    },
    sections: [
      {
        title: "Topwear",
        items: [
          { label: "Shirts", to: shopLink({ subcategory: "Shirts" }) },
          { label: "T-Shirts", to: shopLink({ subcategory: "T-Shirts" }) },
          { label: "Polos", to: shopLink({ subcategory: "Polos" }) },
          { label: "Blouses", to: shopLink({ subcategory: "Blouses" }) },
        ],
      },
      {
        title: "Statement Pieces",
        items: [
          { label: "Dresses", to: shopLink({ subcategory: "Dresses" }) },
          { label: "Co-ords", to: shopLink({ subcategory: "Co-ords" }) },
          { label: "Jackets", to: shopLink({ subcategory: "Jackets" }) },
          { label: "Accessories", to: shopLink({ category: "Accessories" }) },
        ],
      },
      {
        title: "Move & Go",
        items: [
          { label: "Leggings", to: shopLink({ subcategory: "Leggings" }) },
          { label: "Shorts", to: shopLink({ subcategory: "Shorts" }) },
          { label: "Shoes", to: shopLink({ subcategory: "Shoes" }) },
        ],
      },
    ],
  },
  {
    label: "Men",
    to: menLink(),
    description: "Explore menswear departments with direct links to everyday essentials and performance staples.",
    featured: {
      eyebrow: "Menswear edit",
      title: "Build the men’s wardrobe",
      description: "From sharp shirts to relaxed sportswear, start with the categories shoppers use most.",
      to: menLink(),
      ctaLabel: "Explore men",
    },
    sections: [
      {
        title: "Topwear",
        items: [
          { label: "Shirts", to: menLink({ category: "Men", subcategory: "Shirts" }) },
          { label: "T-Shirts", to: menLink({ category: "Men", subcategory: "T-Shirts" }) },
          { label: "Polos", to: menLink({ category: "Men", subcategory: "Polos" }) },
        ],
      },
      {
        title: "Layers",
        items: [
          { label: "Jackets", to: menLink({ category: "Men", subcategory: "Jackets" }) },
          { label: "Shorts", to: menLink({ category: "Men", subcategory: "Shorts" }) },
          { label: "Shoes", to: menLink({ category: "Men", subcategory: "Shoes" }) },
        ],
      },
      {
        title: "Active Picks",
        items: [
          { label: "Sports Jackets", to: menLink({ category: "Men", subcategory: "Jackets" }) },
          { label: "Training T-Shirts", to: menLink({ category: "Men", subcategory: "T-Shirts" }) },
          { label: "Running Shoes", to: menLink({ category: "Men", subcategory: "Shoes" }) },
        ],
      },
    ],
  },
  {
    label: "Women",
    to: womenLink(),
    description: "Open a multi-column women’s menu with shortcuts into westernwear, activewear, and finishing touches.",
    featured: {
      eyebrow: "Women’s edit",
      title: "Discover women’s styles",
      description: "Use the mega dropdown to move from dresses to co-ords, layering pieces, and accessories in one click.",
      to: womenLink(),
      ctaLabel: "Explore women",
    },
    sections: [
      {
        title: "Westernwear",
        items: [
          { label: "Dresses", to: womenLink({ category: "Women", subcategory: "Dresses" }) },
          { label: "Blouses", to: womenLink({ category: "Women", subcategory: "Blouses" }) },
          { label: "Co-ords", to: womenLink({ category: "Women", subcategory: "Co-ords" }) },
        ],
      },
      {
        title: "Layers & Casual",
        items: [
          { label: "Jackets", to: womenLink({ category: "Women", subcategory: "Jackets" }) },
          { label: "Leggings", to: womenLink({ category: "Women", subcategory: "Leggings" }) },
          { label: "Shoes", to: womenLink({ category: "Women", subcategory: "Shoes" }) },
        ],
      },
      {
        title: "Finishing Touches",
        items: [
          { label: "Accessories", to: womenLink({ category: "Accessories" }) },
          { label: "Statement Dresses", to: womenLink({ category: "Women", subcategory: "Dresses" }) },
          { label: "Everyday Co-ords", to: womenLink({ category: "Women", subcategory: "Co-ords" }) },
        ],
      },
    ],
  },
  {
    label: "Kids",
    to: kidsLink(),
    description: "Help parents jump into kids clothing, shoes, accessories, and age-based browsing from one menu.",
    featured: {
      eyebrow: "Kids collection",
      title: "Shop by type or age",
      description: "Open the kids collection already filtered to the right category or age group.",
      to: kidsLink(),
      ctaLabel: "Explore kids",
    },
    sections: [
      {
        title: "Categories",
        items: [
          { label: "Clothing", to: kidsLink({ category: "Clothing" }) },
          { label: "Shoes", to: kidsLink({ category: "Shoes" }) },
          { label: "Accessories", to: kidsLink({ category: "Accessories" }) },
        ],
      },
      {
        title: "Age Groups",
        items: [
          { label: "0-2 Years", to: kidsLink({ age: "0-2" }) },
          { label: "3-5 Years", to: kidsLink({ age: "3-5" }) },
          { label: "6-8 Years", to: kidsLink({ age: "6-8" }) },
          { label: "9-12 Years", to: kidsLink({ age: "9-12" }) },
        ],
      },
    ],
  },
  {
    label: "Sports",
    to: sportsLink(),
    description: "Browse sport-focused categories for training, athleisure, and movement-ready footwear.",
    featured: {
      eyebrow: "Performance edit",
      title: "Train in style",
      description: "Go straight into workout-ready essentials with preset category filters.",
      to: sportsLink(),
      ctaLabel: "Explore sports",
    },
    sections: [
      {
        title: "Training",
        items: [
          { label: "T-Shirts", to: sportsLink({ category: "Sports", subcategory: "T-Shirts" }) },
          { label: "Shorts", to: sportsLink({ category: "Sports", subcategory: "Shorts" }) },
          { label: "Jackets", to: sportsLink({ category: "Sports", subcategory: "Jackets" }) },
        ],
      },
      {
        title: "Movement",
        items: [
          { label: "Leggings", to: sportsLink({ category: "Sports", subcategory: "Leggings" }) },
          { label: "Shoes", to: sportsLink({ category: "Sports", subcategory: "Shoes" }) },
        ],
      },
      {
        title: "Quick Access",
        items: [
          { label: "All sportswear", to: sportsLink() },
          { label: "Performance jackets", to: sportsLink({ category: "Sports", subcategory: "Jackets" }) },
          { label: "Running shoes", to: sportsLink({ category: "Sports", subcategory: "Shoes" }) },
        ],
      },
    ],
  },
];

export default navigationLinks;
