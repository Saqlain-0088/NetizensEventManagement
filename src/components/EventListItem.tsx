import { Clock, Users, ChevronRight, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { EventData } from "@/data/mockEvents";

interface EventListItemProps {
  event: EventData;
  onClick: () => void;
}

export const EventListItem = ({ event, onClick }: EventListItemProps) => (
  <div
    className="rounded-2xl border border-border bg-white p-5 cursor-pointer card-hover group flex items-center gap-4 shadow-sm"
    onClick={onClick}
  >
    {/* Date block */}
    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0">
      <span className="text-lg font-bold text-primary leading-none">
        {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric" })}
      </span>
      <span className="text-[10px] text-primary/70 uppercase font-semibold">
        {new Date(event.date).toLocaleDateString("en-IN", { month: "short" })}
      </span>
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="flex items-center gap-2.5 flex-wrap">
        <h3 className="text-base font-bold text-foreground truncate">{event.title}</h3>
        <StatusBadge status={event.status} />
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {event.pax} guests
        </span>
        {event.hallName && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {event.hallName}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground truncate">
        {event.customerName}{event.occasion ? ` · ${event.occasion}` : ""}
      </p>
    </div>

    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
  </div>
);
