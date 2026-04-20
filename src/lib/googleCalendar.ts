/* 
 * Google Calendar API integration
 */
import axios from 'axios';
import { EventData } from '@/data/mockEvents';

const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

/**
 * Creates a Google Calendar event for a confirmed enquiry.
 * @param accessToken Google OAuth2 access token
 * @param eventData The enquiry data
 */
export const createCalendarEvent = async (accessToken: string, eventData: EventData) => {
  // Convert times to reliable ISO strings
  // Assuming date format is YYYY-MM-DD and startTime is "HH:MM AM/PM"
  try {
    const parseTime = (dateStr: string, timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const date = new Date(dateStr);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    };

    const startTimeISO = parseTime(eventData.date, eventData.startTime);
    const endTimeISO = parseTime(eventData.date, eventData.endTime);

    const description = `
Customer: ${eventData.customerName}
Phone: ${eventData.customerPhone}
Occasion: ${eventData.occasion}
Pax: ${eventData.pax}
Hall: ${eventData.hallName}
Notes: ${eventData.notes || 'N/A'}
    `.trim();

    const event = {
      summary: `${eventData.title} (${eventData.customerName})`,
      location: eventData.hallName,
      description: description,
      start: {
        dateTime: startTimeISO,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTimeISO,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: true,
      },
    };

    const response = await axios.post(CALENDAR_API_URL, event, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return { ok: true, data: response.data };
  } catch (error: any) {
    console.error('Error creating calendar event:', error?.response?.data || error.message);
    return { 
      ok: false, 
      error: error?.response?.data?.error?.message || 'Failed to sync with Google Calendar' 
    };
  }
};
