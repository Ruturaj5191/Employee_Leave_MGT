import React from "react";
import StatusPill from "./StatusPill";
import { EmptyState } from "./Feedback";

export default function LeaveTable({
  leaves,
  showEmployee = false,
  renderActions,
  emptyTitle = "No leave requests yet",
  emptySubtitle = "Requests will show up here once submitted.",
}) {
  if (!leaves || leaves.length === 0) {
    return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />;
  }

  return (
    <div className="overflow-x-auto rounded border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-paper/60 text-xs uppercase tracking-wide text-ink/50">
          <tr>
            {showEmployee && <th className="px-4 py-3 font-medium">Employee</th>}
            <th className="px-4 py-3 font-medium">Dates</th>
            <th className="px-4 py-3 font-medium">Days</th>
            <th className="px-4 py-3 font-medium">Reason</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Applied</th>
            {renderActions && <th className="px-4 py-3 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id} className="border-b border-line last:border-0">
              {showEmployee && (
                <td className="px-4 py-3 font-medium text-ink">{leave.employee_name}</td>
              )}
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink/70">
                {leave.start_date} → {leave.end_date}
              </td>
              <td className="px-4 py-3 text-ink/70">{leave.days}</td>
              <td className="max-w-xs truncate px-4 py-3 text-ink/70" title={leave.reason}>
                {leave.reason}
              </td>
              <td className="px-4 py-3">
                <StatusPill status={leave.status} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-ink/50">
                {new Date(leave.applied_at).toLocaleDateString()}
              </td>
              {renderActions && <td className="px-4 py-3">{renderActions(leave)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
