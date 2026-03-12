'use client';

import { useEffect, useState, useRef } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent, EventType } from '@/services/events';
import EventCard from '@/components/events/EventCard';
import CreateEventDrawer from '@/components/events/CreateEvenDrawer';
import { Search, Plus, ChevronDown, HelpCircle, UserPlus, ExternalLink, MoreVertical } from 'lucide-react';
import { useEventContext } from '@/context/EventContext';

export default function SchedulingPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isCreateDrawerOpen, editingEvent, openCreateDrawer, closeCreateDrawer } = useEventContext();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    const handleClickOutside = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveEvent = async (data: Partial<EventType>) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, data);
    } else {
      await createEvent(data as Omit<EventType, 'id'>);
    }
    await fetchEvents();
    closeCreateDrawer();
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      await fetchEvents();
    } catch (err) {
      console.error('Failed to delete event', err);
      alert('Failed to delete event');
    }
  };

  const openNewEventDrawer = () => {
    openCreateDrawer(null);
    setIsCreateMenuOpen(false);
  };

  const openEditDrawer = (event: EventType) => {
    openCreateDrawer(event);
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-6">
      {/* Top Navigation */}
      <div className="flex justify-end items-center mb-8 gap-4">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <UserPlus size={20} />
        </button>
        <button className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
            S
          </div>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Scheduling</h1>
          <HelpCircle size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
        
        <div className="relative" ref={createMenuRef}>
          <button 
            onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Create
            <ChevronDown size={16} className="ml-1" />
          </button>
          
          {isCreateMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Event type
              </div>
              <button 
                onClick={openNewEventDrawer}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col transition-colors"
              >
                <span className="font-medium text-blue-600">One-on-one</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  1 host <span className="text-gray-400">→</span> 1 invitee
                </span>
                <span className="text-sm text-gray-500">Good for coffee chats, 1:1 interviews, etc.</span>
              </button>
              <button disabled className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col transition-colors opacity-60 cursor-not-allowed">
                <span className="font-medium text-blue-600">Group</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  1 host <span className="text-gray-400">→</span> Multiple invitees
                </span>
                <span className="text-sm text-gray-500">Webinars, online classes, etc.</span>
              </button>
              <button disabled className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col transition-colors opacity-60 cursor-not-allowed">
                <span className="font-medium text-blue-600">Round robin</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  Rotating hosts <span className="text-gray-400">→</span> 1 invitee
                </span>
                <span className="text-sm text-gray-500">Distribute meetings between team members</span>
              </button>
              <button disabled className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col transition-colors opacity-60 cursor-not-allowed">
                <span className="font-medium text-blue-600">Collective</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  Multiple hosts <span className="text-gray-400">→</span> 1 invitee
                </span>
                <span className="text-sm text-gray-500">Panel interviews, group sales calls, etc.</span>
              </button>
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  More ways to meet
                </div>
                <button disabled className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col transition-colors opacity-60 cursor-not-allowed">
                  <span className="font-medium text-blue-600">One-off meeting</span>
                  <span className="text-sm text-gray-500">Offer time outside your normal schedule</span>
                </button>
                <button disabled className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col transition-colors opacity-60 cursor-not-allowed">
                  <span className="font-medium text-blue-600">Meeting poll</span>
                  <span className="text-sm text-gray-500">Let invitees vote on a time to meet</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button className="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-gray-900">
            Event types
          </button>
          <button disabled className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 opacity-60 cursor-not-allowed">
            Single-use links
          </button>
          <button disabled className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 opacity-60 cursor-not-allowed">
            Meeting polls
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search event types"
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
          <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
            <ExternalLink size={16} />
            View landing page
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Event List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
          <p className="text-gray-500">No event types found. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onEdit={openEditDrawer}
              onDelete={handleDeleteEvent}
            />
          ))}
        </div>
      )}

      <CreateEventDrawer 
        isOpen={isCreateDrawerOpen} 
        onClose={closeCreateDrawer} 
        onSave={handleSaveEvent}
        initialData={editingEvent}
      />
    </div>
  );
}
