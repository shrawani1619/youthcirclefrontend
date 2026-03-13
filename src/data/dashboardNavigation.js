export const adminPanelLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/orders", label: "Orders", icon: "orders" },
  {
    to: "/admin/products/list",
    label: "Products",
    icon: "products",
    children: [
      { to: "/admin/products/add", label: "Add Product" },
      { to: "/admin/products/list", label: "List Product" },
    ],
  },
  { to: "/admin/categories", label: "Categories", icon: "products" },
  {
    to: "/admin/vendors/list",
    label: "Vendors",
    icon: "vendors",
    children: [
      { to: "/admin/vendors/list", label: "Vendor List" },
      { to: "/admin/vendors", label: "Vendor Approvals" },
    ],
  },
  { to: "/admin/customers", label: "Customers", icon: "customers" },
  { to: "/admin/analytics", label: "Analytics", icon: "analytics" },
  { to: "/admin/settings", label: "Settings", icon: "settings" },
];

export const vendorPanelLinks = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: "dashboard" },
  {
    to: "/vendor/products/list",
    label: "Products",
    icon: "products",
    children: [
      { to: "/vendor/products/add", label: "Add Product" },
      { to: "/vendor/products/list", label: "List Product" },
    ],
  },
  { to: "/vendor/orders", label: "Orders", icon: "orders" },
];
