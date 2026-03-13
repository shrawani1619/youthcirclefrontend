import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    address: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    setupKey: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitLabel = useMemo(() => {
    if (role === "vendor") {
      return "Submit vendor application";
    }

    if (role === "admin") {
      return "Create admin account";
    }

    return "Create customer account";
  }, [role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      };

      if (role === "vendor") {
        payload.businessName = form.businessName;
        payload.address = form.address;
        payload.bankDetails = {
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          ifsc: form.ifsc,
        };
      }

      if (role === "admin") {
        payload.setupKey = form.setupKey;
      }

      const data = await register({ role, ...payload });

      if (role === "vendor") {
        setMessage(data.message || "Vendor registration submitted for approval.");
        return;
      }

      navigate(role === "admin" ? "/admin/dashboard" : "/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Register as a customer, vendor, or admin.
        </p>

        <div className="mt-6 max-w-xs">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Account type</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm capitalize outline-none transition focus:border-indigo-500"
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
          />

          {role === "vendor" ? (
            <>
              <input
                placeholder="Business name"
                value={form.businessName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, businessName: event.target.value }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
              <input
                placeholder="Business address"
                value={form.address}
                onChange={(event) =>
                  setForm((current) => ({ ...current, address: event.target.value }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
              <input
                placeholder="Account name"
                value={form.accountName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, accountName: event.target.value }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
              <input
                placeholder="Account number"
                value={form.accountNumber}
                onChange={(event) =>
                  setForm((current) => ({ ...current, accountNumber: event.target.value }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
              <input
                placeholder="IFSC code"
                value={form.ifsc}
                onChange={(event) => setForm((current) => ({ ...current, ifsc: event.target.value }))}
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 md:col-span-2"
              />
            </>
          ) : null}

          {role === "admin" ? (
            <input
              placeholder="Admin setup key"
              value={form.setupKey}
              onChange={(event) =>
                setForm((current) => ({ ...current, setupKey: event.target.value }))
              }
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 md:col-span-2"
            />
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-2">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 md:col-span-2">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400 md:col-span-2"
          >
            {loading ? "Submitting..." : submitLabel}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
