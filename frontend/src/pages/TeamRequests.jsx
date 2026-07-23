import React, { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import LeaveTable from "../components/LeaveTable";
import { Spinner, ErrorBanner } from "../components/Feedback";
import { fetchMyLeaves, approveLeave, rejectLeave } from "../api/leaves";
import { extractErrorMessage } from "../utils/errors";

const STATUS_OPTIONS = ["", "pending", "approved", "rejected", "cancelled"];

export default function TeamRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchMyLeaves({ status: status || undefined, search: search || undefined })
      .then((data) => setLeaves(data.results ?? data))
      .catch((err) => setError(extractErrorMessage(err, "Could not load team requests.")))
      .finally(() => setLoading(false));
  }, [status, search]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleDecision(id, decisionFn) {
    setActingId(id);
    setError("");
    try {
      await decisionFn(id);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not record this decision."));
    } finally {
      setActingId(null);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Team requests</h1>
          <p className="mt-1 text-sm text-ink/50">
            Approve or reject leave requests from your team.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by employee or reason…"
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
            showEmployee
            renderActions={(leave) =>
              leave.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecision(leave.id, approveLeave)}
                    disabled={actingId === leave.id}
                    className="rounded bg-leaf px-2.5 py-1 text-xs font-medium text-white hover:bg-leaf/90 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(leave.id, rejectLeave)}
                    disabled={actingId === leave.id}
                    className="rounded border border-line px-2.5 py-1 text-xs font-medium text-ink/70 hover:border-rust hover:text-rust disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
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
