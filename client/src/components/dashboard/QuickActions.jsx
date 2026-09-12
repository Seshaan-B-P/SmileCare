import React from 'react';
import { UserPlus, CalendarPlus, FileText, ArrowRight, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const QuickActions = ({ onOpenAddPatient, onOpenNewApt, onOpenConsultation, onOpenBilling }) => {
  const { isDoctor, hasPermission } = useAuth();

  const actions = [
    {
      title: 'Add Patient',
      desc: 'Register new dental patient',
      icon: UserPlus,
      permKey: 'patients',
      gradient: 'from-brand-600 via-brand-700 to-brand-800 shadow-brand-500/20',
      onClick: onOpenAddPatient
    },
    {
      title: 'New Appointment',
      desc: 'Schedule appointment slot',
      icon: CalendarPlus,
      permKey: 'appointments',
      gradient: 'from-tealbrand-600 via-tealbrand-700 to-tealbrand-800 shadow-tealbrand-500/20',
      onClick: onOpenNewApt
    },
    {
      title: 'New Consultation',
      desc: 'Start dental exam & Rx',
      icon: FileText,
      permKey: 'consultation',
      gradient: 'from-purple-600 via-purple-700 to-purple-800 shadow-purple-500/20',
      onClick: onOpenConsultation
    },
    {
      title: 'Generate Bill',
      desc: 'Issue invoice & payment',
      icon: IndianRupee,
      permKey: 'billing',
      gradient: 'from-emerald-600 via-emerald-700 to-emerald-800 shadow-emerald-500/20',
      onClick: onOpenBilling
    }
  ];

  const visibleActions = actions.filter(act => isDoctor || hasPermission(act.permKey));
  if (visibleActions.length === 0) return null;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${visibleActions.length >= 4 ? 'lg:grid-cols-4' : visibleActions.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
      {visibleActions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <button
            key={idx}
            onClick={act.onClick}
            className={`group text-left p-5 min-h-[140px] flex flex-col justify-between rounded-2xl bg-gradient-to-br ${act.gradient} text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden active:scale-[0.99]`}
          >
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
            
            <div className="flex items-center justify-between relative z-10 w-full">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="mt-3 relative z-10">
              <h4 className="font-extrabold text-sm tracking-tight leading-snug text-white">{act.title}</h4>
              <p className="text-xs text-white/90 font-medium mt-0.5 leading-snug">{act.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
