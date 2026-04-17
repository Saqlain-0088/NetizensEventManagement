import { CalendarDays, Users, CheckCircle2, XCircle, Clock, ArrowRight, Sparkles } from "lucide-react";
// HIDDEN (temporary): TrendingUp (revenue banner icon)
import { useState } from "react";
import { useEvents } from "@/context/EventContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fmt12 } from "@/lib/utils";
import { DateFilter, type DateRange } from "@/components/DateFilter";

const Dashboard = () => {
  const { events } = useEvents();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>({});

  const filteredEvents = events.filter((e) => {
    if (!dateRange.from && !dateRange.to) return true;
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    if (dateRange.from && d < dateRange.from) return false;
    if (dateRange.to && d > dateRange.to) return false;
    return true;
  });

  const confirmed = filteredEvents.filter((e) => e.status === "confirmed").length;
  const draft = filteredEvents.filter((e) => e.status === "draft").length;
  const tentative = filteredEvents.filter((e) => e.status === "tentative").length;
  const cancelled = filteredEvents.filter((e) => e.status === "cancelled").length;
  const totalPax = filteredEvents
    .filter((e) => e.status !== "cancelled")
    .reduce((s, e) => s + e.pax, 0);

  const upcoming = filteredEvents
    .filter((e) => e.status !== "cancelled" && new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // HIDDEN (temporary): revenue calculation
  // const revenue = events.filter(...).reduce(...);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good day <span>👋</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Here's what's happening with your events</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
          <DateFilter value={dateRange} onChange={setDateRange} className="w-full sm:w-56" />
          <Button
            onClick={() => navigate("/add-enquiry")}
            className="gradient-primary text-white border-0 shadow-md glow-primary hover:opacity-90 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">New Enquiry</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={CalendarDays} label="Total Events" value={filteredEvents.length} iconBg="bg-blue-100" iconColor="text-blue-600" valueColor="text-blue-700" />
        <StatCard icon={Clock} label="Pending Review" value={draft} iconBg="bg-slate-100" iconColor="text-slate-600" valueColor="text-slate-700" />
        <StatCard icon={CheckCircle2} label="Confirmed" value={confirmed} iconBg="bg-emerald-100" iconColor="text-emerald-600" valueColor="text-emerald-700" />
        <StatCard icon={Clock} label="Tentative" value={tentative} iconBg="bg-amber-100" iconColor="text-amber-600" valueColor="text-amber-700" />
        <StatCard icon={XCircle} label="Cancelled" value={cancelled} iconBg="bg-red-100" iconColor="text-red-600" valueColor="text-red-700" />
        <StatCard icon={Users} label="Total PAX" value={totalPax} iconBg="bg-indigo-100" iconColor="text-indigo-600" valueColor="text-indigo-700" />
      </div>

      {/* HIDDEN (temporary): Revenue Banner */}
      {/* {revenue > 0 && ( <div className="rounded-2xl gradient-primary ..."> ... </div> )} */}

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Upcoming Events</h2>
          <button
            onClick={() => navigate("/events")}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-medium"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-border p-12 text-center bg-white">
            <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No upcoming events.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => navigate("/add-enquiry")}
            >
              Add your first event
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border border-border bg-white p-4 flex items-center justify-between cursor-pointer card-hover group"
                onClick={() => navigate("/events")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary leading-none">
                      {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric" })}
                    </span>
                    <span className="text-[10px] text-primary/70 uppercase font-medium">
                      {new Date(e.date).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fmt12(e.startTime)} · {e.pax} guests · {e.hallName || e.occasion}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${
                    e.status === "confirmed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {e.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  valueColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}) => (
  <div className="rounded-2xl border border-border bg-white p-5 space-y-3 card-hover">
    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
      <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
    </div>
    <div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  </div>
);

export default Dashboard;
