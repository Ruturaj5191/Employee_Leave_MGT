import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EMPLOYEE_LINKS = [
  { to: "/employee", label: "Dashboard", end: true },
  { to: "/employee/history", label: "Leave history" },
];

const MANAGER_LINKS = [
  { to: "/manager", label: "Dashboard", end: true },
  { to: "/manager/requests", label: "Team requests" },
  { to: "/manager/stats", label: "Employee statistics" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "manager" ? MANAGER_LINKS : EMPLOYEE_LINKS;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-transparent relative overflow-hidden">
      {/* Background blobs for layout */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl mix-blend-multiply animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl mix-blend-multiply animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      <aside className="hidden w-64 shrink-0 glass-panel-darker border-r border-white/40 p-6 md:flex flex-col z-10">
        <div className="mb-10">
          <p className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Leaves</p>
          <p className="text-xs text-ink/50">Leave management</p>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/20 scale-[1.02]"
                    : "text-ink/70 hover:bg-white/50 hover:text-ink hover:scale-[1.02]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-line bg-white/50 px-4 py-2 text-sm font-medium text-ink/70 hover:border-rust hover:bg-rust hover:text-white hover:shadow-md hover:shadow-rust/20 transition-all duration-300"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col z-10">
        <header className="flex items-center justify-between glass-panel-darker border-b border-white/40 px-6 py-4 sticky top-0 z-20">
          <div className="md:hidden font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Leaves</div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs capitalize text-ink/50">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="md:hidden rounded-lg border border-line bg-white/50 px-4 py-2 text-sm font-medium text-ink/70 hover:border-rust hover:bg-rust hover:text-white hover:shadow-md hover:shadow-rust/20 transition-all duration-300"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
