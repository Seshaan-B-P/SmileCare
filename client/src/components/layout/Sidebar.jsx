import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  CreditCard,
  MessageSquareText,
  UserCog,
  BarChart3,
  Settings,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

import { Logo } from '../common/Logo';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser, isDoctor } = useAuth();
  const { followUps, appointments } = useData();

  const pendingFollowUpsCount = followUps.filter(f => f.status === 'Pending').length;
  const todayAppointmentsCount = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'all' },
    { id: 'patients', label: 'Patient Directory', icon: Users, role: 'all' },
    { id: 'appointments', label: 'Appointments & Queue', icon: CalendarDays, role: 'all', badge: todayAppointmentsCount ? `${todayAppointmentsCount} Today` : null, badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    { id: 'consultation', label: 'Consultation & Chart', icon: Stethoscope, role: 'all' },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard, role: 'all' },
    { id: 'whatsapp', label: 'WhatsApp Reminders', icon: MessageSquareText, role: 'all', badge: pendingFollowUpsCount ? `${pendingFollowUpsCount}` : null, badgeColor: 'bg-tealbrand-500 text-white shadow-sm' },
    { id: 'staff', label: 'Staff Management', icon: UserCog, role: 'doctorOnly' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, role: 'doctorOnly' },
    { id: 'doctor-profile', label: isDoctor ? 'Doctor Profile' : 'My Profile', icon: UserCheck, role: 'all' },
    { id: 'settings', label: 'Clinic Settings', icon: Settings, role: 'all' },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col min-h-screen border-r border-slate-800/80 shrink-0 select-none relative z-20 shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Logo size="md" variant="light" />
      </div>

      {/* Logged User Info Card */}
      <div 
        onClick={() => setActiveTab('doctor-profile')}
        className="px-3.5 py-3 mx-3.5 mt-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 hover:from-slate-800 hover:to-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between shadow-inner cursor-pointer transition-all group"
        title="View & Edit Profile"
      >
        <div className="flex items-center gap-3 min-w-0">
          {currentUser?.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/40 shrink-0 shadow-sm group-hover:scale-105 transition-transform" 
            />
          ) : (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${isDoctor ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm' : 'bg-tealbrand-500/20 text-tealbrand-300 border border-tealbrand-500/40 shadow-sm'}`}>
              {isDoctor ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-black text-white truncate leading-tight group-hover:text-brand-300 transition-colors">{currentUser?.name}</div>
            <div className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isDoctor ? 'bg-brand-400' : 'bg-tealbrand-400'}`}></span>
              <span>{currentUser?.role || 'Staff'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Navigation Menu</div>
        {menuItems.map(item => {
          if (item.role === 'doctorOnly' && !isDoctor) return null;
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-brand-600 via-brand-700 to-tealbrand-600 text-white shadow-lg shadow-brand-950/50 scale-[1.01]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-brand-500/20 text-brand-300 border border-brand-500/30')}`}>
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-4 h-4 opacity-80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Details */}
      <div className="p-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-1 text-slate-400 font-bold text-[11px]">
          <Sparkles className="w-3 h-3 text-amber-300" /> SmileCare Healthcare SaaS
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">v2.5 • Clinical Edition</p>
      </div>
    </aside>
  );
};
