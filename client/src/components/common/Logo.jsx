import React from 'react';

export const Logo = ({ size = 'md', variant = 'light', showSubtitle = true, className = '' }) => {
  // Size presets for container and tooth icon
  const sizeMap = {
    sm: { container: 'w-8 h-8', icon: 'w-5 h-5', title: 'text-base', sub: 'text-[9px]' },
    md: { container: 'w-10 h-10', icon: 'w-6 h-6', title: 'text-xl', sub: 'text-[10px]' },
    lg: { container: 'w-14 h-14', icon: 'w-8 h-8', title: 'text-2xl', sub: 'text-xs' },
    xl: { container: 'w-16 h-16', icon: 'w-10 h-10', title: 'text-3xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Sleek Glowing Tooth Icon Badge */}
      <div className={`relative ${currentSize.container} rounded-2xl bg-gradient-to-tr from-brand-600 via-tealbrand-500 to-cyan-400 p-0.5 shadow-teal-glow flex items-center justify-center shrink-0 group`}>
        <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/30 to-tealbrand-400/30 opacity-70 group-hover:opacity-100 transition-opacity"></div>

          {/* Precision Tooth SVG Vector Logo Icon */}
          <svg
            className={`${currentSize.icon} relative z-10 text-cyan-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Tooth Contour Outline */}
            <path d="M12 2C9 2 7 3.5 6 5.5C4.5 8 4 11 5 14C5.8 16.4 7 19.5 8 22C9.5 22 10.5 19 12 16C13.5 19 14.5 22 16 22C17 19.5 18.2 16.4 19 14C20 11 19.5 8 18 5.5C17 3.5 15 2 12 2Z" fill="url(#tooth-grad)" fillOpacity="0.25" />
            {/* Smile / Polish Curve Inside Tooth */}
            <path d="M8.5 9.5C10 11 14 11 15.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            
            <defs>
              <linearGradient id="tooth-grad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="0.5" stopColor="#2DD4BF" />
                <stop offset="1" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Text Header */}
      <div>
        <h1 className={`${currentSize.title} font-black tracking-tight leading-none flex items-center ${variant === 'dark' ? 'text-slate-900' : 'text-white'}`}>
          Smile<span className="text-transparent bg-clip-text bg-gradient-to-r from-tealbrand-400 via-cyan-400 to-tealbrand-300">Care</span>
        </h1>
        {showSubtitle && (
          <p className={`${currentSize.sub} uppercase font-extrabold tracking-wider ${variant === 'dark' ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
            Dental Clinic System
          </p>
        )}
      </div>
    </div>
  );
};
