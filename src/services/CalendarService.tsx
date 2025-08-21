import React from 'react';
import { storage } from './StorageService';
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  category: string;
  assignedTo?: string;
  location?: string;
  priority?: string;
  isRecurring?: boolean;
  recurrencePattern?: {
    type: string;
    interval: number;
    endDate?: string;
    occurrences?: number;
  };
  hasConflict?: boolean;
}
class CalendarService {
  private storageKey = 'calendar_events';
  // Get all events
  getAllEvents(): CalendarEvent[] {
    return storage.get(this.storageKey, []);
  }
  // Get events for a specific date
  getEventsForDate(dateStr: string): CalendarEvent[] {
    const allEvents = this.getAllEvents();
    return allEvents.filter(event => event.date === dateStr);
  }
  // Add a new event
  addEvent(event: CalendarEvent): void {
    const allEvents = this.getAllEvents();
    // Check for conflicts
    const hasConflict = this.checkForConflicts(event, allEvents);
    const eventWithConflictFlag = {
      ...event,
      hasConflict
    };
    storage.save(this.storageKey, [...allEvents, eventWithConflictFlag]);
  }
  // Update an existing event
  updateEvent(eventId: string, updatedEvent: Partial<CalendarEvent>): void {
    const allEvents = this.getAllEvents();
    const updatedEvents = allEvents.map(event => {
      if (event.id === eventId) {
        const mergedEvent = {
          ...event,
          ...updatedEvent
        };
        // Re-check for conflicts
        const otherEvents = allEvents.filter(e => e.id !== eventId);
        const hasConflict = this.checkForConflicts(mergedEvent, otherEvents);
        return {
          ...mergedEvent,
          hasConflict
        };
      }
      return event;
    });
    storage.save(this.storageKey, updatedEvents);
  }
  // Delete an event
  deleteEvent(eventId: string): void {
    const allEvents = this.getAllEvents();
    const filteredEvents = allEvents.filter(event => event.id !== eventId);
    storage.save(this.storageKey, filteredEvents);
  }
  // Check for conflicts with other events
  private checkForConflicts(event: CalendarEvent, otherEvents: CalendarEvent[]): boolean {
    // Only check events on the same day
    const eventsOnSameDay = otherEvents.filter(e => e.date === event.date);
    // Convert times to minutes for easier comparison
    const eventStart = this.timeToMinutes(event.startTime);
    const eventEnd = this.timeToMinutes(event.endTime);
    return eventsOnSameDay.some(otherEvent => {
      const otherStart = this.timeToMinutes(otherEvent.startTime);
      const otherEnd = this.timeToMinutes(otherEvent.endTime);
      // Check if events overlap
      return eventStart >= otherStart && eventStart < otherEnd ||
      // event starts during other event
      eventEnd > otherStart && eventEnd <= otherEnd ||
      // event ends during other event
      eventStart <= otherStart && eventEnd >= otherEnd // event completely contains other event
      ;
    });
  }
  // Helper to convert time string (HH:MM) to minutes since midnight
  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
export const calendarService = new CalendarService();