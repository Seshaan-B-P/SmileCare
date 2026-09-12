import React, { useState } from 'react';

export const Logo = ({ size = 'md', variant = 'light', showSubtitle = true, className = '', iconOnly = false }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeMap = {
    sm: { img: 'w-8 h-8', title: 'text-base', sub: 'text-[9px]' },
    md: { img: 'w-10 h-10', title: 'text-xl', sub: 'text-[10px]' },
    lg: { img: 'w-14 h-14', title: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'w-16 h-16', title: 'text-3xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Brand Logo Badge */}
      <div className={`relative ${currentSize.img} rounded-2xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-white p-1 border border-slate-200/80`}>
        {!imgFailed ? (
          <img
            src="/logo.png"
            alt="SmileCare Logo"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-contain"
          />
        ) : (
          /* SVG Vector Representation of Tooth + Smile + Cross */
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="logoToothGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0062D2" />
                <stop offset="60%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#00B4B6" />
              </linearGradient>
            </defs>
            {/* Stylized Tooth Contour */}
            <path
              d="M32 18 C22 18 16 28 16 40 C16 54 24 72 32 88 C38 88 44 78 50 68 C56 78 62 88 68 88 C76 72 84 54 84 40 C84 28 78 18 68 18 C60 18 54 24 50 24 C46 24 40 18 32 18 Z"
              stroke="url(#logoToothGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#ffffff"
            />
            {/* Smile Arc with Cheek Curve */}
            <path
              d="M33 46 Q50 62 67 46"
              stroke="#0062D2"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Medical Plus / Cross Sign */}
            <path
              d="M72 16 H82 M77 11 V21"
              stroke="#00B4B6"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Brand Text Header & Tagline */}
      {!iconOnly && (
        <div className="leading-tight">
          <h1 className={`${currentSize.title} font-black tracking-tight leading-none flex items-center`}>
            <span className="text-[#0062D2]">Smile</span>
            <span className="text-[#00B4B6]">Care</span>
          </h1>
          {showSubtitle && (
            <p className={`${currentSize.sub} font-bold tracking-tight ${variant === 'dark' ? 'text-slate-500' : 'text-slate-300'} mt-0.5 whitespace-nowrap`}>
              Better Smiles <span className="text-[#00B4B6] mx-0.5">•</span> Healthier Lives
            </p>
          )}
        </div>
      )}
    </div>
  );
};
