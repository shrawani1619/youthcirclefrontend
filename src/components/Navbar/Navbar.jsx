import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { navigationLinks } from "../../data/navigationMenus";

const navLinkClass = (isActive) =>
  `rounded-full px-2.5 py-2 text-xs font-semibold tracking-wide transition lg:px-3 xl:px-4 xl:text-sm ${
    isActive
      ? "bg-slate-900 text-white shadow-soft"
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
  }`;

const mobileLinkClass = (isActive) =>
  `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const ChevronIcon = ({ open = false, className = "" }) => (
  <svg
    viewBox="0 0 20 20"
    className={`h-4 w-4 transition ${open ? "rotate-180" : ""} ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path
      d="M3 4h2l2.2 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.76L20 7H7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="19" r="1.5" />
    <circle cx="17" cy="19" r="1.5" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 19a7 7 0 0 1 14 0" strokeLinecap="round" />
  </svg>
);

const OrdersIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M7 4.75h10A2.25 2.25 0 0 1 19.25 7v10A2.25 2.25 0 0 1 17 19.25H7A2.25 2.25 0 0 1 4.75 17V7A2.25 2.25 0 0 1 7 4.75Z" />
    <path d="M8 9h8M8 13h8M8 17h5" strokeLinecap="round" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10 6H6.75A1.75 1.75 0 0 0 5 7.75v8.5C5 17.22 5.78 18 6.75 18H10" strokeLinecap="round" />
    <path d="M13 8.5 18 12l-5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 12H9" strokeLinecap="round" />
  </svg>
);

