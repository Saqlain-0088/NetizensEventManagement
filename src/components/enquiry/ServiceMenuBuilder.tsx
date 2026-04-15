import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, X, Utensils, Users, Clock, ChevronDown, Search } from "lucide-react";
import { useMasterData, type MenuItem as MasterMenuItem } from "@/context/MasterDataContext";

// ── Types ─────────────────────────────────────────────────────────────────────
export type PersonCategory = "Regular" | "P. Jain" | "S. Jain";
export const PERSON_CATEGORIES: PersonCategory[] = ["Regular", "P. Jain", "S. Jain"];

const CATEGORY_COLORS: Record<PersonCategory, { bg: string; text: string; border: string; dot: string }> = {
  "Regular":  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500"   },
  "P. Jain":  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500"  },
  "S. Jain":  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
};

export interface PersonCategoryEntry {
  category: PersonCategory;
  count: string;
}

export interface ServiceEntry {
  name: string;
  time: string;
  menuItems: string[];
  personCategories: PersonCategoryEntry[];
}

interface ServiceMenuBuilderProps {
  services: ServiceEntry[];
  onChange: (services: ServiceEntry[]) => void;
  startTime: string;
  endTime: string;
  pax: number;
}

// ── Menu categories ───────────────────────────────────────────────────────────
const MENU_CATEGORIES: MasterMenuItem["category"][] = [
  "beverages", "snacks", "breakfast", "lunch", "dinner", "desserts",
];

const CATEGORY_BADGE: Record<MasterMenuItem["category"], string> = {
  beverages: "bg-blue-100 text-blue-700",
  snacks:    "bg-orange-100 text-orange-700",
  breakfast: "bg-yellow-100 text-yellow-700",
  lunch:     "bg-green-100 text-green-700",
  dinner:    "bg-purple-100 text-purple-700",
  desserts:  "bg-pink-100 text-pink-700",
};

// ── Time slots ────────────────────────────────────────────────────────────────
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

const ALL_TIME_SLOTS = makeSlots(6, 0, 23, 30);

