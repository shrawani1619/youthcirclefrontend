import { Link } from "react-router-dom";

const SocialIcon = ({ children, label }) => (
  <a
    href="/"
    aria-label={label}
    onClick={(event) => event.preventDefault()}
    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 transition hover:-translate-y-0.5 hover:border-violet-400 hover:text-white"
  >
    {children}
  </a>
);

const footerSections = [
  {
    title: "About",
    links: [
      { label: "About YouthCircle", to: "/" },
      { label: "Contact", to: "/login" },
      { label: "Privacy Policy", to: "/" },
      { label: "Terms", to: "/" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Men", to: "/products?nav=men" },
      { label: "Women", to: "/products?nav=women" },
      { label: "Kids", to: "/kids" },
      { label: "Accessories", to: "/products?nav=shop" },
    ],
  },
];

const Footer = () => (
  <footer className="mt-16 bg-[#111827] text-white">
    <div className="w-full px-4 py-14 lg:px-8 xl:px-10">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_0.9fr]">
        <div className="max-w-sm space-y-6">
          <div>
            <img src="/logo.png" alt="Youth Circle" className="h-10 w-auto max-w-[160px] object-contain invert" />
            <p className="mt-4 text-base leading-8 text-slate-300">
              Your premier destination for fashion-forward essentials, exclusive drops, and
              elevated everyday style.
            </p>
          </div>

          <div className="flex gap-3">
            <SocialIcon label="Facebook">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.5-.1-1.3-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8V11H7.5v3H10v7h3.5Z" />
              </svg>
            </SocialIcon>
            <SocialIcon label="Twitter">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M18.9 7.2c.8-.1 1.5-.5 2.1-1-.3.9-.9 1.6-1.7 2.1v.5c0 5-3.8 10.8-10.8 10.8-2.1 0-4.1-.6-5.8-1.7h.8c1.8 0 3.5-.6 4.8-1.7-1.7 0-3.1-1.1-3.6-2.7h.7c.3 0 .7 0 1-.1-1.8-.4-3.1-2-3.1-3.9v-.1c.5.3 1.1.5 1.8.5-1.1-.8-1.8-2-1.8-3.5 0-.8.2-1.5.6-2.2 2 2.5 5 4.1 8.4 4.2-.1-.3-.1-.6-.1-.9 0-2.2 1.8-4 4-4 1.1 0 2.1.5 2.8 1.2.9-.2 1.7-.5 2.4-.9-.3.9-.9 1.6-1.7 2.1Z" />
              </svg>
            </SocialIcon>
            <SocialIcon label="Instagram">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.8A3 3 0 0 0 4.8 7.8v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V7.8a3 3 0 0 0-3-3H7.8Zm8.9 1.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7.6A4.4 4.4 0 1 1 7.6 12 4.4 4.4 0 0 1 12 7.6Zm0 1.8A2.6 2.6 0 1 0 14.6 12 2.6 2.6 0 0 0 12 9.4Z" />
              </svg>
            </SocialIcon>
            <SocialIcon label="YouTube">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M21 8.5a3 3 0 0 0-2.1-2.1C17 6 12 6 12 6s-5 0-6.9.4A3 3 0 0 0 3 8.5 31.9 31.9 0 0 0 2.6 12c0 1.2.1 2.3.4 3.5a3 3 0 0 0 2.1 2.1C7 18 12 18 12 18s5 0 6.9-.4a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.3.4-3.5s-.1-2.3-.4-3.5ZM10.2 14.9V9.1L15.4 12l-5.2 2.9Z" />
              </svg>
            </SocialIcon>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-[0.8fr_0.8fr_1.2fr]">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <div className="mt-5 space-y-4">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="block text-base text-slate-200 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-lg font-semibold text-white">
              Subscribe to get special offers and updates.
            </h3>
            <form className="mt-5 flex overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                onClick={(event) => event.preventDefault()}
                className="bg-white px-6 py-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-900 transition hover:bg-violet-600 hover:text-white"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-slate-300">
        &copy; 2026 YouthCircle. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
