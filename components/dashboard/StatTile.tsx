import type { LucideIcon } from "lucide-react";

const TONES = {
  blue: { border: "border-l-blue-500", icon: "text-blue-600 bg-blue-50", value: "text-blue-800" },
  amber: { border: "border-l-amber-500", icon: "text-amber-600 bg-amber-50", value: "text-amber-800" },
  emerald: { border: "border-l-emerald-500", icon: "text-emerald-600 bg-emerald-50", value: "text-emerald-800" },
  red: { border: "border-l-red-500", icon: "text-red-600 bg-red-50", value: "text-red-700" },
  violet: { border: "border-l-violet-500", icon: "text-violet-600 bg-violet-50", value: "text-violet-800" },
} as const;

export function StatTile({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
}) {
  const t = TONES[tone];
  return (
    <div className={`rounded-xl border border-l-4 ${t.border} border-neutral-200 bg-white p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
        <span className={`rounded-lg p-1.5 ${t.icon}`}>
          <Icon size={16} strokeWidth={2.25} />
        </span>
      </div>
      <p className={`mt-1 text-3xl font-bold tabular-nums ${t.value}`}>{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-neutral-400">{sublabel}</p>}
    </div>
  );
}
