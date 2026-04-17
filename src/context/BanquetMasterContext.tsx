import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// ── Property / Location ──────────────────────────────────────────────────────
export interface Property {
  id: string;
  name: string;
  location: string;
  active: boolean;
  usageCount: number;
}

// ── Hall / Venue ──────────────────────────────────────────────────────────────
export interface Hall {
  id: string;
  propertyId: string;
  name: string;
  capacityMin: number;
  capacityMax: number;
  size: string;          // e.g. "41x50 ft"
  baseRent: number;
  active: boolean;
  featured: boolean;
  usageCount: number;
}

// ── Package ───────────────────────────────────────────────────────────────────
export type PackageTimeType = "high-tea" | "lunch" | "dinner" | "conference" | "custom";

export interface Package {
  id: string;
  name: string;
  pricePerPerson: number;
  timeType: PackageTimeType;
  includedItems: string[];   // menu item names
  active: boolean;
  featured: boolean;
  usageCount: number;
}

// ── Extra Service ─────────────────────────────────────────────────────────────
export type ExtraType = "food" | "equipment";

export interface ExtraService {
  id: string;
  name: string;
  type: ExtraType;
  price: number;
  active: boolean;
  featured: boolean;
  usageCount: number;
}

// ── Context type ──────────────────────────────────────────────────────────────
interface BanquetMasterContextType {
  properties: Property[];
  halls: Hall[];
  packages: Package[];
  extras: ExtraService[];

