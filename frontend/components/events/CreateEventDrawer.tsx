'use client';

import { EventType } from '@/services/events';
import { getAvailability, AvailabilitySlot } from '@/services/availability';
import { X, ChevronDown, ChevronUp, Video, Pencil, RotateCcw, Link } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CreateEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<EventType>) => Promise<void>;
  initialData?: EventType | null;
  slugError?: string;
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export default function CreateEventDrawer({ isOpen, onClose, onSave, initialData, slugError }: CreateEventDrawerProps) {
  const [name, setName] = useState('New Meeting');
  const [slug, setSlug] = useState('new-meeting');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [duration, setDuration] = useState(30);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    if (isOpen) {
      getAvailability().then(setAvailability).catch(console.error);

      if (initialData) {
        setName(initialData.name);
        setSlug(initialData.slug);
        setIsSlugManual(true);
        setIsEditingSlug(false);
        setDuration(initialData.duration);
        setIsCustomDuration(![15, 30, 45, 60].includes(initialData.duration));
      } else {
        setName('New Meeting');
        setSlug('new-meeting');
        setIsSlugManual(false);
        setIsEditingSlug(false);
        setDuration(30);
        setIsCustomDuration(false);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({ name, slug, duration });
    } catch (error) {
      console.error('Failed to save event', error);
      alert('Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    
    const dayOrder: Record<string, number> = {
      'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 7
    };
    
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
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header Content */}
        <div className="px-8 pt-8 pb-6 relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 transition-colors p-1"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
          
          <div className="text-[14px] font-bold text-gray-500 mb-2 tracking-wide">Event type</div>
          
          <div className="flex items-center gap-3 mb-1">
            <div className="w-[18px] h-[18px] bg-[#8247f5] rounded-full shrink-0"></div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!isSlugManual) {
                  setSlug(slugify(e.target.value));
                }
              }}
              className="text-[26px] font-bold text-[#1a1a1a] bg-transparent border-none p-0 focus:ring-0 w-full placeholder-gray-300"
              placeholder="Event Name"
            />
          </div>
          <div className="text-[15px] text-gray-500 ml-8 font-medium">One-on-One</div>
        </div>
        
        <div className="flex-1 overflow-y-auto border-t border-gray-200">
          
          {/* Duration Section - Expanded */}
          <div className="px-8 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-bold text-[#1a1a1a]">Duration</h3>
              <ChevronUp size={20} className="text-gray-500" />
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <select
                  value={isCustomDuration ? 'custom' : (duration === 60 ? '1 hr' : `${duration} min`)}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomDuration(true);
                      // Keep the old duration around for the custom input
                    } else {
                      setIsCustomDuration(false);
                      const val = e.target.value === '1 hr' ? 60 : parseInt(e.target.value, 10);
                      setDuration(val);
                    }
                  }}
                  className={`w-full h-11 pl-4 pr-10 bg-white border rounded-lg text-[15px] appearance-none focus:outline-none transition-colors ${isCustomDuration ? 'border-gray-300' : 'border-[#006bff] ring-1 ring-[#006bff]'} cursor-pointer`}
                >
                  <option value="15 min">15 min</option>
                  <option value="30 min">30 min</option>
                  <option value="45 min">45 min</option>
                  <option value="1 hr">1 hr</option>
                  <option value="custom">Custom</option>
                </select>
                <ChevronDown size={18} className="absolute right-3.5 top-3 text-[#006bff] pointer-events-none" />
              </div>

              {isCustomDuration && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full h-11 px-4 border border-[#006bff] ring-1 ring-[#006bff] rounded-lg text-[15px] focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <div className="w-full h-11 px-4 border border-gray-300 rounded-lg flex items-center justify-between bg-white text-[15px] text-gray-700">
                      min
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* URL Slug Section */}
          <div className="px-8 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-bold text-[#1a1a1a] flex items-center gap-2">
                <Link size={16} className="text-gray-500" />
                URL Slug
              </h3>
              {isSlugManual && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugManual(false);
                    setIsEditingSlug(false);
                    setSlug(slugify(name));
                  }}
                  className="text-[13px] text-[#006bff] hover:text-blue-700 flex items-center gap-1 font-medium"
                  title="Reset to auto-generated slug"
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <span className="text-[13px] text-gray-400 pl-3 pr-1 shrink-0 select-none">calendly.com/user/</span>
                {isEditingSlug ? (
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setIsSlugManual(true);
                    }}
                    onBlur={() => setIsEditingSlug(false)}
                    autoFocus
                    className="flex-1 text-[14px] text-[#1a1a1a] font-medium bg-transparent border-none p-0 py-2.5 pr-3 focus:ring-0 focus:outline-none"
                  />
                ) : (
                  <span className="flex-1 text-[14px] text-[#1a1a1a] font-medium py-2.5 pr-3 truncate">
                    {slug || <span className="text-gray-400 italic">type-a-name</span>}
                  </span>
                )}
              </div>
              {!isEditingSlug && (
                <button
                  type="button"
                  onClick={() => setIsEditingSlug(true)}
                  className="p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
                  title="Edit slug"
                >
                  <Pencil size={15} />
                </button>
              )}
            </div>
            {slugError && (
              <p className="text-[13px] text-red-500 mt-2 font-medium">{slugError}</p>
            )}
          </div>

          {/* Location Section - Collapsed */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[16px] font-bold text-[#1a1a1a]">Location</h3>
            </div>
            <div className="text-[15px] text-[#1a1a1a] flex items-center gap-2">
              <div className="flex items-center justify-center text-gray-600 bg-gray-100 p-1.5 rounded-full">
                <Video size={14} />
              </div>
              Google Meet
            </div>
          </div>

          {/* Availability Section - Collapsed */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[16px] font-bold text-[#1a1a1a]">Availability</h3>
            </div>
            <div className="text-[15px] text-[#5e6677]">
              {formatAvailability()}
            </div>
          </div>

          {/* Host Section - Collapsed */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[16px] font-bold text-[#1a1a1a]">Host</h3>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-[#1a1a1a]">
                S
              </div>
              <div className="text-[15px] text-[#5e6677]">Sanchit Pandey (you)</div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end bg-white">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="px-6 py-2.5 bg-[#006bff] text-white font-bold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 text-[15px]"
          >
            {isSubmitting ? 'Saving...' : 'Create'}
          </button>
        </div>
      </div>
    </>
  );
}
