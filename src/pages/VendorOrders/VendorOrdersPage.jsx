import { useEffect, useState } from "react";

import { DashboardLayout } from "../../components/Layout/AppLayout";
import Loader from "../../components/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import { vendorPanelLinks } from "../../data/dashboardNavigation";
import { getVendorOrders, updateVendorOrderStatus } from "../../api/vendorApi";
import formatPrice from "../../utils/formatPrice";

const statuses = ["confirmed", "processing", "shipped", "delivered", "cancelled"];

const VendorOrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);

    try {
      const data = await getVendorOrders(token);
      setOrders(data.orders || []);
      setError("");
    } catch (requestError) {
      setOrders([]);
      setError(requestError.response?.data?.message || "Could not load vendor orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      await updateVendorOrderStatus(token, orderId, orderStatus);
      setError("");
      loadOrders();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update order status.");
    }
  };

  return (
    <DashboardLayout
      title="Multi Vendor Orders"
      subtitle="Track incoming orders and update fulfillment status from the sidebar panel"
      links={vendorPanelLinks}
      panelLabel="Vendor Panel"
    >
      <section className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-900">Vendor orders</h2>

        {loading ? (
          <div className="mt-4">
            <Loader label="Loading vendor orders..." />
          </div>
        ) : error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <article key={order._id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{order.userId?.name || "Customer"}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Payment: {order.paymentStatus} | Total: {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <select
                    value={order.orderStatus}
                    onChange={(event) => handleStatusChange(order._id, event.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 space-y-2">
                  {order.products.map((item) => (
                    <div
                      key={`${order._id}-${item.productId?._id || item.productId}`}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default VendorOrdersPage;
