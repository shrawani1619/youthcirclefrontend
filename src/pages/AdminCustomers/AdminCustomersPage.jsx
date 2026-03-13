import { useEffect, useMemo, useState } from "react";

import EmptyState from "../../components/EmptyState/EmptyState";
import Loader from "../../components/Loader/Loader";
import { DashboardLayout } from "../../components/Layout/AppLayout";
import { getAdminCustomers } from "../../api/authApi";
import { getAdminOrders } from "../../api/orderApi";
import { useAuth } from "../../context/AuthContext";
import { adminPanelLinks } from "../../data/dashboardNavigation";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const cardClass =
  "rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]";

const AdminCustomersPage = () => {
  const { token } = useAuth();
  const [customersList, setCustomersList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [customersRes, ordersRes] = await Promise.all([
          getAdminCustomers(token),
          getAdminOrders({ token }).catch(() => ({ orders: [] })),
        ]);
        setCustomersList(customersRes.customers || []);
        setOrders(ordersRes.orders || []);
      } catch (requestError) {
        setCustomersList([]);
        setOrders([]);
        setError(requestError.response?.data?.message || "Could not load customers.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const orderStatsByUserId = useMemo(() => {
    const map = {};
    for (const order of orders) {
      const id = order.userId?._id ? String(order.userId._id) : null;
      if (!id) continue;
      if (!map[id]) {
        map[id] = { totalOrders: 0, totalSpent: 0 };
      }
      map[id].totalOrders += 1;
      map[id].totalSpent += Number(order.totalAmount || 0);
    }
    return map;
  }, [orders]);

  const customers = useMemo(() => {
    return customersList.map((c) => {
      const id = c.id || c._id;
      const stats = orderStatsByUserId[id] || { totalOrders: 0, totalSpent: 0 };
      return {
        id,
        name: c.name || "Customer",
        email: c.email || "-",
        phone: c.phone || "-",
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        joinDate: c.createdAt ? new Date(c.createdAt) : null,
      };
    });
  }, [customersList, orderStatsByUserId]);

  const metrics = useMemo(
    () => [
      { label: "Total Customers", value: customers.length },
      { label: "Repeat Customers", value: customers.filter((customer) => customer.totalOrders > 1).length },
      {
        label: "Avg. Customer Spend",
        value: customers.length
          ? formatCurrency(
              customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / customers.length
            )
          : formatCurrency(0),
      },
    ],
    [customers]
  );

  return (
    <DashboardLayout
      title="Customers"
      subtitle="Review your customer base and high value shoppers"
      links={adminPanelLinks}
      panelLabel="Admin Panel"
      topBarSearchPlaceholder="Search customers or email"
      hideHeroSection
    >
      {loading ? (
        <Loader label="Loading customers..." />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className={`${cardClass} p-5`}>
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
              </div>
            ))}
          </section>

          <section className={`${cardClass} overflow-hidden`}>
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-sm font-medium text-slate-500">Customer directory</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">All customers</h2>
            </div>

            {customers.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Customer Name", "Email", "Phone", "Orders", "Total Spent", "Join Date"].map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="text-sm text-slate-700">
                        <td className="px-6 py-4 font-semibold text-slate-900">{customer.name}</td>
                        <td className="px-6 py-4">{customer.email}</td>
                        <td className="px-6 py-4">{customer.phone}</td>
                        <td className="px-6 py-4">{customer.totalOrders}</td>
                        <td className="px-6 py-4">{formatCurrency(customer.totalSpent)}</td>
                        <td className="px-6 py-4 text-slate-500">
                        {customer.joinDate ? formatDate(customer.joinDate) : "-"}
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No registered customers yet"
                  description="Customers will appear here once they sign up."
                />
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminCustomersPage;
