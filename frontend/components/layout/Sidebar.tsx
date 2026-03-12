'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Link as LinkIcon, 
  Calendar, 
  Clock, 
  Users, 
  Share2, 
  Grid, 
  Route,
  BarChart2,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { useEventContext } from '@/context/EventContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { openCreateDrawer } = useEventContext();

  const mainNavItems = [
    { name: 'Scheduling', href: '/', icon: LinkIcon },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'Availability', href: '/availability', icon: Clock },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Workflows', href: '/workflows', icon: Share2 },
    { name: 'Integrations & apps', href: '/integrations', icon: Grid },
    { name: 'Routing', href: '/routing', icon: Route },
  ];

  const bottomNavItems = [
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Admin center', href: '/admin', icon: Shield },
  ];

  return (
    <aside className={`h-screen fixed left-0 top-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[240px]'} z-30`}>
      <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className={`flex items-center justify-between mb-6 ${collapsed ? '-mx-1' : 'px-1'}`}>
          <div className="flex items-center gap-2">
            <Image 
              src="/calendly-logo.svg" 
              alt="Calendly Logo" 
              width={28} 
              height={28} 
              className="shrink-0"
            />
            {!collapsed && (
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
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded-md transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        <div className="mb-6">
          <button 
            onClick={() => openCreateDrawer()}
            className={`flex items-center justify-center gap-2 bg-white border border-[#006bff] text-[#006bff] rounded-full font-medium hover:bg-blue-50 transition-colors ${collapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full py-2 px-4'}`}
          >
            <Plus size={18} />
            {!collapsed && <span>Create</span>}
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
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#006bff] rounded-r-md"></div>
                )}
                <item.icon size={18} className={`${isActive ? 'text-[#006bff]' : 'text-gray-500'} shrink-0`} />
                {!collapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="mb-2">
          {!collapsed ? (
            <button className="w-full flex items-center justify-center gap-2 bg-blue-50 text-[#006bff] rounded-md py-2 px-4 font-medium hover:bg-blue-100 transition-colors border border-blue-100 text-sm">
              <span className="w-4 h-4 rounded-full border border-[#006bff] flex items-center justify-center text-[10px] leading-none">$</span>
              Upgrade plan
            </button>
          ) : (
            <button className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-50 text-[#006bff] rounded-md hover:bg-blue-100 transition-colors border border-blue-100" title="Upgrade plan">
              <span className="w-4 h-4 rounded-full border border-[#006bff] flex items-center justify-center text-[10px] leading-none">$</span>
            </button>
          )}
        </div>
        
        <nav className="space-y-0.5">
          {bottomNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-gray-700 hover:bg-gray-100 ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={18} className="text-gray-500 shrink-0" />
              {!collapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
            </Link>
          ))}
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-gray-700 hover:bg-gray-100 ${collapsed ? 'justify-center' : ''}`}>
            <HelpCircle size={18} className="text-gray-500 shrink-0" />
            {!collapsed && (
              <div className="flex items-center justify-between flex-1">
                <span className="text-sm whitespace-nowrap">Help</span>
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            )}
          </button>
        </nav>
      </div>
    </aside>
  );
}
