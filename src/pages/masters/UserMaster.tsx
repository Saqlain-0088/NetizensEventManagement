import { useState } from "react";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { useBanquetMaster } from "@/context/BanquetMasterContext";
import { MasterTable } from "@/components/masters/MasterTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, X, Search, ShieldCheck, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserForm = AuthUser & { password: string };

const empty = (): UserForm => ({
  username: "",
  password: "",
  role: "staff",
  allowedVenues: [],
});

export default function UserMaster() {
  const { users, addUser, updateUser, removeUser, user: currentUser } = useAuth();
  const { halls } = useBanquetMaster();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UserForm | null>(null);
  const [form, setForm] = useState<UserForm>(empty());

  const filtered = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm(empty()); setShowForm(true); };
  const openEdit = (u: UserForm) => { setEditing(u); setForm(u); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = () => {
    if (!form.username.trim()) { toast({ title: "Username is required", variant: "destructive" }); return; }
    if (!editing && !form.password) { toast({ title: "Password is required", variant: "destructive" }); return; }
    
    // Admin role override
    const finalForm = { ...form };
    if (finalForm.role === "admin") finalForm.allowedVenues = ["all"];

    if (editing) {
      updateUser(editing.username, finalForm);
      toast({ title: "User updated" });
    } else {
      if (users.find(u => u.username === form.username)) {
        toast({ title: "Username already exists", variant: "destructive" });
        return;
      }
      addUser(finalForm);
      toast({ title: "User added" });
    }
    closeForm();
  };

  const handleDelete = (username: string) => {
    if (currentUser?.username === username) {
      toast({ title: "You cannot delete yourself", variant: "destructive" });
      return;
    }
    removeUser(username);
    toast({ title: "User deleted" });
  };

  const toggleVenue = (venue: string) => {
    setForm(p => ({
      ...p,
      allowedVenues: p.allowedVenues.includes(venue)
        ? p.allowedVenues.filter(v => v !== venue)
        : [...p.allowedVenues, venue]
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">User Management</h1>
            <p className="text-xs text-muted-foreground">{users.length} users configured</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gradient-primary text-white border-0 gap-2 shadow-md hover:opacity-90">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 bg-white border-border h-10" />
      </div>

      {/* Form Overlay-ish Container */}
      {showForm && (
        <div className="rounded-2xl border border-primary/20 bg-white shadow-xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-primary" />
              {editing ? `Edit User: ${editing.username}` : "Create New User Access"}
            </h2>
            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X className="w-4.5 h-4.5" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Username *</Label>
                <Input 
                  value={form.username} 
                  onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))} 
                  disabled={!!editing}
                  placeholder="e.g. manager_palace" 
                  className="bg-slate-50 border-border h-10" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">{editing ? "New Password (leave blank to keep)" : "Password *"}</Label>
                <Input 
                  type="password"
                  value={form.password} 
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} 
                  placeholder="••••••••" 
                  className="bg-slate-50 border-border h-10" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">System Role</Label>
                <Select value={form.role} onValueChange={(v: any) => setForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="bg-slate-50 border-border h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border">
                    <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                    <SelectItem value="staff">Staff Manager (Restricted)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.role === "staff" && (
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                   <MapPin className="w-3.5 h-3.5" /> Allowed Venues
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin">
                  {halls.map(h => {
                    const selected = form.allowedVenues.includes(h.name);
                    return (
                      <div 
                        key={h.id} 
                        onClick={() => toggleVenue(h.name)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                          selected ? "bg-primary/5 border-primary/50 ring-1 ring-primary/20" : "bg-white border-border hover:bg-slate-50"
                        }`}
                      >
                        <span className={`text-sm font-medium ${selected ? "text-primary" : "text-foreground"}`}>{h.name}</span>
                        <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center ${selected ? "bg-primary border-primary" : "bg-white border-muted-foreground/30"}`}>
                           {selected && <X className="w-3 h-3 text-white rotate-45" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {form.allowedVenues.length === 0 && (
                   <p className="text-[10px] text-amber-600 font-medium">⚠️ No venues selected. This user won't see any events.</p>
                )}
              </div>
            )}

            {form.role === "admin" && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-2">
                 <ShieldCheck className="w-10 h-10 text-emerald-600" />
                 <p className="text-sm font-bold text-emerald-800">Administrator Mode</p>
                 <p className="text-xs text-emerald-700">Administrators have full visibility across all venues and can manage all system settings.</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={handleSave} className="gradient-primary text-white border-0 hover:opacity-90 px-8 font-bold">
              {editing ? "Update User" : "Create User"}
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
              label: "User info", 
              render: (r) => (
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">{r.username}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${r.role === 'admin' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {r.role}
                  </span>
                </div>
              ) 
            },
            { 
              label: "Venue Access", 
              render: (r) => (
                <div className="flex flex-wrap gap-1">
                  {r.allowedVenues.includes("all") ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">All Venues</span>
                  ) : r.allowedVenues.length > 0 ? (
                    r.allowedVenues.map(v => (
                      <span key={v} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{v}</span>
                    ))
                  ) : (
                    <span className="text-[10px] italic text-muted-foreground">None</span>
                  )}
                </div>
              ) 
            },
            {
              label: "Password",
              render: () => <span className="text-muted-foreground opacity-30 text-xs">••••••••</span>
            }
          ]}
          onEdit={(r) => openEdit(r as UserForm)}
          onDelete={(r) => handleDelete((r as UserForm).username)}
          emptyText="No users found."
        />
      </div>
    </div>
  );
}
