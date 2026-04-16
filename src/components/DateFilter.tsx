import { useState, useMemo } from "react";
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type DateRange = { from?: Date; to?: Date };

export type Preset =
  | "all"
  | "today"
  | "yesterday"
  | "1_week_ago"
  | "1_month"
  | "3_months"
  | "6_months"
  | "1_year"
  | "custom";

interface DateFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export const DateFilter = ({ value, onChange, className = "" }: DateFilterProps) => {
  const [preset, setPreset] = useState<Preset>("all");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const applyPreset = (p: Preset) => {
    setPreset(p);
    setPopoverOpen(false);
    const today = new Date();
    
    switch (p) {
      case "all":
        onChange({ from: undefined, to: undefined });
        break;
      case "today":
        onChange({ from: startOfDay(today), to: endOfDay(today) });
        break;
      case "yesterday":
        const y = subDays(today, 1);
        onChange({ from: startOfDay(y), to: endOfDay(y) });
        break;
      case "1_week_ago":
        onChange({ from: startOfDay(subDays(today, 7)), to: endOfDay(today) });
        break;
      case "1_month":
        onChange({ from: startOfDay(subMonths(today, 1)), to: endOfDay(today) });
        break;
      case "3_months":
        onChange({ from: startOfDay(subMonths(today, 3)), to: endOfDay(today) });
        break;
      case "6_months":
        onChange({ from: startOfDay(subMonths(today, 6)), to: endOfDay(today) });
        break;
      case "1_year":
        onChange({ from: startOfDay(subYears(today, 1)), to: endOfDay(today) });
        break;
      case "custom":
        setPopoverOpen(true);
        break;
    }
  };

  const getLabel = () => {
    if (preset === "all") return "All Time";
    if (preset === "today") return "Today";
    if (preset === "yesterday") return "Yesterday";
    if (preset === "1_week_ago") return "Last 7 Days";
    if (preset === "1_month") return "Last 1 Month";
    if (preset === "3_months") return "Last 3 Months";
    if (preset === "6_months") return "Last 6 Months";
    if (preset === "1_year") return "Last 1 Year";
    if (preset === "custom" && value.from && value.to) {
      return `${format(value.from, "PP")} - ${format(value.to, "PP")}`;
    }
    return "Custom Date";
  };

  const presetsList: { label: string; value: Preset }[] = [
    { label: "All Time", value: "all" },
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "1_week_ago" },
    { label: "Last 1 Month", value: "1_month" },
    { label: "Last 3 Months", value: "3_months" },
    { label: "Last 6 Months", value: "6_months" },
    { label: "Last 1 Year", value: "1_year" },
    { label: "Custom Range...", value: "custom" },
  ];

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`bg-white border-border text-foreground text-sm flex items-center justify-between gap-3 px-3.5 shadow-sm hover:bg-slate-50 transition-all ${className}`}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{getLabel()}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2 bg-white border border-border rounded-xl shadow-lg" align="end">
        {preset !== "custom" || (!value.from && !value.to) ? (
          <div className="flex flex-col gap-1">
            {presetsList.map((p) => (
              <button
                key={p.value}
                onClick={() => applyPreset(p.value)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  preset === p.value
                    ? "bg-primary text-white font-semibold shadow-sm"
                    : "text-foreground hover:bg-slate-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">From</label>
              <input
                type="date"
                value={value.from ? format(value.from, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const d = e.target.value ? startOfDay(new Date(e.target.value)) : undefined;
                  onChange({ ...value, from: d });
                }}
                className="w-full h-9 px-3 rounded-md border border-border text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">To</label>
              <input
                type="date"
                min={value.from ? format(value.from, "yyyy-MM-dd") : undefined}
                value={value.to ? format(value.to, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const d = e.target.value ? endOfDay(new Date(e.target.value)) : undefined;
                  onChange({ ...value, to: d });
                }}
                className="w-full h-9 px-3 rounded-md border border-border text-sm"
              />
            </div>
            <div className="pt-2 border-t border-border flex justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => applyPreset("all")} className="text-xs text-muted-foreground">
                Reset
              </Button>
              <Button size="sm" onClick={() => setPopoverOpen(false)} className="text-xs gradient-primary text-white">
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
