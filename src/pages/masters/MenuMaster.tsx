import { useState } from "react";
import { useMasterData, type MenuItem } from "@/context/MasterDataContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Utensils, Plus, X, Search, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES: MenuItem["category"][] = ["beverages", "snacks", "breakfast", "lunch", "dinner", "desserts"];

const CATEGORY_COLORS: Record<MenuItem["category"], string> = {
  beverages: "bg-blue-100 text-blue-700",
  snacks: "bg-orange-100 text-orange-700",
  breakfast: "bg-yellow-100 text-yellow-700",
  lunch: "bg-green-100 text-green-700",
  dinner: "bg-indigo-100 text-indigo-700",
  desserts: "bg-pink-100 text-pink-700",
};

export default function MenuMaster() {
  const { menuItems, addMenuItem, removeMenuItem } = useMasterData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<MenuItem["category"] | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "snacks" as MenuItem["category"] });

  const filtered = menuItems.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || m.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleAdd = () => {
    if (!form.name.trim()) { toast({ title: "Item name is required", variant: "destructive" }); return; }
    addMenuItem(form.name.trim(), form.category);
    toast({ title: "Menu item added" });
    setForm({ name: "", category: form.category });
  };

  const handleDelete = (id: string) => {
    removeMenuItem(id);
    toast({ title: "Item removed" });
  };

  // Group by category for display
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter((m) => m.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Utensils className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Menu Master</h1>
            <p className="text-xs text-muted-foreground">{menuItems.length} items across {CATEGORIES.length} categories</p>
          </div>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gradient-primary text-white border-0 gap-2 shadow-md hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu items..." className="pl-9 bg-white border-border" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterCat === "all" ? "gradient-primary text-white border-0" : "bg-white text-muted-foreground border-border hover:border-primary/40"}`}
          >All</button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${filterCat === cat ? CATEGORY_COLORS[cat] + " border-transparent" : "bg-white text-muted-foreground border-border hover:border-primary/40"}`}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border border-primary/20 bg-white shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Add Menu Item</h2>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[180px] space-y-1.5">
              <Label className="text-xs font-medium">Item Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Paneer Tikka"
                className="bg-white border-border h-9"
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category</Label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as MenuItem["category"] }))}
                className="h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} className="gradient-primary text-white border-0 h-9 text-sm hover:opacity-90">Add Item</Button>
            </div>
          </div>
        </div>
      )}

      {/* Grouped display */}
      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No items found.</div>
      ) : (
        <div className="space-y-4">
          {(Object.entries(grouped) as [MenuItem["category"], MenuItem[]][]).map(([cat, items]) => (
            <div key={cat} className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${CATEGORY_COLORS[cat]}`}>{cat}</span>
                <span className="text-xs text-muted-foreground">{items.length} items</span>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {items.sort((a, b) => b.usageCount - a.usageCount).map((item) => (
                  <div key={item.id} className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-sm hover:border-primary/30 transition-colors">
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground">{item.usageCount}×</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
