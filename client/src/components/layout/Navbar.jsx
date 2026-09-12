import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Calendar, 
  Clock, 
  Sparkles,
  Settings as SettingsIcon,
  ChevronDown,
  Camera,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const Navbar = ({ activeTab, setActiveTab, onSelectPatient }) => {
  const { currentUser, activeRole, logout, isDoctor } = useAuth();
  const { patients, activityLog } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Track last read notification to only show red dot on genuinely new notifications
  const [lastReadNotifId, setLastReadNotifId] = useState(() => {
    try {
      return localStorage.getItem('smilecare_last_read_notif') || null;
    } catch {
      return null;
    }
  });

  const [notificationTab, setNotificationTab] = useState('all'); // 'all' | 'staff'

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter staff actions specifically for Doctor alerts
  const staffActivities = useMemo(() => {
    return (activityLog || []).filter(act => act.isStaff || act.role === 'Staff' || act.user?.toLowerCase().includes('staff'));
  }, [activityLog]);

  // Determine if there is any new / unread notification
  const { hasNewNotifications, unreadCount } = useMemo(() => {
    if (!activityLog || activityLog.length === 0) {
      return { hasNewNotifications: false, unreadCount: 0 };
    }
    const latestId = activityLog[0]?.id;
    if (!lastReadNotifId) {
      // If user has never opened notifications yet, show new dot if activities exist
      return { hasNewNotifications: true, unreadCount: activityLog.length };
    }
    const lastReadIndex = activityLog.findIndex(act => act.id === lastReadNotifId);
    if (lastReadIndex === -1) {
      // All current notifications are newer than the saved read ID
      return { hasNewNotifications: true, unreadCount: activityLog.length };
    }
    return {
      hasNewNotifications: lastReadIndex > 0,
      unreadCount: lastReadIndex
    };
  }, [activityLog, lastReadNotifId]);

  const displayedNotifications = useMemo(() => {
    if (isDoctor && notificationTab === 'staff') {
      return staffActivities;
    }
    return activityLog || [];
  }, [activityLog, staffActivities, isDoctor, notificationTab]);

  const handleToggleNotifications = () => {
    const willOpen = !showNotifications;
    setShowNotifications(willOpen);
    if (willOpen && activityLog && activityLog.length > 0) {
      const topId = activityLog[0]?.id;
      if (topId) {
        setLastReadNotifId(topId);
        try {
          localStorage.setItem('smilecare_last_read_notif', topId);
        } catch (e) {
          console.warn(e);
        }
      }
    }
  };

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
        <div className="relative" ref={notifRef}>
          <button
            id="navbar-notification-bell"
            onClick={handleToggleNotifications}
            className="p-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 relative transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            title={hasNewNotifications ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}` : 'Activity Notifications'}
          >
            <Bell className="w-4.5 h-4.5" />
            {hasNewNotifications && (
              <span 
                id="notification-red-dot" 
                className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" 
              />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-fade-in">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" /> {isDoctor ? 'Clinic & Staff Alerts' : 'Recent Clinic Activity'}
                </h4>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 ? (
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold">
                      {unreadCount} New
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Live Stream</span>
                  )}
                </div>
              </div>

              {/* Doctor-exclusive Staff Activity Filter */}
              {isDoctor && (
                <div className="flex items-center px-3 pt-2 pb-1.5 gap-1.5 border-b border-slate-100 bg-slate-50/60">
                  <button
                    type="button"
                    onClick={() => setNotificationTab('all')}
                    className={`flex-1 py-1.5 px-2.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                      notificationTab === 'all'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    All Activities ({activityLog?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationTab('staff')}
                    className={`flex-1 py-1.5 px-2.5 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      notificationTab === 'staff'
                        ? 'bg-amber-500 text-white shadow-xs font-black'
                        : 'text-amber-800 hover:bg-amber-100/60 bg-amber-50 border border-amber-200/60'
                    }`}
                  >
                    <UserCog className="w-3.5 h-3.5" />
                    Staff Actions ({staffActivities.length})
                  </button>
                </div>
              )}

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {displayedNotifications && displayedNotifications.length > 0 ? (
                  displayedNotifications.slice(0, 8).map((act, index) => {
                    const isNew = notificationTab === 'all' && index < unreadCount;
                    const isStaff = act.isStaff || act.role === 'Staff' || act.user?.toLowerCase().includes('staff');
                    return (
                      <div 
                        key={act.id} 
                        className={`px-4 py-2.5 transition-colors ${
                          isStaff 
                            ? 'bg-amber-50/30 hover:bg-amber-50/70 border-l-2 border-amber-400' 
                            : isNew 
                              ? 'bg-brand-50/40 hover:bg-brand-50/70' 
                              : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-bold text-slate-800 leading-snug">{act.action}</div>
                          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                            {isStaff && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200/80">
                                Staff Alert
                              </span>
                            )}
                            {isNew && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="New notification"></span>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {act.time}
                          </span>
                          <span className={isStaff ? 'text-amber-700 font-bold flex items-center gap-1' : 'text-slate-500'}>
                            {isStaff && <UserCog className="w-3 h-3 text-amber-600" />}
                            {act.user} {isStaff && !act.user.toLowerCase().includes('staff') ? '(Staff)' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-xs text-slate-400 font-medium">
                    {notificationTab === 'staff' ? 'No staff activity recorded yet' : 'No recent activity'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pl-2 pr-3 rounded-2xl hover:bg-slate-100/80 transition-all border border-slate-200/70 shadow-2xs"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80';
              }}
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
                  setActiveTab('doctor-profile');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-tealbrand-700 hover:bg-tealbrand-50 flex items-center gap-2.5 font-bold transition-colors"
              >
                <Camera className="w-4 h-4 text-tealbrand-600" /> Change Profile Photo
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
