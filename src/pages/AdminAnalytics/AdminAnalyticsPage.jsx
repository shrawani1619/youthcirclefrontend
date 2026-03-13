import { useEffect, useMemo, useState } from "react";

import EmptyState from "../../components/EmptyState/EmptyState";
import Loader from "../../components/Loader/Loader";
import { DashboardLayout } from "../../components/Layout/AppLayout";
import { getAllVendors } from "../../api/authApi";
import { getAdminOrders } from "../../api/orderApi";
import { getProducts } from "../../api/productApi";
import { useAuth } from "../../context/AuthContext";
import { adminPanelLinks } from "../../data/dashboardNavigation";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const cardClass =
  "rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]";

const AdminAnalyticsPage = () => {
  const { token } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);

      try {
        const [vendorsData, productsData, ordersData] = await Promise.all([
          getAllVendors(token),
          getProducts({ limit: 200, sortBy: "createdAt", order: "desc" }),
          getAdminOrders({ token }),
        ]);

        setVendors(vendorsData.vendors || []);
        setProducts(productsData.products || []);
        setOrders(ordersData.orders || []);
        setError("");
      } catch (requestError) {
        setVendors([]);
        setProducts([]);
        setOrders([]);
        setError(requestError.response?.data?.message || "Could not load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [token]);

  const monthlyRevenue = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const total = orders
        .filter((order) => {
          const createdAt = new Date(order.createdAt);
          return createdAt.getMonth() === month && createdAt.getFullYear() === year;
        })
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

      return {
        label: date.toLocaleString("en-IN", { month: "short" }),
        total,
      };
    });
  }, [orders]);

  const topCategories = useMemo(() => {
    const categoryMap = products.reduce((accumulator, product) => {
      const key = product.category || "Uncategorized";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 5);
  }, [products]);

  const topVendorRevenue = useMemo(() => {
    const vendorMap = orders.reduce((accumulator, order) => {
      const key = order.vendorId?.businessName || "Vendor";
      accumulator[key] = (accumulator[key] || 0) + Number(order.totalAmount || 0);
      return accumulator;
    }, {});

    return Object.entries(vendorMap)
      .map(([name, total]) => ({ name, total }))
      .sort((left, right) => right.total - left.total)
      .slice(0, 5);
  }, [orders]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

    return [
      { label: "Revenue", value: formatCurrency(totalRevenue) },
      { label: "Average Order Value", value: formatCurrency(avgOrderValue) },
      { label: "Approved Vendors", value: vendors.filter((vendor) => vendor.isApproved).length },
      { label: "Products", value: products.length },
    ];
  }, [orders, vendors, products]);

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((item) => item.total), 1);

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Track business trends, category mix, and vendor performance"
      links={adminPanelLinks}
      panelLabel="Admin Panel"
      topBarSearchPlaceholder="Search reports or metrics"
      hideHeroSection
    >
      {loading ? (
        <Loader label="Loading analytics..." />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`${cardClass} p-5`}>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className={`${cardClass} p-6`}>
              <p className="text-sm font-medium text-slate-500">Revenue trend</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Last 6 months
              </h2>

              <div className="mt-8 flex h-64 items-end gap-4">
                {monthlyRevenue.map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                    <div className="flex h-52 w-full items-end">
                      <div
                        className="w-full rounded-t-2xl bg-slate-900/90 transition hover:bg-violet-600"
                        style={{ height: `${Math.max((item.total / maxMonthlyRevenue) * 100, 8)}%` }}
                        title={`${item.label}: ${formatCurrency(item.total)}`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${cardClass} p-6`}>
              <p className="text-sm font-medium text-slate-500">Top categories</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Product mix
              </h2>

              <div className="mt-6 space-y-4">
                {topCategories.length ? (
                  topCategories.map((category) => (
                    <div key={category.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-800">{category.name}</span>
                        <span className="text-slate-500">{category.count}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-violet-600"
                          style={{
                            width: `${(category.count / Math.max(...topCategories.map((item) => item.count), 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No category data"
                    description="Categories will appear once products are added."
                  />
                )}
              </div>
            </section>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <section className={`${cardClass} p-6`}>
              <p className="text-sm font-medium text-slate-500">Vendor performance</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Top vendor revenue
              </h2>
              <div className="mt-6 space-y-4">
                {topVendorRevenue.length ? (
                  topVendorRevenue.map((vendor) => (
                    <div key={vendor.name} className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <span className="font-medium text-slate-900">{vendor.name}</span>
                      <span className="text-sm font-semibold text-slate-700">
                        {formatCurrency(vendor.total)}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No vendor analytics"
                    description="Vendor revenue data will appear after orders are placed."
                  />
                )}
              </div>
            </section>

            <section className={`${cardClass} p-6`}>
              <p className="text-sm font-medium text-slate-500">Marketplace overview</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Quick breakdown
              </h2>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Pending vendor approvals", value: vendors.filter((vendor) => !vendor.isApproved).length },
                  { label: "Approved vendors", value: vendors.filter((vendor) => vendor.isApproved).length },
                  { label: "Orders recorded", value: orders.length },
                  { label: "Products live", value: products.length },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;
