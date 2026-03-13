import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CartSummary from "../../components/Cart/CartSummary";
import EmptyState from "../../components/EmptyState/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { createOrders, openRazorpayCheckout } from "../../api/orderApi";

const Checkout = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { items, itemCount, subtotal, checkoutItems, clearCart } = useCart();
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    setProcessing(true);
    setMessage("");

    try {
      const orderResult = await createOrders({ token, items: checkoutItems });
      const orderIds = (orderResult.orders || []).map((order) => order._id);

      await openRazorpayCheckout({
        token,
        orderIds,
        customer: user,
        onSuccess: () => {
          clearCart();
          navigate("/orders");
        },
        onFailure: (error) => {
          setMessage(error.message || "Payment could not be completed.");
        },
      });
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Checkout failed.");
    } finally {
      setProcessing(false);
    }
  };

  if (!items.length) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        <EmptyState
          title="Nothing to checkout"
          description="Your cart is empty. Add a product first."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[32px] bg-white p-6 shadow-soft">
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="mt-2 text-sm text-slate-600">
            Orders will be split by vendor automatically and then paid together through Razorpay.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Customer
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
              <p className="mt-1 text-sm text-slate-600">{user?.phone || "No phone added"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Payment
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Secure Razorpay checkout. Successful payments confirm your vendor orders.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              >
                <span className="font-medium text-slate-900">
                  {item.name} x {item.quantity}
                </span>
                <span className="text-slate-600">Size {item.size}</span>
              </div>
            ))}
          </div>

          {message ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {message}
            </div>
          ) : null}
        </section>

        <aside>
          <CartSummary
            subtotal={subtotal}
            itemCount={itemCount}
            action={
              <button
                type="button"
                onClick={handleCheckout}
                disabled={processing}
                className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {processing ? "Processing..." : "Place order and pay"}
              </button>
            }
          />
        </aside>
      </div>
    </main>
  );
};

export default Checkout;
