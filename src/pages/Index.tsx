import { useState } from "react";
import { CalendarDays, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EventListItem } from "@/components/EventListItem";
import { EventDetailModal } from "@/components/EventDetailModal";
import { mockEvents, type EventData, type EventStatus } from "@/data/mockEvents";

const statusFilters: { label: string; value: EventStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Tentative", value: "tentative" },
  { label: "Cancelled", value: "cancelled" },
];

const Index = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const filtered = mockEvents.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-warm px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-8 h-8 text-primary-foreground" />
            <h1 className="text-3xl font-bold text-primary-foreground">Event Manager</h1>
          </div>
          <p className="text-primary-foreground/80">Google Calendar Enhancement & Event Card System</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events or customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {statusFilters.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={statusFilter === f.value ? "default" : "outline"}
                className={statusFilter === f.value ? "gradient-warm text-primary-foreground" : ""}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Events" value={mockEvents.length} />
          <StatCard label="Confirmed" value={mockEvents.filter((e) => e.status === "confirmed").length} />
          <StatCard label="Upcoming PAX" value={mockEvents.filter((e) => e.status !== "cancelled").reduce((s, e) => s + e.pax, 0)} />
        </div>

        {/* Event List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Filter className="w-4 h-4" /> Events ({filtered.length})
          </h2>
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No events found.</p>
          ) : (
            filtered.map((event) => (
              <EventListItem key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
            ))
          )}
        </div>
      </main>

      <EventDetailModal event={selectedEvent} open={!!selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl bg-card border border-border p-5 text-center">
    <p className="text-3xl font-bold text-gradient-warm">{value}</p>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
  </div>
);

export default Index;
