export type EventStatus = "draft" | "tentative" | "confirmed" | "cancelled";

export interface ServiceSlot {
  name: string;
  time: string;
}

export interface ExtraSelection {
  name: string;
  quantity: number;
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
  isEditable: boolean;        // false when confirmed (locked)
  createdBy: string;          // username of creator
  assignedStaff?: string;
  notes?: string;
  selectedExtras?: (string | ExtraSelection)[];
  rawDescription: string;
}

/** Returns true if a new booking (hallName, date, startTime, endTime)
 *  conflicts with any confirmed/booked slot in existingEvents. */
export function hasSlotConflict(
  existingEvents: EventData[],
  hallName: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): boolean {
  const toMins = (t: string | undefined | null) => {
    if (!t || typeof t !== "string" || !t.includes(":")) return 0;
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const newStart = toMins(startTime);
  const newEnd   = toMins(endTime);

  // If new times are invalid, no conflict possible here
  if (newStart === 0 && newEnd === 0) return false;

  return existingEvents.some((e) => {
    if (excludeId && e.id === excludeId) return false;
    if (e.hallName !== hallName)       return false;
    if (e.date !== date)               return false;
    if (e.status === "cancelled")      return false; 
    
    const eStart = toMins(e.startTime);
    const eEnd   = toMins(e.endTime);
    
    // If existing event doesn't have valid times set yet (e.g. fresh draft), skip it
    if (eStart === 0 && eEnd === 0) return false;

    // Overlap when: newStart < eEnd AND newEnd > eStart
    return newStart < eEnd && newEnd > eStart;
  });
}

export const mockEvents: EventData[] = [
  {
    id: "1",
    title: "Wedding Reception - Shah Family",
    customerName: "Rahul Shah",
    customerPhone: "+91 98765 43210",
    occasion: "Wedding",
    hallName: "Grand Ballroom",
    date: "2026-05-15",
    startTime: "18:00",
    endTime: "23:00",
    pax: 250,
    ratePerPerson: 850,
    status: "confirmed",
    isEditable: false,
    createdBy: "admin",
    rawDescription: "A grand wedding reception for the Shah family with full catering.",
    services: [],
    menuItems: {}
  },
  {
    id: "2",
    title: "Corporate Annual Meet",
    customerName: "Amit Mehra",
    customerPhone: "+91 98222 11111",
    occasion: "Corporate",
    hallName: "Conference Hall A",
    date: "2026-04-25",
    startTime: "09:00",
    endTime: "17:00",
    pax: 100,
    ratePerPerson: 1200,
    status: "tentative",
    isEditable: true,
    createdBy: "staff_priya",
    rawDescription: "Annual strategy meet for Tech Solutions Ltd.",
    services: [],
    menuItems: {}
  }
];
