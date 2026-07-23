import React from "react";

export function Spinner({ className = "" }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-teal border-t-transparent ${className}`}
    />
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded border border-rust/30 bg-rust-light px-4 py-3 text-sm text-rust">
      {message}
    </div>
  );
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded border border-leaf/30 bg-leaf-light px-4 py-3 text-sm text-leaf">
      {message}
    </div>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="rounded border border-dashed border-line bg-white/60 py-12 text-center">
      <p className="font-display text-sm font-semibold text-ink/70">{title}</p>
      {subtitle && <p className="mt-1 text-xs text-ink/50">{subtitle}</p>}
    </div>
  );
}
