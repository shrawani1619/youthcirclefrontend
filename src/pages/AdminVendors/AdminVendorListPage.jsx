import { useEffect, useMemo, useState } from "react";

import { DashboardLayout } from "../../components/Layout/AppLayout";
import Loader from "../../components/Loader/Loader";
import { getAllVendors } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { adminPanelLinks } from "../../data/dashboardNavigation";

const AdminVendorListPage = () => {
  const { token } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVendors = async () => {
      setLoading(true);

      try {
        const data = await getAllVendors(token);
        setVendors(data.vendors || []);
        setError("");
      } catch (requestError) {
        setVendors([]);
        setError(requestError.response?.data?.message || "Could not load vendors.");
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, [token]);

  const approvedVendors = useMemo(
    () => vendors.filter((vendor) => vendor.isApproved),
    [vendors]
  );

  return (
    <DashboardLayout
      title="Admin Panel"
      subtitle="View all approved vendors available in the marketplace"
      links={adminPanelLinks}
      panelLabel="Admin Panel"
      topBarSearchPlaceholder="Search vendors or stores"
      hideHeroSection
    >
      <section className="border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Marketplace vendors
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Available vendors
            </h2>
          </div>
          <div className="text-sm font-semibold text-slate-700">
            {approvedVendors.length} approved vendors
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-8">
            <Loader label="Loading vendors..." />
          </div>
        ) : error ? (
          <div className="m-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : approvedVendors.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Business
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {approvedVendors.map((vendor) => (
                  <tr key={vendor._id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{vendor.businessName}</p>
                      <p className="mt-1 text-sm text-emerald-600">Approved</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {vendor.ownerId?.name || "Vendor owner"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 capitalize">
                        {vendor.ownerId?.role || "vendor"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-800">{vendor.ownerId?.email || "-"}</p>
                      <p className="mt-1 text-sm text-slate-500">{vendor.ownerId?.phone || "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{vendor.address || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <h3 className="text-xl font-semibold text-slate-900">No approved vendors yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Approved vendors will appear here once applications have been accepted.
            </p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminVendorListPage;
