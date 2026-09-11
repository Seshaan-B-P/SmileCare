import React from 'react';
import { Users, CalendarCheck, Clock, Activity, Sparkles, IndianRupee } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/dashboard/StatCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { AppointmentChart } from '../components/dashboard/AppointmentChart';
import { QueueWidget } from '../components/appointments/QueueWidget';

export const Dashboard = ({ setActiveTab, onOpenAddPatient, onOpenNewApt, onOpenConsultation, onOpenBilling, onStartConsultation }) => {
  const { patients, appointments, followUps, invoices, activityLog, updateAppointmentStatus } = useData();
  const { currentUser } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Evening';
  };

  const todayDate = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.date === todayDate);
  const pendingFollowUps = followUps.filter(f => f.status === 'Pending');

  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Radiant Executive Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-tealbrand-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-tealbrand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-tealbrand-300 border border-white/15 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Clinical Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">{getGreeting()}, {currentUser?.name || 'SmileCare Team'}!</h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl font-medium leading-relaxed">
              You have <strong className="text-white font-black">{todayApts.length} appointments</strong> scheduled for today and <strong className="text-tealbrand-300 font-black">{pendingFollowUps.length} pending WhatsApp follow-ups</strong>.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('consultation')}
            className="px-6 py-3.5 bg-gradient-to-r from-tealbrand-500 via-tealbrand-600 to-brand-600 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-tealbrand-950/40 transition-all flex items-center justify-center gap-2.5 self-start md:self-auto active:scale-[0.99]"
          >
            <Clock className="w-4 h-4" /> Start Today's First Consultation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={patients.length.toLocaleString()}
          change="+12.4%"
          isIncrease={true}
          icon={Users}
          colorTheme="brand"
        />
        <StatCard
          title="Today's Appointments"
          value={todayApts.length.toString()}
          change="+3 scheduled"
          isIncrease={true}
          icon={CalendarCheck}
          colorTheme="teal"
        />
        <StatCard
          title="Pending Follow-ups"
          value={pendingFollowUps.length.toString()}
          change="WhatsApp ready"
          isIncrease={true}
          icon={Clock}
          colorTheme="purple"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          change="+15.9%"
          isIncrease={true}
          icon={IndianRupee}
          colorTheme="emerald"
        />
      </div>

      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
          Quick Workflows & Actions
        </h3>
        <QuickActions
          onOpenAddPatient={onOpenAddPatient}
          onOpenNewApt={onOpenNewApt}
          onOpenConsultation={onOpenConsultation}
          onOpenBilling={onOpenBilling}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <QueueWidget
            appointments={appointments}
            onUpdateStatus={updateAppointmentStatus}
            onStartConsultation={(apt) => {
              if (onStartConsultation) onStartConsultation(apt);
              setActiveTab('consultation');
            }}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <RevenueChart />
          <AppointmentChart />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h4 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600" /> Recent Clinic Activity Stream
          </h4>
          <span className="text-xs font-bold text-slate-400">Real-time log</span>
        </div>
        <div className="divide-y divide-slate-100">
          {activityLog.slice(0, 5).map(act => (
            <div key={act.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                <div>
                  <div className="font-bold text-slate-800">{act.action}</div>
                  <div className="text-[11px] text-slate-500">By {act.user}</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
