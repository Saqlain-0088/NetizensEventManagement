import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Clock, Check, Plus, X, Package } from "lucide-react";
import type { ServiceEntry } from "./ServiceMenuBuilder";

// ── helpers ──────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");

/** Generate HH:MM slots every `step` minutes from `fromH:fromM` to `toH:toM` (exclusive) */
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

const ALL_SLOTS = makeSlots(6, 0, 23, 30); // 06:00 → 23:00

function fmt12(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${pad(m)} ${ampm}`;
}

// ── CalendarPicker ────────────────────────────────────────────────────────────
export const CalendarPicker = ({ value, onChange, error }: {
  value: string; onChange: (v: string) => void; error?: string;
}) => {
  const [cal, setCal] = useState(() => {
    const d = value ? new Date(value + "T00:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const firstDay = new Date(cal.year, cal.month, 1).getDay();
  const daysInMonth = new Date(cal.year, cal.month + 1, 0).getDate();

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${cal.year}-${pad(cal.month + 1)}-${pad(d)}`;
    const dt = new Date(cal.year, cal.month, d);
    const past = dt < today;
    const sel = value === ds;
    const tod = dt.getTime() === today.getTime();
    cells.push(
      <button key={d} type="button" disabled={past} onClick={() => onChange(ds)}
        className={`aspect-square rounded-lg text-xs font-medium transition-all ${
          sel ? "gradient-primary text-white shadow-sm"
          : tod ? "border-2 border-primary text-primary font-bold"
          : past ? "text-muted-foreground/40 cursor-not-allowed"
          : "hover:bg-primary/10 text-foreground"
        }`}>{d}</button>
    );
  }

  const prevMonth = () => setCal((m) => {
    const d = new Date(m.year, m.month - 1); return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setCal((m) => {
    const d = new Date(m.year, m.month + 1); return { year: d.getFullYear(), month: d.getMonth() };
  });

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        Event Date <span className="text-red-500">*</span>
      </Label>
      <div className="rounded-xl border border-border bg-white p-3 select-none">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {new Date(cal.year, cal.month).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </span>
          <button type="button" onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-0.5">{cells}</div>
        {value && (
          <p className="text-xs text-primary font-medium mt-2 text-center">
            {new Date(value + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ── TimeSlotPicker ─────────────────────────────────────────────────────────────
export const TimeSlotPicker = ({
  label, value, onChange, disableBefore, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  disableBefore?: string | null; error?: string;
}) => {
  // Section labels
  const sections = [
    { label: "Morning", slots: ALL_SLOTS.filter((t) => t >= "06:00" && t < "12:00") },
    { label: "Afternoon", slots: ALL_SLOTS.filter((t) => t >= "12:00" && t < "17:00") },
    { label: "Evening", slots: ALL_SLOTS.filter((t) => t >= "17:00" && t < "20:00") },
    { label: "Night", slots: ALL_SLOTS.filter((t) => t >= "20:00") },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <Label className="text-sm font-medium text-foreground">
          {label} <span className="text-red-500">*</span>
        </Label>
        {value && (
          <span className="ml-auto text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {fmt12(value)}
          </span>
        )}
      </div>
      <div className="rounded-xl border border-border bg-white p-3 space-y-3 max-h-52 overflow-y-auto">
        {sections.map(({ label: sec, slots }) => (
          <div key={sec}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{sec}</p>
            <div className="grid grid-cols-4 gap-1">
              {slots.map((t) => {
                const disabled = !!disableBefore && t <= disableBefore;
                const selected = value === t;
                return (
                  <button key={t} type="button" disabled={disabled} onClick={() => onChange(t)}
                    className={`py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                      selected
                        ? "gradient-primary text-white border-0 shadow-sm"
                        : disabled
                        ? "bg-muted text-muted-foreground/40 border-border cursor-not-allowed"
                        : "bg-white border-border text-foreground hover:border-primary/40 hover:bg-primary/5"
                    }`}>
                    {fmt12(t)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ── AllPackages ───────────────────────────────────────────────────────────────
interface AllPackagesProps {
  packages: any[];
  selectedPkgId: string | null;
  onSelect: (pkg: any) => void;
  services: ServiceEntry[];
  setServices: React.Dispatch<React.SetStateAction<ServiceEntry[]>>;
  menuItems: any[];  // full master menu items
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

      {/* If a package IS selected → show only that package card (collapsed others) */}
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
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {selectedPkg?.timeType?.replace("-", " ")}
            </p>
            <button
              type="button"
              onClick={() => onSelect({ id: null })}
              className="mt-2 text-[11px] text-muted-foreground hover:text-red-500 underline underline-offset-2 transition-colors"
            >
              Change package
            </button>
          </div>

          {/* Editable items of selected package — always visible */}
          {services.length > 0 && (
            <div className="rounded-xl border border-primary/20 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Included Items
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    — edit as needed
                  </span>
                </p>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {services[0].menuItems.length} items
                </span>
              </div>

              {/* Chips: current package items (click to remove) */}
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {services[0].menuItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-primary/10 text-primary border border-primary/25 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                    onClick={() =>
                      setServices((prev) => {
                        const u = [...prev];
                        u[0] = { ...u[0], menuItems: u[0].menuItems.filter((m) => m !== item) };
                        return u;
                      })
                    }
                  >
                    {item}
                    <X className="h-2.5 w-2.5" />
                  </span>
                ))}
                {services[0].menuItems.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No items — add from master below</span>
                )}
              </div>

              {/* Add from master menu — grouped by category */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Add from master menu:</p>
                {/* group master items by category */}
                {(["snacks", "beverages", "breakfast", "lunch", "dinner", "desserts"] as const).map((cat) => {
                  const catItems = menuItems.filter(
                    (m) => m.category === cat && !services[0].menuItems.includes(m.name)
                  );
                  if (!catItems.length) return null;
                  return (
                    <div key={cat}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 capitalize">
                        {cat}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {catItems.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              setServices((prev) => {
                                const u = [...prev];
                                u[0] = { ...u[0], menuItems: [...u[0].menuItems, m.name] };
                                return u;
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-muted/50 text-muted-foreground border border-border hover:border-primary/40 hover:text-primary transition-all"
                          >
                            <Plus className="h-2.5 w-2.5" />
                            {m.name}
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
        // No package selected → show all packages
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packages
            .filter((p) => p.active)
            .map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => onSelect(pkg)}
                className="rounded-xl border border-border bg-white p-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground truncate">{pkg.name}</span>
                  {pkg.featured && <span className="text-amber-500 text-xs">⭐</span>}
                </div>
                <p className="text-base font-bold text-primary">
                  ₹{pkg.pricePerPerson}
                  <span className="text-xs font-normal text-muted-foreground">/person</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {pkg.timeType.replace("-", " ")} · {pkg.includedItems.length} items
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {pkg.includedItems.slice(0, 4).map((item: string) => (
                    <span key={item} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                      {item}
                    </span>
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
