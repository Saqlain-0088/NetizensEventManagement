import { useState } from "react";
import { useBanquetMaster, type ExtraService, type ExtraType } from "@/context/BanquetMasterContext";
import { MasterTable } from "@/components/masters/MasterTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const empty = (): Omit<ExtraService, "id" | "usageCount"> => ({
  name: "", type: "food", price: 0, active: true, featured: false,
});

export default function ExtrasMaster() {
  const { extras, addExtra, updateExtra, deleteExtra, toggleExtra } = useBanquetMaster();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ExtraType | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ExtraService | null>(null);
  const [form, setForm] = useState(empty());

  const filtered = extras.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || e.type === filterType;
    return matchSearch && matchType;
  });

  const openAdd = () => { setEditing(null); setForm(empty()); setShowForm(true); };
  const openEdit = (e: ExtraService) => {
    setEditing(e);
    setForm({ name: e.name, type: e.type, price: e.price, active: e.active, featured: e.featured });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Service name is required", variant: "destructive" }); return; }
    if (editing) { updateExtra(editing.id, form); toast({ title: "Service updated" }); }
    else { addExtra(form); toast({ title: "Service added" }); }
    closeForm();
  };

  const f = (field: string, value: string | number | boolean) => setForm((p) => ({ ...p, [field]: value }));

  // Food vs Equipment totals
  const foodTotal = extras.filter((e) => e.type === "food" && e.active).reduce((s, e) => s + e.price, 0);
  const eqTotal = extras.filter((e) => e.type === "equipment" && e.active).reduce((s, e) => s + e.price, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Extras & Services Master</h1>
            <p className="text-xs text-muted-foreground">{extras.length} services configured</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gradient-primary text-white border-0 gap-2 shadow-md hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-white p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-sm">🍽️</div>
          <div>
            <p className="text-xs text-muted-foreground">Food Add-ons</p>
            <p className="text-sm font-bold text-foreground">{extras.filter((e) => e.type === "food").length} items</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm">🎛️</div>
          <div>
            <p className="text-xs text-muted-foreground">Equipment</p>
            <p className="text-sm font-bold text-foreground">{extras.filter((e) => e.type === "equipment").length} items</p>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="pl-9 bg-white border-border" />
        </div>
        <div className="flex gap-2">
          {(["all", "food", "equipment"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${filterType === t ? "gradient-primary text-white border-0" : "bg-white text-muted-foreground border-border hover:border-primary/40"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-primary/20 bg-white shadow-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editing ? "Edit Service" : "Add New Service"}</h2>
            <button onClick={closeForm} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-1.5">
              <Label className="text-xs font-medium">Service Name *</Label>
              <Input value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="e.g. Welcome Drink" className="bg-white border-border h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Type</Label>
              <select
                value={form.type}
                onChange={(e) => f("type", e.target.value as ExtraType)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="food">Food</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Price (₹)</Label>
              <Input type="number" value={form.price} onChange={(e) => f("price", Number(e.target.value))} className="bg-white border-border h-9" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => f("active", e.target.checked)} className="accent-primary" /> Active
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => f("featured", e.target.checked)} className="accent-amber-500" /> Featured ⭐
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gradient-primary text-white border-0 hover:opacity-90 h-9 text-sm">Save Service</Button>
            <Button variant="outline" onClick={closeForm} className="h-9 text-sm border-border">Cancel</Button>
          </div>
        </div>
      )}

      <MasterTable
        rows={filtered}
        columns={[
          { label: "Service Name", render: (r) => <span className="font-semibold">{r.name}</span> },
          { label: "Type", render: (r) => (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${r.type === "food" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
              {r.type === "food" ? "🍽️" : "🎛️"} {r.type}
            </span>
          )},
          { label: "Price", render: (r) => <span className="font-bold text-primary">₹{r.price.toLocaleString("en-IN")}</span> },
          { label: "Used", render: (r) => <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.usageCount}×</span> },
        ]}
        onEdit={openEdit}
        onDelete={(id) => { deleteExtra(id); toast({ title: "Service deleted" }); }}
        onToggleActive={(id) => toggleExtra(id, "active")}
        onToggleFeatured={(id) => toggleExtra(id, "featured")}
        emptyText="No services found."
      />
    </div>
  );
}
