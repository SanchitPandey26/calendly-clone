'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Link as LinkIcon, 
  Calendar, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useEventContext } from '@/context/EventContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openCreateDrawer, isSidebarCollapsed, setIsSidebarCollapsed } = useEventContext();

  // Auto collapse on tablet sizes
  useEffect(() => {
    if (window.innerWidth >= 768 && window.innerWidth < 1024) {
      setIsSidebarCollapsed(true);
    }
  }, [setIsSidebarCollapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const mainNavItems = [
    { name: 'Scheduling', href: '/', icon: LinkIcon },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'Availability', href: '/availability', icon: Clock },
  ];

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    <aside className={`h-screen fixed left-0 top-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-50
      ${mobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full w-[240px]'}
      md:translate-x-0 ${isSidebarCollapsed ? 'md:w-[72px]' : 'md:w-[240px]'}`}>
      <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className={`flex items-center justify-between mb-6 ${isSidebarCollapsed && !mobileOpen ? '-mx-1' : 'px-1'}`}>
          <div className="flex items-center gap-2">
            <Image 
              src="/calendly-logo.svg" 
              alt="Calendly Logo" 
              width={28} 
              height={28} 
              className="shrink-0"
            />
            {(!isSidebarCollapsed || mobileOpen) && (
              <Image 
                src="/calendly-title.svg" 
                alt="Calendly" 
                width={90} 
                height={22} 
                className="mt-1"
              />
            )}
          </div>
          
          <button 
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileOpen(false);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded-md transition-colors"
            title={(!isSidebarCollapsed || mobileOpen) ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span className="md:hidden"><X size={18} /></span>
            <span className="hidden md:block">{(!isSidebarCollapsed || mobileOpen) ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</span>
          </button>
        </div>
        
        <div className="mb-6">
          <button 
            onClick={() => openCreateDrawer()}
            className={`flex items-center justify-center gap-2 bg-white border border-[#006bff] text-[#006bff] rounded-full font-medium hover:bg-blue-50 transition-colors ${isSidebarCollapsed && !mobileOpen ? 'w-10 h-10 p-0 mx-auto' : 'w-full py-2 px-4'}`}
          >
            <Plus size={18} />
            {(!isSidebarCollapsed || mobileOpen) && <span>Create</span>}
          </button>
        </div>

        <nav className="space-y-0.5">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors relative ${
                  isActive 
                    ? 'bg-blue-50 text-[#006bff] font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                } ${isSidebarCollapsed && !mobileOpen ? 'justify-center' : ''}`}
                title={isSidebarCollapsed && !mobileOpen ? item.name : undefined}
              >
                {isActive && (!isSidebarCollapsed || mobileOpen) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#006bff] rounded-r-md"></div>
                )}
                <item.icon size={18} className={`${isActive ? 'text-[#006bff]' : 'text-gray-500'} shrink-0`} />
                {(!isSidebarCollapsed || mobileOpen) && <span className="text-sm whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
    </>
  );
}