  // Property CRUD
  addProperty: (p: Omit<Property, "id" | "usageCount">) => void;
  updateProperty: (id: string, p: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  toggleProperty: (id: string, field: "active") => void;

  // Hall CRUD
  addHall: (h: Omit<Hall, "id" | "usageCount">) => void;
  updateHall: (id: string, h: Partial<Hall>) => void;
  deleteHall: (id: string) => void;
  toggleHall: (id: string, field: "active" | "featured") => void;

  // Package CRUD
  addPackage: (p: Omit<Package, "id" | "usageCount">) => void;
  updatePackage: (id: string, p: Partial<Package>) => void;
  deletePackage: (id: string) => void;
  togglePackage: (id: string, field: "active" | "featured") => void;

  // Extra CRUD
  addExtra: (e: Omit<ExtraService, "id" | "usageCount">) => void;
  updateExtra: (id: string, e: Partial<ExtraService>) => void;
  deleteExtra: (id: string) => void;
  toggleExtra: (id: string, field: "active" | "featured") => void;

  // AI helpers
  suggestPackages: (pax: number, occasion: string, budget: number) => Package[];
  suggestHall: (pax: number) => Hall | null;
}

const BanquetMasterContext = createContext<BanquetMasterContextType | undefined>(undefined);

// ── Seed data (exact from Banquetoria PDF) ────────────────────────────────────
const defaultProperties: Property[] = [
  { id: "prop1", name: "Adajan", location: "Surat", active: true, usageCount: 2 },
  { id: "prop2", name: "Vesu", location: "Surat", active: true, usageCount: 1 },
];

const defaultHalls: Hall[] = [
  { id: "h1", propertyId: "prop1", name: "THE PALACE", capacityMin: 80,  capacityMax: 220, size: "41x50 ft", baseRent: 5000, active: true, featured: true,  usageCount: 18 },
  { id: "h2", propertyId: "prop1", name: "RAJBHAVAN",  capacityMin: 60,  capacityMax: 120, size: "30x50 ft", baseRent: 5000, active: true, featured: false, usageCount: 12 },
  { id: "h3", propertyId: "prop2", name: "OCEAN",      capacityMin: 80,  capacityMax: 220, size: "41x50 ft", baseRent: 5000, active: true, featured: false, usageCount: 9  },
  // Note: Hall Rental after 04 Hours = ₹5000/hr | Selection Menu = ₹50 extra
];

const defaultPackages: Package[] = [
  {
    id: "pkg1",
    name: "Package 1 – High Tea",
    pricePerPerson: 380,
    timeType: "high-tea",
    includedItems: ["Tea", "Coffee", "Cookies", "Sandwich", "Hot Snacks", "Mineral Water", "Mukhvas"],
    active: true, featured: true, usageCount: 22,
  },
  {
    id: "pkg-saloon",
    name: "Saloon – Boardroom (Min 10)",
    pricePerPerson: 500,
    timeType: "custom",
    includedItems: ["Tea Coffee", "Cookies", "Sandwich"],
    active: true, featured: false, usageCount: 5,
  },
  {
    id: "pkg2",
    name: "Package 2",
    pricePerPerson: 490,
    timeType: "lunch",
    includedItems: ["Soup", "Paneer Sabji", "Veg Sabji", "Butter Roti", "Dal Rice Preparation", "Green Salad", "Papad", "Pickle", "Ice Cream*", "Mukhvas"],
    active: true, featured: false, usageCount: 15,
  },
  {
    id: "pkg3",
    name: "Package 3",
    pricePerPerson: 590,
    timeType: "lunch",
    includedItems: ["Soup", "Paneer Sabji", "Veg Sabji", "Butter Roti", "Dal Rice Preparation", "Sweet", "Green Salad", "Papad", "Pickle", "Mineral Water", "Ice Cream*", "Mukhvas"],
    active: true, featured: false, usageCount: 11,
  },
  {
    id: "pkg4",
    name: "Package 4",
    pricePerPerson: 640,
    timeType: "dinner",
    includedItems: ["Welcome Drink", "Soup", "Starter", "Paneer Sabji", "Veg Sabji", "Butter Roti", "Dal Rice Preparation", "Farsan", "Sweet", "Green Salad", "Papad", "Pickle", "Mineral Water", "Ice Cream*", "Mukhvas"],
    active: true, featured: true, usageCount: 8,
  },
  {
    id: "pkg5",
    name: "Package 5 – Conference",
    pricePerPerson: 990,
    timeType: "conference",
    includedItems: ["Starter", "Appetizers", "Main Course", "Butter Roti", "Dal Rice Preparation", "Sweet / Ice Cream", "3 Types of Fruits", "Papad", "Pickle", "Green Salad"],
    active: true, featured: true, usageCount: 6,
  },
];

const defaultExtras: ExtraService[] = [
  // Food extras (per person)
  { id: "ex1",  name: "Welcome Drink",    type: "food",      price: 50,   active: true, featured: true,  usageCount: 14 },
  { id: "ex2",  name: "Soup",             type: "food",      price: 50,   active: true, featured: false, usageCount: 8  },
  { id: "ex3",  name: "Starter",          type: "food",      price: 90,   active: true, featured: true,  usageCount: 12 },
  { id: "ex4",  name: "Main Course",      type: "food",      price: 90,   active: true, featured: false, usageCount: 10 },
  { id: "ex5",  name: "Live Counter",     type: "food",      price: 120,  active: true, featured: false, usageCount: 5  },
  { id: "ex6",  name: "Butter Milk/Curd", type: "food",      price: 50,   active: true, featured: false, usageCount: 7  },
  { id: "ex7",  name: "Sweet",            type: "food",      price: 100,  active: true, featured: false, usageCount: 9  },
  { id: "ex8",  name: "Tea/Coffee",       type: "food",      price: 50,   active: true, featured: false, usageCount: 11 },
  { id: "ex9",  name: "Cookies",          type: "food",      price: 40,   active: true, featured: false, usageCount: 6  },
  { id: "ex10", name: "Ice Cream*",       type: "food",      price: 50,   active: true, featured: false, usageCount: 8  },
  // Equipment (flat rate)
  { id: "ex11", name: "Mic Sound",        type: "equipment", price: 2000, active: true, featured: true,  usageCount: 10 },
  { id: "ex12", name: "Led Video Wall",   type: "equipment", price: 3000, active: true, featured: false, usageCount: 4  },
  { id: "ex13", name: "Stage 9ft×12ft",   type: "equipment", price: 4000, active: true, featured: false, usageCount: 3  },
  { id: "ex14", name: "Table",            type: "equipment", price: 200,  active: true, featured: false, usageCount: 7  },
  { id: "ex15", name: "Round Table",      type: "equipment", price: 400,  active: true, featured: false, usageCount: 5  },
  { id: "ex16", name: "DJ",               type: "equipment", price: 6000, active: true, featured: true,  usageCount: 6  },
  { id: "ex17", name: "Sound Operator",   type: "equipment", price: 500,  active: true, featured: false, usageCount: 4  },
];

// ── Provider ──────────────────────────────────────────────────────────────────
export const BanquetMasterProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem("master_properties");
    return saved ? JSON.parse(saved) : defaultProperties;
  });
  const [halls, setHalls] = useState<Hall[]>(() => {
    const saved = localStorage.getItem("master_halls");
    return saved ? JSON.parse(saved) : defaultHalls;
  });
  const [packages, setPackages] = useState<Package[]>(() => {
    const saved = localStorage.getItem("master_packages");
    return saved ? JSON.parse(saved) : defaultPackages;
  });
  const [extras, setExtras] = useState<ExtraService[]>(() => {
    const saved = localStorage.getItem("master_extras");
    return saved ? JSON.parse(saved) : defaultExtras;
  });

  useEffect(() => { localStorage.setItem("master_properties", JSON.stringify(properties)); }, [properties]);
  useEffect(() => { localStorage.setItem("master_halls", JSON.stringify(halls)); }, [halls]);
  useEffect(() => { localStorage.setItem("master_packages", JSON.stringify(packages)); }, [packages]);
  useEffect(() => { localStorage.setItem("master_extras", JSON.stringify(extras)); }, [extras]);

  // Property
  const addProperty = (p: Omit<Property, "id" | "usageCount">) =>
    setProperties((prev) => [...prev, { ...p, id: Math.random().toString(36).slice(2, 11), usageCount: 0 }]);
  const updateProperty = (id: string, p: Partial<Property>) =>
    setProperties((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const deleteProperty = (id: string) => setProperties((prev) => prev.filter((x) => x.id !== id));
  const toggleProperty = (id: string, field: "active") =>
    setProperties((prev) => prev.map((x) => (x.id === id ? { ...x, [field]: !x[field] } : x)));

  // Hall
  const addHall = (h: Omit<Hall, "id" | "usageCount">) =>
    setHalls((p) => [...p, { ...h, id: Math.random().toString(36).slice(2, 11), usageCount: 0 }]);
  const updateHall = (id: string, h: Partial<Hall>) =>
    setHalls((p) => p.map((x) => (x.id === id ? { ...x, ...h } : x)));
  const deleteHall = (id: string) => setHalls((p) => p.filter((x) => x.id !== id));
  const toggleHall = (id: string, field: "active" | "featured") =>
    setHalls((p) => p.map((x) => (x.id === id ? { ...x, [field]: !x[field] } : x)));

  // Package
  const addPackage = (pkg: Omit<Package, "id" | "usageCount">) =>
    setPackages((p) => [...p, { ...pkg, id: Math.random().toString(36).slice(2, 11), usageCount: 0 }]);
  const updatePackage = (id: string, pkg: Partial<Package>) =>
    setPackages((p) => p.map((x) => (x.id === id ? { ...x, ...pkg } : x)));
  const deletePackage = (id: string) => setPackages((p) => p.filter((x) => x.id !== id));
  const togglePackage = (id: string, field: "active" | "featured") =>
    setPackages((p) => p.map((x) => (x.id === id ? { ...x, [field]: !x[field] } : x)));

  // Extra
  const addExtra = (e: Omit<ExtraService, "id" | "usageCount">) =>
    setExtras((p) => [...p, { ...e, id: Math.random().toString(36).slice(2, 11), usageCount: 0 }]);
  const updateExtra = (id: string, e: Partial<ExtraService>) =>
    setExtras((p) => p.map((x) => (x.id === id ? { ...x, ...e } : x)));
  const deleteExtra = (id: string) => setExtras((p) => p.filter((x) => x.id !== id));
  const toggleExtra = (id: string, field: "active" | "featured") =>
    setExtras((p) => p.map((x) => (x.id === id ? { ...x, [field]: !x[field] } : x)));

  // AI: suggest packages based on pax, occasion, budget
  const suggestPackages = (pax: number, occasion: string, budget: number): Package[] => {
    const occ = occasion.toLowerCase();
    return packages
      .filter((p) => p.active)
      .filter((p) => budget === 0 || p.pricePerPerson <= budget)
      .filter((p) => {
        if (occ.includes("conference")) return p.timeType === "conference";
        if (occ.includes("wedding") || occ.includes("reception")) return p.pricePerPerson >= 490;
        return true;
      })
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3);
  };

  // AI: suggest hall based on pax
  const suggestHall = (pax: number): Hall | null => {
    const suitable = halls
      .filter((h) => h.active && pax >= h.capacityMin && pax <= h.capacityMax)
      .sort((a, b) => b.usageCount - a.usageCount);
    return suitable[0] ?? null;
  };

  return (
    <BanquetMasterContext.Provider value={{
      properties, halls, packages, extras,
      addProperty, updateProperty, deleteProperty, toggleProperty,
      addHall, updateHall, deleteHall, toggleHall,
      addPackage, updatePackage, deletePackage, togglePackage,
      addExtra, updateExtra, deleteExtra, toggleExtra,
      suggestPackages, suggestHall,
    }}>
      {children}
    </BanquetMasterContext.Provider>
  );
};

export const useBanquetMaster = () => {
  const ctx = useContext(BanquetMasterContext);
  if (!ctx) throw new Error("useBanquetMaster must be used within BanquetMasterProvider");
  return ctx;
};
