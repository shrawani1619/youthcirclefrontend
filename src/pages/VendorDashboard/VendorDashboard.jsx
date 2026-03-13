import { useEffect, useState } from "react";

import Loader from "../../components/Loader/Loader";
import { DashboardLayout } from "../../components/Layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { vendorPanelLinks } from "../../data/dashboardNavigation";
import { useVendor } from "../../context/VendorContext";

const VendorDashboard = () => {
  const { token } = useAuth();
  const { dashboard, loadDashboard } = useVendor();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        await loadDashboard(token);
        setError("");
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Could not load the vendor dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  return (
    <DashboardLayout
      title="Multi Vendor Panel"
      subtitle="Manage products, revenue, and order activity from one sidebar workspace"
      links={vendorPanelLinks}
      panelLabel="Vendor Panel"
    >
      {loading ? (
        <Loader label="Loading vendor dashboard..." />
      ) : error || !dashboard ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error || "Vendor dashboard data is unavailable."}
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Total Products", dashboard.metrics.totalProducts],
              ["Total Sales", dashboard.metrics.totalSales],
              ["Pending Orders", dashboard.metrics.pendingOrders],
              ["Revenue", dashboard.metrics.revenue],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl bg-white p-6 shadow-soft">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
              <div className="mt-4 space-y-3">
                {dashboard.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-900">{order.userId?.name || "Customer"}</span>
                    <span className="text-slate-500">{order.orderStatus}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-slate-900">Recent products</h2>
              <div className="mt-4 space-y-3">
                {dashboard.recentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-900">{product.name}</span>
                    <span className="text-slate-500">{product.stock} in stock</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
};

export default VendorDashboard;
