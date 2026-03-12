'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle2, User, Calendar as CalendarIcon, Globe, Video } from 'lucide-react';
import { getEventBySlug, EventType } from '@/services/events';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const eventSlug = params.event_slug as string;
  
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const name = searchParams.get('name');

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const event = await getEventBySlug(eventSlug);
        setEventType(event);
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoadingEvent(false);
      }
    };
    if (eventSlug) {
      fetchEvent();
    }
  }, [eventSlug]);

  const formatDateTime = () => {
    if (!startTime || !endTime) return '';
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    const formatTime = (d: Date) => {
      let h = d.getUTCHours();
      const m = d.getUTCMinutes();
      const ampm = h >= 12 ? 'pm' : 'am';
      h = h % 12;
      h = h ? h : 12;
      return `${h}:${String(m).padStart(2, '0')}${ampm}`;
    };

    const dateFormatted = startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    return `${formatTime(startDate)} - ${formatTime(endDate)}, ${dateFormatted}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_8px_rgba(0,0,0,0.08)] border border-gray-200 max-w-[800px] w-full relative overflow-hidden min-h-[500px] flex flex-col">
      {/* Ribbon */}
      <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden z-10 pointer-events-none">
        <div className="bg-gray-600 text-white text-[10px] font-bold py-1.5 px-10 transform rotate-45 translate-x-[34px] translate-y-[22px] text-center tracking-wider uppercase">
          Powered by<br/>Calendly
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#00a550] text-white flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <h1 className="text-[24px] font-bold text-gray-900">You are scheduled</h1>
        </div>
        
        <p className="text-[15px] text-gray-700 mb-6">A calendar invitation has been sent to your email address.</p>
        
        <button className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full text-[14px] font-bold text-gray-700 hover:border-gray-400 transition-colors mb-10">
          Open Invitation
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </button>

        <div className="w-full max-w-[450px] border border-gray-200 rounded-lg p-6 text-left">
          <h2 className="text-[20px] font-bold text-gray-900 mb-6">{loadingEvent ? '...' : eventType?.name}</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-gray-600 font-medium">
              <User size={20} className="mt-0.5" />
              <span>{name || 'Sanchit Pandey'}</span>
            </div>
            <div className="flex items-start gap-3 text-gray-600 font-medium">
              <CalendarIcon size={20} className="mt-0.5" />
              <span>{formatDateTime()}</span>
            </div>
            <div className="flex items-start gap-3 text-gray-600 font-medium">
              <Globe size={20} className="mt-0.5" />
              <span>India Standard Time</span>
            </div>
            <div className="flex items-start gap-3 text-gray-600 font-medium">
              <Video size={20} className="mt-0.5" />
              <span>Web conferencing details to follow.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 pt-0 flex gap-4 text-[14px] text-[#006bff]">
        <a href="#" className="hover:underline">Cookie settings</a>
      </div>
    </div>
  );
}
