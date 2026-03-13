'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export function ToastContainer({ toasts, removeToast }: { toasts: ToastData[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-6 left-0 right-0 flex flex-col items-center gap-2 z-100 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const isError = toast.type === 'error';

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg border transition-all duration-300 max-w-[90vw] sm:max-w-[480px]
        ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-[#00a550] border-[#00a550] text-white'}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      {isError ? (
        <AlertCircle size={18} className="shrink-0 text-red-500" />
      ) : (
        <CheckCircle2 size={18} className="shrink-0" />
      )}
      <span className="text-[15px] font-medium flex-1">{toast.message}</span>
      <button onClick={onClose} className="shrink-0 p-0.5 hover:opacity-70 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
}
