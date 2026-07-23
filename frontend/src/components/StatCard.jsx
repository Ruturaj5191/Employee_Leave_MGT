import React from "react";

export default function StatCard({ label, value, sublabel, accent = "teal" }) {
  const accentMap = {
    teal: "text-teal-dark",
    amber: "text-amber",
    leaf: "text-leaf",
    rust: "text-rust",
  };

  return (
    <div className="rounded border border-line bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${accentMap[accent]}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-ink/50">{sublabel}</p>}
    </div>
  );
}
