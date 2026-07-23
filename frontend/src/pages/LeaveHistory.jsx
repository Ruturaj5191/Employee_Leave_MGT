import React, { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import LeaveTable from "../components/LeaveTable";
import { Spinner, ErrorBanner } from "../components/Feedback";
import { fetchMyLeaves, cancelLeave } from "../api/leaves";
import { extractErrorMessage } from "../utils/errors";

const STATUS_OPTIONS = ["", "pending", "approved", "rejected", "cancelled"];

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchMyLeaves({ status: status || undefined, search: search || undefined })
      .then((data) => setLeaves(data.results ?? data))
      .catch((err) => setError(extractErrorMessage(err, "Could not load your leave history.")))
      .finally(() => setLoading(false));
  }, [status, search]);

  useEffect(() => {
    const timeout = setTimeout(load, 250); // light debounce on search
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleCancel(id) {
    setCancellingId(id);
    setError("");
    try {
      await cancelLeave(id);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not cancel this request."));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Leave history</h1>
          <p className="mt-1 text-sm text-ink/50">View and manage all your leave requests.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by reason…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-teal sm:max-w-xs"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-teal sm:w-48"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s ? s[0].toUpperCase() + s.slice(1) : "All statuses"}
              </option>
            ))}
          </select>
        </div>

        <ErrorBanner message={error} />

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <LeaveTable
            leaves={leaves}
            renderActions={(leave) =>
              leave.status === "pending" ? (
                <button
                  onClick={() => handleCancel(leave.id)}
                  disabled={cancellingId === leave.id}
                  className="rounded border border-line px-2.5 py-1 text-xs font-medium text-ink/70 hover:border-rust hover:text-rust disabled:opacity-50"
                >
                  {cancellingId === leave.id ? "Cancelling…" : "Cancel"}
                </button>
              ) : (
                <span className="text-xs text-ink/30">—</span>
              )
            }
          />
        )}
      </div>
    </Layout>
  );
}
