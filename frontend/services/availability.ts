import { api } from './api';

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

export type CreateAvailabilitySlot = Omit<AvailabilitySlot, 'id'>;
export type UpdateAvailabilitySlot = Partial<CreateAvailabilitySlot>;

export async function getAvailability(): Promise<AvailabilitySlot[]> {
  const response = await api.get('/availability');
  return response.data;
}

export async function getAvailabilityById(id: string): Promise<AvailabilitySlot> {
  const response = await api.get(`/availability/${id}`);
  return response.data;
}

export async function createAvailability(slot: CreateAvailabilitySlot): Promise<AvailabilitySlot> {
  const response = await api.post('/availability', slot);
  return response.data;
}

export async function updateAvailability(id: string, slot: UpdateAvailabilitySlot): Promise<AvailabilitySlot> {
  const response = await api.put(`/availability/${id}`, slot);
  return response.data;
}

export async function deleteAvailability(id: string): Promise<void> {
  await api.delete(`/availability/${id}`);
}