function fmt12(hhmm: string) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${pad(m)} ${ampm}`;
}

const TIME_SECTIONS = [
  { label: "Morning",   slots: ALL_TIME_SLOTS.filter((t) => t >= "06:00" && t < "12:00") },
  { label: "Afternoon", slots: ALL_TIME_SLOTS.filter((t) => t >= "12:00" && t < "17:00") },
  { label: "Evening",   slots: ALL_TIME_SLOTS.filter((t) => t >= "17:00" && t < "20:00") },
  { label: "Night",     slots: ALL_TIME_SLOTS.filter((t) => t >= "20:00") },
];

// ── Compact time picker (dropdown style) ──────────────────────────────────────
const CompactTimePicker = ({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-9 flex items-center gap-2 px-3 rounded-lg border text-sm transition-all ${
          value
            ? "border-primary/40 bg-primary/5 text-primary font-medium"
            : "border-border bg-white text-muted-foreground"
        } hover:border-primary/50`}
      >
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">{value ? fmt12(value) : "Pick time..."}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {/* Dropdown panel */}
          <div className="absolute left-0 top-10 z-20 w-72 bg-white border border-border rounded-xl shadow-lg p-3 space-y-3 max-h-64 overflow-y-auto">
            {TIME_SECTIONS.map(({ label, slots }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {label}
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {slots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { onChange(t); setOpen(false); }}
                      className={`py-1 rounded-lg text-[11px] font-medium border transition-all ${
                        value === t
                          ? "gradient-primary text-white border-0 shadow-sm"
                          : "bg-white border-border text-foreground hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {fmt12(t)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Menu picker panel ─────────────────────────────────────────────────────────
const MenuItemsPicker = ({
  selectedItems, onToggle,
}: {
  selectedItems: string[];
  onToggle: (name: string) => void;
}) => {
  const { menuItems: masterMenu } = useMasterData();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<MasterMenuItem["category"] | "all">("all");

  const filtered = masterMenu.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || m.category === activeCategory;
    return matchSearch && matchCat;
  });

  // group filtered by category for display
  const grouped = MENU_CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter((m) => m.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, typeof masterMenu>);

  return (
    <div className="space-y-2.5">
      {/* Search + category filter */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="h-8 pl-8 text-xs bg-white border-border"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
              activeCategory === "all"
                ? "gradient-primary text-white border-0"
                : "bg-white text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            All
          </button>
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors capitalize ${
                activeCategory === cat
                  ? CATEGORY_BADGE[cat] + " border-transparent"
                  : "bg-white text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Item grid grouped by category */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3 italic">No items found</p>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {(Object.entries(grouped) as [MasterMenuItem["category"], typeof masterMenu][]).map(([cat, items]) => (
            <div key={cat}>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize mb-1.5 ${CATEGORY_BADGE[cat]}`}>
                {cat}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {items.sort((a, b) => b.usageCount - a.usageCount).map((item) => {
                  const selected = selectedItems.includes(item.name);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onToggle(item.name)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-all ${
                        selected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-foreground border-border hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {item.name}
                      {selected
                        ? <X className="h-2.5 w-2.5" />
                        : <Plus className="h-2.5 w-2.5 opacity-50" />
                      }
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const defaultCategories = (): PersonCategoryEntry[] =>
  PERSON_CATEGORIES.map((c) => ({ category: c, count: "" }));

const totalPersons = (cats: PersonCategoryEntry[]) =>
  cats.reduce((s, c) => s + (Number(c.count) || 0), 0);

// ── Main component ─────────────────────────────────────────────────────────────
const ServiceMenuBuilder = ({ services, onChange }: ServiceMenuBuilderProps) => {
  const { serviceTemplates } = useMasterData();
  const [manualInputs, setManualInputs] = useState<Record<number, string>>({});

  const sortedTemplates = [...serviceTemplates].sort((a, b) => b.usageCount - a.usageCount);

  const addService = (template?: typeof serviceTemplates[0]) => {
    onChange([
      ...services,
      {
        name: template?.name || "",
        time: template?.defaultTime
          ? (() => {
              // convert "07:15 AM" → "07:15" format (HH:MM 24hr) for slot matching
              const match = template.defaultTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
              if (!match) return template.defaultTime;
              let h = parseInt(match[1]);
              const mn = match[2].padStart(2, "0");
              const pm = match[3].toUpperCase() === "PM";
              if (pm && h < 12) h += 12;
              if (!pm && h === 12) h = 0;
              // round to nearest 30-min slot
              const mNum = parseInt(mn);
              const mRounded = mNum < 15 ? "00" : mNum < 45 ? "30" : "00";
              const hFinal = mNum >= 45 ? h + 1 : h;
              return `${pad(hFinal % 24)}:${mRounded}`;
            })()
          : "",
        menuItems: [],
        personCategories: defaultCategories(),
      },
    ]);
  };

  const updateService = (
    idx: number,
    field: keyof ServiceEntry,
    value: string | string[] | PersonCategoryEntry[]
  ) => {
    const updated = [...services];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const updateCategoryCount = (serviceIdx: number, category: PersonCategory, count: string) => {
    const updated = services[serviceIdx].personCategories.map((pc) =>
      pc.category === category ? { ...pc, count } : pc
    );
    updateService(serviceIdx, "personCategories", updated);
  };

  const removeService = (idx: number) => {
    onChange(services.filter((_, i) => i !== idx));
    setManualInputs((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const toggleMenuItem = (serviceIdx: number, item: string) => {
    const current = services[serviceIdx].menuItems;
    const updated = current.includes(item)
      ? current.filter((m) => m !== item)
      : [...current, item];
    updateService(serviceIdx, "menuItems", updated);
  };

  const addManualItem = (serviceIdx: number) => {
    const raw = (manualInputs[serviceIdx] || "").trim();
    if (!raw) return;
    const entries = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const current = services[serviceIdx].menuItems;
    const toAdd = entries.filter((e) => !current.includes(e));
    if (toAdd.length) updateService(serviceIdx, "menuItems", [...current, ...toAdd]);
    setManualInputs((prev) => ({ ...prev, [serviceIdx]: "" }));
  };

  return (
    <section className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border bg-muted/40 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100">
          <Utensils className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Services & Menu</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {services.length} service{services.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Quick-add templates */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Quick Add Service
          </Label>
          <div className="flex flex-wrap gap-2">
            {sortedTemplates.slice(0, 8).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => addService(t)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="h-3 w-3" />
                {t.name}
                <span className="text-emerald-500 text-[10px]">@ {t.defaultTime}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services list */}
        {services.map((service, idx) => {
          const total = totalPersons(service.personCategories);
          return (
            <div key={idx} className="rounded-xl border border-border bg-slate-50 overflow-hidden">
              {/* Service header bar */}
              <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
                <Utensils className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-foreground flex-1 truncate">
                  {service.name || `Service ${idx + 1}`}
                </span>
                {service.time && (
                  <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                    {fmt12(service.time)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeService(idx)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Row 1: Name + Time picker */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Service Name</Label>
                    <Input
                      value={service.name}
                      onChange={(e) => updateService(idx, "name", e.target.value)}
                      placeholder="e.g. High Tea"
                      className="h-9 bg-white border-border text-foreground text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Time Slot
                    </Label>
                    <CompactTimePicker
                      value={service.time}
                      onChange={(v) => updateService(idx, "time", v)}
                    />
                  </div>
                </div>

                {/* Row 2: Person categories */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-xs font-medium text-muted-foreground">Number of Persons</Label>
                    {total > 0 && (
                      <span className="ml-auto text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Total: {total}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {service.personCategories.map((pc) => {
                      const col = CATEGORY_COLORS[pc.category];
                      return (
                        <div key={pc.category} className={`rounded-lg border ${col.border} ${col.bg} p-2.5 space-y-1.5`}>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${col.dot} shrink-0`} />
                            <span className={`text-xs font-semibold ${col.text}`}>{pc.category}</span>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            value={pc.count}
                            onChange={(e) => updateCategoryCount(idx, pc.category, e.target.value)}
                            placeholder="0"
                            className={`h-8 text-sm font-medium bg-white border-0 shadow-sm text-center ${col.text}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Row 3: Menu items */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Menu Items
                      <span className="ml-1.5 text-primary font-semibold">{service.menuItems.length}</span>
                    </Label>
                  </div>

                  {/* Selected items chips */}
                  {service.menuItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-primary/5 border border-primary/15 rounded-lg min-h-[36px]">
                      {service.menuItems.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-primary/10 text-primary border border-primary/25 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                          onClick={() => toggleMenuItem(idx, item)}
                        >
                          {item}
                          <X className="h-2.5 w-2.5" />
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Manual item add */}
                  <div className="flex gap-2">
                    <Input
                      value={manualInputs[idx] || ""}
                      onChange={(e) => setManualInputs((prev) => ({ ...prev, [idx]: e.target.value }))}
                      placeholder="Type custom item (comma-separate multiple)..."
                      className="h-8 text-xs bg-white border-border flex-1"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addManualItem(idx); } }}
                    />
                    <button
                      type="button"
                      onClick={() => addManualItem(idx)}
                      disabled={!(manualInputs[idx] || "").trim()}
                      className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0 hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  </div>

                  {/* Master menu picker */}
                  <div className="rounded-xl border border-border bg-white p-3">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-2.5 flex items-center gap-1.5">
                      <Utensils className="h-3 w-3" />
                      Pick from Master Menu — click to add/remove
                    </p>
                    <MenuItemsPicker
                      selectedItems={service.menuItems}
                      onToggle={(name) => toggleMenuItem(idx, name)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add service button */}
        <button
          type="button"
          onClick={() => addService()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Custom Service
        </button>
      </div>
    </section>
  );
};

export default ServiceMenuBuilder;
