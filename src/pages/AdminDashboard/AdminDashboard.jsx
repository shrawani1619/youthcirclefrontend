import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/Loader/Loader";
import { DashboardLayout } from "../../components/Layout/AppLayout";
import { getAllVendors, getPendingVendors } from "../../api/authApi";
import { getAdminOrders } from "../../api/orderApi";
import { getProducts } from "../../api/productApi";
import { useAuth } from "../../context/AuthContext";
import { adminPanelLinks } from "../../data/dashboardNavigation";

const DATE_FILTERS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "12m", label: "12 Months" },
];

const CHART_FILTERS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "12m", label: "12 months" },
];

const statusBadgeClass = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  processing: "bg-violet-100 text-violet-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const surfaceClass =
  "rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] transition hover:shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)]";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatCompactNumber = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const shiftDate = (date, amount, unit) => {
  const next = new Date(date);

  if (unit === "days") {
    next.setDate(next.getDate() + amount);
  }

  if (unit === "months") {
    next.setMonth(next.getMonth() + amount);
  }

  return next;
};

const getRangeBounds = (range, referenceDate = new Date()) => {
  if (range === "today") {
    return {
      start: startOfDay(referenceDate),
      end: endOfDay(referenceDate),
      unit: "days",
      amount: 1,
    };
  }

  if (range === "7d") {
    return {
      start: startOfDay(shiftDate(referenceDate, -6, "days")),
      end: endOfDay(referenceDate),
      unit: "days",
      amount: 7,
    };
  }

  if (range === "30d") {
    return {
      start: startOfDay(shiftDate(referenceDate, -29, "days")),
      end: endOfDay(referenceDate),
      unit: "days",
      amount: 30,
    };
  }

  return {
    start: startOfDay(new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 11, 1)),
    end: endOfDay(referenceDate),
    unit: "months",
    amount: 12,
  };
};

const isWithinRange = (value, range) => {
  const date = new Date(value);
  return date >= range.start && date <= range.end;
};

const filterByRange = (items, range, getDateValue = (item) => item.createdAt) =>
  items.filter((item) => {
    const dateValue = getDateValue(item);
    return dateValue ? isWithinRange(dateValue, range) : false;
  });

const getPreviousRange = (range) => {
  if (range.unit === "months") {
    const end = endOfDay(shiftDate(range.start, -1, "days"));
    const start = startOfDay(new Date(end.getFullYear(), end.getMonth() - (range.amount - 1), 1));
    return { start, end, unit: "months", amount: range.amount };
  }

  const end = endOfDay(shiftDate(range.start, -1, "days"));
  const start = startOfDay(shiftDate(end, -(range.amount - 1), "days"));
  return { start, end, unit: "days", amount: range.amount };
};

const getGrowth = (current, previous) => {
  if (!previous) {
    if (!current) {
      return { value: "0.0%", positive: true };
    }

    return { value: "+100.0%", positive: true };
  }

  const percentage = ((current - previous) / previous) * 100;
  const prefix = percentage >= 0 ? "+" : "";

  return {
    value: `${prefix}${percentage.toFixed(1)}%`,
    positive: percentage >= 0,
  };
};

