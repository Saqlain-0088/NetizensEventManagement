import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, X, Clock, Utensils, Sparkles, Users } from "lucide-react";
import { useMasterData, type ServiceTemplate, type MenuItem as MasterMenuItem } from "@/context/MasterDataContext";

export type PersonCategory = "Regular" | "P. Jain" | "S. Jain";

export const PERSON_CATEGORIES: PersonCategory[] = ["Regular", "P. Jain", "S. Jain"];

const CATEGORY_COLORS: Record<PersonCategory, { bg: string; text: string; border: string; dot: string }> = {
  "Regular":  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500"   },
  "P. Jain":  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500"  },
  "S. Jain":  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
};

export interface PersonCategoryEntry {
  category: PersonCategory;
  count: string; // string so input stays controlled
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

const getTimeCategory = (time: string): MasterMenuItem["category"][] => {
  if (!time) return ["snacks", "beverages"];
  const h = parseInt(time.split(":")[0]);
  if (h >= 6 && h < 11) return ["breakfast", "beverages"];
  if (h >= 11 && h < 15) return ["lunch", "beverages"];
  if (h >= 15 && h < 18) return ["snacks", "beverages"];
  return ["dinner", "desserts", "beverages"];
};

const defaultCategories = (): PersonCategoryEntry[] =>
  PERSON_CATEGORIES.map((c) => ({ category: c, count: "" }));

const ServiceMenuBuilder = ({ services, onChange, startTime, pax }: ServiceMenuBuilderProps) => {
  const { serviceTemplates, menuItems: masterMenu } = useMasterData();
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const [manualInputs, setManualInputs] = useState<Record<number, string>>({});

  const sortedTemplates = [...serviceTemplates].sort((a, b) => b.usageCount - a.usageCount);

  const addService = (template?: ServiceTemplate) => {
    onChange([
      ...services,
      {
        name: template?.name || "",
        time: template?.defaultTime || "",
        menuItems: [],
        personCategories: defaultCategories(),
      },
    ]);
  };

  const updateService = (idx: number, field: keyof ServiceEntry, value: string | string[] | PersonCategoryEntry[]) => {
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

  const getSuggestedMenu = (serviceTime: string) => {
    const categories = getTimeCategory(serviceTime || startTime);
    return [...masterMenu]
      .filter((m) => categories.includes(m.category))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, pax > 100 ? 12 : 8);
  };

  // Total persons across all categories for a service
  const totalPersons = (cats: PersonCategoryEntry[]) =>
    cats.reduce((s, c) => s + (Number(c.count) || 0), 0);

  return (
    <section className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
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
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Add Service</Label>
          <div className="flex flex-wrap gap-2">
            {sortedTemplates.slice(0, 6).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => addService(t)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="h-3 w-3" />
                {t.name} @ {t.defaultTime}
              </button>
            ))}
          </div>
        </div>

        {/* Services list */}
        {services.map((service, idx) => {
          const total = totalPersons(service.personCategories);
          return (
            <div key={idx} className="rounded-xl border border-border bg-slate-50 p-4 space-y-3">
              {/* Row 1: Service name + time + remove */}
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
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
                    <Label className="text-xs text-muted-foreground">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="time"
                        value={service.time}
                        onChange={(e) => updateService(idx, "time", e.target.value)}
                        className="h-9 pl-8 bg-white border-border text-foreground text-sm"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeService(idx)}
                  className="mt-6 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Row 2: Number of Persons by category */}
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
                  <Label className="text-xs font-medium text-muted-foreground">Menu Items</Label>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(showSuggestions === idx ? null : idx)}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    {showSuggestions === idx ? "Hide suggestions" : "Smart suggest"}
                  </button>
                </div>

                {/* Selected items chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
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
                  {service.menuItems.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No items added yet</span>
                  )}
                </div>

                {/* Manual add */}
                <div className="flex gap-2">
                  <Input
                    value={manualInputs[idx] || ""}
                    onChange={(e) => setManualInputs((prev) => ({ ...prev, [idx]: e.target.value }))}
                    placeholder="Type item name (comma-separate multiple)..."
                    className="h-8 text-xs bg-white border-border flex-1"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addManualItem(idx); } }}
                  />
                  <button
                    type="button"
                    onClick={() => addManualItem(idx)}
                    disabled={!(manualInputs[idx] || "").trim()}
                    className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0 hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>

                {/* Smart suggestions */}
                {showSuggestions === idx && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Recommended based on time & popularity — click to add
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {getSuggestedMenu(service.time).map((item) => {
                        const selected = service.menuItems.includes(item.name);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleMenuItem(idx, item.name)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-all ${
                              selected
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-foreground border-border hover:border-primary/40 hover:text-primary"
                            }`}
                          >
                            {item.name}
                            <span className={`text-[10px] ${selected ? "text-white/70" : "text-muted-foreground"}`}>
                              {item.usageCount}×
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
