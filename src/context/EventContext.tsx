import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { mockEvents, type EventData, hasSlotConflict } from "@/data/mockEvents";
import { useAuth } from "@/context/AuthContext";
import { useBanquetMaster } from "@/context/BanquetMasterContext";

interface EventContextType {
  // Raw events (all, unfiltered) — used internally only
  _allEvents: EventData[];
  events: EventData[];
  addEvent: (event: EventData) => void;
  updateEvent: (id: string, updates: Partial<EventData>) => { ok: boolean; error?: string };
  confirmEvent: (id: string) => { ok: boolean; error?: string };
  cancelEvent: (id: string) => { ok: boolean; error?: string };
  checkSlotConflict: (hallName: string, date: string, startTime: string, endTime: string, excludeId?: string) => boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<EventData[]>(() => {
    const saved = localStorage.getItem("app_events");
    return saved ? JSON.parse(saved) : mockEvents;
  });

  useEffect(() => {
    localStorage.setItem("app_events", JSON.stringify(events));
  }, [events]);

  const addEvent = (event: EventData) => {
    setEvents((prev) => [event, ...prev]);
  };

  const updateEvent = (id: string, updates: Partial<EventData>): { ok: boolean; error?: string } => {
    let error: string | undefined;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        // Guard: confirmed + not editable → reject
        if (!e.isEditable && e.status === "confirmed") {
          error = "LOCKED: This enquiry is confirmed and cannot be edited.";
          return e;
        }
        return { ...e, ...updates };
      })
    );
    if (error) return { ok: false, error };
    return { ok: true };
  };

  /** Admin-only: move status DRAFT/TENTATIVE → CONFIRMED and lock the record */
  const confirmEvent = (id: string): { ok: boolean; error?: string } => {
    let conflict = false;
    let targetEvent: EventData | undefined;
    setEvents((prev) => {
      targetEvent = prev.find((e) => e.id === id);
      if (!targetEvent) return prev;

      // Check slot conflict against all OTHER confirmed events
      conflict = hasSlotConflict(
        prev,
        targetEvent.hallName,
        targetEvent.date,
        targetEvent.startTime,
        targetEvent.endTime,
        id // exclude self
      );
      if (conflict) return prev; // reject, no mutation

      return prev.map((e) =>
        e.id === id
          ? { ...e, status: "confirmed" as const, isEditable: false }
          : e
      );
    });

    if (conflict) return { ok: false, error: "CONFLICT: That time slot is already booked for this hall." };
    return { ok: true };
  };

  /** Cancel/Reject an enquiry */
  const cancelEvent = (id: string): { ok: boolean; error?: string } => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "cancelled" as const, isEditable: true } : e
      )
    );
    return { ok: true };
  };

  const checkSlotConflict = (
    hallName: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ) => hasSlotConflict(events, hallName, date, startTime, endTime, excludeId);

  return (
    <EventContext.Provider value={{ _allEvents: events, events, addEvent, updateEvent, confirmEvent, cancelEvent, checkSlotConflict }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within EventProvider");

  const { user } = useAuth();
  const { halls } = useBanquetMaster();

  // Apply RBAC filtering — property-based
  const filteredEvents = user?.allowedProperties?.includes("all") || user?.roleId === "role_admin"
    ? ctx._allEvents
    : ctx._allEvents.filter((e) => {
        const hall = halls.find((h) => h.name === e.hallName);
        if (!hall) return false;
        return user?.allowedProperties?.includes(hall.propertyId);
      });

  return {
    events: filteredEvents,
    addEvent: ctx.addEvent,
    updateEvent: ctx.updateEvent,
    confirmEvent: ctx.confirmEvent,
    cancelEvent: ctx.cancelEvent,
    checkSlotConflict: ctx.checkSlotConflict,
  };
};
