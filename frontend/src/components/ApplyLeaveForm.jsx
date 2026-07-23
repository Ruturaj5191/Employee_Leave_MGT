import React, { useState } from "react";
import { applyLeave } from "../api/leaves";
import { extractErrorMessage } from "../utils/errors";
import { Spinner, ErrorBanner, SuccessBanner } from "./Feedback";

const todayISO = () => new Date().toISOString().split("T")[0];

export default function ApplyLeaveForm({ onApplied }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function validateClientSide() {
    const errs = {};
    if (!startDate) errs.start_date = "Start date is required.";
    if (!endDate) errs.end_date = "End date is required.";
    if (startDate && startDate < todayISO()) {
      errs.start_date = "Start date cannot be in the past.";
    }
    if (startDate && endDate && endDate < startDate) {
      errs.end_date = "End date cannot be before start date.";
    }
    if (!reason.trim()) errs.reason = "Please add a short reason.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errs = validateClientSide();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await applyLeave({ start_date: startDate, end_date: endDate, reason });
      setSuccess("Leave request submitted. Your manager will review it shortly.");
      setStartDate("");
      setEndDate("");
      setReason("");
      setFieldErrors({});
      onApplied?.();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not submit this leave request."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">Start date</label>
          <input
            type="date"
            min={todayISO()}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-teal"
          />
          {fieldErrors.start_date && (
            <p className="mt-1 text-xs text-rust">{fieldErrors.start_date}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">End date</label>
          <input
            type="date"
            min={startDate || todayISO()}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-teal"
          />
          {fieldErrors.end_date && (
            <p className="mt-1 text-xs text-rust">{fieldErrors.end_date}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink/60">Reason</label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-teal"
          placeholder="Briefly describe the reason for your leave"
        />
        {fieldErrors.reason && <p className="mt-1 text-xs text-rust">{fieldErrors.reason}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-dark disabled:opacity-60"
      >
        {submitting && <Spinner className="border-white border-t-transparent" />}
        Submit request
      </button>
    </form>
  );
}
