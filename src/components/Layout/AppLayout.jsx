import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";
import { useAuth } from "../../context/AuthContext";

export const AppLayout = ({ children }) => (
  <div className="min-h-screen overflow-x-hidden bg-slate-50">
    <Navbar />
    <div>{children}</div>
    <Footer />
  </div>
);

const dashboardLinkClass = ({ isActive }) =>
  `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-slate-900 text-white shadow-soft"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const panelIcons = {
  dashboard: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-11h7V4h-7v5Z" strokeLinejoin="round" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4.75h10A2.25 2.25 0 0 1 19.25 7v10A2.25 2.25 0 0 1 17 19.25H7A2.25 2.25 0 0 1 4.75 17V7A2.25 2.25 0 0 1 7 4.75Z" />
      <path d="M8 9h8M8 13h8M8 17h5" strokeLinecap="round" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3.75 4.75 7.5 12 11.25 19.25 7.5 12 3.75Z" strokeLinejoin="round" />
      <path d="M4.75 7.5v9L12 20.25l7.25-3.75v-9" strokeLinejoin="round" />
      <path d="M12 11.25v9" />
    </svg>
  ),
  vendors: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19.25V9.5l4-2.75 4 2.75v9.75M16 10.5l4 2.25v6.5M2.75 19.25h18.5" strokeLinejoin="round" />
      <path d="M9 12.5h2M9 16h2" strokeLinecap="round" />
    </svg>
  ),
  approvals: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21a8.25 8.25 0 1 0 0-16.5A8.25 8.25 0 0 0 12 21Z" />
      <path d="m8.75 12 2.1 2.1 4.4-4.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  customers: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="9" r="3.25" />
      <circle cx="17" cy="10.5" r="2.25" />
      <path d="M3.75 18.5a5.5 5.5 0 0 1 10.5 0M14.5 18.5a4 4 0 0 1 5.75-3.6" strokeLinecap="round" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4.75 19.25h14.5" strokeLinecap="round" />
      <path d="M7.5 16.5v-5M12 16.5V8M16.5 16.5v-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8.75A3.25 3.25 0 1 0 12 15.25 3.25 3.25 0 1 0 12 8.75Z" />
      <path d="M19.25 12a7.45 7.45 0 0 0-.08-1.07l1.8-1.4-1.75-3.03-2.18.88a7.55 7.55 0 0 0-1.85-1.08L14.9 3.75h-3.8l-.29 2.55a7.55 7.55 0 0 0-1.85 1.08l-2.18-.88-1.75 3.03 1.8 1.4A7.45 7.45 0 0 0 4.75 12c0 .36.03.72.08 1.07l-1.8 1.4 1.75 3.03 2.18-.88c.56.45 1.18.82 1.85 1.08l.29 2.55h3.8l.29-2.55c.67-.26 1.29-.63 1.85-1.08l2.18.88 1.75-3.03-1.8-1.4c.05-.35.08-.71.08-1.07Z" strokeLinejoin="round" />
    </svg>
  ),
};

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6.75 10.25a5.25 5.25 0 1 1 10.5 0v2.5c0 .8.32 1.56.88 2.12l.62.63H5.25l.62-.63c.56-.56.88-1.32.88-2.12v-2.5Z" strokeLinejoin="round" />
    <path d="M10 18.25a2.25 2.25 0 0 0 4 0" strokeLinecap="round" />
  </svg>
);

const renderSidebarLink = (link, isDarkVariant, pathname) => {
  const sharedClass = `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
    isDarkVariant
      ? "text-slate-300 hover:bg-white/5 hover:text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

  const activeClass = isDarkVariant
    ? "bg-white/10 text-white shadow-[0_16px_30px_-22px_rgba(99,102,241,0.85)]"
    : "bg-slate-900 text-white shadow-soft";

  const disabledClass = isDarkVariant
    ? "cursor-not-allowed opacity-45"
    : "cursor-not-allowed opacity-50";

  const content = (
    <>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-current/10">
        {panelIcons[link.icon] || panelIcons.dashboard}
      </span>
      <span className="flex-1">{link.label}</span>
      {link.disabled ? (
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${isDarkVariant ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
          Soon
        </span>
      ) : null}
    </>
  );

  if (link.disabled) {
    return (
      <div key={`${link.label}-disabled`} className={`${sharedClass} ${disabledClass}`}>
        {content}
      </div>
    );
  }

  const hasActiveChild = Array.isArray(link.children)
    ? link.children.some((child) => pathname === child.to)
    : false;

  if (Array.isArray(link.children) && link.children.length) {
    return (
      <div key={link.to} className="group">
        <NavLink
          to={link.to}
          className={({ isActive }) => `${sharedClass} ${isActive || hasActiveChild ? activeClass : ""}`}
        >
          {content}
        </NavLink>

        <div
          className={`overflow-hidden pl-5 transition-all duration-200 ${
            hasActiveChild
              ? "mt-2 max-h-40 opacity-100"
              : "max-h-0 opacity-0 group-hover:mt-2 group-hover:max-h-40 group-hover:opacity-100"
          }`}
        >
          <div className={`space-y-1 border-l ${isDarkVariant ? "border-white/10" : "border-slate-200"} pl-4`}>
            {link.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? isDarkVariant
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 font-medium text-slate-900"
                      : isDarkVariant
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-500 hover:text-slate-900"
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      key={link.to}
      to={link.to}
      className={({ isActive }) => `${sharedClass} ${isActive ? activeClass : ""}`}
    >
      {content}
    </NavLink>
  );
};

export const DashboardLayout = ({
  title,
  subtitle,
  links,
  children,
  panelLabel = "Control Center",
  navSectionLabel = "Operations",
  variant = "light",
  topBarSearchPlaceholder = "Search",
  topBarAction = null,
  hideTopBarHeading = false,
  hideHeroSection = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    []
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isDarkVariant = variant === "dark";

  const rootClass = isDarkVariant ? "min-h-screen bg-slate-950" : "min-h-screen bg-white";
  const sidebarClass = isDarkVariant
    ? "rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#172554,#0f172a_58%,#020617)] p-6 text-white shadow-[0_30px_80px_-45px_rgba(79,70,229,0.55)] lg:sticky lg:top-4 lg:max-h-[calc(100vh-32px)] lg:overflow-y-auto"
    : "border-b border-slate-200 bg-white p-6 lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r";
  const shellCardClass = isDarkVariant
    ? "rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
    : "border-b border-slate-200 bg-white px-0 py-3";
  const heroCardClass = isDarkVariant
    ? "rounded-[28px] border border-white/10 bg-white/5 px-6 py-5 backdrop-blur"
    : "border-b border-slate-200 bg-white px-0 py-6";

  return (
    <div className={rootClass}>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={sidebarClass}>
          <div className="flex h-full flex-col">
            <div>
              <p className={`text-2xl font-bold tracking-tight ${isDarkVariant ? "text-white" : "text-slate-900"}`}>
                YouthCircle
              </p>
              <p className={`mt-2 text-xs font-medium uppercase tracking-[0.22em] ${isDarkVariant ? "text-slate-400" : "text-slate-400"}`}>
                {panelLabel}
              </p>
            </div>

            <div className="mt-12">
              <p className={`text-xs font-medium uppercase tracking-[0.22em] ${isDarkVariant ? "text-slate-500" : "text-slate-400"}`}>
                {navSectionLabel}
              </p>

              <nav className="mt-4 space-y-2">
                {links.map((link) => renderSidebarLink(link, isDarkVariant, location.pathname))}
              </nav>
            </div>

            {!isDarkVariant ? (
              <div className="mt-auto border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl transition hover:bg-slate-50">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      {panelIcons.customers}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user?.name || "Dashboard user"}
                      </p>
                      <p className="truncate text-xs capitalize text-slate-500">
                        {user?.role || "member"}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <main className="space-y-8 px-4 py-6 lg:px-8 lg:py-8">
          <section className={shellCardClass}>
            <div
              className={`flex flex-col gap-4 sm:flex-row sm:items-center ${
                hideTopBarHeading ? "sm:justify-end" : "sm:justify-between"
              }`}
            >
              {!hideTopBarHeading ? (
                <div className="flex items-center gap-3">
                  <div>
                    <p className={`text-2xl font-semibold tracking-tight ${isDarkVariant ? "text-white" : "text-slate-900"}`}>
                      {title}
                    </p>
                    <p className={`text-[11px] font-medium uppercase tracking-[0.22em] ${isDarkVariant ? "text-slate-400" : "text-slate-400"}`}>
                      Operation Level
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                {!isDarkVariant ? (
                  <button
                    type="button"
                    aria-label={topBarSearchPlaceholder}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    <SearchIcon />
                  </button>
                ) : (
                  <label
                    className="flex min-w-[240px] flex-1 items-center gap-3 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2.5 text-slate-300 sm:max-w-sm"
                  >
                    <SearchIcon />
                    <input
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder={topBarSearchPlaceholder}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                    />
                  </label>
                )}
                <button
                  type="button"
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${
                    isDarkVariant
                      ? "border border-white/10 bg-slate-950/40 text-slate-200"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <BellIcon />
                </button>
                <div
                  className={`inline-flex items-center gap-3 rounded-full px-2 py-1 ${
                    isDarkVariant
                      ? "border border-white/10 bg-slate-950/40 text-slate-100"
                      : "text-slate-800"
                  }`}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
                    {(user?.name || "A").charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium">{user?.name || "Admin"}</span>
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-400" fill="currentColor">
                    <path d="M5.5 7.5 10 12l4.5-4.5" />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {!hideHeroSection ? (
            <section className={heroCardClass}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkVariant ? "text-indigo-200" : "text-slate-500"}`}>
                    Overview
                  </p>
                  <h1 className={`mt-2 text-4xl font-semibold tracking-tight ${isDarkVariant ? "text-white" : "text-slate-900"}`}>
                    {title}
                  </h1>
                  <p className={`mt-2 text-sm leading-7 ${isDarkVariant ? "text-slate-300" : "text-slate-500"}`}>
                    {subtitle}
                  </p>
                </div>

                <div className="flex flex-col gap-2 text-right">
                  <p className={`text-xs font-medium ${isDarkVariant ? "text-slate-400" : "text-slate-400"}`}>
                    Today
                  </p>
                  <p className={`text-sm font-semibold ${isDarkVariant ? "text-white" : "text-slate-800"}`}>
                    {todayLabel}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
};
