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
import ServiceMenuBuilder, { type ServiceEntry, PERSON_CATEGORIES } from "@/components/enquiry/ServiceMenuBuilder";
import { CalendarPicker, TimeSlotPicker, AllPackages } from "@/components/enquiry/DateTimePicker";
import {
  CalendarDays, User, Clock, Utensils, CheckCircle2,
  ArrowLeft, ArrowRight, Package, Sparkles, X, FileText, ChevronRight,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Event Info", icon: CalendarDays, desc: "Title, occasion & hall" },
  { id: 2, label: "Customer",   icon: User,         desc: "Contact details"         },
  { id: 3, label: "Schedule",   icon: Clock,        desc: "Date, time & guests"     },
  { id: 4, label: "Services",   icon: Utensils,     desc: "Menu & extras"           },
  { id: 5, label: "Review",     icon: CheckCircle2, desc: "Confirm & submit"        },
];

const AddEnquiry = () => {
  const navigate = useNavigate();
  const { addEvent } = useEvents();
  const { occasions, addOccasion, removeOccasion, incrementUsage, menuItems } = useMasterData();
  const { packages, halls, extras } = useBanquetMaster();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", customerName: "", customerPhone: "", customerEmail: "",
    occasion: "", hallName: "", date: "", startTime: "", endTime: "",
    pax: "", ratePerPerson: "", status: "tentative" as EventStatus, notes: "",
  });
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  // ── Package selection ─────────────────────────────────────────────────────
  const applyPackage = (pkg: typeof packages[0] | { id: null }) => {
    if (!pkg.id) {
      // Deselect
      setSelectedPkgId(null);
      setServices([]);
      update("ratePerPerson", "");
      return;
    }
    const p = pkg as typeof packages[0];
    setSelectedPkgId(p.id);
    update("ratePerPerson", String(p.pricePerPerson));

    // Build service entry with ALL items from the package pulled from master menu
    // (items that exist in master menu get their names; unknown names are kept as-is)
    const pkgItems = p.includedItems; // names from package definition
    const tm: Record<string, string> = {
      "high-tea": "16:00", lunch: "12:30", dinner: "20:00", conference: "10:00", custom: "",
    };
    setServices([{
      name: p.name,
      time: tm[p.timeType] || "",
      menuItems: pkgItems,
      personCategories: PERSON_CATEGORIES.map((c) => ({ category: c, count: "" })),
    }]);
    toast({ title: `Package applied: ${p.name}` });
  };

  const toggleExtra = (name: string) =>
    setSelectedExtras((p) => p.includes(name) ? p.filter((x) => x !== name) : [...p, name]);
  const extrasTotal = extras.filter((e) => selectedExtras.includes(e.name)).reduce((s, e) => s + e.price, 0);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.title.trim()) e.title = "Event title is required";
      if (!form.hallName) e.hallName = "Hall / Venue is required";
    }
    if (s === 2) {
      if (!form.customerName.trim()) e.customerName = "Customer name is required";
      if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
        e.customerEmail = "Invalid email";
    }
    if (s === 3) {
      if (!form.date) e.date = "Date is required";
      if (!form.startTime) e.startTime = "Start time is required";
      if (!form.endTime) e.endTime = "End time is required";
      if (form.startTime && form.endTime && form.startTime >= form.endTime)
        e.endTime = "End time must be after start time";
      if (!form.pax) e.pax = "Guest count is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length)); };
  const goPrev = () => { setErrors({}); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = () => {
    const sel = occasions.find((o) => o.name === form.occasion);
    if (sel) incrementUsage("occasion", sel.id);
    const eventServices = services.filter((s) => s.name.trim()).map((s) => ({ name: s.name, time: s.time }));
    const menuItemsMap: Record<string, string[]> = {};
    services.forEach((s) => { if (s.name && s.menuItems.length > 0) menuItemsMap[s.name] = s.menuItems; });
    addEvent({
      id: crypto.randomUUID(), title: form.title, customerName: form.customerName,
      customerPhone: form.customerPhone, customerEmail: form.customerEmail || undefined,
      occasion: form.occasion, hallName: form.hallName, date: form.date,
      startTime: form.startTime, endTime: form.endTime, pax: Number(form.pax),
      ratePerPerson: Number(form.ratePerPerson), advanceAmount: undefined, taxPercent: undefined,
      services: eventServices, menuItems: menuItemsMap, status: form.status,
      assignedStaff: undefined, notes: form.notes || undefined,
      rawDescription: `NAME: ${form.customerName}\nPAX: ${form.pax}\nOCCASION: ${form.occasion}`,
    });
    toast({ title: "Enquiry created!", description: "The event has been saved." });
    navigate("/events");
  };

  const activeHalls = halls.filter((h) => h.active);
  const activeExtrasFood = extras.filter((e) => e.active && e.type === "food");
  const activeExtrasEq   = extras.filter((e) => e.active && e.type === "equipment");
  const curStep = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Enquiry</h1>
            <p className="text-sm text-muted-foreground">Step {step} of {STEPS.length} — {curStep.desc}</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center mb-8 overflow-x-auto pb-1 gap-0">
          {STEPS.map((s, i) => {
            const done = step > s.id; const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center shrink-0">
                <button type="button" onClick={() => done ? setStep(s.id) : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active ? "gradient-primary text-white shadow-md glow-primary"
                    : done  ? "bg-emerald-100 text-emerald-700 cursor-pointer hover:bg-emerald-200"
                    : "bg-muted text-muted-foreground cursor-default"
                  }`}>
                  {done ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <s.icon className="w-4 h-4 shrink-0" />}
                  <span className="hidden sm:block">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className={`w-4 h-4 mx-1 shrink-0 ${done ? "text-emerald-400" : "text-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <curStep.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{curStep.label}</p>
              <p className="text-xs text-muted-foreground">{curStep.desc}</p>
            </div>
          </div>

          {/* Card body */}
          <div className="p-6">

            {/* ── STEP 1: Event Info ─────────────────────────────────────── */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Event Title" value={form.title}
                  onChange={(v) => update("title", v)}
                  placeholder="e.g. Shah Corporate Lunch" required error={errors.title}
                />
                <SmartDropdown
                  label="Occasion" items={occasions} value={form.occasion}
                  onChange={(v) => update("occasion", v)}
                  onAdd={addOccasion} onRemove={removeOccasion}
                  placeholder="Search or select occasion..."
                />
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Hall / Venue<span className="text-red-500 ml-0.5">*</span></Label>
                  <Select value={form.hallName} onValueChange={(v) => update("hallName", v)}>
                    <SelectTrigger className={`bg-white h-10 text-foreground ${errors.hallName ? 'border-red-400' : 'border-border'}`}>
                      <SelectValue placeholder="Select hall..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border shadow-lg">
                      {activeHalls.map((h) => (
                        <SelectItem key={h.id} value={h.name}>
                          {h.name}{" "}
                          <span className="text-xs text-muted-foreground ml-1">
                            {h.capacityMin}–{h.capacityMax} pax
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.hallName && <p className="text-xs text-red-500 mt-0.5">{errors.hallName}</p>}
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
            )}

            {/* ── STEP 2: Customer ──────────────────────────────────────── */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Customer Name" value={form.customerName}
                  onChange={(v) => update("customerName", v)}
                  placeholder="e.g. Rahul Shah" required error={errors.customerName}
                />
                <Field
                  label="Phone Number" value={form.customerPhone}
                  onChange={(v) => update("customerPhone", v)}
                  placeholder="+91 98765 43210"
                />
                <Field
                  label="Email Address" value={form.customerEmail}
                  onChange={(v) => update("customerEmail", v)}
                  placeholder="email@example.com" type="email" error={errors.customerEmail}
                />
              </div>
            )}

            {/* ── STEP 3: Schedule — Calendly-style ────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Date + Start time side by side on md, stacked on sm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CalendarPicker
                    value={form.date}
                    onChange={(v) => update("date", v)}
                    error={errors.date}
                  />
                  <div className="space-y-4">
                    <TimeSlotPicker
                      label="Start Time"
                      value={form.startTime}
                      onChange={(v) => { update("startTime", v); if (form.endTime && v >= form.endTime) update("endTime", ""); }}
                      error={errors.startTime}
                    />
                    <TimeSlotPicker
                      label="End Time"
                      value={form.endTime}
                      onChange={(v) => update("endTime", v)}
                      disableBefore={form.startTime || null}
                      error={errors.endTime}
                    />
                  </div>
                </div>

                {/* PAX + Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="PAX (Guests)" value={form.pax}
                    onChange={(v) => update("pax", v)}
                    type="number" placeholder="50" required error={errors.pax}
                  />
                  <Field
                    label="Rate / Person (₹)" value={form.ratePerPerson}
                    onChange={(v) => update("ratePerPerson", v)}
                    type="number" placeholder="600"
                  />
                </div>

                {/* Package selection — pulled from BanquetMaster */}
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <AllPackages
                    packages={packages}
                    selectedPkgId={selectedPkgId}
                    onSelect={applyPackage}
                    services={services}
                    setServices={setServices}
                    menuItems={menuItems}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 4: Services & Extras ─────────────────────────────── */}
            {step === 4 && (
              <div className="space-y-5">
                <ServiceMenuBuilder
                  services={services}
                  onChange={setServices}
                  startTime={form.startTime}
                  endTime={form.endTime}
                  pax={Number(form.pax) || 0}
                />

                {/* Extras */}
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-semibold text-foreground">Extras & Add-ons</p>
                  </div>

                  {activeExtrasFood.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Food</Label>
                      <div className="flex flex-wrap gap-2">
                        {activeExtrasFood.map((ex) => {
                          const sel = selectedExtras.includes(ex.name);
                          return (
                            <button key={ex.id} type="button" onClick={() => toggleExtra(ex.name)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                sel ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"
                              }`}>
                              {ex.name}
                              <span className={sel ? "text-white/70" : "text-muted-foreground"}>₹{ex.price}</span>
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
                            <button key={ex.id} type="button" onClick={() => toggleExtra(ex.name)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                sel ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"
                              }`}>
                              {ex.name}
                              <span className={sel ? "text-white/70" : "text-muted-foreground"}>
                                ₹{ex.price.toLocaleString("en-IN")}
                              </span>
                              {sel && <X className="h-3 w-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedExtras.length > 0 && (
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{selectedExtras.length} selected</span>
                      <span className="text-sm font-bold text-primary">+₹{extrasTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />Additional Notes
                  </Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Any special requirements..."
                    rows={3}
                    className="bg-white border-border resize-none text-foreground"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 5: Review ────────────────────────────────────────── */}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Review your enquiry before submitting.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReviewRow label="Event Title" value={form.title} />
                  <ReviewRow label="Occasion" value={form.occasion || "—"} />
                  <ReviewRow label="Hall" value={form.hallName || "—"} />
                  <ReviewRow label="Status" value={form.status} />
                  <ReviewRow label="Customer" value={form.customerName} />
                  <ReviewRow label="Phone" value={form.customerPhone || "—"} />
                  <ReviewRow
                    label="Date"
                    value={form.date
                      ? new Date(form.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  />
                  <ReviewRow
                    label="Time"
                    value={form.startTime && form.endTime ? `${form.startTime} – ${form.endTime}` : "—"}
                  />
                  <ReviewRow label="PAX" value={form.pax ? `${form.pax} guests` : "—"} />
                  <ReviewRow label="Rate/Person" value={form.ratePerPerson ? `₹${form.ratePerPerson}` : "—"} />
                </div>

                {services.filter((s) => s.name).length > 0 && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Services</p>
                    {services.filter((s) => s.name).map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{s.name}</span>
                        <span className="text-muted-foreground">{s.time} · {s.menuItems.length} items</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedExtras.length > 0 && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Extras</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedExtras.map((e) => (
                        <span key={e} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {form.notes && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-foreground">{form.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <Button type="button" variant="outline" onClick={step === 1 ? () => navigate(-1) : goPrev}
              className="border-border text-muted-foreground hover:text-foreground gap-2">
              <ArrowLeft className="w-4 h-4" />{step === 1 ? "Cancel" : "Back"}
            </Button>
            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div key={s.id} className={`rounded-full transition-all duration-300 ${
                  step === s.id ? "w-6 h-2 gradient-primary"
                  : step > s.id ? "w-2 h-2 bg-emerald-400"
                  : "w-2 h-2 bg-border"
                }`} />
              ))}
            </div>
            {step < STEPS.length ? (
              <Button type="button" onClick={goNext}
                className="gradient-primary text-white border-0 shadow-md hover:opacity-90 gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit}
                className="gradient-primary text-white border-0 shadow-md glow-primary hover:opacity-90 gap-2 px-8">
                <CheckCircle2 className="w-4 h-4" />Create Enquiry
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Small helpers ─────────────────────────────────────────────────────────────
const Field = ({
  label, value, onChange, placeholder, type = "text", required, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; error?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-foreground">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    <Input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-white border-border h-10 text-foreground placeholder:text-muted-foreground focus:ring-primary/30 transition-colors ${error ? "border-red-400" : ""}`}
    />
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-foreground capitalize">{value}</p>
  </div>
);

export default AddEnquiry;
