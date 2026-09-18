import React, { useState } from 'react';
import { IndianRupee, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const RevenueChart = ({ invoices: propInvoices }) => {
  const { invoices: contextInvoices = [] } = useData() || {};
  const invoices = propInvoices || contextInvoices;

  const [metric, setMetric] = useState('paid'); // 'paid' | 'billed'

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  const parseDate = (dStr) => {
    if (!dStr) return null;
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const dataPoints = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const mName = monthNames[d.getMonth()];
    const yr = d.getFullYear();

    const matchingInvoices = (invoices || []).filter(inv => {
      const invD = parseDate(inv.date);
      if (!invD) return false;
      return invD.getFullYear() === yr && invD.getMonth() === d.getMonth();
    });

    const revenue = matchingInvoices.reduce((sum, inv) => {
      const val = metric === 'paid' ? Number(inv.paidAmount) || 0 : Number(inv.totalAmount) || 0;
      return sum + val;
    }, 0);

    return { month: mName, revenue, count: matchingInvoices.length };
  });

  const maxRev = Math.max(...dataPoints.map(d => d.revenue), 1);
  const totalPeriodRevenue = dataPoints.reduce((a, b) => a + b.revenue, 0);
  const avgMonthly = Math.round(totalPeriodRevenue / 6);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" /> Revenue Trend (Last 6 Months)
          </h4>
          <p className="text-xs text-slate-500">
            {metric === 'paid' ? 'Actual collections received' : 'Gross invoiced amounts'} over recent months
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs font-bold">
            <button
              onClick={() => setMetric('paid')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metric === 'paid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Collected
            </button>
            <button
              onClick={() => setMetric('billed')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metric === 'billed' ? 'bg-white text-tealbrand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Invoiced
            </button>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200">
            <ArrowUpRight className="w-3.5 h-3.5" /> ₹{totalPeriodRevenue.toLocaleString()} Total
          </div>
        </div>
      </div>

      <div className="h-52 w-full flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
        {dataPoints.map((pt, idx) => {
          const heightPercent = pt.revenue > 0 ? Math.max((pt.revenue / maxRev) * 100, 12) : 6;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md pointer-events-none mb-1 text-center whitespace-nowrap z-10">
                ₹{pt.revenue.toLocaleString()}
                <span className="block text-[9px] text-slate-300 font-normal">{pt.count} bills</span>
              </div>

              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[42px] rounded-t-lg transition-all group-hover:brightness-110 shadow-sm relative overflow-hidden ${
                  pt.revenue > 0 
                    ? metric === 'paid'
                      ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-tealbrand-400' 
                      : 'bg-gradient-to-t from-brand-600 via-brand-500 to-tealbrand-400'
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
        <span>6-Month Total: <strong className="text-brand-600 font-bold">₹{totalPeriodRevenue.toLocaleString()}</strong></span>
      </div>
    </div>
  );
};
