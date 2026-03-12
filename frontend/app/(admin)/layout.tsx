import Sidebar from '@/components/layout/Sidebar';
import { EventProvider } from '@/context/EventContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EventProvider>
      <Sidebar />
      <main className="ml-60 min-h-screen">
        {children}
      </main>
    </EventProvider>
  );
}
