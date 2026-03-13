'use client';

import { useEffect, useState } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent, EventType } from '@/services/events';
import { getAvailability, AvailabilitySlot } from '@/services/availability';
import EventCard from '@/components/events/EventCard';
import CreateEventDrawer from '@/components/events/CreateEventDrawer';
import { Search, Plus } from 'lucide-react';
import { useEventContext } from '@/context/EventContext';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast, getErrorMessage } from '@/hooks/useToast';

export default function SchedulingPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [slugError, setSlugError] = useState('');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);
  
  const { isCreateDrawerOpen, editingEvent, openCreateDrawer, closeCreateDrawer } = useEventContext();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [eventsData, availabilityData] = await Promise.all([
        getEvents(),
        getAvailability()
      ]);
      setEvents(eventsData);
      setAvailability(availabilityData);
    } catch (err) {
      showError('Failed to load events. Please refresh the page.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSaveEvent = async (data: Partial<EventType>) => {
    setSlugError('');
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
        showSuccess('Event updated successfully!');
      } else {
        await createEvent(data as Omit<EventType, 'id'>);
        showSuccess('Event created successfully!');
      }
      await fetchEvents();
      closeCreateDrawer();
    } catch (err: unknown) {
      const resp = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      if (resp?.status === 409) {
        setSlugError('This URL slug is already taken. Please choose a different one.');
      } else {
        showError(getErrorMessage(err, 'Failed to save event.'));
      }
    }
  };

  const handleDeleteClick = (event: EventType) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent(eventToDelete.id);
      await fetchEvents();
      showSuccess('Event deleted successfully!');
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to delete event.'));
      console.error('Failed to delete event', err);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const openEditDrawer = (event: EventType) => {
    openCreateDrawer(event);
  };

  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 pt-16 md:pt-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Top Navigation */}
      <div className="flex justify-end items-center mb-8 gap-4">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
            S
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Scheduling</h1>
        
        <button 
          onClick={() => openCreateDrawer(null)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button className="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-gray-900">
            Event types
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-full sm:max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search event types"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
        />
      </div>

      {/* User Row */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
            S
          </div>
          <span className="font-medium text-gray-900">Sanchit Pandey</span>
        </div>
        <div className="flex items-center gap-4">
          {/* View landing page — commented out for future implementation */}
          {/* <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
            <ExternalLink size={16} />
            View landing page
          </button> */}
        </div>
      </div>

      {/* Event List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
          <p className="text-gray-500">
            {searchQuery ? 'No event types match your search.' : 'No event types found. Create one to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              availability={availability}
              onEdit={openEditDrawer}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <CreateEventDrawer 
        isOpen={isCreateDrawerOpen} 
        onClose={() => { closeCreateDrawer(); setSlugError(''); }}
        onSave={handleSaveEvent}
        initialData={editingEvent}
        slugError={slugError}
      />

      {/* Delete Event Modal */}
      {deleteModalOpen && eventToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-start justify-center">
          <div className="bg-white rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100 w-full max-w-[460px] p-8 m-4 mt-32">
            <h2 className="text-[22px] font-bold text-[#1a1a1a] mb-6">Delete {eventToDelete.name}?</h2>
            
            <p className="text-[16px] text-[#4d5055] mb-8 leading-relaxed">
              Users will be unable to schedule further meetings with deleted event types. Meetings previously scheduled will also be deleted.
            </p>

            <div className="flex items-center gap-4">
              <button 
                onClick={closeDeleteModal}
                className="flex-1 py-3 px-6 border border-[#006bff] rounded-full text-[15px] font-bold text-[#1a1a1a] hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteEvent}
                className="flex-1 py-3 px-6 bg-[#d0401b] hover:bg-[#b03010] text-white rounded-full text-[15px] font-bold transition-colors cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
