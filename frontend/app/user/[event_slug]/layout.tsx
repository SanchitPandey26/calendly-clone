'use client';

import { Link2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function PublicBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}${pathname}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#1a1a1a]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-end items-center gap-4">
        <button className="text-[14px] font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1">
          Menu
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-[14px] font-medium text-gray-700 hover:border-gray-400 transition-colors">
          <Link2 size={16} />
          Copy link
        </button>
      </header>
      
      <main className="p-4 md:p-8 flex justify-center">
        {children}
      </main>
    </div>
  );
}
