import React, { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import LeaveBalanceRing from "../components/LeaveBalanceRing";
import ApplyLeaveForm from "../components/ApplyLeaveForm";
import LeaveTable from "../components/LeaveTable";
import { Spinner } from "../components/Feedback";
import { fetchEmployeeDashboard } from "../api/leaves";

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetchEmployeeDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Your dashboard</h1>
          <p className="mt-1 text-sm text-ink/50">
            Track your leave balance and apply for time off.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="glass-panel rounded-2xl p-8 flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                <LeaveBalanceRing
                  quota={data.annual_quota}
                  approved={data.approved_leaves}
                  pending={data.pending_leaves}
                  remaining={data.remaining_leave}
                />
              </div>

              <div className="glass-panel rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                <h2 className="mb-6 font-display text-lg font-bold text-ink">
                  Apply for leave
                </h2>
                <ApplyLeaveForm onApplied={load} />
              </div>
            </div>

            <div className="mt-8 glass-panel rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
              <h2 className="mb-6 font-display text-lg font-bold text-ink">
                Recent requests
              </h2>
              <LeaveTable leaves={data.recent_requests} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
