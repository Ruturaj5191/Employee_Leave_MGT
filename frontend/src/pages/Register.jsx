import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, fetchManagers } from "../api/auth";
import { Spinner, ErrorBanner, SuccessBanner } from "../components/Feedback";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password2: "",
    role: "employee",
    manager: "",
  });

  const [managers, setManagers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchManagers()
      .then(setManagers)
      .catch(() => {});
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  }

  function handleRoleToggle(role) {
    setForm((prev) => ({ ...prev, role, manager: "" }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form };
      if (payload.role === "manager") {
        delete payload.manager;
      }
      if (payload.manager === "") {
        delete payload.manager;
      }

      await register(payload);
      setSuccess("Registration successful! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        // Flatten DRF error object into a readable string
        const messages = Object.entries(data)
          .map(([key, val]) => {
            const msg = Array.isArray(val) ? val.join(" ") : val;
            return key === "non_field_errors" ? msg : `${key}: ${msg}`;
          })
          .join(" | ");
        setError(messages);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-teal transition-colors";
  const labelCls = "mb-1 block text-xs font-medium text-ink/60";

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-semibold text-ink">Create Account</p>
          <p className="mt-1 text-sm text-ink/50">Join as an employee or manager</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded border border-line bg-white p-6 shadow-sm"
        >
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          {/* Role Toggle */}
          <div>
            <label className={labelCls}>I am a</label>
            <div className="mt-1 flex rounded border border-line overflow-hidden">
              <button
                type="button"
                onClick={() => handleRoleToggle("employee")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  form.role === "employee"
                    ? "bg-teal text-white"
                    : "bg-white text-ink/60 hover:bg-paper"
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => handleRoleToggle("manager")}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  form.role === "manager"
                    ? "bg-teal text-white"
                    : "bg-white text-ink/60 hover:bg-paper"
                }`}
              >
                Manager
              </button>
            </div>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First Name</label>
              <input
                type="text"
                name="first_name"
                required
                value={form.first_name}
                onChange={handleChange}
                className={inputCls}
                placeholder="John"
              />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input
                type="text"
                name="last_name"
                required
                value={form.last_name}
                onChange={handleChange}
                className={inputCls}
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className={labelCls}>Username</label>
            <input
              type="text"
              name="username"
              required
              value={form.username}
              onChange={handleChange}
              className={inputCls}
              placeholder="johndoe"
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={inputCls}
              placeholder="john@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className={labelCls}>Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className={inputCls}
              placeholder="Min. 8 characters"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className={labelCls}>Confirm Password</label>
            <input
              type="password"
              name="password2"
              required
              minLength={8}
              value={form.password2}
              onChange={handleChange}
              className={inputCls}
              placeholder="Re-enter password"
            />
          </div>

          {/* Manager Dropdown – only for employees */}
          {form.role === "employee" && (
            <div>
              <label className={labelCls}>Assign Manager</label>
              <select
                name="manager"
                value={form.manager}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">— Select a manager (optional) —</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} (@{m.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded bg-teal py-2.5 text-sm font-medium text-white transition hover:bg-teal-dark disabled:opacity-60"
          >
            {submitting && <Spinner className="border-white border-t-transparent" />}
            Create Account
          </button>
        </form>

        {/* Link to Login */}
        <p className="mt-6 text-center text-sm text-ink/50">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