const DesktopMegaMenu = ({ link, closeMenu }) => (
  <div className="absolute left-1/2 top-full z-50 w-max max-w-[96vw] -translate-x-1/2 pt-4">
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.55)]">
      <div>
        <div
          className={`grid justify-start gap-x-2 gap-y-6 ${
            link.sections.length > 2
              ? "md:grid-cols-[repeat(3,minmax(160px,220px))]"
              : "md:grid-cols-[repeat(2,minmax(160px,220px))]"
          }`}
        >
          {link.sections.map((section) => (
            <div key={section.title} className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{section.title}</p>
              <div className="mt-4 space-y-1.5">
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={closeMenu}
                    className="block rounded-2xl px-3 py-2 text-sm leading-6 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const DesktopAccountMenu = ({ user, menuLinks, closeMenu, onLogout }) => (
  <div className="absolute right-0 top-full z-50 w-72 pt-4">
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.55)]">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <UserIcon />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-slate-900">{user?.name || "User"}</p>
          <p className="truncate text-sm text-slate-500">{user?.phone || user?.email || "YouthCircle member"}</p>
        </div>
      </div>

      <div className="p-2">
        {menuLinks.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <span className="text-slate-500">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <span className="text-slate-500">
            <LogoutIcon />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
);

const GuestAccountMenu = ({ closeMenu }) => (
  <div className="absolute right-0 top-full z-50 w-72 pt-4">
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.55)]">
      <div className="px-5 py-5">
        <p className="text-2xl font-semibold tracking-tight text-slate-900">Hello User</p>
        <p className="mt-1 text-sm text-slate-500">Access your YouthCircle account</p>
        <Link
          to="/register"
          onClick={closeMenu}
          className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Sign Up
        </Link>
      </div>

      <div className="border-t border-slate-200 p-2">
        <Link
          to="/login"
          onClick={closeMenu}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <span className="text-slate-500">
            <UserIcon />
          </span>
          <span>Sign In</span>
        </Link>
        <Link
          to="/login"
          onClick={closeMenu}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <span className="text-slate-500">
            <OrdersIcon />
          </span>
          <span>My Orders</span>
        </Link>
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState("");
  const [expandedMobileSection, setExpandedMobileSection] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isExactLinkActive = (linkTo) => {
    const targetUrl = new URL(linkTo, "https://youthcircle.local");
    const currentParams = new URLSearchParams(location.search);
    const targetParams = new URLSearchParams(targetUrl.search);

    if (linkTo === "/products?nav=shop" && location.pathname === "/products" && !currentParams.get("nav")) {
      return true;
    }

    if (location.pathname !== targetUrl.pathname) {
      return false;
    }

    return Array.from(targetParams.entries()).every(([key, value]) => currentParams.get(key) === value);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setExpandedMobileSection("");
    setAccountMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setActiveMegaMenu("");
    setExpandedMobileSection("");
    setAccountMenuOpen(false);
  };

  const toggleMobileSection = (label) => {
    setExpandedMobileSection((current) => (current === label ? "" : label));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();
    const searchParams = new URLSearchParams({ nav: "shop" });

    if (trimmedQuery) {
      searchParams.set("search", trimmedQuery);
    }

    closeMenu();
    navigate(`/products?${searchParams.toString()}`);
  };

  const accountMenuLinks =
    user?.role === "customer"
      ? [
          { label: "Profile", to: "/profile", icon: <UserIcon /> },
          { label: "My Orders", to: "/orders", icon: <OrdersIcon /> },
          { label: "Cart", to: "/cart", icon: <CartIcon /> },
        ]
      : user?.role === "vendor"
        ? [
            { label: "Profile", to: "/profile", icon: <UserIcon /> },
            { label: "Vendor Dashboard", to: "/vendor/dashboard", icon: <UserIcon /> },
          ]
        : user?.role === "admin"
          ? [
              { label: "Profile", to: "/profile", icon: <UserIcon /> },
              { label: "Admin Dashboard", to: "/admin/dashboard", icon: <UserIcon /> },
            ]
          : [];

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl">
      <div className="w-full px-4 py-4 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between gap-3 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-4">
          <Link to="/" className="flex shrink-0 items-center" onClick={closeMenu}>
            <img
              src="/logo.png"
              alt="Youth Circle"
              className="h-20 w-auto max-w-[260px] object-contain"
            />
          </Link>

          <nav className="hidden min-w-0 items-center justify-center gap-0.5 lg:flex xl:gap-1.5">
            {navigationLinks.map((link) => {
              const hasMegaMenu = Boolean(link.sections?.length);
              const isLinkActive = isExactLinkActive(link.to);
              const isMenuOpen = activeMegaMenu === link.label;

              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => hasMegaMenu && setActiveMegaMenu(link.label)}
                  onMouseLeave={() => hasMegaMenu && setActiveMegaMenu("")}
                >
                  <Link
                    to={link.to}
                    onFocus={() => hasMegaMenu && setActiveMegaMenu(link.label)}
                    className={`${navLinkClass(isLinkActive)} ${hasMegaMenu ? "inline-flex items-center gap-2" : ""}`}
                  >
                    <span>{link.label}</span>
                    {hasMegaMenu ? (
                      <ChevronIcon
                        open={isMenuOpen}
                        className={isLinkActive ? "text-white" : "text-slate-400"}
                      />
                    ) : null}
                  </Link>
                  {hasMegaMenu && isMenuOpen ? <DesktopMegaMenu link={link} closeMenu={closeMenu} /> : null}
                </div>
              );
            })}
            {user?.role === "vendor" ? (
              <NavLink to="/vendor/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
                Vendor
              </NavLink>
            ) : null}
            {user?.role === "admin" ? (
              <NavLink to="/admin/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
                Admin
              </NavLink>
            ) : null}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm transition hover:border-slate-300 focus-within:border-slate-900"
            >
              <SearchIcon />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="w-20 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:w-24 xl:w-40"
              />
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
              >
                Search
              </button>
            </form>
            <Link
              to="/cart"
              aria-label="Shopping cart"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-900 hover:text-slate-900"
            >
              <CartIcon />
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            </Link>

            {user ? (
              <div
                className="relative"
                onMouseLeave={() => setAccountMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    navigate("/profile");
                  }}
                  onMouseEnter={() => setAccountMenuOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-900 hover:text-slate-900"
                >
                  <UserIcon />
                  <ChevronIcon open={accountMenuOpen} className="text-slate-400" />
                </button>
                {accountMenuOpen ? (
                  <DesktopAccountMenu
                    user={user}
                    menuLinks={accountMenuLinks}
                    closeMenu={closeMenu}
                    onLogout={handleLogout}
                  />
                ) : null}
              </div>
            ) : (
              <div
                className="relative"
                onMouseLeave={() => setAccountMenuOpen(false)}
              >
                <button
                  type="button"
                  aria-label="Open account menu"
                  onClick={() => setAccountMenuOpen((current) => !current)}
                  onMouseEnter={() => setAccountMenuOpen(true)}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 p-3 text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-violet-700"
                >
                  <UserIcon />
                </button>
                {accountMenuOpen ? <GuestAccountMenu closeMenu={closeMenu} /> : null}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label="Toggle menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-800 transition hover:border-slate-900 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-soft lg:hidden">
            <form onSubmit={handleSearchSubmit} className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
              <SearchIcon />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Go
              </button>
            </form>
            <nav className="space-y-1">
              {navigationLinks.map((link) => {
                const hasMegaMenu = Boolean(link.sections?.length);
                const isExpanded = expandedMobileSection === link.label;

                return (
                  <div key={link.label} className="rounded-[26px] border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 p-1.5">
                      <Link
                        to={link.to}
                        onClick={closeMenu}
                        className={`flex-1 ${mobileLinkClass(isExactLinkActive(link.to))}`}
                      >
                        {link.label}
                      </Link>
                      {hasMegaMenu ? (
                        <button
                          type="button"
                          aria-label={`Toggle ${link.label} subcategories`}
                          onClick={() => toggleMobileSection(link.label)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <ChevronIcon open={isExpanded} />
                        </button>
                      ) : null}
                    </div>
                    {hasMegaMenu && isExpanded ? (
                      <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                        <div className="space-y-4">
                          {link.sections.map((section) => (
                            <div key={section.title}>
                              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                {section.title}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {section.items.map((item) => (
                                  <Link
                                    key={item.label}
                                    to={item.to}
                                    onClick={closeMenu}
                                    className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <NavLink
                to="/try-on/demo"
                onClick={closeMenu}
                className={({ isActive }) => mobileLinkClass(isActive)}
              >
                Try-On
              </NavLink>
              {user?.role === "vendor" ? (
                <NavLink
                  to="/vendor/dashboard"
                  onClick={closeMenu}
                  className={({ isActive }) => mobileLinkClass(isActive)}
                >
                  Vendor
                </NavLink>
              ) : null}
              {user?.role === "admin" ? (
                <NavLink
                  to="/admin/dashboard"
                  onClick={closeMenu}
                  className={({ isActive }) => mobileLinkClass(isActive)}
                >
                  Admin
                </NavLink>
              ) : null}
            </nav>

            <div className="mt-4 border-t border-slate-200 pt-4">
              {user ? (
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
                  <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <UserIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-slate-900">{user.name}</p>
                      <p className="truncate text-sm text-slate-500">
                        {user.phone || user.email || "YouthCircle member"}
                      </p>
                    </div>
                  </div>

                  <div className="p-2">
                    {accountMenuLinks.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <span className="text-slate-500">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <span className="text-slate-500">
                        <LogoutIcon />
                      </span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/cart"
                    onClick={closeMenu}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    <CartIcon />
                    <span>Cart ({itemCount})</span>
                  </Link>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
