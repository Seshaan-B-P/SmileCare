import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, change, isIncrease, icon: Icon, colorTheme = 'brand', subtitle }) => {
  const iconBgColors = {
    brand: 'bg-gradient-to-tr from-brand-600 to-brand-700 text-white shadow-brand-500/25',
    teal: 'bg-gradient-to-tr from-tealbrand-600 to-tealbrand-700 text-white shadow-tealbrand-500/25',
    purple: 'bg-gradient-to-tr from-purple-600 to-purple-700 text-white shadow-purple-500/25',
    emerald: 'bg-gradient-to-tr from-emerald-600 to-emerald-700 text-white shadow-emerald-500/25'
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${iconBgColors[colorTheme]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {change && (
          <span className={`inline-flex items-center gap-1 font-extrabold ${isIncrease ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {change}
          </span>
        )}
        <span className="text-slate-400 font-bold text-[11px]">{subtitle || 'vs last month'}</span>
      </div>
    </div>
  );
};
