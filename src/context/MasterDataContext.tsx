import { createContext, useContext, useState, ReactNode } from "react";

export interface StaffMember {
  id: string;
  name: string;
  usageCount: number;
  lastUsed?: string;
}

export interface OccasionItem {
  id: string;
  name: string;
  usageCount: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snacks" | "beverages" | "desserts";
  usageCount: number;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  defaultTime: string;
  usageCount: number;
}

interface MasterDataContextType {
  staff: StaffMember[];
  occasions: OccasionItem[];
  menuItems: MenuItem[];
  serviceTemplates: ServiceTemplate[];
  addStaff: (name: string) => void;
  removeStaff: (id: string) => void;
  addOccasion: (name: string) => void;
  removeOccasion: (id: string) => void;
  addMenuItem: (name: string, category: MenuItem["category"]) => void;
  removeMenuItem: (id: string) => void;
  incrementUsage: (type: "staff" | "occasion" | "menu" | "service", id: string) => void;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

const defaultStaff: StaffMember[] = [
  { id: "s1", name: "Priya", usageCount: 12, lastUsed: "2026-04-08" },
  { id: "s2", name: "Amit", usageCount: 8, lastUsed: "2026-04-07" },
  { id: "s3", name: "Ravi", usageCount: 5, lastUsed: "2026-04-05" },
  { id: "s4", name: "Sneha", usageCount: 3 },
  { id: "s5", name: "Vikram", usageCount: 2 },
];

const defaultOccasions: OccasionItem[] = [
  { id: "o1", name: "Wedding", usageCount: 15 },
  { id: "o2", name: "Corporate", usageCount: 12 },
  { id: "o3", name: "Birthday", usageCount: 10 },
  { id: "o4", name: "Anniversary", usageCount: 6 },
  { id: "o5", name: "Engagement", usageCount: 4 },
  { id: "o6", name: "Baby Shower", usageCount: 3 },
  { id: "o7", name: "Kitty Party", usageCount: 2 },
  { id: "o8", name: "Conference", usageCount: 2 },
];

const defaultMenuItems: MenuItem[] = [
  { id: "m1", name: "Tea", category: "beverages", usageCount: 20 },
  { id: "m2", name: "Coffee", category: "beverages", usageCount: 18 },
  { id: "m3", name: "Samosa", category: "snacks", usageCount: 15 },
  { id: "m4", name: "Sandwich", category: "snacks", usageCount: 12 },
  { id: "m5", name: "Aalu Paratha", category: "breakfast", usageCount: 14 },
  { id: "m6", name: "Gobi Paratha", category: "breakfast", usageCount: 11 },
  { id: "m7", name: "Paneer Butter Masala", category: "lunch", usageCount: 16 },
  { id: "m8", name: "Dal Makhani", category: "lunch", usageCount: 14 },
  { id: "m9", name: "Naan", category: "lunch", usageCount: 18 },
  { id: "m10", name: "Rice", category: "lunch", usageCount: 17 },
  { id: "m11", name: "Biryani", category: "dinner", usageCount: 13 },
  { id: "m12", name: "Gulab Jamun", category: "desserts", usageCount: 10 },
  { id: "m13", name: "Pasta", category: "dinner", usageCount: 8 },
  { id: "m14", name: "Pizza", category: "dinner", usageCount: 7 },
  { id: "m15", name: "Chole", category: "lunch", usageCount: 9 },
  { id: "m16", name: "Raita", category: "lunch", usageCount: 8 },
  { id: "m17", name: "Paneer Tikka", category: "snacks", usageCount: 11 },
  { id: "m18", name: "Spring Rolls", category: "snacks", usageCount: 6 },
  { id: "m19", name: "Mocktails", category: "beverages", usageCount: 9 },
  { id: "m20", name: "Fresh Juice", category: "beverages", usageCount: 8 },
];

const defaultServiceTemplates: ServiceTemplate[] = [
  { id: "st1", name: "High Tea", defaultTime: "07:15 AM", usageCount: 10 },
  { id: "st2", name: "Brunch", defaultTime: "09:30 AM", usageCount: 8 },
  { id: "st3", name: "Lunch", defaultTime: "12:30 PM", usageCount: 12 },
  { id: "st4", name: "Snacks", defaultTime: "04:00 PM", usageCount: 6 },
  { id: "st5", name: "Dinner", defaultTime: "08:00 PM", usageCount: 9 },
  { id: "st6", name: "Welcome Drinks", defaultTime: "06:00 PM", usageCount: 5 },
  { id: "st7", name: "Starters", defaultTime: "07:00 PM", usageCount: 7 },
  { id: "st8", name: "Desserts", defaultTime: "10:00 PM", usageCount: 4 },
  { id: "st9", name: "Main Course", defaultTime: "08:30 PM", usageCount: 6 },
];

export const MasterDataProvider = ({ children }: { children: ReactNode }) => {
  const [staff, setStaff] = useState<StaffMember[]>(defaultStaff);
  const [occasions, setOccasions] = useState<OccasionItem[]>(defaultOccasions);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [serviceTemplates] = useState<ServiceTemplate[]>(defaultServiceTemplates);

  const addStaff = (name: string) => {
    setStaff((prev) => [...prev, { id: Math.random().toString(36).slice(2, 11), name, usageCount: 0 }]);
  };
  const removeStaff = (id: string) => setStaff((prev) => prev.filter((s) => s.id !== id));

  const addOccasion = (name: string) => {
    setOccasions((prev) => [...prev, { id: Math.random().toString(36).slice(2, 11), name, usageCount: 0 }]);
  };
  const removeOccasion = (id: string) => setOccasions((prev) => prev.filter((o) => o.id !== id));

  const addMenuItem = (name: string, category: MenuItem["category"]) => {
    setMenuItems((prev) => [...prev, { id: Math.random().toString(36).slice(2, 11), name, category, usageCount: 0 }]);
  };
  const removeMenuItem = (id: string) => setMenuItems((prev) => prev.filter((m) => m.id !== id));

  const incrementUsage = (type: "staff" | "occasion" | "menu" | "service", id: string) => {
    if (type === "staff") {
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, usageCount: s.usageCount + 1, lastUsed: new Date().toISOString().split("T")[0] } : s))
      );
    } else if (type === "occasion") {
      setOccasions((prev) => prev.map((o) => (o.id === id ? { ...o, usageCount: o.usageCount + 1 } : o)));
    } else if (type === "menu") {
      setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, usageCount: m.usageCount + 1 } : m)));
    }
  };

  return (
    <MasterDataContext.Provider
      value={{ staff, occasions, menuItems, serviceTemplates, addStaff, removeStaff, addOccasion, removeOccasion, addMenuItem, removeMenuItem, incrementUsage }}
    >
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = () => {
  const ctx = useContext(MasterDataContext);
  if (!ctx) throw new Error("useMasterData must be used within MasterDataProvider");
  return ctx;
};
