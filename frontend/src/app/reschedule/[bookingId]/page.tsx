'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, Video, Globe, ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon } from 'lucide-react';
import { getSlots, TimeSlot } from '@/services/booking';
import { getAvailability, AvailabilitySlot } from '@/services/availability';
import { rescheduleBooking, Booking } from '@/services/bookings';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast, getErrorMessage } from '@/hooks/useToast';
import PoweredByRibbon from '@/components/ui/PoweredByRibbon';
import { DisplaySlot, convertSlotsForDisplay, filterPastSlots, formatHM } from '@/src/utils/timezoneUtils';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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

export default function ReschedulePage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  // Booking data passed via search params
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rawSlots, setRawSlots] = useState<TimeSlot[]>([]);
  const [displaySlots, setDisplaySlots] = useState<DisplaySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<DisplaySlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const { toasts, removeToast, showError, showSuccess } = useToast();

  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [timezone, setTimezone] = useState('India Standard Time');
  const [currentTime, setCurrentTime] = useState('');
  const timezoneRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Load booking data from URL search params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const bookingData: Booking = {
      id: bookingId,
      eventTypeId: searchParams.get('eventTypeId') || '',
      inviteeName: searchParams.get('inviteeName') || '',
      inviteeEmail: searchParams.get('inviteeEmail') || '',
      date: searchParams.get('date') || '',
      startTime: searchParams.get('startTime') || '',
      endTime: searchParams.get('endTime') || '',
      status: 'SCHEDULED',
      createdAt: '',
      updatedAt: '',
      eventType: {
        id: searchParams.get('eventTypeId') || '',
        name: searchParams.get('eventName') || 'Meeting',
        slug: searchParams.get('eventSlug') || '',
        duration: parseInt(searchParams.get('duration') || '30', 10),
      },
    };
    setBooking(bookingData);
    setLoading(false);
  }, [bookingId]);

  // Fetch availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const availData = await getAvailability();
        setAvailability(availData);
        if (availData.length > 0 && availData[0].timezone) {
          setTimezone(availData[0].timezone);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      } finally {
        setLoadingAvailability(false);
      }
    };
    fetchAvailability();
  }, []);

  // Live clock for timezone
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
      } catch (e) {
        setCurrentTime('');
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

  // Timezone dropdown close handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const dropdown = document.getElementById('tz-dropdown-reschedule');
      if (dropdown && dropdown.contains(e.target as Node)) return;
      if (isTimezoneOpen && timezoneRef.current && !timezoneRef.current.contains(e.target as Node)) {
        setIsTimezoneOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const handleScroll = (e: Event) => {
      const dropdown = document.getElementById('tz-dropdown-reschedule');
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
        setDropdownStyle({ position: 'fixed', left: rect.left, bottom: window.innerHeight - rect.top + 8, width: Math.max(rect.width, 320), zIndex: 50 });
      } else {
        setDropdownStyle({ position: 'fixed', left: rect.left, top: rect.bottom + 8, width: Math.max(rect.width, 320), zIndex: 50 });
      }
    }
    setIsTimezoneOpen(!isTimezoneOpen);
  };

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null); };
  const handleNextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null); };

  // Timezone IANA IDs
  const availTzId = availability.length > 0 && availability[0].timezone
    ? (TIMEZONES.find(t => t.label === availability[0].timezone)?.id || availability[0].timezone)
    : 'Asia/Kolkata';
  const selectedTzId = TIMEZONES.find(t => t.label === timezone)?.id || 'Asia/Kolkata';

  // Re-convert slots when timezone changes
  useEffect(() => {
    if (rawSlots.length === 0) { setDisplaySlots([]); return; }
    const converted = convertSlotsForDisplay(rawSlots, availTzId, selectedTzId);
    const isToday = selectedDate ? selectedDate.toDateString() === new Date().toDateString() : false;
    const filtered = filterPastSlots(converted, isToday, selectedTzId);
    setDisplaySlots(filtered);
  }, [timezone, rawSlots, selectedDate]);

  const handleDateClick = async (day: number) => {
    if (!booking) return;
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
    setSelectedSlot(null);
    setLoadingSlots(true);
    try {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const fetchedSlots = await getSlots(booking.eventTypeId, dateStr);
      setRawSlots(fetchedSlots);
    } catch (error) {
      showError('Failed to load available slots.');
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot || !booking) return;
    setSubmitting(true);
    try {
      await rescheduleBooking(booking.id, selectedSlot.originalStartTime, selectedSlot.originalEndTime);
      showSuccess('Meeting rescheduled successfully!');
      setTimeout(() => router.push('/meetings'), 1200);
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to reschedule meeting.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Format the former booking time for display
  const formatFormerTime = () => {
    if (!booking?.startTime || !booking?.endTime) return '';
    const startDate = new Date(booking.startTime);
    const startH = startDate.getUTCHours();
    const startM = startDate.getUTCMinutes();
    const endDate = new Date(booking.endTime);
    const endH = endDate.getUTCHours();
    const endM = endDate.getUTCMinutes();

    const fmt = (h: number, m: number) => {
      const ampm = h >= 12 ? 'pm' : 'am';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
    };

    const dateFormatted = startDate.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return `${fmt(startH, startM)} - ${fmt(endH, endM)}, ${dateFormatted}`;
  };

  // Check if a slot is the former time
  const isFormerSlot = (slot: DisplaySlot) => {
    return booking?.startTime === slot.originalStartTime;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-[0_1px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex flex-col md:flex-row max-w-[1060px] w-full relative overflow-hidden min-h-[500px] md:min-h-[600px]">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <PoweredByRibbon />

        {/* Left Panel */}
        <div className="w-full md:w-[380px] p-4 sm:p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
          <div className="text-gray-500 font-medium mb-1">Sanchit Pandey</div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-gray-900 mb-6">{booking?.eventType?.name || 'Meeting'}</h1>

          <div className="flex items-center gap-3 text-gray-600 mb-4 font-medium">
            <Clock size={20} />
            <span>{booking?.eventType?.duration || 30} min</span>
          </div>
          <div className="flex items-start gap-3 text-gray-600 font-medium mb-8">
            <Video size={20} className="mt-0.5" />
            <span className="leading-snug">Web conferencing details provided upon confirmation.</span>
          </div>

          {/* Former Time section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="text-[14px] text-gray-500 font-medium mb-3">
              Former Time ({booking?.inviteeName || 'Invitee'})
            </div>
            <div className="flex items-start gap-3 text-gray-700 mb-3">
              <CalendarIcon size={18} className="mt-0.5 shrink-0" />
              <span className="text-[14px] font-medium">{formatFormerTime()}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Globe size={18} className="shrink-0" />
              <span className="text-[14px] font-medium">{timezone}</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className={`p-4 sm:p-8 flex-1 flex flex-col relative ${selectedDate ? 'md:flex-row gap-6 sm:gap-8' : ''}`}>
          <div className={`flex flex-col ${selectedDate ? 'md:w-[60%]' : 'w-full max-w-[500px] mx-auto'}`}>
            <div className="text-[13px] text-gray-500 font-medium mb-1">Reschedule Event</div>
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
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isTimezoneOpen && (
                <div
                  id="tz-dropdown-reschedule"
                  style={dropdownStyle}
                  className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-[280px] overflow-y-auto"
                >
                  {TIMEZONES.map((tz) => (
                    <button
                      key={tz.label}
                      onClick={() => { setTimezone(tz.label); setIsTimezoneOpen(false); }}
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
                ) : displaySlots.length > 0 ? (
                  displaySlots.map((slot, i) => {
                    const isSelected = selectedSlot?.originalStartTime === slot.originalStartTime;
                    const isFormer = isFormerSlot(slot);
                    return (
                      <div key={i} className="flex gap-2">
                        <button
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex-1 py-3.5 rounded-md border text-[15px] font-bold transition-all flex flex-col items-center
                            ${isSelected
                              ? 'bg-gray-600 border-gray-600 text-white w-1/2'
                              : 'border-[#006bff] text-[#006bff] hover:border-2 hover:py-[13px] bg-white'
                            }
                          `}
                        >
                          {formatHM(slot.displayStartH, slot.displayStartM)}
                          {isFormer && (
                            <span className={`text-[11px] font-medium ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                              Former Time
                            </span>
                          )}
                        </button>
                        {isSelected && (
                          <button
                            onClick={handleReschedule}
                            disabled={submitting}
                            className="flex-1 bg-[#006bff] text-white rounded-md font-bold text-[15px] hover:bg-blue-700 transition-colors disabled:opacity-70"
                          >
                            {submitting ? 'Saving...' : 'Confirm'}
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
        </div>
      </div>
    </div>
  );
}
