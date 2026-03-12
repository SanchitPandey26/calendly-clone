'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Clock, Video, Globe, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { getSlots, TimeSlot } from '@/services/booking';
import { getEventBySlug, EventType } from '@/services/events';
import { getAvailability, AvailabilitySlot } from '@/services/availability';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function DateSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const eventSlug = params.event_slug as string;
  
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [timezone, setTimezone] = useState('India Standard Time');
  const [currentTime, setCurrentTime] = useState('');
  const timezoneRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

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

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const [event, availData] = await Promise.all([
          getEventBySlug(eventSlug),
          getAvailability()
        ]);
        setEventType(event);
        setAvailability(availData);
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoadingEvent(false);
        setLoadingAvailability(false);
      }
    };
    if (eventSlug) {
      fetchEventData();
    }
  }, [eventSlug]);

  useEffect(() => {
    const updateTime = () => {
      const tz = TIMEZONES.find(t => t.label === timezone)?.id || 'Asia/Kolkata';
      try {
        const timeString = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: tz
        }).format(new Date()).toLowerCase();
        setCurrentTime(timeString);
      } catch(e) {
        setCurrentTime('');
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const dropdown = document.getElementById('timezone-dropdown');
      if (dropdown && dropdown.contains(e.target as Node)) return;
      
      if (isTimezoneOpen && timezoneRef.current && !timezoneRef.current.contains(e.target as Node)) {
        setIsTimezoneOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const handleScroll = (e: Event) => {
      const dropdown = document.getElementById('timezone-dropdown');
      if (dropdown && e.target && dropdown.contains(e.target as Node)) return;
      if (isTimezoneOpen) setIsTimezoneOpen(false); 
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isTimezoneOpen]);

  const toggleTimezone = () => {
    if (!isTimezoneOpen && timezoneRef.current) {
      const rect = timezoneRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        setDropdownStyle({
          position: 'fixed',
          left: rect.left,
          bottom: window.innerHeight - rect.top + 8,
          width: Math.max(rect.width, 320),
          zIndex: 50
        });
      } else {
        setDropdownStyle({
          position: 'fixed',
          left: rect.left,
          top: rect.bottom + 8,
          width: Math.max(rect.width, 320),
          zIndex: 50
        });
      }
    }
    setIsTimezoneOpen(!isTimezoneOpen);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday = 0

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDateClick = async (day: number) => {
    if (!eventType) return;
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
    setSelectedSlot(null);
    setLoadingSlots(true);
    
    try {
      // Format date as YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const fetchedSlots = await getSlots(eventType.id, dateStr);
      setSlots(fetchedSlots);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    let h = date.getUTCHours();
    const m = date.getUTCMinutes();
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${String(m).padStart(2, '0')}${ampm}`;
  };

  const handleNext = () => {
    if (selectedDate && selectedSlot) {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      router.push(`/user/${eventSlug}/form?date=${dateStr}&startTime=${selectedSlot.startTime}&endTime=${selectedSlot.endTime}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_1px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex flex-col md:flex-row max-w-[1060px] w-full relative overflow-hidden min-h-[600px]">
      {/* Powered by Calendly Ribbon */}
      <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden z-10 pointer-events-none">
        <div className="bg-gray-600 text-white text-[10px] font-bold py-1.5 px-10 transform rotate-45 translate-x-[34px] translate-y-[22px] text-center tracking-wider uppercase">
          Powered by<br/>Calendly
        </div>
      </div>

      {/* Left Panel */}
      <div className="w-full md:w-[380px] p-8 border-r border-gray-200 flex flex-col">
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#006bff] hover:bg-blue-50 transition-colors mb-6">
          <ArrowLeft size={20} />
        </button>
        <div className="text-gray-500 font-medium mb-1">Sanchit Pandey</div>
        <h1 className="text-[28px] font-bold text-gray-900 mb-6">{loadingEvent ? '...' : eventType?.name}</h1>
        
        <div className="flex items-center gap-3 text-gray-600 mb-4 font-medium">
          <Clock size={20} />
          <span>{loadingEvent ? '--' : eventType?.duration} min</span>
        </div>
        <div className="flex items-start gap-3 text-gray-600 font-medium">
          <Video size={20} className="mt-0.5" />
          <span className="leading-snug">Web conferencing details provided upon confirmation.</span>
        </div>

        <div className="mt-auto pt-8 flex gap-4 text-[14px] text-[#006bff]">
          <a href="#" className="hover:underline">Cookie settings</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </div>

      {/* Right Panel */}
      <div className={`p-8 flex-1 flex flex-col relative ${selectedDate ? 'md:flex-row gap-8' : ''}`}>
        <div className={`flex flex-col ${selectedDate ? 'md:w-[60%]' : 'w-full max-w-[500px] mx-auto'}`}>
          <h2 className="text-[20px] font-bold text-gray-900 mb-6">Select a Date & Time</h2>
          
          {/* Calendar Header */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <button onClick={handlePrevMonth} className="p-2 text-[#006bff] hover:bg-blue-50 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="text-[16px] font-medium w-32 text-center">
              {MONTHS[month]} {year}
            </div>
            <button onClick={handleNextMonth} className="p-2 text-[#006bff] hover:bg-blue-50 rounded-full transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-4 mb-8">
            {DAYS.map(day => (
              <div key={day} className="text-center text-[11px] font-semibold text-gray-500 tracking-wider">
                {day}
              </div>
            ))}
            
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
              const dateObj = new Date(year, month, day);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = dateObj < today;
              
              const dayOfWeekName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][dateObj.getDay()];
              const hasAvailability = availability.some(a => a.dayOfWeek === dayOfWeekName);
              const isAvailable = !isPast && hasAvailability && !loadingAvailability;

              return (
                <div key={day} className="flex justify-center">
                  <button
                    onClick={() => isAvailable && handleDateClick(day)}
                    disabled={!isAvailable}
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-medium transition-colors relative
                      ${isSelected ? 'bg-[#006bff] text-white' : 
                        isAvailable ? 'text-[#006bff] bg-blue-50 hover:bg-blue-100' : 
                        'text-gray-400 cursor-default'}
                    `}
                  >
                    {day}
                    {isAvailable && !isSelected && (
                      <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-gray-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Timezone */}
          <div className="mt-auto">
            <div className="text-[14px] font-bold text-gray-900 mb-2">Time zone</div>
            <button 
              ref={timezoneRef}
              onClick={toggleTimezone}
              className="flex items-center gap-2 text-[15px] text-gray-700 hover:text-gray-900 py-1 rounded-md transition-colors w-fit"
            >
              <Globe size={16} />
              {timezone} {currentTime ? `(${currentTime})` : ''}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`ml-1 transition-transform ${isTimezoneOpen ? 'rotate-180' : ''}`}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {isTimezoneOpen && (
              <div 
                id="timezone-dropdown"
                style={dropdownStyle} 
                className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-[280px] overflow-y-auto"
              >
                {TIMEZONES.map((tz) => (
                  <button
                    key={tz.label}
                    onClick={() => {
                      setTimezone(tz.label);
                      setIsTimezoneOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
                  >
                    <span className={`text-[15px] ${timezone === tz.label ? 'text-[#006bff] font-medium' : 'text-gray-700'}`}>
                      {tz.label}
                    </span>
                    {timezone === tz.label && <Check size={16} className="text-[#006bff]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Slots Panel */}
        {selectedDate && (
          <div className="md:w-[40%] flex flex-col pt-14">
            <div className="text-[16px] text-gray-700 mb-6">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[400px] custom-scrollbar">
              {loadingSlots ? (
                <div className="text-center text-gray-500 py-4">Loading...</div>
              ) : slots.length > 0 ? (
                slots.map((slot, i) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <div key={i} className="flex gap-2">
                      <button
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex-1 py-3.5 rounded-md border text-[15px] font-bold transition-all
                          ${isSelected 
                            ? 'bg-gray-600 border-gray-600 text-white w-1/2' 
                            : 'border-[#006bff] text-[#006bff] hover:border-[2px] hover:py-[13px] bg-white'
                          }
                        `}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                      {isSelected && (
                        <button 
                          onClick={handleNext}
                          className="flex-1 bg-[#006bff] text-white rounded-md font-bold text-[15px] hover:bg-blue-700 transition-colors"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-4">No slots available</div>
              )}
            </div>
          </div>
        )}

        {/* Troubleshoot Button */}
        {!selectedDate && (
          <div className="absolute bottom-8 right-8">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-[14px] font-medium text-gray-700 hover:border-gray-400 transition-colors bg-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              Troubleshoot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
