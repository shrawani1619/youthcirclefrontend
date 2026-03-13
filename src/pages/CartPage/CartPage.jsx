import { Link } from "react-router-dom";

import CartSummary from "../../components/Cart/CartSummary";
import { useCart } from "../../context/CartContext";
import formatPrice from "../../utils/formatPrice";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const CartPage = () => {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart } = useCart();
  const discount = items.reduce(
    (sum, item) => sum + item.price * ((item.discount || 0) / 100) * item.quantity,
    0
  );
  const shipping = 10;
  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <main className="min-h-[calc(100vh-120px)] bg-[#F8F9FB] px-4 py-8 lg:px-6 lg:py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-center">
          <section className="w-full max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[20px] bg-slate-100 text-slate-400">
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M7 8h10l-1 10H8L7 8Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.5 8V6.8A2.5 2.5 0 0 1 12 4.3a2.5 2.5 0 0 1 2.5 2.5V8" strokeLinecap="round" />
                <path d="M12 10.8v4.4" strokeLinecap="round" />
                <path d="M9.8 13h4.4" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-medium tracking-tight text-slate-800">Your cart is empty</h1>
            <p className="mt-2 text-sm text-slate-500">Looks like you haven&apos;t added anything yet.</p>
            <Link
              to="/products?nav=shop"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#111827] px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse Products
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.8fr)_300px]">
        <section>
          <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
            <h1 className="text-3xl font-light uppercase tracking-tight text-slate-800">Your Cart</h1>
            <span className="h-px w-12 bg-slate-400" />
          </div>

          <div className="border-b border-slate-200">
            {items.map((item) => {
              const finalPrice = item.price * (1 - (item.discount || 0) / 100);

              return (
                <article
                  key={`${item.productId}-${item.size}`}
                  className="grid gap-5 border-t border-slate-200 py-6 first:border-t-0 md:grid-cols-[84px_minmax(0,1fr)_90px_36px] md:items-center"
                >
                  <div className="overflow-hidden bg-slate-100">
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      className="h-[84px] w-[84px] object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-slate-800">{item.name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span>{formatPrice(finalPrice)}</span>
                      <span className="inline-flex h-6 min-w-6 items-center justify-center border border-slate-200 px-2 text-xs uppercase text-slate-500">
                        {item.size}
                      </span>
                    </div>
                  </div>

                  <div className="justify-self-start md:justify-self-center">
                    <div className="inline-flex h-11 min-w-[56px] items-center justify-center border border-slate-200 px-3 text-sm text-slate-700">
                      {item.quantity}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))
                        }
                        className="inline-flex h-7 w-7 items-center justify-center border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="inline-flex h-7 w-7 items-center justify-center border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId, item.size)}
                    aria-label={`Remove ${item.name}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M7 7 17 17" strokeLinecap="round" />
                      <path d="M17 7 7 17" strokeLinecap="round" />
                    </svg>
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="xl:self-start xl:pt-16">
          <CartSummary
            subtotal={subtotal}
            itemCount={itemCount}
            shipping={shipping}
            discount={discount}
            total={total}
            action={
              <Link
                to="/checkout"
                className="block bg-black px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800"
              >
                Proceed to Checkout
              </Link>
            }
          />
        </aside>
      </div>
    </main>
  );
};

export default CartPage;
