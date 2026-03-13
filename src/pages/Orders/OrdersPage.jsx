import { useEffect, useState } from "react";

import EmptyState from "../../components/EmptyState/EmptyState";
import Loader from "../../components/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import { cancelOrder, getMyOrders } from "../../api/orderApi";
import formatPrice from "../../utils/formatPrice";

const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);

    try {
      const data = await getMyOrders({ token });
      setOrders(data.orders || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const handleCancel = async (orderId) => {
    await cancelOrder({ token, orderId });
    loadOrders();
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-slate-900">My orders</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track split vendor orders, payment state, and delivery progress.
        </p>
      </div>

      {loading ? (
        <Loader label="Loading your orders..." />
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : orders.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order._id} className="rounded-[32px] bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Vendor: {order.vendorId?.businessName || "Vendor"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">Order ID: {order._id}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Payment: {order.paymentStatus} | Status: {order.orderStatus}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                  {["pending", "confirmed", "processing"].includes(order.orderStatus) ? (
                    <button
                      type="button"
                      onClick={() => handleCancel(order._id)}
                      className="mt-3 text-sm font-semibold text-rose-600"
                    >
                      Cancel order
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {order.products.map((item) => (
                  <div
                    key={`${order._id}-${item.productId?._id || item.productId}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-900">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-slate-600">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No orders yet"
          description="Orders created during checkout will show up here."
        />
      )}
    </main>
  );
};

export default OrdersPage;
