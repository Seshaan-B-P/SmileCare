import React from 'react';
import { IndianRupee, ArrowUpRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const RevenueChart = () => {
  const { invoices = [] } = useData();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  
  const dataPoints = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const mName = monthNames[d.getMonth()];
    const yr = d.getFullYear();
    
    const totalMonthRev = invoices
      .filter(inv => {
        if (!inv.date) return false;
        const invD = new Date(inv.date);
        return invD.getFullYear() === yr && invD.getMonth() === d.getMonth();
      })
      .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

    return { month: mName, revenue: totalMonthRev };
  });

  const maxRev = Math.max(...dataPoints.map(d => d.revenue), 1);
  const totalPeriodRevenue = dataPoints.reduce((a, b) => a + b.revenue, 0);
  const avgMonthly = Math.round(totalPeriodRevenue / 6);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" /> Monthly Revenue Trend
          </h4>
          <p className="text-xs text-slate-500">Gross revenue performance over last 6 months</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200">
          <ArrowUpRight className="w-3.5 h-3.5" /> ₹{totalPeriodRevenue.toLocaleString()} Total
        </div>
      </div>

      <div className="h-52 w-full flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
        {dataPoints.map((pt, idx) => {
          const heightPercent = pt.revenue > 0 ? Math.max((pt.revenue / maxRev) * 100, 10) : 4;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md pointer-events-none mb-1">
                ₹{pt.revenue.toLocaleString()}
              </div>

              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[42px] rounded-t-lg transition-all group-hover:brightness-110 shadow-sm relative overflow-hidden ${
                  pt.revenue > 0 
                    ? 'bg-gradient-to-t from-brand-600 via-brand-500 to-tealbrand-400' 
                    : 'bg-slate-200'
                }`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <span className="text-xs font-semibold text-slate-600 mt-1">{pt.month}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Average: <strong className="text-slate-800">₹{avgMonthly.toLocaleString()} / mo</strong></span>
        <span>Total H2 Revenue: <strong className="text-brand-600 font-bold">₹{totalPeriodRevenue.toLocaleString()}</strong></span>
      </div>
    </div>
  );
};
