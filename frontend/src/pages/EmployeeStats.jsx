import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Spinner, EmptyState } from "../components/Feedback";
import { fetchEmployeeStats } from "../api/leaves";

export default function EmployeeStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Employee leave statistics
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Approved, pending, and remaining leave days for the current year.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : stats.length === 0 ? (
          <EmptyState title="No employees on your team yet" />
        ) : (
          <div className="overflow-x-auto rounded border border-line bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-line bg-paper/60 text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Quota</th>
                  <th className="px-4 py-3 font-medium">Approved</th>
                  <th className="px-4 py-3 font-medium">Pending</th>
                  <th className="px-4 py-3 font-medium">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row) => (
                  <tr key={row.employee_id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{row.employee_name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/60">
                      {row.annual_quota}d
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-teal-dark">
                      {row.approved_days}d
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-amber">
                      {row.pending_days}d
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/70">
                      {row.remaining_days}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
