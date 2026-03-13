import { api } from './api';

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface BookingRequest {
  eventTypeId: string;
  startTime: string;
  endTime: string;
  inviteeName: string;
  inviteeEmail: string;
  notes?: string;
}

export async function getSlots(eventTypeId: string, date: string): Promise<TimeSlot[]> {
  const response = await api.get(`/slots?eventTypeId=${eventTypeId}&date=${date}`);
  return response.data;
}

export async function createBooking(booking: BookingRequest): Promise<any> {
  const response = await api.post('/bookings', booking);
  return response.data;
}
