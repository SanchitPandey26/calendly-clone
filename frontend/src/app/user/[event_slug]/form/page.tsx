'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, Video, Calendar as CalendarIcon, Globe } from 'lucide-react';
import { createBooking } from '@/services/booking';
import { getEventBySlug, EventType } from '@/services/events';
import { getAvailability } from '@/services/availability';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast, getErrorMessage } from '@/hooks/useToast';
import PoweredByRibbon from '@/components/ui/PoweredByRibbon';
import { formatTimeInTimezone } from '@/src/utils/timezoneUtils';

export default function BookingFormPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventSlug = params.event_slug as string;

  const dateStr = searchParams.get('date');
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const tzLabel = searchParams.get('tz') || 'India Standard Time';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({});
  const { toasts, removeToast, showError } = useToast();

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [availTzId, setAvailTzId] = useState('Asia/Kolkata');

  const TIMEZONES = [
    { label: 'India Standard Time', id: 'Asia/Kolkata' },
    { label: 'Eastern Time - US & Canada', id: 'America/New_York' },
    { label: 'Central Time - US & Canada', id: 'America/Chicago' },
    { label: 'Mountain Time - US & Canada', id: 'America/Denver' },
    { label: 'Pacific Time - US & Canada', id: 'America/Los_Angeles' },
    { label: 'Greenwich Mean Time', id: 'Europe/London' },
    { label: 'Central European Time', id: 'Europe/Paris' },
    { label: 'Australian Eastern Time', id: 'Australia/Sydney' },
  ];

  const selectedTzId = TIMEZONES.find(t => t.label === tzLabel)?.id || 'Asia/Kolkata';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [event, availData] = await Promise.all([
          getEventBySlug(eventSlug),
          getAvailability()
        ]);
        setEventType(event);
        if (availData.length > 0 && availData[0].timezone) {
          const foundTz = TIMEZONES.find(t => t.label === availData[0].timezone);
          setAvailTzId(foundTz?.id || availData[0].timezone);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingEvent(false);
      }
    };
    if (eventSlug) {
      fetchData();
    }
  }, [eventSlug]);

  // Format date and time for display using the selected timezone
  const formatDateTime = () => {
    if (!startTime || !endTime) return '';
    const startDate = new Date(startTime);

    const startFormatted = formatTimeInTimezone(startTime, availTzId, selectedTzId);
    const endFormatted = formatTimeInTimezone(endTime, availTzId, selectedTzId);

    const dateFormatted = startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    return `${startFormatted} - ${endFormatted}, ${dateFormatted}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const errors: { name?: string; email?: string } = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email.';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    if (!eventType) return;
    setLoading(true);
    try {
      await createBooking({
        eventTypeId: eventType.id,
        startTime: startTime!,
        endTime: endTime!,
        inviteeName: name,
        inviteeEmail: email
      });
      router.push(`/user/${eventSlug}/confirm?date=${dateStr}&startTime=${startTime}&endTime=${endTime}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&tz=${encodeURIComponent(tzLabel)}`);
    } catch (error: unknown) {
      const resp = (error as { response?: { status?: number } })?.response;
      if (resp?.status === 409) {
        showError('This slot is no longer available. Please select another one.');
        setTimeout(() => router.push(`/user/${eventSlug}`), 2000);
      } else {
        showError(getErrorMessage(error, 'Booking failed. Please try again.'));
      }
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex flex-col md:flex-row max-w-[1060px] w-full relative overflow-hidden min-h-[500px] md:min-h-[600px]">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <PoweredByRibbon />

      {/* Left Panel */}
      <div className="w-full md:w-[380px] p-4 sm:p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
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
          <span>{tzLabel}</span>
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
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff] ${formErrors.name ? 'border-red-400' : 'border-gray-300'}`}
            />
            {formErrors.name && <p className="text-[13px] text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-[14px] font-bold text-gray-900 mb-2">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff] ${formErrors.email ? 'border-red-400' : 'border-gray-300'}`}
            />
            {formErrors.email && <p className="text-[13px] text-red-500 mt-1">{formErrors.email}</p>}
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
