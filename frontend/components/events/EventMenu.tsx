'use client';

import { MoreVertical, ExternalLink, Pencil, User, Code, FileText, Globe, EyeOff, Copy, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface EventMenuProps {
  eventSlug: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EventMenu({ eventSlug, onEdit, onDelete }: EventMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOn, setIsOn] = useState(true);
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
        className={`w-10 h-10 rounded-md transition-colors flex items-center justify-center ${menuOpen ? 'bg-gray-300 text-gray-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        <MoreVertical size={20} />
      </button>
      
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
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
          <button className="w-full text-left px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">
            <User size={18} className="text-gray-500" />
            Edit permissions
          </button>
          
          <div className="h-px bg-gray-200 my-2"></div>
          
          <button className="w-full text-left px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">
            <Code size={18} className="text-gray-500" />
            Add to website
          </button>
          <button className="w-full text-left px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">
            <FileText size={18} className="text-gray-500" />
            Add internal note
          </button>
          <button className="w-full text-left px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 flex items-start gap-3">
            <Globe size={18} className="text-gray-500 mt-0.5" />
            <div>
              <div>Change invitee language</div>
              <div className="text-[#006bff] text-[13px]">English</div>
            </div>
          </button>

          <div className="h-px bg-gray-200 my-2"></div>

          <button className="w-full text-left px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">
            <EyeOff size={18} className="text-gray-500" />
            Make secret
          </button>
          <button className="w-full text-left px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">
            <Copy size={18} className="text-gray-500" />
            Duplicate
          </button>
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

          <div className="h-px bg-gray-200 my-2"></div>

          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-[15px] text-gray-700">On/Off</span>
            <button 
              onClick={() => setIsOn(!isOn)}
              className={`w-10 h-5 rounded-full relative transition-colors ${isOn ? 'bg-[#006bff]' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${isOn ? 'left-[22px]' : 'left-0.5'}`}></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
