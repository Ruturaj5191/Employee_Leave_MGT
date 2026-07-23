import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import LeaveTable from "../components/LeaveTable";
import { Spinner } from "../components/Feedback";
import { fetchManagerDashboard } from "../api/leaves";

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Team overview</h1>
          <p className="mt-1 text-sm text-ink/50">
            Review pending requests and keep tabs on your team.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Pending requests" value={data.pending_requests} accent="amber" />
              <StatCard label="Approved today" value={data.approved_today} accent="leaf" />
              <StatCard label="Total employees" value={data.total_employees} accent="teal" />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-ink">
                  Recent requests
                </h2>
                <Link
                  to="/manager/requests"
                  className="text-sm font-medium text-teal-dark hover:underline"
                >
                  View all →
                </Link>
              </div>
              <LeaveTable leaves={data.recent_requests} showEmployee />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
