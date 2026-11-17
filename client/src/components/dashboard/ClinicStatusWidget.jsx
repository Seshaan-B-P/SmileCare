import React, { useState, useEffect } from 'react';
import { 
  Power, 
  Clock, 
  Mail, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings, 
  Calendar, 
  Info, 
  X, 
  ShieldAlert, 
  ShieldCheck,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  getClinicStatus, 
  updateClinicStatus, 
  updateClinicScheduleConfig, 
  sendTestClosureEmail, 
  getClosureHistory 
} from '../../services/api';
import { useData } from '../../context/DataContext';

export const ClinicStatusWidget = () => {
  const { appointments, patients, showToast } = useData();

  // Clinic status state
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modals & Panels
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);

  // Manual closure form state
  const [closureReason, setClosureReason] = useState('Doctor Emergency Leave / Public Holiday');
  const [customClosureNote, setCustomClosureNote] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState('APPOINTMENT_PATIENTS');
  const [reopenTimeText, setReopenTimeText] = useState('Tomorrow 9:00 AM');

  // Schedule config state
  const [editOpeningTime, setEditOpeningTime] = useState('09:00');
  const [editClosingTime, setEditClosingTime] = useState('20:00');
  const [editWorkingDays, setEditWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [editPolicy, setEditPolicy] = useState('APPOINTMENT_PATIENTS');

  // Test email state
  const [testEmailAddress, setTestEmailAddress] = useState('chennai@smilecare.in');
  const [testRecipientName, setTestRecipientName] = useState('SmileCare Test Patient');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Notification history
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await getClinicStatus();
      if (res && res.success) {
        setStatusData(res);
        setEditOpeningTime(res.openingTime || '09:00');
        setEditClosingTime(res.closingTime || '20:00');
        setEditWorkingDays(res.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
        setEditPolicy(res.recipientPolicy || 'APPOINTMENT_PATIENTS');
        setSelectedPolicy(res.recipientPolicy || 'APPOINTMENT_PATIENTS');
      }
    } catch (err) {
      console.warn('Failed to load clinic status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds for live status sync
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenClinic = async () => {
    setIsUpdating(true);
    try {
      const res = await updateClinicStatus('OPEN', '', selectedPolicy, 'Dr. Tharma P (Admin)');
      if (res && res.success) {
        showToast('🟢 SmileCare Clinic is now marked OPEN!');
        await fetchStatus();
      } else {
        showToast(`Failed: ${res?.error || 'Could not open clinic'}`);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmClose = async () => {
    setIsUpdating(true);
    try {
      const finalReason = customClosureNote 
        ? `${closureReason} - ${customClosureNote}` 
        : closureReason;

      const res = await updateClinicStatus(
        'CLOSED', 
        finalReason, 
        selectedPolicy, 
        'Dr. Tharma P (Admin)'
      );

      if (res && res.success) {
        setShowCloseModal(false);
        const count = res.closureResult?.sentCount || 0;
        showToast(`🔴 Clinic manually CLOSED. Sent notifications to ${count} patient(s)!`);
        await fetchStatus();
      } else {
        showToast(`Failed: ${res?.error || 'Could not close clinic'}`);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsUpdating(true);
    try {
      const res = await updateClinicScheduleConfig({
        openingTime: editOpeningTime,
        closingTime: editClosingTime,
        workingDays: editWorkingDays,
        recipientPolicy: editPolicy
      });
      if (res && res.success) {
        showToast('Schedule & notification policy updated successfully!');
        setShowConfigModal(false);
        await fetchStatus();
      } else {
        showToast(`Config error: ${res?.error || 'Failed to update'}`);
      }
    } catch (err) {
      showToast(`Config error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      showToast('Please enter a valid test email address.');
      return;
    }
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await sendTestClosureEmail(testEmailAddress, testRecipientName);
      setTestResult(res);
      if (res && res.success) {
        showToast(`✉️ Test closure notice sent to ${testEmailAddress}!`);
      } else {
        showToast(`Failed to send test: ${res?.error || 'Error'}`);
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
      showToast(`Test email error: ${err.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setShowHistoryModal(true);
    try {
      const res = await getClosureHistory();
      if (res && res.success) {
        setHistoryLogs(res.history || []);
      }
    } catch (err) {
      console.warn('History fetch error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleWorkingDay = (day) => {
    if (editWorkingDays.includes(day)) {
      if (editWorkingDays.length <= 1) {
        showToast('At least one working day must be selected.');
        return;
      }
      setEditWorkingDays(editWorkingDays.filter(d => d !== day));
    } else {
      setEditWorkingDays([...editWorkingDays, day]);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = (appointments || []).filter(a => a.date === todayStr && a.status !== 'Cancelled');
  const optedInPatients = (patients || []).filter(p => p.email && p.email.includes('@') && p.emailOptIn !== false);

  const isOpen = (statusData?.effectiveStatus || statusData?.status) === 'OPEN';
  const isOverride = statusData?.isManualOverride;

  const estimatedRecipientsCount = selectedPolicy === 'APPOINTMENT_PATIENTS'
    ? todayAppointments.filter(a => {
        const p = (patients || []).find(pt => pt.id === a.patientId);
        const email = p?.email || a.patientEmail;
        return email && email.includes('@') && (p?.emailOptIn !== false);
      }).length
    : optedInPatients.length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-soft relative overflow-hidden transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
              <Power className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                Clinic Operating Status & Automated Notifications
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Live operational control, automated working-hours calculation, and patient email dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            title="Refresh Status"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" /> Configure Hours & Policy
          </button>

          <button
            onClick={fetchHistory}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Closure Logs
          </button>
        </div>
      </div>

      {/* Main Status & Dashboard Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Status Indicator Card (Left) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-slate-100/60 rounded-2xl p-5 border border-slate-200/80">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Current Operating Status
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-sm ${
              isOpen 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                : 'bg-rose-50 text-rose-700 border-rose-200/80'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-ping'}`} />
              {isOpen ? 'CLINIC OPEN' : 'CLINIC CLOSED'}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {isOpen ? (
                <>
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                  <span>Accepting Appointments</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-7 h-7 text-rose-600" />
                  <span>Closed to Patients</span>
                </>
              )}
            </div>

            <div className="mt-2 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Operating Mode:</span>
                <span className="font-bold text-slate-800">
                  {isOverride 
                    ? '⚠️ Manual Override by Administrator' 
                    : '⚙️ Automatic Working-Hours Calculation'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Server Clock:</span>
                <span className="font-bold text-slate-800">
                  {statusData?.currentDay || 'Today'} {statusData?.currentTime || '--:--'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  statusData?.isWithinWorkingHours 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {statusData?.isWithinWorkingHours ? 'Within Hours' : 'Outside Hours'}
                </span>
              </div>
              {statusData?.lastStatusChange && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                  <span>Last status changed:</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(statusData.lastStatusChange).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>by</span>
                  <span className="font-semibold text-slate-700">
                    {statusData.lastStatusChangedBy || 'System'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Manual Control Action Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center gap-3">
            {isOpen ? (
              <button
                onClick={() => setShowCloseModal(true)}
                disabled={isUpdating}
                className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Power className="w-4 h-4" /> Manually Close Clinic Now
              </button>
            ) : (
              <button
                onClick={handleOpenClinic}
                disabled={isUpdating}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-tealbrand-600 hover:from-emerald-700 hover:to-tealbrand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Reopen Clinic
              </button>
            )}
          </div>
        </div>

        {/* Schedule & Notification Summary (Right) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hours card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Working Hours</span>
                <Clock className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-base font-black text-slate-900">
                {statusData?.openingTime || '09:00'} – {statusData?.closingTime || '20:00'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Auto-closure triggers daily at closing time ({statusData?.closingTime || '20:00'}).
              </p>
            </div>

            {/* Recipient policy card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Notification Policy</span>
                <Users className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-xs font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg inline-block">
                {statusData?.recipientPolicy === 'ALL_OPTED_IN' 
                  ? 'All Opted-In Patients' 
                  : 'Patients with Scheduled Appointments'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {statusData?.recipientPolicy === 'ALL_OPTED_IN'
                  ? 'Broadcasts closure notice to all opted-in patients.'
                  : 'Avoids bulk spam; notifies patients with slots today.'}
              </p>
            </div>
          </div>

          {/* Working Days Row */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Configured Working Days
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map(day => {
                const isActive = (statusData?.workingDays || []).includes(day);
                return (
                  <span
                    key={day}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 line-through'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Email Service Delivery Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-800">
                  Email Dispatcher: {statusData?.emailNotificationStatus?.mode || 'Automated Simulator & Logger'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Last closure sent: <strong className="text-slate-700">{statusData?.emailNotificationStatus?.lastSentAt ? new Date(statusData.emailNotificationStatus.lastSentAt).toLocaleString() : 'No closure email sent today'}</strong>
                {statusData?.emailNotificationStatus?.totalDelivered > 0 && ` (${statusData.emailNotificationStatus.totalDelivered} emails logged)`}
              </p>
            </div>

            <button
              onClick={() => setShowTestEmailModal(true)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
            >
              <Send className="w-3.5 h-3.5 text-brand-600" /> Send Test Notice
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Confirmation Dialog before Manual Closure */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Confirm Clinic Closure</h4>
                  <p className="text-xs text-slate-500">Step required before triggering patient closure notifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowCloseModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-100 text-xs text-rose-900 leading-relaxed">
                <strong>Attention:</strong> Changing clinic status to <strong>CLOSED</strong> will immediately mark the clinic as inactive and dispatch official closure notifications to eligible patients based on the selected recipient policy.
              </div>

              {/* Closure Reason Preset */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Closure Reason (Official Record)
                </label>
                <select
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Doctor Emergency Leave / Public Holiday">Doctor Emergency Leave / Public Holiday</option>
                  <option value="Severe Weather / Public General Holiday">Severe Weather / Public General Holiday</option>
                  <option value="Scheduled Clinic Sanitation & Equipment Maintenance">Scheduled Clinic Sanitation & Equipment Maintenance</option>
                  <option value="Emergency Power / Electrical Maintenance">Emergency Power / Electrical Maintenance</option>
                  <option value="Administrative Closure">Administrative Closure</option>
                </select>
              </div>

              {/* Optional Custom Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Additional Note (Optional)
                </label>
                <input
                  type="text"
                  value={customClosureNote}
                  onChange={(e) => setCustomClosureNote(e.target.value)}
                  placeholder="e.g. Rescheduling slots for tomorrow morning"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Recipient Policy Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Notification Recipient Policy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPolicy === 'APPOINTMENT_PATIENTS'
                      ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="policy"
                      value="APPOINTMENT_PATIENTS"
                      checked={selectedPolicy === 'APPOINTMENT_PATIENTS'}
                      onChange={() => setSelectedPolicy('APPOINTMENT_PATIENTS')}
                      className="sr-only"
                    />
                    <div className="font-extrabold">Scheduled Appointments (Recommended)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Notifies {estimatedRecipientsCount} patient(s) with appointments today.
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPolicy === 'ALL_OPTED_IN'
                      ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="policy"
                      value="ALL_OPTED_IN"
                      checked={selectedPolicy === 'ALL_OPTED_IN'}
                      onChange={() => setSelectedPolicy('ALL_OPTED_IN')}
                      className="sr-only"
                    />
                    <div className="font-extrabold">All Opted-in Patients</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Broadcasts to {optedInPatients.length} registered patient(s).
                    </div>
                  </label>
                </div>
              </div>

              {/* Email preview snippet */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">
                  Email Notification Preview:
                </span>
                <div className="text-[11px] text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-200/80 font-mono">
                  <div><strong>Subject:</strong> Important Notice – SmileCare Clinic is Currently Closed</div>
                  <div className="text-slate-400">---</div>
                  <div>Dear Patient,</div>
                  <div>We would like to inform you that SmileCare Dental Clinic is currently closed.</div>
                  <div>We apologize for any inconvenience caused.</div>
                  <div>For appointment-related queries or further assistance, please contact our clinic during working hours.</div>
                  <div>Regards, SmileCare Dental Clinic</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowCloseModal(false)}
                disabled={isUpdating}
                className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClose}
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-950/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                Confirm & Close Clinic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Configure Working Hours & Schedule */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Clinic Schedule & Notification Settings</h4>
                  <p className="text-xs text-slate-500">Configure operating times and automated closure triggers</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Opening & Closing Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Opening Time (24h)
                  </label>
                  <input
                    type="time"
                    value={editOpeningTime}
                    onChange={(e) => setEditOpeningTime(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Closing Time (24h)
                  </label>
                  <input
                    type="time"
                    value={editClosingTime}
                    onChange={(e) => setEditClosingTime(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Working Days Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Working Days
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_DAYS.map(day => {
                    const isSelected = editWorkingDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleWorkingDay(day)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Default Recipient Policy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Default Closure Notification Recipient Policy
                </label>
                <select
                  value={editPolicy}
                  onChange={(e) => setEditPolicy(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="APPOINTMENT_PATIENTS">
                    Patients with Scheduled Appointments during closure (Recommended)
                  </option>
                  <option value="ALL_OPTED_IN">
                    All Opted-in Registered Patients
                  </option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Governs which patients receive automated emails when closing time is reached.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-950/20 flex items-center gap-2"
              >
                {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Save Schedule Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Send Test Closure Email */}
      {showTestEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-tealbrand-50 text-tealbrand-600 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Send Test Closure Notice</h4>
                  <p className="text-xs text-slate-500">Verify email dispatch safely without disturbing patients</p>
                </div>
              </div>
              <button
                onClick={() => setShowTestEmailModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="chennai@smilecare.in"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sample Patient Name
                </label>
                <input
                  type="text"
                  value={testRecipientName}
                  onChange={(e) => setTestRecipientName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs ${testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {testResult.success ? (
                    <div>
                      <strong>Success:</strong> Closure notice sent via {testResult.transportMode || 'Simulator'}.
                      <div className="text-[10px] mt-0.5 font-mono">MessageId: {testResult.messageId}</div>
                    </div>
                  ) : (
                    <div>
                      <strong>Error:</strong> {testResult.error || 'Failed to dispatch test email'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowTestEmailModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={testSending}
                className="px-5 py-2.5 rounded-xl bg-tealbrand-600 hover:bg-tealbrand-700 text-white font-extrabold text-xs shadow-md shadow-tealbrand-950/20 flex items-center gap-2"
              >
                {testSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Test Email Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Closure Notification History Logs */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Clinic Closure Notification History</h4>
                  <p className="text-xs text-slate-500">Persistent log of automatic and manual closure broadcasts</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingHistory ? (
                <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Loading notification records...
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No clinic closure notifications have been triggered yet.
                </div>
              ) : (
                historyLogs.map(log => (
                  <div key={log._id || log.cycleId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">
                        {log.closureType === 'AUTOMATIC' ? '⏰ Automatic Schedule Closure' : '👤 Manual Admin Closure'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'NO_RECIPIENTS' ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Reason: <strong>{log.reason || 'N/A'}</strong></span>
                      <span>Policy: <strong>{log.recipientPolicy}</strong></span>
                      <span>Delivered: <strong>{log.recipientsCount} recipient(s)</strong></span>
                      <span>Time: <strong>{new Date(log.closedAt).toLocaleString()}</strong></span>
                    </div>

                    {log.recipients && log.recipients.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Recipients List:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {log.recipients.map((r, i) => (
                            <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                              {r.patientName} ({r.email}) - {r.status}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

