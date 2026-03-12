'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, Video, Calendar as CalendarIcon, Globe } from 'lucide-react';
import { createBooking } from '@/services/booking';
import { getEventBySlug, EventType } from '@/services/events';

export default function BookingFormPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventSlug = params.event_slug as string;
  
  const dateStr = searchParams.get('date');
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Format date and time for display
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventType) return;
    setLoading(true);
    try {
      await createBooking({
        eventTypeId: eventType.id,
        startTime: startTime!,
        endTime: endTime!,
        inviteeName: name,
        inviteeEmail: email,
        notes
      });
      router.push(`/user/${eventSlug}/confirm?date=${dateStr}&startTime=${startTime}&endTime=${endTime}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex flex-col md:flex-row max-w-[1060px] w-full relative overflow-hidden min-h-[600px]">
      {/* Ribbon */}
      <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden z-10 pointer-events-none">
        <div className="bg-gray-600 text-white text-[10px] font-bold py-1.5 px-10 transform rotate-45 translate-x-[34px] translate-y-[22px] text-center tracking-wider uppercase">
          Powered by<br/>Calendly
        </div>
      </div>

      {/* Left Panel */}
      <div className="w-full md:w-[380px] p-8 border-r border-gray-200 flex flex-col">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#006bff] hover:bg-blue-50 transition-colors mb-6">
          <ArrowLeft size={20} />
        </button>
        <div className="text-gray-500 font-medium mb-1">Sanchit Pandey</div>
        <h1 className="text-[28px] font-bold text-gray-900 mb-6">{loadingEvent ? '...' : eventType?.name}</h1>
        
        <div className="flex items-center gap-3 text-gray-600 mb-4 font-medium">
          <Clock size={20} />
          <span>{loadingEvent ? '--' : eventType?.duration} min</span>
        </div>
        <div className="flex items-start gap-3 text-gray-600 mb-4 font-medium">
          <Video size={20} className="mt-0.5" />
          <span className="leading-snug">Web conferencing details provided upon confirmation.</span>
        </div>
        <div className="flex items-start gap-3 text-gray-600 mb-4 font-medium">
          <CalendarIcon size={20} className="mt-0.5" />
          <span className="leading-snug">{formatDateTime()}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 font-medium">
          <Globe size={20} />
          <span>India Standard Time</span>
        </div>

        <div className="mt-auto pt-8 flex gap-4 text-[14px] text-[#006bff]">
          <a href="#" className="hover:underline">Cookie settings</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </div>

      {/* Right Panel */}
      <div className="p-8 flex-1">
        <h2 className="text-[20px] font-bold text-gray-900 mb-6">Enter Details</h2>
        
        <form onSubmit={handleSubmit} className="max-w-[400px]">
          <div className="mb-4">
            <label className="block text-[14px] font-bold text-gray-900 mb-2">Name *</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff]"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-[14px] font-bold text-gray-900 mb-2">Email *</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff]"
            />
          </div>

          <button type="button" className="text-[#006bff] font-medium text-[14px] border border-[#006bff] rounded-full px-4 py-1.5 hover:bg-blue-50 transition-colors mb-6">
            Add Guests
          </button>

          <div className="mb-6">
            <label className="block text-[14px] font-bold text-gray-900 mb-2">Please share anything that will help prepare for our meeting.</label>
            <textarea 
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff] resize-y"
            ></textarea>
          </div>

          <div className="text-[12px] text-gray-600 mb-6 leading-relaxed">
            By proceeding, you confirm that you have read and agree to <br/>
            <a href="#" className="text-[#006bff] hover:underline font-medium">Calendly's Terms of Use</a> and <a href="#" className="text-[#006bff] hover:underline font-medium">Privacy Notice</a>.
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#006bff] text-white font-bold text-[15px] rounded-full px-6 py-3 hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            {loading ? 'Scheduling...' : 'Schedule Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
