import React from 'react';

interface HalloweenLogoProps {
  compact?: boolean;
  className?: string;
}

export const HalloweenLogo: React.FC<HalloweenLogoProps> = ({ compact = false, className = '' }) => {
  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Spectral Emblem: Crescent Moon + Pumpkin AI Core */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A1A28] to-[#101018] p-1.5 border border-[#7C3AED]/40 shadow-lg shadow-[#7C3AED]/20 group">
        {/* Ambient spectral glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#7C3AED]/20 to-[#FF7518]/20 opacity-75 blur-[3px] group-hover:opacity-100 transition-opacity" />

        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 h-7 w-7 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Crescent Moon */}
          <path
            d="M23 4C14.7157 4 8 10.7157 8 19C8 23.3643 9.86657 27.2928 12.8529 30.0153C10.7135 28.5273 9.3 26.0691 9.3 23.2759C9.3 17.5997 13.9014 12.9983 19.5776 12.9983C21.7161 12.9983 23.6841 13.9168 25.074 15.3857C24.4729 8.9189 24.0152 4 23 4Z"
            fill="url(#moonGrad)"
          />

          {/* Pumpkin / Spectral AI Core */}
          <path
            d="M17 11C14 11 11 14 11 19C11 24 14 28 18 28C22 28 25 24 25 19C25 14 21 11 17 11Z"
            fill="url(#pumpkinGrad)"
            fillOpacity="0.85"
          />

          {/* Carved / Circuit AI Eyes */}
          <path
            d="M14.5 16.5L16 18.5H13.5L14.5 16.5Z"
            fill="#09090D"
          />
          <path
            d="M19.5 16.5L20.5 18.5H18L19.5 16.5Z"
            fill="#09090D"
          />

          {/* Jack-o'-lantern smile / frequency wave */}
          <path
            d="M14 22C15.2 23 18.8 23 20 22C19.2 23.5 14.8 23.5 14 22Z"
            fill="#09090D"
          />

          {/* Center glowing intelligence dot */}
          <circle cx="17" cy="19" r="1.2" fill="#F4F0FA" className="animate-pulse" />

          {/* Gradients */}
          <defs>
            <linearGradient id="moonGrad" x1="8" y1="4" x2="25" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A78BFA" />
              <stop offset="0.6" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#3B0764" />
            </linearGradient>
            <linearGradient id="pumpkinGrad" x1="11" y1="11" x2="25" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFB347" />
              <stop offset="0.5" stopColor="#FF7518" />
              <stop offset="1" stopColor="#B43403" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {!compact && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5 leading-none">
            <span className="font-display font-bold text-base tracking-tight text-[#F4F0FA]">
              CAMPUS<span className="text-[#FF7518]">PILOT</span>
            </span>
            <span className="font-creepster text-[#A78BFA] text-xs transform -translate-y-0.5 tracking-wider">
              AI
            </span>
          </div>
          <span className="font-display text-[9px] font-semibold tracking-[0.2em] text-[#9693A7] uppercase mt-1">
            HAUNTED INTELLIGENCE
          </span>
        </div>
      )}
    </div>
  );
};
