import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EventListItem } from "@/components/EventListItem";
import { EventDetailModal } from "@/components/EventDetailModal";
import { useEvents } from "@/context/EventContext";
import { useNavigate } from "react-router-dom";
import type { EventData, EventStatus } from "@/data/mockEvents";
import { DateFilter, type DateRange } from "@/components/DateFilter";

const statusFilters: { label: string; value: EventStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Tentative", value: "tentative" },
  { label: "Cancelled", value: "cancelled" },
];

const activeStyles: Record<string, string> = {
  all: "bg-primary text-white border-primary shadow-sm",
  confirmed: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
  tentative: "bg-amber-500 text-white border-amber-500 shadow-sm",
  cancelled: "bg-red-500 text-white border-red-500 shadow-sm",
};

const Events = () => {
  const { events } = useEvents();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesDate = (() => {
      if (!dateRange.from && !dateRange.to) return true;
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      if (dateRange.from && d < dateRange.from) return false;
      if (dateRange.to && d > dateRange.to) return false;
      return true;
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Event List</h1>
          <p className="text-muted-foreground text-sm mt-1">{events.length} total events</p>
        </div>
        <Button
          onClick={() => navigate("/add-enquiry")}
          className="gradient-primary text-white border-0 shadow-md glow-primary hover:opacity-90 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Enquiry
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events or customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-border h-10"
          />
        </div>
        <DateFilter value={dateRange} onChange={setDateRange} className="w-full sm:w-[220px]" />
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((f) => {
            const isActive = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                  isActive
                    ? activeStyles[f.value]
                    : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border p-16 text-center bg-white">
            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No events found.</p>
          </div>
        ) : (
          filtered.map((event) => (
            <EventListItem key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
          ))
        )}
      </div>

      <EventDetailModal event={selectedEvent} open={!!selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

export default Events;
