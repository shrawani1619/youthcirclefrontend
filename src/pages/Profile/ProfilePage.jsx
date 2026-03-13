import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const { user, vendor } = useAuth();

  const quickLinks =
    user?.role === "customer"
      ? [
          { label: "My Orders", to: "/orders" },
          { label: "Cart", to: "/cart" },
        ]
      : user?.role === "vendor"
        ? [
            { label: "Vendor Dashboard", to: "/vendor/dashboard" },
            { label: "Manage Products", to: "/vendor/products/list" },
          ]
        : [
            { label: "Admin Dashboard", to: "/admin/dashboard" },
            { label: "Manage Products", to: "/admin/products/list" },
          ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <section className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Profile</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          {user?.name || "YouthCircle User"}
        </h1>
        <p className="mt-2 text-sm capitalize text-slate-500">{user?.role || "member"}</p>
      </section>

      <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Account details</h2>
            <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Name</p>
                <p className="mt-2 text-sm text-slate-800">{user?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Email</p>
                <p className="mt-2 break-all text-sm text-slate-800">{user?.email || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Phone</p>
                <p className="mt-2 text-sm text-slate-800">{user?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Role</p>
                <p className="mt-2 text-sm capitalize text-slate-800">{user?.role || "-"}</p>
              </div>
            </div>
          </section>

          {user?.role === "vendor" ? (
            <section className="border-t border-slate-200 pt-8">
              <h2 className="text-lg font-semibold text-slate-900">Business details</h2>
              <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Business Name
                  </p>
                  <p className="mt-2 text-sm text-slate-800">{vendor?.businessName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    GST Number
                  </p>
                  <p className="mt-2 text-sm text-slate-800">{vendor?.gstNumber || "-"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Address
                  </p>
                  <p className="mt-2 text-sm text-slate-800">{vendor?.address || "-"}</p>
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="border-t border-slate-200 pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-4 space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 text-sm font-medium text-slate-700 transition hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default ProfilePage;
