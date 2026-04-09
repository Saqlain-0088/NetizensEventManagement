import { useState } from "react";
import { useBanquetMaster, type Hall } from "@/context/BanquetMasterContext";
import { MasterTable } from "@/components/masters/MasterTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Plus, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const empty = (): Omit<Hall, "id" | "usageCount"> => ({
  name: "", capacityMin: 0, capacityMax: 0, size: "", baseRent: 0, active: true, featured: false,
});

export default function HallMaster() {
  const { halls, addHall, updateHall, deleteHall, toggleHall } = useBanquetMaster();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Hall | null>(null);
  const [form, setForm] = useState(empty());

  const filtered = halls.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm(empty()); setShowForm(true); };
  const openEdit = (h: Hall) => { setEditing(h); setForm({ name: h.name, capacityMin: h.capacityMin, capacityMax: h.capacityMax, size: h.size, baseRent: h.baseRent, active: h.active, featured: h.featured }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Hall name is required", variant: "destructive" }); return; }
    if (editing) {
      updateHall(editing.id, form);
      toast({ title: "Hall updated" });
    } else {
      addHall(form);
      toast({ title: "Hall added" });
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    deleteHall(id);
    toast({ title: "Hall deleted" });
  };

  const f = (field: string, value: string | number | boolean) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Hall / Venue Master</h1>
            <p className="text-xs text-muted-foreground">{halls.length} venues configured</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gradient-primary text-white border-0 gap-2 shadow-md hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Hall
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search halls..." className="pl-9 bg-white border-border" />
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-primary/20 bg-white shadow-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editing ? "Edit Hall" : "Add New Hall"}</h2>
            <button onClick={closeForm} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Hall Name *</Label>
              <Input value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="e.g. THE PALACE" className="bg-white border-border h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Size</Label>
              <Input value={form.size} onChange={(e) => f("size", e.target.value)} placeholder="e.g. 41x50 ft" className="bg-white border-border h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Min Capacity</Label>
              <Input type="number" value={form.capacityMin} onChange={(e) => f("capacityMin", Number(e.target.value))} className="bg-white border-border h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Max Capacity</Label>
              <Input type="number" value={form.capacityMax} onChange={(e) => f("capacityMax", Number(e.target.value))} className="bg-white border-border h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Base Rent (₹)</Label>
              <Input type="number" value={form.baseRent} onChange={(e) => f("baseRent", Number(e.target.value))} className="bg-white border-border h-9" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => f("active", e.target.checked)} className="accent-primary" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => f("featured", e.target.checked)} className="accent-amber-500" />
              Featured ⭐
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gradient-primary text-white border-0 hover:opacity-90 h-9 text-sm">Save Hall</Button>
            <Button variant="outline" onClick={closeForm} className="h-9 text-sm border-border">Cancel</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <MasterTable
        rows={filtered}
        columns={[
          { label: "Hall Name", render: (r) => <span className="font-semibold">{r.name}</span> },
          { label: "Capacity", render: (r) => <span className="text-muted-foreground">{r.capacityMin}–{r.capacityMax} pax</span> },
          { label: "Size", render: (r) => <span className="text-muted-foreground">{r.size || "—"}</span> },
          { label: "Base Rent", render: (r) => <span>{r.baseRent > 0 ? `₹${r.baseRent.toLocaleString("en-IN")}` : "Included"}</span> },
          { label: "Used", render: (r) => <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.usageCount}×</span> },
        ]}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleActive={(id) => toggleHall(id, "active")}
        onToggleFeatured={(id) => toggleHall(id, "featured")}
        emptyText="No halls found."
      />
    </div>
  );
}
