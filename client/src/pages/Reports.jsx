import React from 'react';
import { BarChart3, FileSpreadsheet, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';
import { exportToCSV, triggerPrint } from '../utils/exportUtils';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { AppointmentChart } from '../components/dashboard/AppointmentChart';

export const Reports = () => {
  const { patients, appointments, invoices, consultations } = useData();

  const handleExportCSV = () => {
    const reportData = invoices.map(i => ({
      InvoiceNo: i.id,
      PatientName: i.patientName,
      Date: i.date,
      TotalAmount: i.totalAmount,
      PaidAmount: i.paidAmount,
      BalanceDue: i.balanceDue,
      Status: i.paymentStatus,
      PaymentMethod: i.paymentMethod || 'Credit Card'
    }));
    exportToCSV(reportData, 'SmileCare_Financial_Report.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" /> Clinical & Financial Analytics
          </h2>
          <p className="text-xs text-slate-500">Comprehensive daily reports, treatment distribution, and downloadable logs</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download Excel / CSV
          </button>
          <button
            onClick={triggerPrint}
            className="px-4 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print PDF Summary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Patient Base</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{patients.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Consultations</span>
          <div className="text-2xl font-black text-brand-600 mt-1">{consultations.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gross Invoiced</span>
          <div className="text-2xl font-black text-tealbrand-600 mt-1">₹{invoices.reduce((a, b) => a + b.totalAmount, 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Revenue Collected</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{invoices.reduce((a, b) => a + b.paidAmount, 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueChart />
        <AppointmentChart />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
          Patient Demographics & Growth Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">Female Ratio</span>
            <span className="text-lg font-black text-slate-900">58%</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">Male Ratio</span>
            <span className="text-lg font-black text-slate-900">42%</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">Average Patient Age</span>
            <span className="text-lg font-black text-slate-900">36.5 years</span>
          </div>
        </div>
      </div>
    </div>
  );
};
