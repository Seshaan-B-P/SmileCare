import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const base = "inline-flex items-center font-medium rounded-full border transition-colors";
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1 text-sm"
  };

  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    teal: "bg-tealbrand-50 text-tealbrand-700 border-tealbrand-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    doctor: "bg-gradient-to-r from-brand-600 to-tealbrand-600 text-white border-transparent shadow-sm",
    staff: "bg-slate-800 text-white border-slate-700 shadow-sm"
  };

  return (
    <span className={`${base} ${sizeClasses[size]} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};
