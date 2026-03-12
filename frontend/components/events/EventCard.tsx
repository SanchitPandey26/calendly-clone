'use client';

import { EventType } from '@/services/events';
import { Link, AlertCircle } from 'lucide-react';
import EventMenu from './EventMenu';

interface EventCardProps {
  event: EventType;
  onEdit: (event: EventType) => void;
  onDelete: (id: string) => void;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const handleCopyLink = () => {
    const url = `${window.location.origin}/user/${event.slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const isNewMeeting = event.name === 'New Meeting';

  // Generate a color based on the event name for the left border
  const colors = ['bg-[#8247f5]', 'bg-[#006bff]', 'bg-[#00a550]', 'bg-[#ff4f00]', 'bg-[#e53935]'];
  const colorIndex = event.name.length % colors.length;
  const borderColorClass = isNewMeeting ? 'bg-[#ff4f00]' : colors[colorIndex];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex relative">
      {/* Left colored stripe */}
      <div className={`w-1.5 ${borderColorClass} shrink-0 rounded-l-lg`}></div>
      
      <div className="flex-1 p-5 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="pt-1">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#006bff] focus:ring-[#006bff]" />
          </div>
          <div>
            <h3 className="text-[22px] font-semibold text-gray-900 mb-1 tracking-tight">{event.name}</h3>
            <div className="text-[15px] text-gray-500 flex items-center gap-1.5 mb-1">
              {isNewMeeting && <AlertCircle size={16} className="text-[#ff4f00]" />}
              <span>{event.duration} min</span>
              <span>•</span>
              <span>{isNewMeeting ? 'No location set' : 'Google Meet'}</span>
              <span>•</span>
              <span>One-on-One</span>
            </div>
            <p className="text-[15px] text-gray-500">
              Weekdays, 9 am - 5 pm
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isNewMeeting && (
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 text-[15px] font-medium text-gray-900 border border-gray-300 hover:border-gray-400 bg-white rounded-full transition-colors"
            >
              <Link size={16} className="text-gray-700" />
              Copy link
            </button>
          )}
          
          <EventMenu 
            eventSlug={event.slug}
            onEdit={() => onEdit(event)} 
            onDelete={() => {
              if (confirm('Are you sure you want to delete this event type?')) {
                onDelete(event.id);
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
}
