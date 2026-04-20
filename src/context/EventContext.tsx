import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { mockEvents, type EventData, hasSlotConflict } from "@/data/mockEvents";
import { useAuth } from "@/context/AuthContext";
import { useBanquetMaster } from "@/context/BanquetMasterContext";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { createCalendarEvent } from "@/lib/googleCalendar";
import { toast } from "sonner";

interface EventContextType {
  // Raw events (all, unfiltered) — used internally only
  _allEvents: EventData[];
  events: EventData[];
  addEvent: (event: EventData) => Promise<void>;
  updateEvent: (id: string, updates: Partial<EventData>) => Promise<{ ok: boolean; error?: string }>;
  confirmEvent: (id: string) => Promise<{ ok: boolean; error?: string }>;
  cancelEvent: (id: string) => { ok: boolean; error?: string };
  checkSlotConflict: (hallName: string, date: string, startTime: string, endTime: string, excludeId?: string) => boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, isAuthenticated } = useGoogleAuth();
  const [events, setEvents] = useState<EventData[]>(() => {
    const saved = localStorage.getItem("app_events");
    if (saved) {
      const parsed: EventData[] = JSON.parse(saved);
      // Migrate: ensure every event has selectedExtras (added later)
      return parsed.map(e => ({ selectedExtras: [], ...e }));
    }
    return mockEvents;
  });

  useEffect(() => {
    localStorage.setItem("app_events", JSON.stringify(events));
  }, [events]);

  const addEvent = async (event: EventData) => {
    setEvents((prev) => [event, ...prev]);
    
    // Sync to Google Calendar if status is confirmed
    if (event.status === "confirmed" && isAuthenticated && accessToken) {
      toast.info("Syncing with Google Calendar...");
      const result = await createCalendarEvent(accessToken, event);
      if (result.ok) {
        toast.success("Enquiry created and synced to Google Calendar!");
      } else {
        toast.warning(`Enquiry created locally, but Google Calendar sync failed: ${result.error}`);
      }
    }
  };

  const updateEvent = async (id: string, updates: Partial<EventData>): Promise<{ ok: boolean; error?: string }> => {
    let error: string | undefined;
    let targetEvent: EventData | undefined;

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        targetEvent = { ...e, ...updates };
        // Guard: confirmed + not editable → reject
        if (!e.isEditable && e.status === "confirmed" && !updates.isEditable) {
          error = "LOCKED: This enquiry is confirmed and cannot be edited.";
          return e;
        }
        return targetEvent;
      })
    );

    if (error) return { ok: false, error };

    // If it was just updated to confirmed (or edited while confirmed), sync it
    if (targetEvent && targetEvent.status === "confirmed" && isAuthenticated && accessToken) {
      toast.info("Updating Google Calendar...");
      const result = await createCalendarEvent(accessToken, targetEvent);
      if (result.ok) {
        toast.success("Enquiry updated and synced to Google Calendar!");
      } else {
        toast.warning(`Enquiry updated locally, but Google Calendar sync failed: ${result.error}`);
      }
    }

    return { ok: true };
  };

  /** Admin-only: move status DRAFT/TENTATIVE → CONFIRMED and lock the record */
  const confirmEvent = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    let conflict = false;
    let targetEvent: EventData | undefined;
    
    // First, check for conflicts and update state
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
    
    // After state update, sync to Google Calendar if authenticated
    if (isAuthenticated && accessToken && targetEvent) {
      toast.info("Syncing with Google Calendar...");
      const result = await createCalendarEvent(accessToken, targetEvent);
      if (result.ok) {
        toast.success("Enquiry confirmed and synced to Google Calendar!");
      } else {
        toast.warning(`Confirmed locally, but Google Calendar sync failed: ${result.error}`);
      }
    } else if (!isAuthenticated) {
      toast.warning("Enquiry confirmed locally, but Google Calendar is not connected.");
    } else {
      toast.success("Enquiry confirmed successfully.");
    }

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
