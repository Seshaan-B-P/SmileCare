import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Calendar, 
  Clock, 
  Sparkles,
  Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const Navbar = ({ activeTab, setActiveTab, onSelectPatient }) => {
  const { currentUser, activeRole, logout, isDoctor } = useAuth();
  const { patients, activityLog } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const filteredPatients = searchQuery.trim() 
    ? patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery))
    : [];

  const pageTitles = {
    dashboard: 'Dashboard Overview',
    'doctor-profile': isDoctor ? 'Doctor Profile & Clinical Qualifications' : 'Staff Profile & Assigned Permissions',
    patients: 'Patient Directory & Medical Records',
    appointments: 'Appointment Calendar & Live Queue',
    consultation: 'Clinical Consultation & Tooth Charting',
    billing: 'Billing, Invoices & Payment Ledger',
    whatsapp: 'WhatsApp Follow-Up & Reminder Hub',
    staff: 'Staff Roster & RBAC Permissions',
    reports: 'Clinical Reports & Financial Analytics',
    settings: 'Clinic Profile & WhatsApp Config'
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">
            {pageTitles[activeTab] || 'SmileCare System'}
          </h2>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Global Quick Search Bar */}
      <div className="relative w-80 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient name, ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs font-bold text-slate-900 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-inner"
          />
        </div>

        {searchQuery.trim() !== '' && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in max-h-64 overflow-y-auto">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => {
                    if (onSelectPatient) onSelectPatient(patient);
                    setActiveTab('patients');
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-brand-50 flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{patient.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{patient.id} • {patient.phone}</div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {patient.gender}, {patient.age}y
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 font-bold text-center">No matching patients found</div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Notifications & Profile Pill */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 relative transition-colors border border-transparent hover:border-slate-200"
            title="Activity Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-fade-in">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Recent Clinic Activity
                </h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Live Stream</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {activityLog.slice(0, 5).map(act => (
                  <div key={act.id} className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <div className="text-xs font-bold text-slate-800 leading-snug">{act.action}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" /> {act.time} • {act.user}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pl-2 pr-3 rounded-2xl hover:bg-slate-100/80 transition-all border border-slate-200/70 shadow-2xs"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-brand-500/30 shadow-sm"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-black text-slate-900 leading-tight">{currentUser?.name}</div>
              <div className="text-[10px] text-slate-500 font-bold">{currentUser?.title}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 space-y-1">
                <div className="text-xs font-black text-slate-900">{currentUser?.name}</div>
                <div className="text-[11px] text-slate-500 font-medium truncate">{currentUser?.email}</div>
                <div className="mt-1 flex items-center gap-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isDoctor ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-tealbrand-50 text-tealbrand-700 border border-tealbrand-200'}`}>
                    {currentUser?.role || 'Staff'} {currentUser?.regNo ? `(#${currentUser.regNo})` : currentUser?.idProofNo ? `(#${currentUser.idProofNo})` : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('doctor-profile');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-bold transition-colors"
              >
                <User className="w-4 h-4 text-brand-600" /> {isDoctor ? 'Doctor Profile' : 'My Profile'}
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-bold transition-colors"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" /> Clinic Settings
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 border-t border-slate-100 font-extrabold transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
