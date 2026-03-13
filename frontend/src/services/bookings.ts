import { api } from './api';

export interface Booking {
  id: string;
  eventTypeId: string;
  inviteeName: string;
  inviteeEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  eventType: {
    id: string;
    name: string;
    slug: string;
    duration: number;
  };
}

export const getUpcomingBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/bookings/upcoming');
  return response.data;
};

export const getPastBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/bookings/past');
  return response.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
};

export const rescheduleBooking = async (
  id: string,
  newStartTime: string,
  newEndTime: string
): Promise<Booking> => {
  const response = await api.patch(`/bookings/${id}/reschedule`, { newStartTime, newEndTime });
  return response.data;
};
