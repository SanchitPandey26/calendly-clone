'use client';

import { useState, useEffect } from 'react';
import { getAvailability, createAvailability, updateAvailability, deleteAvailability, AvailabilitySlot } from '@/services/availability';
import { ChevronDown, MoreVertical, Plus, X, Copy, CheckCircle2, List, Calendar as CalendarIcon, RefreshCw, CalendarDays } from 'lucide-react';

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
  const [showToast, setShowToast] = useState(false);
  const [timezone, setTimezone] = useState('India Standard Time');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const data = await getAvailability();
      setSlots(data);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
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
      showSuccessToast();
    } catch (error) {
      console.error('Failed to add slot:', error);
    }
  };

  const handleUpdateSlot = async (id: string, updates: Partial<AvailabilitySlot>) => {
    try {
      const updatedSlot = await updateAvailability(id, updates);
      setSlots(slots.map(s => s.id === id ? updatedSlot : s));
      showSuccessToast();
    } catch (error) {
      console.error('Failed to update slot:', error);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await deleteAvailability(id);
      setSlots(slots.filter(s => s.id !== id));
      showSuccessToast();
    } catch (error) {
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
    <div className="max-w-[1200px] mx-auto px-8 py-8 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-[#00a550] text-white px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-[15px] font-medium">Your settings have been saved!</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-6">Availability</h1>
        
        <div className="flex items-center gap-8 border-b border-gray-200">
          <button className="pb-3 text-[15px] font-medium text-[#006bff] border-b-2 border-[#006bff]">
            Schedules
          </button>
          <button className="pb-3 text-[15px] font-medium text-gray-500 hover:text-gray-900">
            Calendar settings
          </button>
          <button className="pb-3 text-[15px] font-medium text-gray-500 hover:text-gray-900">
            Advanced settings
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div>
            <div className="text-[13px] text-gray-500 mb-1">Schedule</div>
            <button className="flex items-center gap-2 text-[22px] font-bold text-[#006bff] hover:underline mb-2">
              Working hours (default)
              <ChevronDown size={20} />
            </button>
            <button className="flex items-center gap-1.5 text-[15px] text-gray-700 hover:text-gray-900">
              Active on: <span className="text-[#006bff]">2 event types</span>
              <ChevronDown size={16} className="text-[#006bff]" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button className="flex items-center gap-2 px-4 py-1.5 bg-white text-gray-900 text-[14px] font-medium rounded-md shadow-sm">
                <List size={16} />
                List
              </button>
              <button className="flex items-center gap-2 px-4 py-1.5 text-gray-600 text-[14px] font-medium hover:text-gray-900 rounded-md">
                <CalendarIcon size={16} />
                Calendar
              </button>
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex">
          {/* Left Column - Weekly Hours */}
          <div className="flex-1 p-6 border-r border-gray-200">
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
                                  className="h-10 px-3 border border-gray-200 rounded-md text-[15px] text-gray-700 bg-white focus:outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff] w-[100px]"
                                >
                                  {timeOptions.map(time => (
                                    <option key={`start-${time}`} value={time}>{time}</option>
                                  ))}
                                </select>
                                <span className="text-gray-400">-</span>
                                <select 
                                  value={formatTime(slot.endTime)}
                                  onChange={(e) => handleUpdateSlot(slot.id, { endTime: parseTime(e.target.value) })}
                                  className="h-10 px-3 border border-gray-200 rounded-md text-[15px] text-gray-700 bg-white focus:outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff] w-[100px]"
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
                                  <>
                                    <button 
                                      onClick={() => handleAddSlot(day.id)}
                                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                      title={`New interval for ${day.id.charAt(0) + day.id.slice(1).toLowerCase()}`}
                                    >
                                      <Plus size={18} />
                                    </button>
                                    <button 
                                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                      title="Copy times to..."
                                    >
                                      <Copy size={16} />
                                    </button>
                                  </>
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
              <button className="flex items-center gap-1 text-[15px] text-[#006bff] hover:underline font-medium">
                {timezone}
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Right Column - Date-specific hours */}
          <div className="flex-1 p-6">
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
          </div>
        </div>
      </div>
    </div>
  );
}
