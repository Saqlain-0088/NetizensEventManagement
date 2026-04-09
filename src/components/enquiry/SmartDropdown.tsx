import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, X, Star, ChevronDown } from "lucide-react";

interface SmartDropdownProps {
  label: string;
  items: { id: string; name: string; usageCount: number }[];
  value: string;
  onChange: (value: string) => void;
  onAdd?: (name: string) => void;
  onRemove?: (id: string) => void;
  placeholder?: string;
  required?: boolean;
}

const SmartDropdown = ({
  label,
  items,
  value,
  onChange,
  onAdd,
  onRemove,
  placeholder,
  required,
}: SmartDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState("");
  // Position of the dropdown panel in viewport coords
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);

  // Recalculate portal position whenever the dropdown opens or window scrolls/resizes
  const updatePosition = () => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < 260 && spaceAbove > spaceBelow;

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  };

  useEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check both the container and the portal panel
      const panel = document.getElementById("smart-dropdown-portal-panel");
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !(panel && panel.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sorted = [...items].sort((a, b) => b.usageCount - a.usageCount);

  const getPopularityTier = (usageCount: number, index: number) => {
    if (index === 0 && usageCount > 0) return "top";
    if (index < 3 && usageCount > 0) return "popular";
    return "none";
  };

  const filtered = sorted.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const topPicks = sorted.slice(0, 3);

  const selectItem = (name: string) => {
    onChange(name);
    setSearch("");
    setIsOpen(false);
  };

  const handleAddNew = () => {
    const trimmed = newItem.trim();
    if (!trimmed || !onAdd) return;
    onAdd(trimmed);
    setNewItem("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearch(v);
    if (value && v !== value) onChange("");
    setIsOpen(true);
  };

  // The dropdown panel rendered via portal
  const dropdownPanel = isOpen
    ? createPortal(
        <div
          id="smart-dropdown-portal-panel"
          style={dropdownStyle}
          className="bg-white border border-border rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Scrollable list */}
          <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                No matches — add it below
              </div>
            ) : (
              filtered.map((item, index) => {
                const tier = getPopularityTier(item.usageCount, index);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-muted cursor-pointer text-sm transition-colors group"
                    onMouseDown={(e) => { e.preventDefault(); selectItem(item.name); }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-foreground truncate">{item.name}</span>
                      {tier === "top" && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          Top pick
                        </span>
                      )}
                      {tier === "popular" && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                          Popular
                        </span>
                      )}
                    </div>
                    {onRemove && (
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(item.id); }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-0.5 shrink-0 ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Add new footer */}
          {onAdd && (
            <div className="border-t border-border p-2.5 bg-muted/30 flex gap-2 items-center">
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={`Add new ${label.toLowerCase()}…`}
                className="flex-1 h-8 px-3 text-xs rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleAddNew(); }
                  if (e.key === "Escape") setIsOpen(false);
                }}
              />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleAddNew(); }}
                disabled={!newItem.trim()}
                className="h-8 px-3 rounded-lg text-xs font-semibold text-white flex items-center gap-1 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed gradient-primary"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <Label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Trigger input — measure this for portal positioning */}
      <div className="relative" ref={inputWrapRef}>
        <Input
          value={value || search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="bg-white border-border h-10 text-foreground placeholder:text-muted-foreground pr-16"
        />
        {/* Clear */}
        {(value || search) && (
          <button
            type="button"
            className="absolute right-8 top-0 h-10 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            onMouseDown={(e) => { e.preventDefault(); onChange(""); setSearch(""); }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {/* Chevron toggle */}
        <button
          type="button"
          className="absolute right-0 top-0 h-10 w-9 flex items-center justify-center text-muted-foreground"
          onMouseDown={(e) => { e.preventDefault(); setIsOpen((o) => !o); }}
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Quick-pick chips — shown when no value and dropdown is closed */}
      {!value && !isOpen && topPicks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {topPicks.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectItem(item.name)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-colors bg-primary/8 text-primary border-primary/20 hover:bg-primary/15"
            >
              {i === 0 && <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />}
              {item.name}
            </button>
          ))}
        </div>
      )}

      {/* Portal-rendered dropdown */}
      {dropdownPanel}
    </div>
  );
};

export default SmartDropdown;
