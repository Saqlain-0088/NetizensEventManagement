export type EventStatus = "tentative" | "confirmed" | "cancelled";

export interface ServiceSlot {
  name: string;
  time: string;
}

export interface EventData {
  id: string;
  title: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  occasion: string;
  hallName: string;
  date: string;
  startTime: string;
  endTime: string;
  pax: number;
  ratePerPerson: number;
  advanceAmount?: number;
  taxPercent?: number;
  services: ServiceSlot[];
  menuItems: Record<string, string[]>;
  status: EventStatus;
  assignedStaff?: string;
  notes?: string;
  rawDescription: string;
}

export const mockEvents: EventData[] = [
  {
    id: "1",
    title: "Shah Corporate Lunch",
    customerName: "Rahul Shah",
    customerPhone: "+91 98765 43210",
    customerEmail: "rahul@company.com",
    occasion: "Corporate",
    hallName: "Grand Ballroom",
    date: "2026-04-10",
    startTime: "07:00 AM",
    endTime: "10:00 AM",
    pax: 50,
    ratePerPerson: 600,
    advanceAmount: 10000,
    taxPercent: 18,
    services: [
      { name: "High Tea", time: "07:15 AM" },
      { name: "Brunch", time: "09:30 AM" },
    ],
    menuItems: {
      "High Tea": ["Tea", "Coffee", "Samosa", "Sandwich", "Cookies"],
      "Brunch": ["Paneer Butter Masala", "Dal Makhani", "Naan", "Rice", "Gulab Jamun"],
    },
    status: "confirmed",
    assignedStaff: "Priya",
    notes: "VIP client, extra care on presentation",
    rawDescription: "NAME: Rahul Shah\nPAX: 50\nOCCASION: Corporate\nRATE: 600\nMENU: Tea + Lunch\nTIME: 7:00 AM – 10:00 AM\nCONFIRMED",
  },
  {
    id: "2",
    title: "Patel Wedding Reception",
    customerName: "Meera Patel",
    customerPhone: "+91 99887 65432",
    occasion: "Wedding",
    hallName: "Crystal Hall",
    date: "2026-04-12",
    startTime: "06:00 PM",
    endTime: "11:00 PM",
    pax: 200,
    ratePerPerson: 1200,
    advanceAmount: 50000,
    taxPercent: 18,
    services: [
      { name: "Welcome Drinks", time: "06:00 PM" },
      { name: "Starters", time: "07:00 PM" },
      { name: "Main Course", time: "08:30 PM" },
      { name: "Desserts", time: "10:00 PM" },
    ],
    menuItems: {
      "Welcome Drinks": ["Mocktails", "Fresh Juice", "Chaas"],
      "Starters": ["Paneer Tikka", "Veg Kebab", "Spring Rolls", "Pav Bhaji"],
      "Main Course": ["Biryani", "Chole", "Palak Paneer", "Rotis", "Raita"],
      "Desserts": ["Ice Cream", "Jalebi", "Ras Malai"],
    },
    status: "tentative",
    assignedStaff: "Amit",
    rawDescription: "NAME: Meera Patel\nPAX: 200\nOCCASION: Wedding\nRATE: 1200\nTIME: 6:00 PM – 11:00 PM",
  },
  {
    id: "3",
    title: "Kumar Birthday Party",
    customerName: "Sneha Kumar",
    customerPhone: "+91 87654 32100",
    occasion: "Birthday",
    hallName: "Terrace Garden",
    date: "2026-04-08",
    startTime: "04:00 PM",
    endTime: "08:00 PM",
    pax: 30,
    ratePerPerson: 800,
    taxPercent: 18,
    services: [
      { name: "Snacks", time: "04:30 PM" },
      { name: "Dinner", time: "06:30 PM" },
    ],
    menuItems: {
      "Snacks": ["French Fries", "Nachos", "Bruschetta", "Mini Burgers"],
      "Dinner": ["Pasta", "Pizza", "Garlic Bread", "Caesar Salad", "Cake"],
    },
    status: "cancelled",
    assignedStaff: "Ravi",
    notes: "Cancelled due to venue conflict",
    rawDescription: "NAME: Sneha Kumar\nPAX: 30\nOCCASION: Birthday\nRATE: 800\nTIME: 4:00 PM – 8:00 PM\nCANCELLED",
  },
];
