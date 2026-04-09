import type { EventStatus } from "@/data/mockEvents";

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  tentative: {
    label: "Tentative",
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
};

export const StatusBadge = ({ status }: { status: EventStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
};
