'use client';

export default function PoweredByRibbon() {
  return (
    <div className="absolute top-0 right-0 w-32 h-32 z-50 pointer-events-none">
      <div 
        className="absolute bg-[#4d5055] text-center transform rotate-45 shadow-sm font-sans flex flex-col items-center justify-center pointer-events-auto hover:scale-110 transition-transform duration-200"
        style={{
          top: '24px',
          right: '-36px',
          width: '160px',
          padding: '6px 0 8px 0',
        }}
      >
        <div className="text-[8px] font-bold text-[#a8b2bc] tracking-[0.05em] leading-none mb-0.5">
          POWERED BY
        </div>
        <div className="text-[17px] font-bold text-white tracking-tight leading-none">
          Calendly
        </div>
      </div>
    </div>
  );
}
