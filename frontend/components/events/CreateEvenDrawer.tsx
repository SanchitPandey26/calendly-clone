'use client';

import { EventType } from '@/services/events';
import { X, Clock, MapPin, Calendar, User, ChevronDown, Video, Phone, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CreateEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<EventType>) => Promise<void>;
  initialData?: EventType | null;
}

export default function CreateEventDrawer({ isOpen, onClose, onSave, initialData }: CreateEventDrawerProps) {
  const [name, setName] = useState('New Meeting');
  const [duration, setDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDuration(initialData.duration);
      } else {
        setName('New Meeting');
        setDuration(30);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({ name, duration });
      onClose();
    } catch (error) {
      console.error('Failed to save event', error);
      alert('Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-[#f8f9fa] shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-[#8247f5] rounded-full mt-2"></div>
            <div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-[22px] font-semibold text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full tracking-tight"
                />
              </div>
              <div className="text-[15px] text-gray-500 mt-0.5">One-on-One</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors self-start"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-6 space-y-4 flex-1">
            {/* Duration Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Duration</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="bg-transparent border-none p-0 focus:ring-0 text-sm cursor-pointer"
                      >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="button" className="text-gray-400 hover:text-gray-600">
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#ff4f00]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Location</div>
                    <div className="text-sm text-[#ff4f00] flex items-center gap-1">
                      <AlertCircle size={14} />
                      No location set
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                  <Video size={16} className="text-blue-500" />
                  Zoom
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                  <Phone size={16} className="text-gray-500" />
                  Phone call
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                  <MapPin size={16} className="text-gray-500" />
                  In-person
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                  All options
                </button>
              </div>
            </div>

            {/* Availability Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Availability</div>
                    <div className="text-sm text-gray-500">Default schedule</div>
                  </div>
                </div>
                <button type="button" className="text-gray-400 hover:text-gray-600">
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>

            {/* Host Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Host</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium text-[10px]">
                        S
                      </div>
                      <span className="text-sm text-gray-700">Sanchit Pandey</span>
                    </div>
                  </div>
                </div>
                <button type="button" className="text-gray-400 hover:text-gray-600">
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white border-t border-gray-200 flex items-center justify-between">
            <button type="button" className="text-[#006bff] hover:text-blue-700 font-medium text-[15px]">
              More options
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 bg-[#006bff] text-white font-medium rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
