import React from "react";

/**
 * Signature visual: a ring built from the employee's own leave days —
 * approved (teal), pending (amber), and remaining (light track) —
 * with the remaining-day count set as the hero number in the center.
 */
export default function LeaveBalanceRing({ quota, approved, pending, remaining }) {
  const size = 168;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const approvedFrac = quota > 0 ? approved / quota : 0;
  const pendingFrac = quota > 0 ? pending / quota : 0;

  const approvedLen = circumference * approvedFrac;
  const pendingLen = circumference * pendingFrac;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E2DC"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0F766E"
          strokeWidth={stroke}
          strokeDasharray={`${approvedLen} ${circumference - approvedLen}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#D97706"
          strokeWidth={stroke}
          strokeDasharray={`${pendingLen} ${circumference - pendingLen}`}
          strokeDashoffset={-approvedLen}
          strokeLinecap="round"
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          className="fill-ink font-display text-3xl font-semibold"
        >
          {remaining}
        </text>
      </svg>
      <div className="space-y-2 text-sm">
        <p className="font-display text-base font-semibold text-ink">Leave balance</p>
        <Legend swatch="bg-teal" label="Approved" value={approved} />
        <Legend swatch="bg-amber" label="Pending" value={pending} />
        <Legend swatch="bg-line" label="Remaining" value={remaining} />
        <p className="pt-1 text-xs text-ink/50">of {quota} days this year</p>
      </div>
    </div>
  );
}

function Legend({ swatch, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${swatch}`} />
      <span className="text-ink/70">{label}</span>
      <span className="ml-auto font-mono text-xs text-ink/60">{value}d</span>
    </div>
  );
}
