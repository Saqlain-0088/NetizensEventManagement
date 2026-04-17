import { useState } from "react";
import { useAuth, type Role } from "@/context/AuthContext";
import { MasterTable } from "@/components/masters/MasterTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Plus, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emptyRole = (): Omit<Role, "id"> => ({
  name: "",
  permissions: {
    canView: true,
    canAdd: false,
    canEdit: false,
    canDelete: false,
  },
});

export default function RoleMaster() {
  const { roles, addRole, updateRole, deleteRole } = useAuth();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<Omit<Role, "id">>(emptyRole());

  const filtered = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm(emptyRole()); setShowForm(true); };
  const openEdit = (r: Role) => { setEditing(r); setForm({ name: r.name, permissions: { ...r.permissions } }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Role name is required", variant: "destructive" }); return; }
    
    // Admin check - prevent modifying the core admin role lightly, or just allow it but warn.
    // We'll allow it for flexibility but maybe prevent deleting it.

    if (editing) {
      if (editing.id === "role_admin" && (!form.permissions.canView || !form.permissions.canAdd || !form.permissions.canEdit || !form.permissions.canDelete)) {
         toast({ title: "Cannot strip permissions from Administrator", variant: "destructive" });
         return;
      }
      updateRole(editing.id, form);
      toast({ title: "Role updated" });
    } else {
      addRole({ ...form, id: `role_${Math.random().toString(36).substring(2, 9)}` });
      toast({ title: "Role added" });
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    if (id === "role_admin") {
      toast({ title: "Cannot delete Administrator role", variant: "destructive" });
      return;
    }
    deleteRole(id);
    toast({ title: "Role deleted" });
  };

  const togglePermission = (perm: keyof Role["permissions"]) => {
    setForm(p => ({
      ...p,
      permissions: {
        ...p.permissions,
        [perm]: !p.permissions[perm]
      }
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldAlert className="w-4.5 h-4.5 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Role Management</h1>
            <p className="text-xs text-muted-foreground">Define roles and access permissions</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gradient-primary text-white border-0 gap-2 shadow-md hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Role
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles..." className="pl-9 bg-white border-border h-10" />
      </div>

      {/* Form Container */}
      {showForm && (
        <div className="rounded-2xl border border-primary/20 bg-white shadow-xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-primary" />
              {editing ? `Edit Role: ${editing.name}` : "Create New Role"}
            </h2>
            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X className="w-4.5 h-4.5" /></button>
          </div>

          <div className="space-y-4 max-w-xl">
             <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Role Name *</Label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} 
                  placeholder="e.g. Finance Manager" 
                  className="bg-slate-50 border-border h-10" 
                  disabled={editing?.id === 'role_admin'}
                />
              </div>

              <div className="space-y-3 pt-2">
                 <Label className="text-xs font-bold text-muted-foreground uppercase">Permissions</Label>
                 <div className="grid grid-cols-2 gap-3">
                    {/* View */}
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.permissions.canView ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : 'bg-white border-border hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={form.permissions.canView} onChange={() => togglePermission('canView')} className="accent-primary w-4 h-4" />
                        <div>
                           <p className={`text-sm font-bold ${form.permissions.canView ? 'text-primary' : 'text-foreground'}`}>View Data</p>
                           <p className="text-[10px] text-muted-foreground">Can see entries in their properties</p>
                        </div>
                    </label>
                    {/* Add */}
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.permissions.canAdd ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : 'bg-white border-border hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={form.permissions.canAdd} onChange={() => togglePermission('canAdd')} className="accent-primary w-4 h-4" />
                        <div>
                           <p className={`text-sm font-bold ${form.permissions.canAdd ? 'text-primary' : 'text-foreground'}`}>Create New</p>
                           <p className="text-[10px] text-muted-foreground">Can add new records</p>
                        </div>
                    </label>
                    {/* Edit */}
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.permissions.canEdit ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : 'bg-white border-border hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={form.permissions.canEdit} onChange={() => togglePermission('canEdit')} className="accent-primary w-4 h-4" />
                        <div>
                           <p className={`text-sm font-bold ${form.permissions.canEdit ? 'text-primary' : 'text-foreground'}`}>Edit Existing</p>
                           <p className="text-[10px] text-muted-foreground">Can modify existing records</p>
                        </div>
                    </label>
                    {/* Delete */}
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.permissions.canDelete ? 'bg-red-50 border-red-200 ring-1 ring-red-100' : 'bg-white border-border hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={form.permissions.canDelete} onChange={() => togglePermission('canDelete')} className="accent-red-500 w-4 h-4" />
                        <div>
                           <p className={`text-sm font-bold ${form.permissions.canDelete ? 'text-red-700' : 'text-foreground'}`}>Delete</p>
                           <p className="text-[10px] text-red-500/70">Can permanently remove records</p>
                        </div>
                    </label>
                 </div>
              </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={handleSave} className="gradient-primary text-white border-0 hover:opacity-90 px-8 font-bold">
              {editing ? "Update Role" : "Create Role"}
            </Button>
            <Button variant="outline" onClick={closeForm} className="border-border px-6">Cancel</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <MasterTable
          rows={filtered}
          columns={[
            { 
              label: "Role Name", 
              render: (r) => (
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${r.id === 'role_admin' ? 'text-emerald-600' : 'text-foreground'}`}>{r.name}</span>
                  {r.id === 'role_admin' && <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              ) 
            },
            { 
              label: "Permissions", 
              render: (r) => (
                <div className="flex flex-wrap gap-1.5">
                   {r.permissions.canView && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold tracking-wide">View</span>}
                   {r.permissions.canAdd && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-bold tracking-wide">Add</span>}
                   {r.permissions.canEdit && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase font-bold tracking-wide">Edit</span>}
                   {r.permissions.canDelete && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase font-bold tracking-wide">Delete</span>}
                </div>
              ) 
            }
          ]}
          onEdit={(r) => openEdit(r as Role)}
          onDelete={(r) => handleDelete((r as Role).id)}
          emptyText="No roles found."
        />
      </div>
    </div>
  );
}
