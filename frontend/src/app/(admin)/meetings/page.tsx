'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { getUpcomingBookings, getPastBookings, cancelBooking, Booking } from '@/services/bookings';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast, getErrorMessage } from '@/hooks/useToast';

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelMessage, setCancelMessage] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = activeTab === 'upcoming' 
        ? await getUpcomingBookings() 
        : await getPastBookings();
      setBookings(data);
    } catch (error) {
      showError('Failed to load bookings. Please try again.');
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelMessage('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    
    try {
      await cancelBooking(bookingToCancel.id);
      fetchBookings();
      setCancelModalOpen(false);
      setBookingToCancel(null);
      showSuccess('Meeting cancelled successfully.');
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to cancel meeting.'));
      console.error('Failed to cancel booking', error);
    }
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setBookingToCancel(null);
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
    const dateObj = new Date(booking.startTime);
    const date = dateObj.toLocaleDateString('en-GB', {
      timeZone: 'UTC',
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
      timeZone: 'UTC',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Top Navigation Bar */}
      <div className="h-[72px] px-4 sm:px-8 flex items-center justify-end border-b border-transparent pt-12 md:pt-0">
        <div className="flex items-center">
          <div className="flex items-center p-1.5">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[13px] font-bold text-gray-700 border border-gray-200">
              S
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 pt-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Meetings</h1>
        </div>

        {/* Tabs and List Container */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="flex items-center border-b border-gray-200 px-4 sm:px-6">
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`py-4 text-[15px] font-medium border-b-2 transition-colors hover:cursor-pointer ${
                  activeTab === 'upcoming' 
                    ? 'border-[#006bff] text-[#006bff]' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                className={`py-4 text-[15px] font-medium border-b-2 transition-colors hover:cursor-pointer ${
                  activeTab === 'past' 
                    ? 'border-[#006bff] text-[#006bff]' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Past
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 flex justify-end text-[13px] text-gray-500 bg-white border-b border-gray-200">
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
                  <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200 text-[15px] text-gray-700 font-medium">
                    {date}
                  </div>
                  {dateBookings.map((booking) => (
                    <div key={booking.id} className="border-b border-gray-200 last:border-b-0">
                      <div 
                        className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 cursor-pointer transition-colors gap-3"
                        onClick={() => toggleDetails(booking.id)}
                      >
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="w-6 h-6 rounded-full bg-[#ff4f00] shrink-0"></div>
                          <div className="flex flex-col">
                            <div className="text-[15px] text-gray-900">
                              {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                            </div>
                          </div>
                          <div className="ml-0 sm:ml-12 flex flex-col">
                            <div className="text-[15px] font-bold text-gray-900">
                              {booking.inviteeName}
                            </div>
                            <div className="text-[15px] text-gray-500">
                              Event type: <span className="font-bold text-gray-900">{booking.eventType?.name || 'Meeting'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[15px] text-gray-500 font-medium">
                          <Play size={10} className={`fill-current transition-transform ${expandedBookingId === booking.id ? 'rotate-90' : ''}`} />
                          Details
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedBookingId === booking.id && (
                        <div className="px-4 sm:px-6 py-6 bg-white border-t border-gray-200 flex flex-col sm:flex-row gap-6 sm:gap-12">
                          {/* Left Column - Actions */}
                          <div className="w-full sm:w-[240px] shrink-0 flex flex-col gap-3">
                            {activeTab === 'upcoming' && (
                              <button 
                                onClick={() => handleCancelClick(booking)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full text-[15px] font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                              >
                                <Trash2 size={16} />
                                Cancel
                              </button>
                            )}
                          </div>

                          {/* Right Column - Details */}
                          <div className="flex-1 flex flex-col gap-6 sm:pl-8">
                            <div>
                              <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wider mb-3">Invitee</h4>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-medium text-gray-700 border border-gray-200">
                                  {booking.inviteeName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="text-[15px] text-gray-900">{booking.inviteeName}</div>
                                  <div className="text-[13px] text-gray-500">{booking.inviteeEmail}</div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wider mb-2">Event Type</h4>
                              <div className="text-[15px] text-gray-700">{booking.eventType?.name || 'Meeting'}</div>
                            </div>

                            <div className="text-[13px] text-gray-500 mt-4">
                              Created {new Date(booking.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
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

      {/* Cancel Event Modal */}
      {cancelModalOpen && bookingToCancel && (
        <div className="fixed inset-0  backdrop-blur-sm z-50 flex items-start justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[430px] p-8 m-4">
            <h2 className="text-[22px] font-bold text-[#1a1a1a] mb-6 text-center">Cancel Event</h2>
            
            <div className="text-center mb-6">
              <div className="text-[15px] text-gray-700">{bookingToCancel.eventType?.name || 'Meeting'}</div>
              <div className="text-[16px] font-bold text-[#1a1a1a] my-1">{bookingToCancel.inviteeName}</div>
              <div className="text-[15px] text-gray-600">
                {formatTime(bookingToCancel.startTime)} – {formatTime(bookingToCancel.endTime)}
              </div>
            </div>

            <p className="text-[15px] text-gray-700 mb-6 leading-relaxed">
              Please confirm that you would like to cancel this event. A cancellation email will also go out to the invitee.
            </p>

            <div className="flex items-center gap-4">
              <button 
                onClick={closeCancelModal}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-full text-[15px] font-bold text-[#1a1a1a] hover:border-gray-400 transition-colors cursor-pointer"
              >
                No, don't cancel
              </button>
              <button 
                onClick={confirmCancel}
                className="flex-1 py-3 px-6 bg-[#006bff] hover:bg-blue-700 text-white rounded-full text-[15px] font-bold transition-colors cursor-pointer"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
