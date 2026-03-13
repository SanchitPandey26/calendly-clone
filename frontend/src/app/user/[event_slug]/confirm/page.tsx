'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle2, User, Calendar as CalendarIcon, Globe, Video, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { getEventBySlug, EventType } from '@/services/events';
import { getAvailability } from '@/services/availability';
import PoweredByRibbon from '@/components/ui/PoweredByRibbon';
import { formatTimeInTimezone } from '@/src/utils/timezoneUtils';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const eventSlug = params.event_slug as string;

  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const name = searchParams.get('name');
  const tzLabel = searchParams.get('tz') || 'India Standard Time';

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

  const formatDateTime = () => {
    if (!startTime || !endTime) return '';
    const startDate = new Date(startTime);

    const startFormatted = formatTimeInTimezone(startTime, availTzId, selectedTzId);
    const endFormatted = formatTimeInTimezone(endTime, availTzId, selectedTzId);

    const dateFormatted = startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    return `${startFormatted} - ${endFormatted}, ${dateFormatted}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_8px_rgba(0,0,0,0.08)] border border-gray-200 max-w-[800px] w-full relative overflow-hidden min-h-[500px] flex flex-col">
      <PoweredByRibbon />

      <div className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#00a550] text-white flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <h1 className="text-[24px] font-bold text-gray-900">You are scheduled</h1>
        </div>



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
              <span>{tzLabel}</span>
            </div>
            <div className="flex items-start gap-3 text-gray-600 font-medium">
              <Video size={20} className="mt-0.5" />
              <span>Web conferencing details to follow.</span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
