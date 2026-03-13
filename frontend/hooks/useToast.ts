import { useState, useCallback } from 'react';
import { ToastData } from '@/components/ui/Toast';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = `toast-${++toastIdCounter}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const showError = useCallback((message: string) => addToast(message, 'error'), [addToast]);

  return { toasts, addToast, removeToast, showSuccess, showError };
}

/**
 * Extract a user-friendly error message from an Axios error response.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const resp = (error as { response?: { data?: { message?: string }; status?: number } }).response;
    if (resp?.data?.message) return resp.data.message;
    if (resp?.status === 409) return 'This already exists. Please use a different name or slug.';
    if (resp?.status === 404) return 'The requested item was not found.';
    if (resp?.status === 400) return 'Invalid data. Please check your input.';
  }
  return fallback;
}
