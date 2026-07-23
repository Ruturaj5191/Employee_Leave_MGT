import React from "react";

const STYLES = {
  pending: "bg-amber-light text-amber",
  approved: "bg-leaf-light text-leaf",
  rejected: "bg-rust-light text-rust",
  cancelled: "bg-line text-ink/60",
};

export default function StatusPill({ status }) {
  const style = STYLES[status] || STYLES.cancelled;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}
    >
      {status}
    </span>
  );
}
