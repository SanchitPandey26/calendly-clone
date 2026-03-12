'use client';

import { useState, useEffect, useCallback } from 'react';
import { HelpCircle, ChevronDown, Upload, Filter, Play, RefreshCw, Trash2, ExternalLink, FileText, Flag, UserPlus } from 'lucide-react';
import { getUpcomingBookings, getPastBookings, cancelBooking, Booking } from '@/services/bookings';
import Image from 'next/image';

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [showBuffers, setShowBuffers] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = activeTab === 'upcoming' 
        ? await getUpcomingBookings() 
        : await getPastBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this meeting?')) {
      try {
        await cancelBooking(id);
        fetchBookings();
      } catch (error) {
        console.error('Failed to cancel booking', error);
      }
    }
  };

  const toggleDetails = (id: string) => {
    if (expandedBookingId === id) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(id);
    }
  };

  // Group bookings by date
  const groupedBookings = bookings.reduce((acc, booking) => {
    const date = new Date(booking.startTime).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="h-[72px] px-8 flex items-center justify-end border-b border-transparent">
        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <UserPlus size={20} />
          </button>
          <button className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-md transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[13px] font-bold text-gray-700 border border-gray-200">
              S
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Meetings</h1>
            <button className="text-gray-500 hover:text-gray-700">
              <HelpCircle size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-[15px] font-medium text-gray-700 hover:border-gray-400 bg-white">
              My Calendly
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-[15px] text-gray-700">Show buffers</span>
              <button className="text-gray-400 hover:text-gray-600">
                <HelpCircle size={16} />
              </button>
              <button 
                onClick={() => setShowBuffers(!showBuffers)}
                className={`w-10 h-5 rounded-full relative transition-colors ml-1 ${showBuffers ? 'bg-[#006bff]' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${showBuffers ? 'left-[22px]' : 'left-0.5'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs and List Container */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6">
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`py-4 text-[15px] font-medium border-b-2 transition-colors ${
                  activeTab === 'upcoming' 
                    ? 'border-[#006bff] text-[#006bff]' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                className={`py-4 text-[15px] font-medium border-b-2 transition-colors ${
                  activeTab === 'past' 
                    ? 'border-[#006bff] text-[#006bff]' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Past
              </button>
              <button className="py-4 text-[15px] font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 flex items-center gap-1">
                Date Range
                <ChevronDown size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-[15px] font-medium text-gray-700 hover:border-gray-400 transition-colors">
                <Upload size={16} />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-[15px] font-medium text-gray-700 hover:border-gray-400 transition-colors">
                <Filter size={16} />
                Filter
                <ChevronDown size={16} className="ml-1" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 flex justify-end text-[13px] text-gray-500 bg-white border-b border-gray-200">
            Displaying {bookings.length} of {bookings.length} Events
          </div>

          {/* List */}
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-[120px] h-[100px] bg-gray-100 rounded-lg flex items-center justify-center mb-6 relative">
                <div className="absolute top-0 right-0 -mt-3 -mr-3 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">0</div>
                <div className="w-[80px] h-[60px] border-2 border-gray-300 rounded grid grid-cols-4 grid-rows-3 gap-0.5 p-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-sm"></div>
                  ))}
                </div>
              </div>
              <h3 className="text-[22px] font-bold text-[#1a1a1a]">No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Events</h3>
            </div>
          ) : (
            <div>
              {Object.entries(groupedBookings).map(([date, dateBookings]) => (
                <div key={date}>
                  <div className="px-6 py-4 bg-white border-b border-gray-200 text-[15px] text-gray-700 font-medium">
                    {date}
                  </div>
                  {dateBookings.map((booking) => (
                    <div key={booking.id} className="border-b border-gray-200 last:border-b-0">
                      <div 
                        className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => toggleDetails(booking.id)}
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-6 h-6 rounded-full bg-[#ff4f00] shrink-0"></div>
                          <div className="flex flex-col">
                            <div className="text-[15px] text-gray-900">
                              {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                            </div>
                            <div className="text-[13px] text-gray-500">
                              10:00am - 10:45am (India Standard Time)
                            </div>
                          </div>
                          <div className="ml-12 flex flex-col">
                            <div className="text-[15px] font-bold text-gray-900">
                              Sanchit Pandey
                            </div>
                            <div className="text-[15px] text-gray-500">
                              Event type <span className="font-bold text-gray-900">{booking.eventType?.name || 'Meeting'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-12">
                          <div className="text-[15px] text-gray-500">
                            1 host | 0 non-hosts
                          </div>
                          <div className="flex items-center gap-1.5 text-[15px] text-gray-500 font-medium">
                            <Play size={10} className={`fill-current transition-transform ${expandedBookingId === booking.id ? 'rotate-90' : ''}`} />
                            Details
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedBookingId === booking.id && (
                        <div className="px-6 py-6 bg-white border-t border-gray-200 flex gap-12">
                          {/* Left Column - Actions */}
                          <div className="w-[240px] shrink-0 flex flex-col gap-3">
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full text-[15px] font-medium text-gray-700 hover:border-gray-400 transition-colors">
                              <RefreshCw size={16} />
                              Reschedule
                            </button>
                            <button 
                              onClick={() => handleCancel(booking.id)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full text-[15px] font-medium text-gray-700 hover:border-gray-400 transition-colors"
                            >
                              <Trash2 size={16} />
                              Cancel
                            </button>
                            
                            <div className="mt-4 flex flex-col gap-5">
                              <button className="flex items-center gap-3 text-[15px] font-medium text-[#006bff] hover:underline">
                                <ExternalLink size={18} />
                                Edit Event Type
                              </button>
                              <button className="flex items-center gap-3 text-[15px] font-medium text-[#006bff] hover:underline">
                                <Filter size={18} />
                                Filter by Event Type
                              </button>
                              <button className="flex items-center gap-3 text-[15px] font-medium text-[#006bff] hover:underline">
                                <RefreshCw size={18} />
                                Schedule Invitee Again
                              </button>
                              <button className="flex items-center gap-3 text-[15px] font-medium text-[#006bff] hover:underline">
                                <Flag size={18} />
                                Report this event
                              </button>
                            </div>
                          </div>

                          {/* Right Column - Details */}
                          <div className="flex-1 flex flex-col gap-6 pl-8">
                            <div>
                              <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wider mb-3">Invitee</h4>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-medium text-gray-700 border border-gray-200">
                                  {booking.inviteeName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="text-[15px] text-[#006bff] hover:underline cursor-pointer">{booking.inviteeName}</div>
                                  <div className="text-[13px] text-gray-500">{booking.inviteeEmail}</div>
                                </div>
                              </div>
                              <div className="flex gap-4 mt-2 ml-11">
                                <button className="text-[13px] font-medium text-[#006bff] hover:underline">Edit email</button>
                                <button className="text-[13px] font-medium text-[#006bff] hover:underline">View contact</button>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wider mb-2">Location</h4>
                              <div className="text-[15px] text-gray-700">
                                This is a Google Meet web conference. <a href="#" className="text-[#006bff] hover:underline">Join now</a>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wider mb-2">Invitee Time Zone</h4>
                              <div className="text-[15px] text-gray-700">India Standard Time</div>
                            </div>

                            <div>
                              <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wider mb-3">Meeting Host</h4>
                              <div className="text-[15px] text-gray-700 mb-3">Host will attend this meeting</div>
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-medium text-gray-700 border border-gray-200">
                                SP
                              </div>
                            </div>

                            <div className="mt-2">
                              <button className="flex items-center gap-2 text-[15px] font-medium text-[#006bff] hover:underline">
                                <FileText size={18} />
                                Add meeting notes
                              </button>
                              <div className="text-[13px] text-gray-500 mt-1">
                                (only the host will see these)
                              </div>
                            </div>

                            <div className="text-[13px] text-gray-500 mt-4">
                              Created {new Date(booking.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })} by Sanchit Pandey
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              
              {bookings.length > 0 && (
                <div className="px-6 py-4 text-center text-[15px] text-gray-500 border-t border-gray-200">
                  You&apos;ve reached the end of the list
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