const buildPath = (values) => {
  const width = 100;
  const height = 44;
  const maxValue = Math.max(...values, 1);

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - (value / maxValue) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

const DashboardIcon = ({ type }) => {
  const icons = {
    revenue: (
      <path
        d="M12 3.75v16.5M16 7.5c0-1.52-1.79-2.75-4-2.75S8 5.98 8 7.5s1.79 2.75 4 2.75 4 1.23 4 2.75S14.21 15.75 12 15.75 8 14.52 8 13"
        strokeLinecap="round"
      />
    ),
    orders: (
      <>
        <path d="M7 4.75h10A2.25 2.25 0 0 1 19.25 7v10A2.25 2.25 0 0 1 17 19.25H7A2.25 2.25 0 0 1 4.75 17V7A2.25 2.25 0 0 1 7 4.75Z" />
        <path d="M8 9h8M8 13h8M8 17h5" strokeLinecap="round" />
      </>
    ),
    customers: (
      <>
        <circle cx="9" cy="9" r="3.25" />
        <circle cx="17" cy="10.5" r="2.25" />
        <path d="M3.75 18.5a5.5 5.5 0 0 1 10.5 0M14.5 18.5a4 4 0 0 1 5.75-3.6" strokeLinecap="round" />
      </>
    ),
    vendors: (
      <>
        <path d="M4 19.25V9.5l4-2.75 4 2.75v9.75M16 10.5l4 2.25v6.5M2.75 19.25h18.5" strokeLinejoin="round" />
        <path d="M9 12.5h2M9 16h2" strokeLinecap="round" />
      </>
    ),
    products: (
      <>
        <path d="M12 3.75 4.75 7.5 12 11.25 19.25 7.5 12 3.75Z" strokeLinejoin="round" />
        <path d="M4.75 7.5v9L12 20.25l7.25-3.75v-9" strokeLinejoin="round" />
        <path d="M12 11.25v9" />
      </>
    ),
    pending: (
      <>
        <circle cx="12" cy="12" r="8.25" />
        <path d="M12 7.75v4.25l2.5 1.75" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      {icons[type]}
    </svg>
  );
};

const HeaderFilters = ({ value, onChange, items }) => (
  <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
    {items.map((item) => (
      <button
        key={item.value}
        type="button"
        onClick={() => onChange(item.value)}
        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
          value === item.value
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        {item.label}
      </button>
    ))}
  </div>
);

const StatCard = ({ label, value, growth, icon }) => (
  <article className={`${surfaceClass} p-5`}>
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            growth.positive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          {growth.value}
        </span>
      </div>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        <DashboardIcon type={icon} />
      </span>
    </div>
  </article>
);

const AnalyticsChartCard = ({ chartFilter, onFilterChange, chartData, revenueTotal, ordersTotal }) => {
  const revenuePath = buildPath(chartData.map((item) => item.revenue));
  const orderPath = buildPath(chartData.map((item) => item.orders));

  return (
    <section className={`${surfaceClass} p-6`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Sales analytics</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Revenue and order trends
          </h2>
        </div>
        <HeaderFilters value={chartFilter} onChange={onFilterChange} items={CHART_FILTERS} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:max-w-xl">
        <div className="rounded-2xl bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {formatCurrency(revenueTotal)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Orders</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{ordersTotal}</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 md:p-6">
        <div className="flex items-center gap-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            Revenue
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
            Orders
          </div>
        </div>

        <div className="mt-6">
          <svg viewBox="0 0 100 52" className="h-64 w-full overflow-visible">
            {[0, 25, 50, 75, 100].map((line) => (
              <line
                key={line}
                x1="0"
                y1={line / 2 + 1}
                x2="100"
                y2={line / 2 + 1}
                stroke="#E2E8F0"
                strokeDasharray="2 3"
                strokeWidth="0.35"
              />
            ))}
            <path d={revenuePath} fill="none" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
            <path d={orderPath} fill="none" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-500 md:grid-cols-6 xl:grid-cols-12">
          {chartData.map((item) => (
            <div key={item.label} className="truncate">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
      statusBadgeClass[status] || "bg-slate-100 text-slate-700"
    }`}
  >
    {status}
  </span>
);

const EmptyState = ({ message }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
    {message}
  </div>
);

const AdminDashboard = () => {
  const { token } = useAuth();
  const [dateFilter, setDateFilter] = useState("30d");
  const [chartFilter, setChartFilter] = useState("12m");
  const [pendingVendors, setPendingVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [pendingData, vendorsData, productsData, ordersData] = await Promise.all([
          getPendingVendors(token),
          getAllVendors(token),
          getProducts({ limit: 200, sortBy: "createdAt", order: "desc" }),
          getAdminOrders({ token }),
        ]);

        setPendingVendors(pendingData.vendors || []);
        setAllVendors(vendorsData.vendors || []);
        setProducts(productsData.products || []);
        setOrders(ordersData.orders || []);
        setError("");
      } catch (requestError) {
        setPendingVendors([]);
        setAllVendors([]);
        setProducts([]);
        setOrders([]);
        setError(requestError.response?.data?.message || "Could not load admin data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const approvedVendors = useMemo(
    () => allVendors.filter((vendor) => vendor.isApproved),
    [allVendors]
  );

  const selectedRange = useMemo(() => getRangeBounds(dateFilter), [dateFilter]);
  const previousRange = useMemo(() => getPreviousRange(selectedRange), [selectedRange]);

  const currentOrders = useMemo(
    () => filterByRange(orders, selectedRange),
    [orders, selectedRange]
  );
  const previousOrders = useMemo(
    () => filterByRange(orders, previousRange),
    [orders, previousRange]
  );

  const currentRevenue = useMemo(
    () => currentOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [currentOrders]
  );
  const previousRevenue = useMemo(
    () => previousOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [previousOrders]
  );

  const currentCustomers = useMemo(
    () =>
      new Set(
        currentOrders.map(
          (order) => String(order.userId?._id || order.userId?.email || order.userId?.name || order._id)
        )
      ).size,
    [currentOrders]
  );

  const previousCustomers = useMemo(
    () =>
      new Set(
        previousOrders.map(
          (order) => String(order.userId?._id || order.userId?.email || order.userId?.name || order._id)
        )
      ).size,
    [previousOrders]
  );

  const currentVendorsAdded = useMemo(
    () => filterByRange(approvedVendors, selectedRange).length,
    [approvedVendors, selectedRange]
  );
  const previousVendorsAdded = useMemo(
    () => filterByRange(approvedVendors, previousRange).length,
    [approvedVendors, previousRange]
  );

  const currentProductsAdded = useMemo(
    () => filterByRange(products, selectedRange).length,
    [products, selectedRange]
  );
  const previousProductsAdded = useMemo(
    () => filterByRange(products, previousRange).length,
    [products, previousRange]
  );

  const currentPendingOrders = useMemo(
    () => currentOrders.filter((order) => order.orderStatus === "pending").length,
    [currentOrders]
  );
  const previousPendingOrders = useMemo(
    () => previousOrders.filter((order) => order.orderStatus === "pending").length,
    [previousOrders]
  );

  const recentOrders = useMemo(
    () =>
      [...currentOrders]
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
        .slice(0, 6),
    [currentOrders]
  );

  const topVendors = useMemo(() => {
    const aggregate = currentOrders.reduce((accumulator, order) => {
      const key = String(order.vendorId?._id || order.vendorId || "vendor");

      if (!accumulator[key]) {
        accumulator[key] = {
          id: key,
          name: order.vendorId?.businessName || "Vendor",
          totalSales: 0,
          orders: 0,
        };
      }

      accumulator[key].totalSales += Number(order.totalAmount || 0);
      accumulator[key].orders += 1;

      return accumulator;
    }, {});

    return Object.values(aggregate)
      .map((vendor) => ({
        ...vendor,
        rating: (4.2 + Math.min(vendor.orders * 0.08, 0.7)).toFixed(1),
      }))
      .sort((left, right) => right.totalSales - left.totalSales)
      .slice(0, 5);
  }, [currentOrders]);

  const lowStockProducts = useMemo(
    () =>
      [...products]
        .filter((product) => Number(product.stock || 0) <= 5)
        .sort((left, right) => Number(left.stock || 0) - Number(right.stock || 0))
        .slice(0, 5),
    [products]
  );

  const newCustomers = useMemo(() => {
    const customersById = orders.reduce((accumulator, order) => {
      const key = String(order.userId?._id || order.userId?.email || order.userId?.name || order._id);
      const joinDate = new Date(order.createdAt);

      if (!accumulator[key] || joinDate < accumulator[key].joinDate) {
        accumulator[key] = {
          id: key,
          name: order.userId?.name || "Customer",
          email: order.userId?.email || "-",
          joinDate,
        };
      }

      return accumulator;
    }, {});

    return Object.values(customersById)
      .filter((customer) => isWithinRange(customer.joinDate, selectedRange))
      .sort((left, right) => right.joinDate - left.joinDate)
      .slice(0, 5);
  }, [orders, selectedRange]);

  const chartData = useMemo(() => {
    const range = getRangeBounds(chartFilter);

    if (chartFilter === "12m") {
      return Array.from({ length: 12 }, (_, index) => {
        const start = startOfDay(new Date(range.start.getFullYear(), range.start.getMonth() + index, 1));
        const end = endOfDay(new Date(start.getFullYear(), start.getMonth() + 1, 0));
        const periodOrders = orders.filter((order) => isWithinRange(order.createdAt, { start, end }));

        return {
          label: start.toLocaleString("en-IN", { month: "short" }),
          revenue: periodOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
          orders: periodOrders.length,
        };
      });
    }

    const bucketCount = chartFilter === "7d" ? 7 : 30;

    return Array.from({ length: bucketCount }, (_, index) => {
      const day = startOfDay(shiftDate(range.start, index, "days"));
      const nextDay = endOfDay(day);
      const periodOrders = orders.filter((order) => isWithinRange(order.createdAt, { start: day, end: nextDay }));

      return {
        label: day.toLocaleString("en-IN", { day: "numeric", month: "short" }),
        revenue: periodOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
        orders: periodOrders.length,
      };
    });
  }, [chartFilter, orders]);

  const metricCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(currentRevenue),
      growth: getGrowth(currentRevenue, previousRevenue),
      icon: "revenue",
    },
    {
      label: "Total Orders",
      value: formatCompactNumber(currentOrders.length),
      growth: getGrowth(currentOrders.length, previousOrders.length),
      icon: "orders",
    },
    {
      label: "Total Customers",
      value: formatCompactNumber(currentCustomers),
      growth: getGrowth(currentCustomers, previousCustomers),
      icon: "customers",
    },
    {
      label: "Total Vendors",
      value: formatCompactNumber(approvedVendors.length),
      growth: getGrowth(currentVendorsAdded, previousVendorsAdded),
      icon: "vendors",
    },
    {
      label: "Total Products",
      value: formatCompactNumber(products.length),
      growth: getGrowth(currentProductsAdded, previousProductsAdded),
      icon: "products",
    },
    {
      label: "Pending Orders",
      value: formatCompactNumber(currentPendingOrders),
      growth: getGrowth(currentPendingOrders, previousPendingOrders),
      icon: "pending",
    },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Overview of store performance"
      links={adminPanelLinks}
      panelLabel="Admin Panel"
      topBarSearchPlaceholder="Search orders, vendors, customers, or products"
      hideHeroSection
    >
      {loading ? (
        <Loader label="Loading admin dashboard..." />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
            <HeaderFilters value={dateFilter} onChange={setDateFilter} items={DATE_FILTERS} />
          </section>

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {metricCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </section>

          <AnalyticsChartCard
            chartFilter={chartFilter}
            onFilterChange={setChartFilter}
            chartData={chartData}
            revenueTotal={chartData.reduce((sum, item) => sum + item.revenue, 0)}
            ordersTotal={chartData.reduce((sum, item) => sum + item.orders, 0)}
          />

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_0.9fr]">
            <section className={`${surfaceClass} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">Recent activity</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    Recent Orders
                  </h2>
                </div>
                <Link to="/orders" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
                  View all
                </Link>
              </div>

              {recentOrders.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {["Order ID", "Customer Name", "Vendor", "Amount", "Order Status", "Date"].map((heading) => (
                          <th
                            key={heading}
                            className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {recentOrders.map((order) => (
                        <tr key={order._id} className="text-sm text-slate-700">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            #{String(order._id).slice(-6).toUpperCase()}
                          </td>
                          <td className="px-6 py-4">{order.userId?.name || "Customer"}</td>
                          <td className="px-6 py-4">{order.vendorId?.businessName || "Vendor"}</td>
                          <td className="px-6 py-4">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={order.orderStatus} />
                          </td>
                          <td className="px-6 py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState message="No recent orders for this time range." />
                </div>
              )}
            </section>

            <section className={`${surfaceClass} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Vendor performance</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    Top Vendors
                  </h2>
                </div>
                <Link
                  to="/admin/vendors/list"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  View all
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {topVendors.length ? (
                  topVendors.map((vendor, index) => (
                    <div
                      key={vendor.id}
                      className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4"
                    >
                      <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">{vendor.name}</p>
                        <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
                          <div>
                            <p>Total Sales</p>
                            <p className="mt-1 font-semibold text-slate-900">
                              {formatCurrency(vendor.totalSales)}
                            </p>
                          </div>
                          <div>
                            <p>Orders</p>
                            <p className="mt-1 font-semibold text-slate-900">{vendor.orders}</p>
                          </div>
                          <div>
                            <p>Rating</p>
                            <p className="mt-1 font-semibold text-slate-900">{vendor.rating}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="Vendor rankings will appear once new orders come in." />
                )}
              </div>
            </section>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <section className={`${surfaceClass} overflow-hidden`}>
              <div className="border-b border-slate-200 px-6 py-5">
                <p className="text-sm font-medium text-slate-500">Inventory watch</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  Low Stock Products
                </h2>
              </div>

              {lowStockProducts.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Product Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Stock Remaining
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {lowStockProducts.map((product) => (
                        <tr key={product._id} className="text-sm text-slate-700">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{product.name}</p>
                            <p className="mt-1 text-slate-500">{product.category}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              {product.stock} left
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState message="No low stock products right now." />
                </div>
              )}
            </section>

            <section className={`${surfaceClass} overflow-hidden`}>
              <div className="border-b border-slate-200 px-6 py-5">
                <p className="text-sm font-medium text-slate-500">Customer growth</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  New Customers
                </h2>
              </div>

              {newCustomers.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Customer Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Join Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {newCustomers.map((customer) => (
                        <tr key={customer.id} className="text-sm text-slate-700">
                          <td className="px-6 py-4 font-semibold text-slate-900">{customer.name}</td>
                          <td className="px-6 py-4">{customer.email}</td>
                          <td className="px-6 py-4 text-slate-500">{formatDate(customer.joinDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState message="No new customers found for this time range." />
                </div>
              )}
            </section>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
