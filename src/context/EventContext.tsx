import { createContext, useContext, useState, ReactNode } from "react";
import { mockEvents, type EventData } from "@/data/mockEvents";

interface EventContextType {
  events: EventData[];
  addEvent: (event: EventData) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<EventData[]>(mockEvents);

  const addEvent = (event: EventData) => {
    setEvents((prev) => [event, ...prev]);
  };

  return (
    <EventContext.Provider value={{ events, addEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within EventProvider");
  return ctx;
};
