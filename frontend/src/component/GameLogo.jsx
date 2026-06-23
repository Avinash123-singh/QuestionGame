import React from 'react';

export default function GameLogo({ size = 'md' }) {
  const isSmall = size === 'sm';

  return (
    <div className="inline-block select-none animate-logo-float">
      <div className="flex flex-col items-center leading-none">
        <div
          className={`font-black uppercase tracking-wider text-white drop-shadow-lg ${
            isSmall ? 'text-xl -rotate-2' : 'text-4xl md:text-5xl -rotate-2'
          }`}
          style={{ fontFamily: "'Arial Black', Impact, sans-serif" }}
        >
          FAKE
        </div>
        <div
          className={`font-black uppercase tracking-wider text-[#f5c518] drop-shadow-lg ${
            isSmall ? 'text-xl rotate-1 -mt-0.5' : 'text-4xl md:text-5xl rotate-1 -mt-1'
          }`}
          style={{
            fontFamily: "'Arial Black', Impact, sans-serif",
            textShadow: '0 2px 12px rgba(245,197,24,0.4)',
          }}
        >
          ANSWER
        </div>
        <div
          className={`font-black uppercase tracking-widest text-white rounded-md -rotate-1 ${
            isSmall ? 'text-[10px] px-2.5 py-0.5 mt-0.5' : 'text-sm px-4 py-1 mt-1'
          }`}
          style={{
            fontFamily: "'Arial Black', Impact, sans-serif",
            background: 'linear-gradient(90deg, #e91e8c, #c2185b)',
            boxShadow: '0 3px 12px rgba(233,30,140,0.45)',
          }}
        >
          PARTY
        </div>
      </div>
    </div>
  );
}
