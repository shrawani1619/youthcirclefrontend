import formatPrice from "../../utils/formatPrice";

const CartSummary = ({ subtotal, itemCount, shipping = 0, discount = 0, total, action }) => {
  const totalPrice = typeof total === "number" ? total : subtotal + shipping - discount;

  return (
    <div className="lg:sticky lg:top-24">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-light uppercase tracking-tight text-slate-800">Cart Totals</h2>
          <span className="h-px flex-1 bg-slate-300" />
        </div>

        <div className="mt-7 space-y-4 text-sm text-slate-600">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span>Items</span>
            <span className="text-slate-900">{itemCount}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span>Subtotal</span>
            <span className="text-slate-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span>Shipping Fee</span>
            <span className="text-slate-900">{shipping ? formatPrice(shipping) : formatPrice(0)}</span>
          </div>
          {discount ? (
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span>Discount</span>
              <span className="text-slate-900">- {formatPrice(discount)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between pt-1 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {action ? <div className="mt-8">{action}</div> : null}
      </div>
    </div>
  );
};

export default CartSummary;
