import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvents } from "@/context/EventContext";
import { useMasterData } from "@/context/MasterDataContext";
import { useBanquetMaster } from "@/context/BanquetMasterContext";
import { useToast } from "@/hooks/use-toast";
import type { EventStatus } from "@/data/mockEvents";
import SmartDropdown from "@/components/enquiry/SmartDropdown";
import SummaryPanel from "@/components/enquiry/SummaryPanel";
import ServiceMenuBuilder, { type ServiceEntry, PERSON_CATEGORIES } from "@/components/enquiry/ServiceMenuBuilder";
import {
  CalendarDays, User, Clock, FileText, Sparkles,
  CheckCircle2, ArrowLeft, Package, Plus, X,
} from "lucide-react";

const AddEnquiry = () => {
  const navigate = useNavigate();
  const { addEvent } = useEvents();
  const { occasions, addOccasion, removeOccasion, incrementUsage } = useMasterData();
  // HIDDEN (temporary): staff, addStaff, removeStaff
  const { packages, halls, extras, suggestPackages, suggestHall } = useBanquetMaster();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "", customerName: "", customerPhone: "", customerEmail: "",
    occasion: "", hallName: "", date: "", startTime: "", endTime: "",
    pax: "", ratePerPerson: "",
    // HIDDEN (temporary): advanceAmount, taxPercent, assignedStaff
    status: "tentative" as EventStatus, notes: "",
  });
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [suggestedPkgs, setSuggestedPkgs] = useState<typeof packages>([]);

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  // Auto-suggest packages when occasion/pax/rate changes
  useEffect(() => {
    if (form.occasion || form.pax) {
      const budget = Number(form.ratePerPerson) || 0;
      setSuggestedPkgs(suggestPackages(Number(form.pax) || 0, form.occasion, budget));
    }
  }, [form.occasion, form.pax, form.ratePerPerson]);

  // Auto-suggest hall when pax changes
  useEffect(() => {
    const pax = Number(form.pax);
    if (pax > 0 && !form.hallName) {
      const hall = suggestHall(pax);
      if (hall) update("hallName", hall.name);
    }
  }, [form.pax]);

  // Apply a package — auto-fill rate and services
  const applyPackage = (pkg: typeof packages[0]) => {
    update("ratePerPerson", String(pkg.pricePerPerson));
    const timeMap: Record<string, string> = {
      "high-tea": "16:00", lunch: "12:30", dinner: "20:00", conference: "10:00", custom: "",
    };
    setServices([{
      name: pkg.name,
      time: timeMap[pkg.timeType] || "",
      menuItems: pkg.includedItems,
      personCategories: PERSON_CATEGORIES.map((c) => ({ category: c, count: "" })),
    }]);
    toast({ title: `Package applied: ${pkg.name}`, description: `₹${pkg.pricePerPerson}/person · ${pkg.includedItems.length} items auto-filled` });
  };

  const toggleExtra = (name: string) =>
    setSelectedExtras((p) => p.includes(name) ? p.filter((x) => x !== name) : [...p, name]);

  const extrasTotal = extras
    .filter((e) => selectedExtras.includes(e.name))
    .reduce((s, e) => s + e.price, 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Event title is required";
    if (!form.customerName.trim()) e.customerName = "Customer name is required";
    if (!form.date) e.date = "Date is required";
    if (!form.startTime) e.startTime = "Start time is required";
    if (!form.endTime) e.endTime = "End time is required";
    if (form.startTime && form.endTime && form.startTime >= form.endTime) e.endTime = "End time must be after start time";
    if (!form.pax) e.pax = "Guest count is required";
    if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) e.customerEmail = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast({ title: "Please fix the errors", variant: "destructive" }); return; }

    const selectedOccasion = occasions.find((o) => o.name === form.occasion);
    if (selectedOccasion) incrementUsage("occasion", selectedOccasion.id);
    // HIDDEN (temporary): staff usage increment

    const eventServices = services.filter((s) => s.name.trim()).map((s) => ({ name: s.name, time: s.time }));
    const menuItems: Record<string, string[]> = {};
    services.forEach((s) => { if (s.name && s.menuItems.length > 0) menuItems[s.name] = s.menuItems; });

    addEvent({
      id: crypto.randomUUID(),
      title: form.title, customerName: form.customerName, customerPhone: form.customerPhone,
      customerEmail: form.customerEmail || undefined, occasion: form.occasion, hallName: form.hallName,
      date: form.date, startTime: form.startTime, endTime: form.endTime,
      pax: Number(form.pax), ratePerPerson: Number(form.ratePerPerson),
      // HIDDEN (temporary): advanceAmount, taxPercent
      advanceAmount: undefined,
      taxPercent: undefined,
      services: eventServices, menuItems, status: form.status,
      // HIDDEN (temporary): assignedStaff
      assignedStaff: undefined, notes: form.notes || undefined,
      rawDescription: `NAME: ${form.customerName}\nPAX: ${form.pax}\nOCCASION: ${form.occasion}\nRATE: ${form.ratePerPerson}\nTIME: ${form.startTime} – ${form.endTime}`,
    });

    toast({ title: "Enquiry created!", description: "The event has been saved successfully." });
    navigate("/events");
  };

  const activeHalls = halls.filter((h) => h.active);
  const activeExtrasFood = extras.filter((e) => e.active && e.type === "food");
  const activeExtrasEq = extras.filter((e) => e.active && e.type === "equipment");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-7">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Enquiry</h1>
            <p className="text-sm text-muted-foreground">Fill in the details to create a new event</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Event Details */}
        <FormSection icon={CalendarDays} title="Event Details" iconBg="bg-violet-100" iconColor="text-violet-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Event Title" value={form.title} onChange={(v) => update("title", v)} placeholder="e.g. Shah Corporate Lunch" required error={errors.title} />
            <SmartDropdown label="Occasion" items={occasions} value={form.occasion} onChange={(v) => update("occasion", v)} onAdd={addOccasion} onRemove={removeOccasion} placeholder="Search or select occasion..." />
            {/* Hall dropdown from Hall Master */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Hall / Venue</Label>
              <Select value={form.hallName} onValueChange={(v) => update("hallName", v)}>
                <SelectTrigger className="bg-white border-border h-10 text-foreground">
                  <SelectValue placeholder="Select hall..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-border shadow-lg">
                  {activeHalls.map((h) => (
                    <SelectItem key={h.id} value={h.name}>
                      <span className="font-medium">{h.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{h.capacityMin}–{h.capacityMax} pax</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger className="bg-white border-border h-10 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-border shadow-lg">
                  <SelectItem value="tentative" className="text-amber-700 focus:bg-amber-50">🟡 Tentative</SelectItem>
                  <SelectItem value="confirmed" className="text-emerald-700 focus:bg-emerald-50">🟢 Confirmed</SelectItem>
                  <SelectItem value="cancelled" className="text-red-700 focus:bg-red-50">🔴 Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormSection>

        {/* Customer Details */}
        <FormSection icon={User} title="Customer Details" iconBg="bg-blue-100" iconColor="text-blue-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Customer Name" value={form.customerName} onChange={(v) => update("customerName", v)} placeholder="e.g. Rahul Shah" required error={errors.customerName} />
            <Field label="Phone Number" value={form.customerPhone} onChange={(v) => update("customerPhone", v)} placeholder="+91 98765 43210" />
            <Field label="Email Address" value={form.customerEmail} onChange={(v) => update("customerEmail", v)} placeholder="email@example.com" type="email" error={errors.customerEmail} />
            {/* HIDDEN (temporary): Assigned Staff dropdown */}
          </div>
        </FormSection>

        {/* Schedule */}
        <FormSection icon={Clock} title="Schedule" iconBg="bg-amber-100" iconColor="text-amber-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Event Date" value={form.date} onChange={(v) => update("date", v)} type="date" required error={errors.date} />
            <Field label="Start Time" value={form.startTime} onChange={(v) => update("startTime", v)} type="time" required error={errors.startTime} />
            <Field label="End Time" value={form.endTime} onChange={(v) => update("endTime", v)} type="time" required error={errors.endTime} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Field label="PAX (Guests)" value={form.pax} onChange={(v) => update("pax", v)} type="number" placeholder="50" required error={errors.pax} />
            <Field label="Rate / Person (₹)" value={form.ratePerPerson} onChange={(v) => update("ratePerPerson", v)} type="number" placeholder="600" />
            {/* HIDDEN (temporary): Advance (₹) and Tax % fields */}
          </div>
        </FormSection>

        {/* AI Package Suggestions */}
        {suggestedPkgs.length > 0 && (
          <FormSection icon={Package} title="Suggested Packages" iconBg="bg-violet-100" iconColor="text-violet-600">
            <p className="text-xs text-muted-foreground mb-3">Based on your occasion and guest count — click to auto-fill</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {suggestedPkgs.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => applyPackage(pkg)}
                  className="rounded-xl border border-border bg-muted/30 p-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground truncate">{pkg.name}</span>
                    {pkg.featured && <span className="text-amber-500 text-xs">⭐</span>}
                  </div>
                  <p className="text-lg font-bold text-primary">₹{pkg.pricePerPerson}<span className="text-xs font-normal text-muted-foreground">/person</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{pkg.includedItems.length} items · {pkg.timeType.replace("-", " ")}</p>
                  <p className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to apply →</p>
                </button>
              ))}
            </div>
          </FormSection>
        )}

        {/* HIDDEN (temporary): Live Summary Panel (revenue/payment section) */}
        {/* <SummaryPanel pax={...} ratePerPerson={...} taxPercent={...} advanceAmount={...} extrasTotal={extrasTotal} /> */}

        {/* Services & Menu */}
        <ServiceMenuBuilder services={services} onChange={setServices} startTime={form.startTime} endTime={form.endTime} pax={Number(form.pax) || 0} />

        {/* Extras & Services */}
        <FormSection icon={Sparkles} title="Extras & Add-ons" iconBg="bg-amber-100" iconColor="text-amber-600">
          {activeExtrasFood.length > 0 && (
            <div className="space-y-2 mb-4">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Food Add-ons</Label>
              <div className="flex flex-wrap gap-2">
                {activeExtrasFood.map((ex) => {
                  const sel = selectedExtras.includes(ex.name);
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => toggleExtra(ex.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${sel ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"}`}
                    >
                      {ex.name}
                      <span className={`${sel ? "text-white/70" : "text-muted-foreground"}`}>₹{ex.price}</span>
                      {sel && <X className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {activeExtrasEq.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Equipment</Label>
              <div className="flex flex-wrap gap-2">
                {activeExtrasEq.map((ex) => {
                  const sel = selectedExtras.includes(ex.name);
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => toggleExtra(ex.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${sel ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"}`}
                    >
                      {ex.name}
                      <span className={`${sel ? "text-white/70" : "text-muted-foreground"}`}>₹{ex.price.toLocaleString("en-IN")}</span>
                      {sel && <X className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {selectedExtras.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{selectedExtras.length} extras selected</span>
              <span className="text-sm font-bold text-primary">+₹{extrasTotal.toLocaleString("en-IN")}</span>
            </div>
          )}
        </FormSection>

        {/* Notes */}
        <FormSection icon={FileText} title="Additional Notes" iconBg="bg-slate-100" iconColor="text-slate-500">
          <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any special requirements, dietary restrictions, or additional notes..." rows={3} className="bg-white border-border focus:ring-primary/30 resize-none text-foreground" />
        </FormSection>

        <div className="flex gap-3 pt-2 pb-8">
          <Button type="submit" className="gradient-primary text-white border-0 shadow-md glow-primary hover:opacity-90 gap-2 px-8">
            <CheckCircle2 className="w-4 h-4" /> Create Enquiry
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="border-border text-muted-foreground hover:text-foreground hover:bg-muted">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

const FormSection = ({ icon: Icon, title, iconBg, iconColor, children }: { icon: React.ElementType; title: string; iconBg: string; iconColor: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-3.5 border-b border-border bg-muted/40 flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const Field = ({ label, value, onChange, placeholder, type = "text", required, error }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean; error?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-foreground">{label} {required && <span className="text-red-500">*</span>}</Label>
    <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`bg-white border-border h-10 text-foreground placeholder:text-muted-foreground focus:ring-primary/30 transition-colors ${error ? "border-red-400" : ""}`} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default AddEnquiry;
