import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner, ErrorBanner } from "../components/Feedback";

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(username, password);
      navigate(user.role === "manager" ? "/manager" : "/employee");
    } catch {
      // error surfaced via context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl mix-blend-multiply animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      
      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        <div className="mb-10 text-center">
          <p className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Leaves</p>
          <p className="mt-1 text-sm text-ink/50">Sign in to manage time off</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 glass-panel rounded-2xl p-8 animate-slide-up">
          <ErrorBanner message={error} />

          <div className="input-group">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder=" "
              autoFocus
            />
            <label className="input-label">Username</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder=" "
            />
            <label className="input-label">Password</label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary py-3 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none"
          >
            {submitting && <Spinner className="border-white border-t-transparent" />}
            Sign in
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-ink/60 animate-fade-in" style={{animationDelay: '0.2s'}}>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
