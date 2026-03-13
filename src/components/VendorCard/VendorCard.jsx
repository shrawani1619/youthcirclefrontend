const VendorCard = ({ vendor, action }) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{vendor.businessName}</h3>
        <p className="mt-1 text-sm text-slate-500">{vendor.ownerId?.name || "Vendor owner"}</p>
        <p className="mt-3 text-sm text-slate-600">{vendor.address}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  </article>
);

export default VendorCard;
