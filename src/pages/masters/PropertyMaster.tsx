import { useState } from "react";
import { useBanquetMaster, type Property } from "@/context/BanquetMasterContext";
import { MasterTable } from "@/components/masters/MasterTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, Search, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const empty = (): Omit<Property, "id" | "usageCount"> => ({
  name: "", location: "", active: true,
});

export default function PropertyMaster() {
  const { properties, addProperty, updateProperty, deleteProperty, toggleProperty } = useBanquetMaster();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(empty());

  const filtered = properties.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm(empty()); setShowForm(true); };
  const openEdit = (p: Property) => { setEditing(p); setForm({ name: p.name, location: p.location, active: p.active }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Property name is required", variant: "destructive" }); return; }
    if (editing) {
      updateProperty(editing.id, form);
      toast({ title: "Property updated" });
    } else {
      addProperty(form);
      toast({ title: "Property added" });
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    deleteProperty(id);
    toast({ title: "Property deleted" });
  };

  const f = (field: string, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
            <MapPin className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Property / Location Master</h1>
            <p className="text-xs text-muted-foreground">{properties.length} properties configured</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gradient-primary text-white border-0 gap-2 shadow-md hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Property
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search properties..." className="pl-9 bg-white border-border" />
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-primary/20 bg-white shadow-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editing ? "Edit Property" : "Add New Property"}</h2>
            <button onClick={closeForm} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Property Name *</Label>
              <Input value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="e.g. Adajan" className="bg-white border-border h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Location Details</Label>
              <Input value={form.location} onChange={(e) => f("location", e.target.value)} placeholder="e.g. Surat, Gujarat" className="bg-white border-border h-9" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => f("active", e.target.checked)} className="accent-primary" />
              Active
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gradient-primary text-white border-0 hover:opacity-90 h-9 text-sm">Save Property</Button>
            <Button variant="outline" onClick={closeForm} className="h-9 text-sm border-border">Cancel</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <MasterTable
        rows={filtered}
        columns={[
          { label: "Property Name", render: (r) => <span className="font-semibold">{r.name}</span> },
          { label: "Location", render: (r) => <span className="text-muted-foreground">{r.location || "—"}</span> },
          { label: "Used", render: (r) => <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.usageCount}×</span> },
        ]}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleActive={(id) => toggleProperty(id, "active")}
        emptyText="No properties found."
      />
    </div>
  );
}
