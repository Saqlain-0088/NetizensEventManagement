import React, { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Check, Plus, X, Package, Globe } from "lucide-react";
import type { ServiceEntry } from "./ServiceMenuBuilder";

// ── helpers ──────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");

function makeSlots(fromH: number, fromM: number, toH: number, toM: number, step = 30): string[] {
  const slots: string[] = [];
  let h = fromH, m = fromM;
  while (h < toH || (h === toH && m < toM)) {
    slots.push(`${pad(h)}:${pad(m)}`);
    m += step;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
  }
  return slots;
}

const ALL_SLOTS = makeSlots(6, 0, 23, 30);

function fmt12(hhmm: string) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h % 12 || 12;
  return `${h12}:${pad(m)}${ampm}`;
}

function formatDateHeading(ds: string) {
  if (!ds) return "";
  const d = new Date(ds + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
}

// ── CalendlyScheduler ─────────────────────────────────────────────────────────
// Calendly-style: Calendar on LEFT, time slots on RIGHT (vertical list)
// Two-phase: pick start time, then pick end time
export const CalendlyScheduler = ({
  date, onDateChange,
  startTime, onStartTimeChange,
  endTime, onEndTimeChange,
  errors,
}: {
  date: string; onDateChange: (v: string) => void;
  startTime: string; onStartTimeChange: (v: string) => void;
  endTime: string; onEndTimeChange: (v: string) => void;
  errors?: { date?: string; startTime?: string; endTime?: string };
}) => {
  const [cal, setCal] = useState(() => {
    const d = date ? new Date(date + "T00:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  // "start" or "end" – which time list to show
  const [phase, setPhase] = useState<"start" | "end">(startTime ? "end" : "start");
  const slotListRef = useRef<HTMLDivElement>(null);

  // Reset phase when start time changes
  useEffect(() => {
    if (startTime && !endTime) setPhase("end");
    if (!startTime) setPhase("start");
  }, [startTime, endTime]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const firstDay = new Date(cal.year, cal.month, 1).getDay();
  const daysInMonth = new Date(cal.year, cal.month + 1, 0).getDate();

  // Build calendar cells
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${cal.year}-${pad(cal.month + 1)}-${pad(d)}`;
    const dt = new Date(cal.year, cal.month, d);
    const past = dt < today;
    const sel = date === ds;
    const tod = dt.getTime() === today.getTime();
    cells.push(
      <button key={d} type="button" disabled={past}
        onClick={() => { onDateChange(ds); setPhase("start"); }}
        className={`w-9 h-9 rounded-full text-sm font-medium transition-all flex items-center justify-center ${
          sel
            ? "bg-[#0069ff] text-white shadow-md"
            : tod
            ? "border-2 border-[#0069ff] text-[#0069ff] font-bold"
            : past
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-700 hover:bg-blue-50"
        }`}>
        {d}
      </button>
    );
  }

  // Time slots for the right panel
  const slotsToShow = phase === "start"
    ? ALL_SLOTS
    : ALL_SLOTS.filter((t) => t > startTime); // end must be after start

  const selectedInPhase = phase === "start" ? startTime : endTime;

  const handleTimeClick = (t: string) => {
    if (phase === "start") {
      onStartTimeChange(t);
      // Auto-clear end time if it's now invalid
      if (endTime && t >= endTime) onEndTimeChange("");
      setPhase("end");
    } else {
      onEndTimeChange(t);
    }
  };

  // Confirmed slot state (Calendly shows "Confirm" button next to selected)
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);

  const handleSlotClick = (t: string) => {
    if (pendingSlot === t) {
      // Confirm click
      handleTimeClick(t);
      setPendingSlot(null);
    } else {
      setPendingSlot(t);
    }
  };

  // Reset pending when phase changes
  useEffect(() => { setPendingSlot(null); }, [phase]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        Select a Date & Time <span className="text-red-500">*</span>
      </Label>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[380px]">

          {/* ──── LEFT: Calendar ──────────────────────────────── */}
          <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-gray-200">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button type="button"
                onClick={() => setCal((m) => {
                  const d = new Date(m.year, m.month - 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(cal.year, cal.month).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </span>
              <button type="button"
                onClick={() => setCal((m) => {
                  const d = new Date(m.year, m.month + 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-1 place-items-center">
              {cells}
            </div>

            {/* Timezone footer */}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
              <Globe className="w-3 h-3" />
              <span>India Standard Time</span>
            </div>
          </div>

          {/* ──── RIGHT: Time slots ───────────────────────────── */}
          <div className="w-full md:w-48 flex flex-col">
            {date ? (
              <>
                {/* Date heading */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDateHeading(date)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {phase === "start" ? "Select start time" : "Select end time"}
                  </p>
                  {/* Phase toggle pills */}
                  <div className="flex gap-1.5 mt-2">
                    <button type="button"
                      onClick={() => setPhase("start")}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        phase === "start"
                          ? "bg-[#0069ff] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                      Start{startTime && `: ${fmt12(startTime)}`}
                    </button>
                    <button type="button"
                      onClick={() => startTime ? setPhase("end") : undefined}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        phase === "end"
                          ? "bg-[#0069ff] text-white"
                          : startTime
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed"
                      }`}>
                      End{endTime && `: ${fmt12(endTime)}`}
                    </button>
                  </div>
                </div>

                {/* Scrollable time slot list */}
                <div ref={slotListRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 max-h-[280px]">
                  {slotsToShow.map((t) => {
                    const isSelected = selectedInPhase === t;
                    const isPending = pendingSlot === t;

                    return (
                      <div key={t} className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSlotClick(t)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                            isSelected
                              ? "bg-[#0069ff] text-white border-[#0069ff]"
                              : isPending
                              ? "bg-[#0069ff]/10 text-[#0069ff] border-[#0069ff]"
                              : "bg-white text-[#0069ff] border-[#0069ff]/30 hover:border-[#0069ff] hover:bg-blue-50"
                          }`}
                        >
                          {fmt12(t)}
                        </button>

                        {/* Confirm button (Calendly style) */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => { handleTimeClick(t); setPendingSlot(null); }}
                            className="px-3 py-2.5 rounded-lg text-sm font-semibold bg-[#0069ff] text-white hover:bg-[#0055d4] transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* No date selected yet */
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Pick a date</p>
                  <p className="text-xs text-gray-400 mt-0.5">to see available times</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar — selected summary */}
        {(startTime || endTime) && (
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              {date && (
                <span className="font-medium text-gray-700">
                  {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              )}
              {startTime && (
                <>
                  <span className="text-gray-400">·</span>
                  <span className="font-semibold text-[#0069ff]">{fmt12(startTime)}</span>
                </>
              )}
              {endTime && (
                <>
                  <span className="text-gray-400">→</span>
                  <span className="font-semibold text-[#0069ff]">{fmt12(endTime)}</span>
                </>
              )}
            </div>
            {startTime && endTime && (
              <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Confirmed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error messages */}
      {errors?.date && <p className="text-xs text-red-500">{errors.date}</p>}
      {errors?.startTime && <p className="text-xs text-red-500">{errors.startTime}</p>}
      {errors?.endTime && <p className="text-xs text-red-500">{errors.endTime}</p>}
    </div>
  );
};

// ── Legacy exports (keep for backward compat) ────────────────────────────────
export const CalendarPicker = CalendlyScheduler; // alias
export const TimeSlotPicker = () => null; // no longer used standalone

// ── AllPackages ───────────────────────────────────────────────────────────────
interface AllPackagesProps {
  packages: any[];
  selectedPkgId: string | null;
  onSelect: (pkg: any) => void;
  services: ServiceEntry[];
  setServices: React.Dispatch<React.SetStateAction<ServiceEntry[]>>;
  menuItems: any[];
}

export const AllPackages = ({
  packages, selectedPkgId, onSelect, services, setServices, menuItems,
}: AllPackagesProps) => {
  const selectedPkg = packages.find((p) => p.id === selectedPkgId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Select Package</p>
        {selectedPkgId && (
          <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Applied ✓
          </span>
        )}
      </div>

      {selectedPkgId ? (
        <div className="space-y-3">
          {/* Selected package card */}
          <div className="rounded-xl border-2 border-primary bg-primary/5 shadow-sm p-3 relative">
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-1 pr-7">
              <span className="text-xs font-semibold text-foreground">{selectedPkg?.name}</span>
              {selectedPkg?.featured && <span className="text-amber-500 text-xs">⭐</span>}
            </div>
            <p className="text-base font-bold text-primary">
              ₹{selectedPkg?.pricePerPerson}
              <span className="text-xs font-normal text-muted-foreground">/person</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{selectedPkg?.timeType?.replace("-", " ")}</p>
            <button type="button" onClick={() => onSelect({ id: null })}
              className="mt-2 text-[11px] text-muted-foreground hover:text-red-500 underline underline-offset-2 transition-colors">
              Change package
            </button>
          </div>

          {/* Editable included items */}
          {services.length > 0 && (
            <div className="rounded-xl border border-primary/20 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Included Items <span className="ml-1.5 text-xs font-normal text-muted-foreground">— edit as needed</span>
                </p>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {services[0].menuItems.length} items
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {services[0].menuItems.map((item) => (
                  <span key={item}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-primary/10 text-primary border border-primary/25 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                    onClick={() => setServices((prev) => {
                      const u = [...prev];
                      u[0] = { ...u[0], menuItems: u[0].menuItems.filter((m) => m !== item) };
                      return u;
                    })}>
                    {item} <X className="h-2.5 w-2.5" />
                  </span>
                ))}
                {services[0].menuItems.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No items — add from master below</span>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Add from master menu:</p>
                {(["snacks", "beverages", "breakfast", "lunch", "dinner", "desserts"] as const).map((cat) => {
                  const catItems = menuItems.filter(
                    (m) => m.category === cat && !services[0].menuItems.includes(m.name)
                  );
                  if (!catItems.length) return null;
                  return (
                    <div key={cat}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 capitalize">{cat}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {catItems.map((m) => (
                          <button key={m.id} type="button"
                            onClick={() => setServices((prev) => {
                              const u = [...prev];
                              u[0] = { ...u[0], menuItems: [...u[0].menuItems, m.name] };
                              return u;
                            })}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-muted/50 text-muted-foreground border border-border hover:border-primary/40 hover:text-primary transition-all">
                            <Plus className="h-2.5 w-2.5" /> {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packages.filter((p) => p.active).map((pkg) => (
            <button key={pkg.id} type="button" onClick={() => onSelect(pkg)}
              className="rounded-xl border border-border bg-white p-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-foreground truncate">{pkg.name}</span>
                {pkg.featured && <span className="text-amber-500 text-xs">⭐</span>}
              </div>
              <p className="text-base font-bold text-primary">
                ₹{pkg.pricePerPerson}<span className="text-xs font-normal text-muted-foreground">/person</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {pkg.timeType.replace("-", " ")} · {pkg.includedItems.length} items
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {pkg.includedItems.slice(0, 4).map((item: string) => (
                  <span key={item} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{item}</span>
                ))}
                {pkg.includedItems.length > 4 && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    +{pkg.includedItems.length - 4} more
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
