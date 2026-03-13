import { useEffect, useState } from "react";

import { DashboardLayout } from "../../components/Layout/AppLayout";
import Loader from "../../components/Loader/Loader";
import VendorCard from "../../components/VendorCard/VendorCard";
import { useAuth } from "../../context/AuthContext";
import { approveVendor, getPendingVendors } from "../../api/authApi";
import { adminPanelLinks } from "../../data/dashboardNavigation";

const AdminVendorApprovalPage = () => {
  const { token } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVendors = async () => {
    setLoading(true);

    try {
      const data = await getPendingVendors(token);
      setVendors(data.vendors || []);
      setError("");
    } catch (requestError) {
      setVendors([]);
      setError(requestError.response?.data?.message || "Could not load vendor applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [token]);

  const handleApprove = async (vendorId) => {
    try {
      await approveVendor(token, vendorId);
      setError("");
      loadVendors();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not approve vendor.");
    }
  };

  return (
    <DashboardLayout
      title="Admin Panel"
      subtitle="Review pending vendor requests and approve new marketplace sellers"
      links={adminPanelLinks}
      panelLabel="Admin Panel"
      topBarSearchPlaceholder="Search vendors or stores"
      topBarAction={{ label: "Add Product", to: "/admin/products/add" }}
      hideHeroSection
    >
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Vendor requests
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Pending approval requests
            </h2>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {vendors.length} waiting
          </div>
        </div>

        {loading ? (
          <div className="mt-6">
            <Loader label="Loading vendor applications..." />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor._id}
                vendor={vendor}
                action={
                  <button
                    type="button"
                    onClick={() => handleApprove(vendor._id)}
                    className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Approve
                  </button>
                }
              />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminVendorApprovalPage;
