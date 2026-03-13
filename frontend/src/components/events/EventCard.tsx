'use client';

import { useState } from 'react';
import { EventType } from '@/services/events';
import { AvailabilitySlot } from '@/services/availability';
import { Link, Check } from 'lucide-react';
import EventMenu from './EventMenu';

interface EventCardProps {
  event: EventType;
  availability: AvailabilitySlot[];
  onEdit: (event: EventType) => void;
  onDelete: (event: EventType) => void;
}

export default function EventCard({ event, availability, onEdit, onDelete }: EventCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/user/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  const borderColorClass = 'bg-[#8247f5]'; // Consistent purple color

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12;
    return `${h}${minutes === '00' ? '' : ':' + minutes} ${ampm}`;
  };

  const formatAvailability = () => {
    if (!availability || availability.length === 0) return 'No availability set';
    
    // Sort logic to make sure the days display in correct order: Mon, Tue...
    const dayOrder: Record<string, number> = {
      'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 7
    };
    
    // Use a Set to get unique days, as there could be multiple slots per day
    const activeDaysSet = new Set(availability.map(a => a.dayOfWeek));
    const activeDays = Array.from(activeDaysSet).sort((a, b) => dayOrder[a] - dayOrder[b]);
    
    const isWeekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].every(d => activeDays.includes(d)) && activeDays.length === 5;
    
    const daysMapping: Record<string, string> = {
      'MONDAY': 'Mon', 'TUESDAY': 'Tue', 'WEDNESDAY': 'Wed', 'THURSDAY': 'Thu', 'FRIDAY': 'Fri', 'SATURDAY': 'Sat', 'SUNDAY': 'Sun'
    };
    
    const daysStr = isWeekdays ? 'Weekdays' : activeDays.map(d => daysMapping[d]).join(', ');
    
    const firstSlot = availability[0];
    const allSameTime = availability.every(a => a.startTime === firstSlot.startTime && a.endTime === firstSlot.endTime);
    
    if (allSameTime) {
      return `${daysStr}, ${formatTime(firstSlot.startTime)} - ${formatTime(firstSlot.endTime)}`;
    } else {
      return `${daysStr}, hours vary`;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-100 transition-shadow flex relative">
      {/* Left colored stripe */}
      <div className={`w-1.5 ${borderColorClass} shrink-0 rounded-l-lg`}></div>
      
      <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-[18px] sm:text-[22px] font-semibold text-gray-900 mb-1 tracking-tight">{event.name}</h3>
          <div className="text-[15px] text-gray-500 mb-0.5">
            {event.duration} min • Google Meet • One-on-One
          </div>
          <div className="text-[15px] text-gray-500">
            {formatAvailability()}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-4 py-2 text-[15px] font-medium border rounded-full transition-colors ${
              copied 
                ? 'bg-[#00a550] border-[#00a550] text-white' 
                : 'text-gray-900 border-gray-300 hover:border-gray-400 hover:cursor-pointer bg-white'
            }`}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied!
              </>
            ) : (
              <>
                <Link size={16} className="text-gray-700" />
                Copy link
              </>
            )}
          </button>
          
          <EventMenu 
            eventSlug={event.slug}
            onEdit={() => onEdit(event)} 
            onDelete={() => onDelete(event)} 
          />
        </div>
      </div>
    </div>
  );
}
