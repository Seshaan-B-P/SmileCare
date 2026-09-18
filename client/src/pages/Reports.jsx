import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  IndianRupee, 
  Activity, 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  Stethoscope, 
  HeartPulse, 
  Layers, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { 
  exportToCSV, 
  exportFinancialCSV, 
  exportClinicalCSV, 
  exportDemographicsCSV, 
  triggerPrint 
} from '../utils/exportUtils';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { AppointmentChart } from '../components/dashboard/AppointmentChart';

export const Reports = () => {
  const { 
    patients = [], 
    appointments = [], 
    invoices = [], 
    consultations = [], 
    dentalCharts = {},
    clinicProfile = {},
    showToast 
  } = useData() || {};

  // Date Range State
  const [dateRange, setDateRange] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Active View Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'financial' | 'clinical' | 'demographics'

  // Search filters for tables
  const [financialSearch, setFinancialSearch] = useState('');
  const [clinicalSearch, setClinicalSearch] = useState('');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Safe date parser
  const parseSafeDate = (dStr) => {
    if (!dStr) return null;
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Check if a date string falls inside the chosen filter range
  const isWithinDateRange = (dateStr) => {
    if (dateRange === 'all') return true;
    if (!dateStr) return false;
    const target = parseSafeDate(dateStr);
    if (!target) return false;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    if (dateRange === 'today') {
      return targetStart.getTime() === todayStart.getTime();
    }
    if (dateRange === 'week') {
      const pastWeek = new Date(todayStart);
      pastWeek.setDate(pastWeek.getDate() - 7);
      return targetStart >= pastWeek && targetStart <= now;
    }
    if (dateRange === 'month') {
      const pastMonth = new Date(todayStart);
      pastMonth.setDate(pastMonth.getDate() - 30);
      return targetStart >= pastMonth && targetStart <= now;
    }
    if (dateRange === 'year') {
      const pastYear = new Date(todayStart);
      pastYear.setFullYear(pastYear.getFullYear() - 1);
      return targetStart >= pastYear && targetStart <= now;
    }
    if (dateRange === 'custom') {
      const start = customStartDate ? parseSafeDate(customStartDate) : null;
      const end = customEndDate ? parseSafeDate(customEndDate) : null;
      if (start && targetStart < start) return false;
      if (end && targetStart > end) return false;
      return true;
    }
    return true;
  };

  // Filtered Datasets based on selected date range
  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter(i => isWithinDateRange(i.date));
  }, [invoices, dateRange, customStartDate, customEndDate]);

  const filteredConsultations = useMemo(() => {
    return (consultations || []).filter(c => isWithinDateRange(c.date));
  }, [consultations, dateRange, customStartDate, customEndDate]);

  const filteredAppointments = useMemo(() => {
    return (appointments || []).filter(a => isWithinDateRange(a.date));
  }, [appointments, dateRange, customStartDate, customEndDate]);

  // Financial Metrics Calculations
  const financialMetrics = useMemo(() => {
    const grossInvoiced = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const revenueCollected = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
    const balanceDue = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);
    const collectionRate = grossInvoiced > 0 ? Math.round((revenueCollected / grossInvoiced) * 100) : 0;

    // Payment Methods Aggregation
    const paymentMethods = {
      UPI: { count: 0, amount: 0 },
      Cash: { count: 0, amount: 0 },
      'Credit Card': { count: 0, amount: 0 },
      'Debit Card': { count: 0, amount: 0 },
      'Net Banking': { count: 0, amount: 0 },
      Other: { count: 0, amount: 0 }
    };

    filteredInvoices.forEach(inv => {
      const method = inv.paymentMethod || 'Cash';
      const paid = Number(inv.paidAmount) || 0;
      if (paymentMethods[method]) {
        paymentMethods[method].count++;
        paymentMethods[method].amount += paid;
      } else {
        paymentMethods.Other.count++;
        paymentMethods.Other.amount += paid;
      }
    });

    // Payment Status Aggregation
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    filteredInvoices.forEach(inv => {
      const status = (inv.paymentStatus || '').toLowerCase();
      if (status === 'paid') paidCount++;
      else if (status === 'partial') partialCount++;
      else pendingCount++;
    });

    return {
      grossInvoiced,
      revenueCollected,
      balanceDue,
      collectionRate,
      invoiceCount: filteredInvoices.length,
      paymentMethods,
      paidCount,
      partialCount,
      pendingCount
    };
  }, [filteredInvoices]);

  // Clinical Metrics Calculations
  const clinicalMetrics = useMemo(() => {
    const totalConsultations = filteredConsultations.length;
    const uniquePatientsTreated = new Set(filteredConsultations.map(c => c.patientId || c.patientName)).size;
    const followUpsScheduled = filteredConsultations.filter(c => c.followUpDate && c.followUpDate !== 'None').length;
    const followUpRate = totalConsultations > 0 ? Math.round((followUpsScheduled / totalConsultations) * 100) : 0;

    // Top Diagnoses Aggregation
    const diagnosisCounts = {};
    filteredConsultations.forEach(c => {
      const diag = (c.diagnosis || 'Routine Dental Checkup').trim();
      if (diag) {
        diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1;
      }
    });

    const topDiagnoses = Object.entries(diagnosisCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tooth Pathology / Odontogram Findings from dentalCharts
    let decayCount = 0;
    let crownCount = 0;
    let missingCount = 0;
    let filledCount = 0;
    let rctCount = 0;
    let healthyCount = 0;

    Object.values(dentalCharts || {}).forEach(patientChart => {
      if (typeof patientChart === 'object' && patientChart !== null) {
        Object.values(patientChart).forEach(toothData => {
          const cond = (toothData.condition || toothData.status || toothData || '').toString().toLowerCase();
          if (cond.includes('cavity') || cond.includes('caries') || cond.includes('decay')) decayCount++;
          else if (cond.includes('crown') || cond.includes('cap')) crownCount++;
          else if (cond.includes('missing') || cond.includes('extracted')) missingCount++;
          else if (cond.includes('fill') || cond.includes('composite')) filledCount++;
          else if (cond.includes('rct') || cond.includes('root canal')) rctCount++;
          else if (cond.includes('healthy') || cond.includes('sound')) healthyCount++;
        });
      }
    });

    const totalPathologyTeeth = decayCount + crownCount + missingCount + filledCount + rctCount;

    return {
      totalConsultations,
      uniquePatientsTreated,
      followUpsScheduled,
      followUpRate,
      topDiagnoses,
      pathology: {
        decayCount,
        crownCount,
        missingCount,
        filledCount,
        rctCount,
        totalPathologyTeeth
      }
    };
  }, [filteredConsultations, dentalCharts]);

  // Demographics Calculations (Real dynamic data calculated from patients array)
  const demographicsMetrics = useMemo(() => {
    let femaleCount = 0;
    let maleCount = 0;
    let otherCount = 0;
    let totalAge = 0;
    let ageCount = 0;

    const ageBrackets = {
      pediatric: 0,   // < 18
      youngAdult: 0,  // 18 - 35
      middleAdult: 0, // 36 - 55
      senior: 0       // 56+
    };

    patients.forEach(p => {
      const g = (p.gender || '').toLowerCase();
      if (g === 'female') femaleCount++;
      else if (g === 'male') maleCount++;
      else otherCount++;

      const age = Number(p.age);
      if (!isNaN(age) && age > 0) {
        totalAge += age;
        ageCount++;
        if (age < 18) ageBrackets.pediatric++;
        else if (age <= 35) ageBrackets.youngAdult++;
        else if (age <= 55) ageBrackets.middleAdult++;
        else ageBrackets.senior++;
      }
    });

    const totalPatients = patients.length;
    const femalePercent = totalPatients > 0 ? Math.round((femaleCount / totalPatients) * 100) : 0;
    const malePercent = totalPatients > 0 ? Math.round((maleCount / totalPatients) * 100) : 0;
    const otherPercent = totalPatients > 0 ? Math.max(0, 100 - femalePercent - malePercent) : 0;
    const avgAge = ageCount > 0 ? (totalAge / ageCount).toFixed(1) : '32.0';

    return {
      totalPatients,
      femaleCount,
      maleCount,
      otherCount,
      femalePercent,
      malePercent,
      otherPercent,
      avgAge,
      ageBrackets
    };
  }, [patients]);

  // Export handlers
  const handleExport = (type) => {
    setExportDropdownOpen(false);
    let success = false;
    let label = '';

    if (type === 'financial') {
      success = exportFinancialCSV(filteredInvoices, `SmileCare_Financial_Ledger_${dateRange}.csv`);
      label = 'Financial Ledger';
    } else if (type === 'clinical') {
      success = exportClinicalCSV(filteredConsultations, `SmileCare_Clinical_Reports_${dateRange}.csv`);
      label = 'Clinical Reports';
    } else if (type === 'demographics') {
      success = exportDemographicsCSV(patients, 'SmileCare_Patient_Demographics.csv');
      label = 'Patient Demographics';
    } else if (type === 'all') {
      // Export comprehensive summary
      const summaryData = [
        { Metric: 'Reporting Period', Value: dateRange.toUpperCase() },
        { Metric: 'Total Patient Base', Value: patients.length },
        { Metric: 'Total Consultations in Period', Value: filteredConsultations.length },
        { Metric: 'Gross Invoiced Amount (INR)', Value: financialMetrics.grossInvoiced },
        { Metric: 'Revenue Collected (INR)', Value: financialMetrics.revenueCollected },
        { Metric: 'Outstanding Dues (INR)', Value: financialMetrics.balanceDue },
        { Metric: 'Collection Rate (%)', Value: `${financialMetrics.collectionRate}%` },
        { Metric: 'Female Ratio (%)', Value: `${demographicsMetrics.femalePercent}%` },
        { Metric: 'Male Ratio (%)', Value: `${demographicsMetrics.malePercent}%` },
        { Metric: 'Average Patient Age (years)', Value: demographicsMetrics.avgAge }
      ];
      success = exportToCSV(summaryData, `SmileCare_Executive_Summary_${dateRange}.csv`);
      label = 'Clinic Executive Summary';
    }

    if (success) {
      if (showToast) showToast(`${label} exported successfully to CSV!`);
    } else {
      if (showToast) showToast(`No data found to export for ${label.toLowerCase()}`, 'info');
    }
  };

  // Filtered lists for tables
  const displayedInvoices = useMemo(() => {
    const q = financialSearch.toLowerCase().trim();
    if (!q) return filteredInvoices;
    return filteredInvoices.filter(i => 
      (i.id || '').toLowerCase().includes(q) ||
      (i.patientName || '').toLowerCase().includes(q) ||
      (i.receiptNo || '').toLowerCase().includes(q) ||
      (i.paymentMethod || '').toLowerCase().includes(q) ||
      (i.paymentStatus || '').toLowerCase().includes(q)
    );
  }, [filteredInvoices, financialSearch]);

  const displayedConsultations = useMemo(() => {
    const q = clinicalSearch.toLowerCase().trim();
    if (!q) return filteredConsultations;
    return filteredConsultations.filter(c => 
      (c.id || '').toLowerCase().includes(q) ||
      (c.patientName || '').toLowerCase().includes(q) ||
      (c.chiefComplaint || '').toLowerCase().includes(q) ||
      (c.diagnosis || '').toLowerCase().includes(q) ||
      (c.treatmentPlan || '').toLowerCase().includes(q)
    );
  }, [filteredConsultations, clinicalSearch]);

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-brand-600" /> Clinical Reports & Financial Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-dimensional clinical audit, revenue intelligence, treatment tracking & demographic cohorts
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Multi-Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="px-4 py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV / Excel</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Select Export Dataset
                </div>
                <button
                  onClick={() => handleExport('financial')}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2"
                >
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Export Financial Ledger ({filteredInvoices.length})
                </button>
                <button
                  onClick={() => handleExport('clinical')}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-brand-600" /> Export Clinical Consultations ({filteredConsultations.length})
                </button>
                <button
                  onClick={() => handleExport('demographics')}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-tealbrand-600" /> Export Demographics ({patients.length})
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => handleExport('all')}
                  className="w-full text-left px-3.5 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" /> Export Executive Summary
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print PDF Summary
          </button>
        </div>
      </div>

      {/* Date Range Selector & Period Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span>Reporting Period:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'Last 12 Months' },
            { id: 'custom', label: 'Custom Range' }
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => setDateRange(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRange === preset.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {dateRange === 'custom' && (
          <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-brand-500 font-semibold"
            />
            <span className="text-xs text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-brand-500 font-semibold"
            />
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Overview Dashboard
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'financial'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <IndianRupee className="w-4 h-4" /> Financial Analytics ({filteredInvoices.length})
        </button>
        <button
          onClick={() => setActiveTab('clinical')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'clinical'
              ? 'bg-tealbrand-50 text-tealbrand-700 border border-tealbrand-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" /> Clinical Reports ({filteredConsultations.length})
        </button>
        <button
          onClick={() => setActiveTab('demographics')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'demographics'
              ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Patient Demographics ({patients.length})
        </button>
      </div>

      {/* Top Level Summary Cards (Always Visible across tabs for quick context) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gross Billed</span>
            <IndianRupee className="w-4 h-4 text-tealbrand-600" />
          </div>
          <div className="text-2xl font-black text-tealbrand-700 mt-1">
            ₹{financialMetrics.grossInvoiced.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{filteredInvoices.length} invoices in period</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Collected</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ₹{financialMetrics.revenueCollected.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
            {financialMetrics.collectionRate}% collection efficiency
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Outstanding Due</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ₹{financialMetrics.balanceDue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{financialMetrics.pendingCount + financialMetrics.partialCount} pending/partial</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Consultations Done</span>
            <Stethoscope className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-brand-600 mt-1">
            {clinicalMetrics.totalConsultations}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{clinicalMetrics.uniquePatientsTreated} unique patients</p>
        </div>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RevenueChart invoices={filteredInvoices} />
            <AppointmentChart appointments={filteredAppointments} consultations={filteredConsultations} />
          </div>

          {/* Quick Demographics Preview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Patient Cohorts & Growth Summary
                </h3>
                <p className="text-xs text-slate-500">Live dynamic demographic metrics calculated across entire clinic database</p>
              </div>
              <button
                onClick={() => setActiveTab('demographics')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View Full Demographics &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
              <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-100">
                <span className="text-purple-500 block text-[10px] uppercase">Female Ratio</span>
                <span className="text-xl font-black text-purple-900">{demographicsMetrics.femalePercent}%</span>
                <span className="text-[10px] text-purple-600 block mt-0.5">{demographicsMetrics.femaleCount} female patients</span>
              </div>
              <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-100">
                <span className="text-sky-500 block text-[10px] uppercase">Male Ratio</span>
                <span className="text-xl font-black text-sky-900">{demographicsMetrics.malePercent}%</span>
                <span className="text-[10px] text-sky-600 block mt-0.5">{demographicsMetrics.maleCount} male patients</span>
              </div>
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <span className="text-emerald-500 block text-[10px] uppercase">Average Patient Age</span>
                <span className="text-xl font-black text-emerald-900">{demographicsMetrics.avgAge} yrs</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Computed across all records</span>
              </div>
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-100">
                <span className="text-amber-600 block text-[10px] uppercase">Total Registered Base</span>
                <span className="text-xl font-black text-amber-900">{patients.length}</span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Active electronic records</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL ANALYTICS */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Payment Method & Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Method Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Payment Methods Breakdown
              </h4>
              <div className="space-y-3">
                {Object.entries(financialMetrics.paymentMethods).map(([method, info]) => {
                  const percent = financialMetrics.revenueCollected > 0 
                    ? Math.round((info.amount / financialMetrics.revenueCollected) * 100) 
                    : 0;
                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">{method} ({info.count} bills)</span>
                        <span className="text-slate-900">₹{info.amount.toLocaleString()} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Status Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Wallet className="w-4 h-4 text-tealbrand-600" /> Invoice Payment Status
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center my-4">
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-black uppercase text-emerald-600 block">Fully Paid</span>
                  <span className="text-xl font-black text-emerald-800">{financialMetrics.paidCount}</span>
                </div>
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-black uppercase text-amber-600 block">Partial Paid</span>
                  <span className="text-xl font-black text-amber-800">{financialMetrics.partialCount}</span>
                </div>
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-black uppercase text-rose-600 block">Pending</span>
                  <span className="text-xl font-black text-rose-800">{financialMetrics.pendingCount}</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                💡 <strong className="text-slate-800">Collection Efficiency:</strong> {financialMetrics.collectionRate}% of all invoiced balances for this period have been received into clinic accounts.
              </div>
            </div>
          </div>

          <RevenueChart invoices={filteredInvoices} />

          {/* Financial Transactions Ledger Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Financial Transaction Ledger ({displayedInvoices.length})
                </h3>
                <p className="text-xs text-slate-500">Comprehensive breakdown of all invoices issued and collections made</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={financialSearch}
                    onChange={(e) => setFinancialSearch(e.target.value)}
                    className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 font-medium w-48"
                  />
                </div>
                <button
                  onClick={() => handleExport('financial')}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">Invoice / Receipt</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Patient Name</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3">Amount Paid</th>
                    <th className="py-2.5 px-3">Balance</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {displayedInvoices.length > 0 ? (
                    displayedInvoices.map((inv, idx) => (
                      <tr key={inv.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-brand-600">
                          {inv.id || 'INV'}
                          {inv.receiptNo && <span className="block text-[10px] text-slate-400 font-normal">#{inv.receiptNo}</span>}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{inv.date || 'N/A'}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{inv.patientName || 'Patient'}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">₹{(Number(inv.totalAmount) || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-emerald-600">₹{(Number(inv.paidAmount) || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-amber-600">₹{(Number(inv.balanceDue) || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-600">{inv.paymentMethod || 'Cash'}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            (inv.paymentStatus || '').toLowerCase() === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : (inv.paymentStatus || '').toLowerCase() === 'partial'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {inv.paymentStatus || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                        No financial records found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLINICAL REPORTS */}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
          {/* Top Clinical Diagnoses & Odontogram Tooth Findings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Diagnoses */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <HeartPulse className="w-4 h-4 text-rose-500" /> Common Clinical Diagnoses
              </h4>
              {clinicalMetrics.topDiagnoses.length > 0 ? (
                <div className="space-y-3">
                  {clinicalMetrics.topDiagnoses.map((diag, idx) => {
                    const pct = Math.round((diag.count / (clinicalMetrics.totalConsultations || 1)) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800">{diag.name}</span>
                          <span className="text-slate-600">{diag.count} cases ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all"
                            style={{ width: `${Math.max(pct, 8)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs font-bold">
                  No consultation diagnoses logged yet for this period.
                </div>
              )}
            </div>

            {/* Tooth Pathology Statistics (from Odontograms) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-brand-600" /> Odontogram Pathology Findings
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center my-2">
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <span className="text-[10px] font-black uppercase text-red-600 block">Carious / Cavities</span>
                  <span className="text-xl font-black text-red-700">{clinicalMetrics.pathology.decayCount}</span>
                  <span className="text-[9px] text-red-500 block">teeth affected</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-[10px] font-black uppercase text-purple-600 block">RCT Performed</span>
                  <span className="text-xl font-black text-purple-700">{clinicalMetrics.pathology.rctCount}</span>
                  <span className="text-[9px] text-purple-500 block">teeth treated</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-black uppercase text-amber-600 block">Crowns Placed</span>
                  <span className="text-xl font-black text-amber-700">{clinicalMetrics.pathology.crownCount}</span>
                  <span className="text-[9px] text-amber-500 block">prosthetic caps</span>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-600 block">Missing Teeth</span>
                  <span className="text-xl font-black text-slate-700">{clinicalMetrics.pathology.missingCount}</span>
                  <span className="text-[9px] text-slate-400 block">edentulous sites</span>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                  <span className="text-[10px] font-black uppercase text-teal-600 block">Restorations</span>
                  <span className="text-xl font-black text-teal-700">{clinicalMetrics.pathology.filledCount}</span>
                  <span className="text-[9px] text-teal-500 block">composite filled</span>
                </div>
                <div className="p-3 bg-brand-50 rounded-xl border border-brand-200">
                  <span className="text-[10px] font-black uppercase text-brand-600 block">Follow-up Rate</span>
                  <span className="text-xl font-black text-brand-700">{clinicalMetrics.followUpRate}%</span>
                  <span className="text-[9px] text-brand-500 block">compliance rate</span>
                </div>
              </div>
            </div>
          </div>

          <AppointmentChart appointments={filteredAppointments} consultations={filteredConsultations} />

          {/* Clinical Consultations Log Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Clinical Consultations & Treatment Ledger ({displayedConsultations.length})
                </h3>
                <p className="text-xs text-slate-500">Detailed case record of all dental treatments and doctor notes</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search consultations..."
                    value={clinicalSearch}
                    onChange={(e) => setClinicalSearch(e.target.value)}
                    className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 font-medium w-48"
                  />
                </div>
                <button
                  onClick={() => handleExport('clinical')}
                  className="px-3 py-1.5 bg-tealbrand-50 text-tealbrand-700 font-extrabold text-xs rounded-lg border border-tealbrand-200 hover:bg-tealbrand-100 transition-colors flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Chief Complaint</th>
                    <th className="py-2.5 px-3">Diagnosis</th>
                    <th className="py-2.5 px-3">Treatment Plan</th>
                    <th className="py-2.5 px-3">Follow-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {displayedConsultations.length > 0 ? (
                    displayedConsultations.map((c, idx) => (
                      <tr key={c.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{c.date || 'N/A'}</td>
                        <td className="py-3 px-3 font-bold text-brand-600 whitespace-nowrap">{c.id || `CNS-${idx + 1}`}</td>
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">{c.patientName || 'Patient'}</td>
                        <td className="py-3 px-3 max-w-[160px] truncate" title={c.chiefComplaint}>{c.chiefComplaint || 'Checkup'}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800 max-w-[160px] truncate" title={c.diagnosis}>{c.diagnosis || 'Routine'}</td>
                        <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate" title={c.treatmentPlan}>{c.treatmentPlan || c.procedureNotes || 'None'}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {c.followUpDate && c.followUpDate !== 'None' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              {c.followUpDate}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">None</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                        No clinical consultations found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PATIENT DEMOGRAPHICS */}
      {activeTab === 'demographics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" /> Patient Population Demographics
                </h3>
                <p className="text-xs text-slate-500">Live breakdown calculated across all {patients.length} active registered patients</p>
              </div>

              <button
                onClick={() => handleExport('demographics')}
                className="px-3.5 py-2 bg-purple-50 text-purple-700 font-extrabold text-xs rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Demographics CSV
              </button>
            </div>

            {/* Gender Ratio Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200/80">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Female Patients</span>
                <div className="text-2xl font-black text-purple-900 mt-1">{demographicsMetrics.femalePercent}%</div>
                <div className="text-xs text-purple-700 mt-1 font-semibold">{demographicsMetrics.femaleCount} patients registered</div>
              </div>

              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200/80">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-600">Male Patients</span>
                <div className="text-2xl font-black text-sky-900 mt-1">{demographicsMetrics.malePercent}%</div>
                <div className="text-xs text-sky-700 mt-1 font-semibold">{demographicsMetrics.maleCount} patients registered</div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Average Patient Age</span>
                <div className="text-2xl font-black text-emerald-900 mt-1">{demographicsMetrics.avgAge} yrs</div>
                <div className="text-xs text-emerald-700 mt-1 font-semibold">Mean chronological age</div>
              </div>
            </div>

            {/* Age Cohorts Distribution */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Age Brackets Distribution
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Pediatric (<18y)', count: demographicsMetrics.ageBrackets.pediatric, color: 'bg-indigo-500' },
                  { label: 'Young Adult (18-35y)', count: demographicsMetrics.ageBrackets.youngAdult, color: 'bg-brand-500' },
                  { label: 'Middle Adult (36-55y)', count: demographicsMetrics.ageBrackets.middleAdult, color: 'bg-tealbrand-500' },
                  { label: 'Senior (56y+)', count: demographicsMetrics.ageBrackets.senior, color: 'bg-amber-500' },
                ].map((bracket, idx) => {
                  const pct = patients.length > 0 ? Math.round((bracket.count / patients.length) * 100) : 0;
                  return (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>{bracket.label}</span>
                        <span className="text-slate-900">{bracket.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${bracket.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* PRINT PREVIEW MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 printable-area space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="border-b pb-4 border-slate-900 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900">{clinicProfile.name || 'SmileCare Dental Speciality Clinic'}</h1>
                <p className="text-xs text-slate-600">{clinicProfile.address || 'Chennai, Tamil Nadu'}</p>
                <p className="text-xs text-slate-600">Reg No: {clinicProfile.registrationNo || 'TN-MOH-2024-884'} | Phone: {clinicProfile.phone || '+91 44 2621 8899'}</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-black uppercase text-brand-700">Audit & Analytics Report</h2>
                <p className="text-xs text-slate-500">Generated on: {new Date().toLocaleDateString()}</p>
                <p className="text-xs font-bold text-slate-700">Period: {dateRange.toUpperCase()}</p>
              </div>
            </div>

            {/* Financial Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase border-b border-slate-300 pb-1 text-slate-800">1. Financial Ledger & Revenue Performance</h3>
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 text-[10px] uppercase">Gross Billed</span>
                  <strong className="text-base text-slate-900">₹{financialMetrics.grossInvoiced.toLocaleString()}</strong>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 text-[10px] uppercase">Revenue Collected</span>
                  <strong className="text-base text-emerald-700">₹{financialMetrics.revenueCollected.toLocaleString()}</strong>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 text-[10px] uppercase">Pending Dues</span>
                  <strong className="text-base text-amber-700">₹{financialMetrics.balanceDue.toLocaleString()}</strong>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 text-[10px] uppercase">Collection Rate</span>
                  <strong className="text-base text-brand-700">{financialMetrics.collectionRate}%</strong>
                </div>
              </div>
            </div>

            {/* Clinical Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase border-b border-slate-300 pb-1 text-slate-800">2. Clinical Consultations & Treatment Volume</h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 text-[10px] uppercase">Total Consultations</span>
                  <strong className="text-base text-slate-900">{clinicalMetrics.totalConsultations}</strong>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 text-[10px] uppercase">Unique Patients</span>
                  <strong className="text-base text-brand-700">{clinicalMetrics.uniquePatientsTreated}</strong>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 text-[10px] uppercase">Follow-up Compliance</span>
                  <strong className="text-base text-purple-700">{clinicalMetrics.followUpRate}%</strong>
                </div>
              </div>
            </div>

            {/* Demographics Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase border-b border-slate-300 pb-1 text-slate-800">3. Active Patient Demographics</h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 text-[10px] uppercase">Patient Base</span>
                  <strong className="text-base text-slate-900">{demographicsMetrics.totalPatients}</strong>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 text-[10px] uppercase">Gender Distribution</span>
                  <strong className="text-base text-slate-900">{demographicsMetrics.femalePercent}% F / {demographicsMetrics.malePercent}% M</strong>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 text-[10px] uppercase">Average Patient Age</span>
                  <strong className="text-base text-emerald-700">{demographicsMetrics.avgAge} years</strong>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 flex justify-between items-end text-xs">
              <div>
                <p className="border-t border-slate-400 pt-1 font-bold text-slate-700">Authorized Medical Director</p>
              </div>
              <div>
                <p className="border-t border-slate-400 pt-1 font-bold text-slate-700">Official Clinic Seal</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="no-print flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={triggerPrint}
                className="px-5 py-2 text-xs font-extrabold bg-slate-900 text-white rounded-xl shadow hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
