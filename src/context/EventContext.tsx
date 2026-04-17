import { createContext, useContext, useState, ReactNode } from "react";
import { mockEvents, type EventData } from "@/data/mockEvents";
import { useAuth } from "@/context/AuthContext";
import { useBanquetMaster } from "@/context/BanquetMasterContext";

interface EventContextType {
  events: EventData[];
  addEvent: (event: EventData) => void;
  updateEvent: (id: string, updates: Partial<EventData>) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<EventData[]>(mockEvents);

  const addEvent = (event: EventData) => {
    setEvents((prev) => [event, ...prev]);
  };

  const updateEvent = (id: string, updates: Partial<EventData>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within EventProvider");

  const { user } = useAuth();
  const { halls } = useBanquetMaster();
  
  // Apply RBAC filtering. If user has 'all', they see everything. Otherwise just their properties.
  const filteredEvents = user?.allowedProperties?.includes("all")
    ? ctx.events
    : ctx.events.filter((e) => {
        const hall = halls.find((h) => h.name === e.hallName);
        if (!hall) return false;
        return user?.allowedProperties?.includes(hall.propertyId);
      });

  return { ...ctx, events: filteredEvents };
};
