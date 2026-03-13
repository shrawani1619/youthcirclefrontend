import { useEffect, useMemo, useState } from "react";

import EmptyState from "../../components/EmptyState/EmptyState";
import Loader from "../../components/Loader/Loader";
import { DashboardLayout } from "../../components/Layout/AppLayout";
import { getAdminOrders } from "../../api/orderApi";
import { useAuth } from "../../context/AuthContext";
import { adminPanelLinks } from "../../data/dashboardNavigation";

const statusBadgeClass = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  processing: "bg-violet-100 text-violet-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const cardClass =
  "rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]";

const AdminOrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);

      try {
        const data = await getAdminOrders({ token });
        setOrders(data.orders || []);
        setError("");
      } catch (requestError) {
        setOrders([]);
        setError(requestError.response?.data?.message || "Could not load admin orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  const sortedOrders = useMemo(
    () => [...orders].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
    [orders]
  );

  const metrics = useMemo(() => {
    const totalRevenue = sortedOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    return [
      { label: "Total Orders", value: sortedOrders.length },
      { label: "Pending", value: sortedOrders.filter((order) => order.orderStatus === "pending").length },
      { label: "Delivered", value: sortedOrders.filter((order) => order.orderStatus === "delivered").length },
      { label: "Revenue", value: formatCurrency(totalRevenue) },
    ];
  }, [sortedOrders]);

  return (
    <DashboardLayout
      title="Orders"
      subtitle="Track purchases and fulfillment across all vendors"
      links={adminPanelLinks}
      panelLabel="Admin Panel"
      topBarSearchPlaceholder="Search orders, customers or vendors"
      hideHeroSection
    >
      {loading ? (
        <Loader label="Loading admin orders..." />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className={`${cardClass} p-5`}>
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
              </div>
            ))}
          </section>

          <section className={`${cardClass} overflow-hidden`}>
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-sm font-medium text-slate-500">Orders overview</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Recent orders</h2>
            </div>

            {sortedOrders.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Order ID", "Customer", "Vendor", "Amount", "Status", "Date"].map((heading) => (
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
                    {sortedOrders.map((order) => (
                      <tr key={order._id} className="text-sm text-slate-700">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          #{String(order._id).slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">{order.userId?.name || "Customer"}</td>
                        <td className="px-6 py-4">{order.vendorId?.businessName || "Vendor"}</td>
                        <td className="px-6 py-4">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              statusBadgeClass[order.orderStatus] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No orders yet"
                  description="Orders placed by customers will appear here for admin review."
                />
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminOrdersPage;
