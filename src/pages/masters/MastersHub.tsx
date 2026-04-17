import { useNavigate } from "react-router-dom";
import { Building2, Package, Utensils, Sparkles, ArrowRight, Users, MapPin, ShieldAlert } from "lucide-react";
import { useBanquetMaster } from "@/context/BanquetMasterContext";
import { useMasterData } from "@/context/MasterDataContext";
import { useAuth } from "@/context/AuthContext";

const cards = [
  {
    title: "Property / Location",
    description: "Manage properties and their locations",
    icon: MapPin,
    color: "bg-purple-100 text-purple-600",
    border: "border-purple-200 hover:border-purple-400",
    path: "/masters/properties",
  },
  {
    title: "Hall / Venue",
    description: "Manage banquet halls, capacity, and pricing",
    icon: Building2,
    color: "bg-blue-100 text-blue-600",
    border: "border-blue-200 hover:border-blue-400",
    path: "/masters/halls",
  },
  {
    title: "Packages",
    description: "Configure meal packages with pricing and menu items",
    icon: Package,
    color: "bg-blue-100 text-blue-600",
    border: "border-blue-200 hover:border-blue-400",
    path: "/masters/packages",
  },
  {
    title: "Menu Items",
    description: "Manage all food items across categories",
    icon: Utensils,
    color: "bg-emerald-100 text-emerald-600",
    border: "border-emerald-200 hover:border-emerald-400",
    path: "/masters/menu",
  },
  {
    title: "Extras & Services",
    description: "Add-on food items and equipment services",
    icon: Sparkles,
    color: "bg-amber-100 text-amber-600",
    border: "border-amber-200 hover:border-amber-400",
    path: "/masters/extras",
  },
  {
    title: "User Access (RBAC)",
    description: "Manage system users, roles, and venue assignments",
    icon: Users,
    color: "bg-indigo-100 text-indigo-600",
    border: "border-indigo-200 hover:border-indigo-400",
    path: "/masters/users",
  },
  {
    title: "Roles & Permissions",
    description: "Manage roles and access levels",
    icon: ShieldAlert,
    color: "bg-red-100 text-red-600",
    border: "border-red-200 hover:border-red-400",
    path: "/masters/roles",
  },
];

export default function MastersHub() {
  const navigate = useNavigate();
  const { properties, halls, packages, extras } = useBanquetMaster();
  const { menuItems } = useMasterData();
  const { users, roles } = useAuth(); // NEW

  const counts = [properties.length, halls.length, packages.length, menuItems.length, extras.length, users.length, roles.length]; // added roles.length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Master Data</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure halls, packages, menu items and services</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className={`rounded-2xl border-2 bg-white p-6 text-left transition-all duration-200 card-hover ${card.border} shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
            </div>
            <div className="mt-4">
              <p className="text-base font-bold text-foreground">{card.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-foreground">{counts[i]}</span>
              <span className="text-xs text-muted-foreground ml-1">records</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
