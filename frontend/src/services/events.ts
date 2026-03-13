import { api } from './api';

export interface EventType {
  id: string;
  name: string;
  slug: string;
  duration: number;
  color?: string;
}

export const getEvents = async (): Promise<EventType[]> => {
  const response = await api.get('/event-types');
  return response.data;
};

export const getEvent = async (id: string): Promise<EventType> => {
  const response = await api.get(`/event-types/${id}`);
  return response.data;
};

export const getEventBySlug = async (slug: string): Promise<EventType | null> => {
  try {
    const response = await api.get(`/event-types/slug/${slug}`);
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { status?: number } })?.response;
    if (resp?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createEvent = async (data: Omit<EventType, 'id'>): Promise<EventType> => {
  const response = await api.post('/event-types', data);
  return response.data;
};

export const updateEvent = async (id: string, data: Partial<EventType>): Promise<EventType> => {
  const response = await api.put(`/event-types/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/event-types/${id}`);
};
