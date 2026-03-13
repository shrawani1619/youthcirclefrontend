import { useState } from "react";

import { DashboardLayout } from "../../components/Layout/AppLayout";
import { adminPanelLinks } from "../../data/dashboardNavigation";

const sectionClass = "rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    storeName: "YouthCircle",
    supportEmail: "support@youthcircle.com",
    orderAlerts: true,
    vendorApprovalEmails: true,
    autoApproveVendors: false,
    maintenanceMode: false,
  });
  const [message, setMessage] = useState("");

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    setMessage("Settings updated for this session.");
  };

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Configure admin preferences and marketplace controls"
      links={adminPanelLinks}
      panelLabel="Admin Panel"
      topBarSearchPlaceholder="Search settings"
      hideHeroSection
    >
      <form onSubmit={handleSave} className="space-y-6">
        <section className={sectionClass}>
          <p className="text-sm font-medium text-slate-500">General</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Store preferences
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Store name</span>
              <input
                value={settings.storeName}
                onChange={(event) => updateSetting("storeName", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Support email</span>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(event) => updateSetting("supportEmail", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <section className={sectionClass}>
            <p className="text-sm font-medium text-slate-500">Notifications</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Alerts
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  key: "orderAlerts",
                  label: "Order alerts",
                  description: "Receive updates when new orders are created.",
                },
                {
                  key: "vendorApprovalEmails",
                  label: "Vendor approval emails",
                  description: "Send email notifications for vendor approval actions.",
                },
              ].map((item) => (
                <label key={item.key} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={(event) => updateSetting(item.key, event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <p className="text-sm font-medium text-slate-500">Marketplace controls</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Admin controls
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  key: "autoApproveVendors",
                  label: "Auto approve vendors",
                  description: "Automatically approve new vendor registrations.",
                },
                {
                  key: "maintenanceMode",
                  label: "Maintenance mode",
                  description: "Temporarily restrict store operations for maintenance.",
                },
              ].map((item) => (
                <label key={item.key} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={(event) => updateSetting(item.key, event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                </label>
              ))}
            </div>
          </section>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">{message || "Update marketplace preferences and save changes."}</p>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Save changes
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
