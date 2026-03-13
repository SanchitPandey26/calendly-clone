'use client';

import { useState, useEffect } from 'react';
import { getAvailability, createAvailability, updateAvailability, deleteAvailability, updateTimezoneAll, AvailabilitySlot } from '@/services/availability';
import { ChevronDown, Plus, X, RefreshCw, Globe, Check } from 'lucide-react';
import { useRef } from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast, getErrorMessage } from '@/hooks/useToast';

const DAYS_OF_WEEK = [
  { id: 'SUNDAY', label: 'S' },
  { id: 'MONDAY', label: 'M' },
  { id: 'TUESDAY', label: 'T' },
  { id: 'WEDNESDAY', label: 'W' },
  { id: 'THURSDAY', label: 'T' },
  { id: 'FRIDAY', label: 'F' },
  { id: 'SATURDAY', label: 'S' },
];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('India Standard Time');
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
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
    fetchAvailability();
  }, []);

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
      const dropdown = document.getElementById('timezone-dropdown-availability');
      if (dropdown && dropdown.contains(e.target as Node)) return;
      
      if (isTimezoneOpen && timezoneRef.current && !timezoneRef.current.contains(e.target as Node)) {
        setIsTimezoneOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const handleScroll = (e: Event) => {
      const dropdown = document.getElementById('timezone-dropdown-availability');
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

  const fetchAvailability = async () => {
    try {
      const data = await getAvailability();
      setSlots(data);
      if (data.length > 0 && data[0].timezone) {
        setTimezone(data[0].timezone);
      }
    } catch (error) {
      showError('Failed to load availability. Please refresh the page.');
      console.error('Failed to fetch availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (dayOfWeek: string) => {
    try {
      const newSlot = await createAvailability({
        dayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
        timezone,
      });
      setSlots([...slots, newSlot]);
      showSuccess('Availability slot added!');
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to add time slot.'));
      console.error('Failed to add slot:', error);
    }
  };

  const handleUpdateSlot = async (id: string, updates: Partial<AvailabilitySlot>) => {
    try {
      const updatedSlot = await updateAvailability(id, updates);
      setSlots(slots.map(s => s.id === id ? updatedSlot : s));
      showSuccess('Your settings have been saved!');
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to update time slot.'));
      console.error('Failed to update slot:', error);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await deleteAvailability(id);
      setSlots(slots.filter(s => s.id !== id));
      showSuccess('Time slot removed.');
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to remove time slot.'));
      console.error('Failed to delete slot:', error);
    }
  };

  const getSlotsForDay = (dayOfWeek: string) => {
    return slots.filter(s => s.dayOfWeek === dayOfWeek).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes}${ampm}`;
  };

  const parseTime = (time12: string) => {
    const match = time12.match(/(\d+):(\d+)(am|pm)/);
    if (!match) return '09:00';
    let [_, h, m, ampm] = match;
    let hours = parseInt(h, 10);
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${m}`;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const ampm = h < 12 ? 'am' : 'pm';
        const timeStr = `${h12}:${m.toString().padStart(2, '0')}${ampm}`;
        options.push(timeStr);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 pt-16 md:pt-8 relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-6">Availability</h1>
        
        <div className="flex items-center gap-8 border-b border-gray-200">
          <button className="pb-3 text-[15px] font-medium text-[#006bff] border-b-2 border-[#006bff]">
            Schedules
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="text-[13px] text-gray-500 mb-1">Schedule</div>
          <div className="text-[22px] font-bold text-gray-900 mb-2">
            Working hours (default)
          </div>
        </div>

        {/* Content */}
        <div className="flex">
          {/* Weekly Hours */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw size={18} className="text-gray-500" />
              <h2 className="text-[16px] font-semibold text-gray-900">Weekly hours</h2>
            </div>
            <p className="text-[14px] text-gray-500 mb-8">Set when you are typically available for meetings</p>

            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const daySlots = getSlotsForDay(day.id);
                const hasSlots = daySlots.length > 0;

                return (
                  <div key={day.id} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#006bff] text-white flex items-center justify-center text-[14px] font-medium shrink-0 mt-1">
                      {day.label}
                    </div>
                    
                    <div className="flex-1">
                      {!hasSlots ? (
                        <div className="flex items-center gap-3 h-10">
                          <span className="text-[15px] text-gray-500">Unavailable</span>
                          <button 
                            onClick={() => handleAddSlot(day.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            title={`New interval for ${day.id.charAt(0) + day.id.slice(1).toLowerCase()}`}
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {daySlots.map((slot, index) => (
                            <div key={slot.id} className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <select 
                                  value={formatTime(slot.startTime)}
                                  onChange={(e) => handleUpdateSlot(slot.id, { startTime: parseTime(e.target.value) })}
                                  className="h-10 px-2 sm:px-3 border border-gray-200 rounded-md text-[14px] sm:text-[15px] text-gray-700 bg-white focus:outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff] w-[85px] sm:w-[100px]"
                                >
                                  {timeOptions.map(time => (
                                    <option key={`start-${time}`} value={time}>{time}</option>
                                  ))}
                                </select>
                                <span className="text-gray-400">-</span>
                                <select 
                                  value={formatTime(slot.endTime)}
                                  onChange={(e) => handleUpdateSlot(slot.id, { endTime: parseTime(e.target.value) })}
                                  className="h-10 px-2 sm:px-3 border border-gray-200 rounded-md text-[14px] sm:text-[15px] text-gray-700 bg-white focus:outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff] w-[85px] sm:w-[100px]"
                                >
                                  {timeOptions.map(time => (
                                    <option key={`end-${time}`} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                  title={`Remove ${day.id.charAt(0) + day.id.slice(1).toLowerCase()} interval ${index + 1}`}
                                >
                                  <X size={18} />
                                </button>
                                {index === daySlots.length - 1 && (
                                  <button 
                                    onClick={() => handleAddSlot(day.id)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                    title={`New interval for ${day.id.charAt(0) + day.id.slice(1).toLowerCase()}`}
                                  >
                                    <Plus size={18} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button 
                ref={timezoneRef}
                onClick={toggleTimezone}
                className="flex items-center gap-2 text-[15px] text-gray-700 hover:text-gray-900 py-1 rounded-md transition-colors w-fit font-medium"
              >
                <Globe size={16} />
                {timezone} {currentTime ? `(${currentTime})` : ''}
                <ChevronDown size={16} className={`ml-1 transition-transform ${isTimezoneOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTimezoneOpen && (
                <div 
                  id="timezone-dropdown-availability"
                  style={dropdownStyle} 
                  className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-[280px] overflow-y-auto"
                >
                  {TIMEZONES.map((tz) => (
                    <button
                      key={tz.label}
                      onClick={async () => {
                        const newTz = tz.label;
                        setTimezone(newTz);
                        setIsTimezoneOpen(false);
                        try {
                          await updateTimezoneAll(newTz);
                          setSlots(slots.map(s => ({ ...s, timezone: newTz })));
                          showSuccess('Timezone updated successfully!');
                        } catch (error) {
                          showError(getErrorMessage(error, 'Failed to update timezone.'));
                          console.error('Failed to update timezone for all slots', error);
                        }
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

          {/* Date-specific hours — commented out for future implementation */}
          {/* <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-gray-500" />
                <h2 className="text-[16px] font-semibold text-gray-900">Date-specific hours</h2>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-full text-[14px] font-medium text-gray-700 hover:border-gray-400 transition-colors">
                <Plus size={16} />
                Hours
              </button>
            </div>
            <p className="text-[14px] text-gray-500">Adjust hours for specific days</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
