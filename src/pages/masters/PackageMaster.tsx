import { useState } from "react";
import { useBanquetMaster, type Package, type PackageTimeType } from "@/context/BanquetMasterContext";
import { MasterTable } from "@/components/masters/MasterTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package as PkgIcon, Plus, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TIME_TYPES: { value: PackageTimeType; label: string }[] = [
  { value: "high-tea", label: "High Tea" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "conference", label: "Conference" },
  { value: "custom", label: "Custom" },
];

const empty = (): Omit<Package, "id" | "usageCount"> => ({
  name: "", pricePerPerson: 0, timeType: "lunch", includedItems: [], active: true, featured: false,
});

export default function PackageMaster() {
  const { packages, addPackage, updatePackage, deletePackage, togglePackage } = useBanquetMaster();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState(empty());
  const [itemInput, setItemInput] = useState("");

  const filtered = packages.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm(empty()); setItemInput(""); setShowForm(true); };
  const openEdit = (p: Package) => {
    setEditing(p);
    setForm({ name: p.name, pricePerPerson: p.pricePerPerson, timeType: p.timeType, includedItems: [...p.includedItems], active: p.active, featured: p.featured });
    setItemInput("");
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const addItem = () => {
    const entries = itemInput.split(",").map((s) => s.trim()).filter(Boolean);
    const toAdd = entries.filter((e) => !form.includedItems.includes(e));
    if (toAdd.length) setForm((p) => ({ ...p, includedItems: [...p.includedItems, ...toAdd] }));
    setItemInput("");
  };

  const removeItem = (item: string) =>
    setForm((p) => ({ ...p, includedItems: p.includedItems.filter((i) => i !== item) }));

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Package name is required", variant: "destructive" }); return; }
    if (editing) { updatePackage(editing.id, form); toast({ title: "Package updated" }); }
    else { addPackage(form); toast({ title: "Package added" }); }
    closeForm();
  };

  const f = (field: string, value: string | number | boolean | string[]) =>
    setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <PkgIcon className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Package Master</h1>
            <p className="text-xs text-muted-foreground">{packages.length} packages configured</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gradient-primary text-white border-0 gap-2 shadow-md hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Package
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search packages..." className="pl-9 bg-white border-border" />
      </div>

      {showForm && (
        <div className="rounded-2xl border border-primary/20 bg-white shadow-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editing ? "Edit Package" : "Add New Package"}</h2>
            <button onClick={closeForm} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Package Name *</Label>
              <Input value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="e.g. Package 1 – High Tea" className="bg-white border-border h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Price / Person (₹)</Label>
              <Input type="number" value={form.pricePerPerson} onChange={(e) => f("pricePerPerson", Number(e.target.value))} className="bg-white border-border h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Time Type</Label>
              <select
                value={form.timeType}
                onChange={(e) => f("timeType", e.target.value as PackageTimeType)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {TIME_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Included items */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Included Menu Items</Label>
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {form.includedItems.map((item) => (
                <span key={item} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all" onClick={() => removeItem(item)}>
                  {item} <X className="h-2.5 w-2.5" />
                </span>
              ))}
              {form.includedItems.length === 0 && <span className="text-xs text-muted-foreground italic">No items added</span>}
            </div>
            <div className="flex gap-2">
              <Input
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                placeholder="Add items (comma-separated)..."
                className="h-8 text-xs bg-white border-border flex-1"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
              />
              <Button type="button" onClick={addItem} disabled={!itemInput.trim()} className="h-8 px-3 gradient-primary text-white border-0 text-xs">
                <Plus className="h-3 w-3" />
              </Button>
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
            <Button onClick={handleSave} className="gradient-primary text-white border-0 hover:opacity-90 h-9 text-sm">Save Package</Button>
            <Button variant="outline" onClick={closeForm} className="h-9 text-sm border-border">Cancel</Button>
          </div>
        </div>
      )}

      <MasterTable
        rows={filtered}
        columns={[
          { label: "Package Name", render: (r) => (
            <div>
              <span className="font-semibold">{r.name}</span>
              {r.name.toLowerCase().includes("boardroom") || r.name.toLowerCase().includes("saloon") ? (
                <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Min 10 pax</span>
              ) : null}
            </div>
          )},
          { label: "Price/Person", render: (r) => <span className="font-bold text-primary">₹{r.pricePerPerson} <span className="text-xs font-normal text-muted-foreground">ex GST</span></span> },
          { label: "Type", render: (r) => <span className="capitalize px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{r.timeType.replace("-", " ")}</span> },
          { label: "Included Items", render: (r) => (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {r.includedItems.slice(0, 4).map((item) => (
                <span key={item} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item}</span>
              ))}
              {r.includedItems.length > 4 && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">+{r.includedItems.length - 4} more</span>
              )}
            </div>
          )},
          { label: "Used", render: (r) => <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.usageCount}×</span> },
        ]}
        onEdit={openEdit}
        onDelete={(id) => { deletePackage(id); toast({ title: "Package deleted" }); }}
        onToggleActive={(id) => togglePackage(id, "active")}
        onToggleFeatured={(id) => togglePackage(id, "featured")}
        emptyText="No packages found."
      />
    </div>
  );
}
