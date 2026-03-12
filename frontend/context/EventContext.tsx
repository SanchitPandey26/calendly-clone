'use client';

import { EventType } from '@/services/events';
import React, { createContext, useContext, useState } from 'react';

interface EventContextType {
  isCreateDrawerOpen: boolean;
  editingEvent: EventType | null;
  openCreateDrawer: (event?: EventType | null) => void;
  closeCreateDrawer: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);

  const openCreateDrawer = (event: EventType | null = null) => {
    setEditingEvent(event);
    setIsCreateDrawerOpen(true);
  };
  const closeCreateDrawer = () => {
    setIsCreateDrawerOpen(false);
    setEditingEvent(null);
  };

  return (
    <EventContext.Provider value={{ isCreateDrawerOpen, editingEvent, openCreateDrawer, closeCreateDrawer }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
}
