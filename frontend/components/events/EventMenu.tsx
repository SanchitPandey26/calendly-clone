'use client';

import { MoreVertical, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface EventMenuProps {
  eventSlug: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EventMenu({ eventSlug, onEdit, onDelete }: EventMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className={`w-10 h-10 rounded-md transition-colors flex items-center justify-center ${menuOpen ? 'text-gray-800' : 'text-gray-700 hover:bg-white hover:cursor-pointer'}`}
      >
        <MoreVertical size={20} />
      </button>
      
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
          <a 
            href={`/user/${eventSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
          >
            <ExternalLink size={18} className="text-gray-500" />
            View booking page
          </a>
          <button 
            onClick={() => {
              setMenuOpen(false);
              onEdit();
            }}
            className="w-full text-left px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
          >
            <Pencil size={18} className="text-gray-500" />
            Edit
          </button>
          
          <div className="h-px bg-gray-200 my-2"></div>

          <button 
            onClick={() => {
              setMenuOpen(false);
              onDelete();
            }}
            className="w-full text-left px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
          >
            <Trash2 size={18} className="text-gray-500" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
