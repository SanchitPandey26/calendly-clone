'use client';

import Sidebar from '@/components/layout/Sidebar';
import { EventProvider, useEventContext } from '@/context/EventContext';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useEventContext();
  
  return (
    <>
      <Sidebar />
      <main className={`ml-0 ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'} min-h-screen transition-all duration-300`}>
        {children}
      </main>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EventProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </EventProvider>
  );
}
