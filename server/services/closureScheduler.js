import { Setting } from '../models/Setting.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { ClosureNotification } from '../models/ClosureNotification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { sendOfficialClosureNoticeEmail } from './emailService.js';

/**
 * Days of the week in standard order
 */
export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

/**
 * Calculate working hours status based on configured clinic settings
 */
export function calculateWorkingHoursStatus(setting) {
  const now = new Date();
  // Format current time in HH:mm
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;

  const currentDayName = DAYS_OF_WEEK[now.getDay()];

  const workingDays = Array.isArray(setting?.workingDays) && setting.workingDays.length > 0
    ? setting.workingDays
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const openingTime = setting?.openingTime || '09:00';
  const closingTime = setting?.closingTime || '20:00';

  const isWorkingDay = workingDays.includes(currentDayName);
  const isWithinHours = isWorkingDay && (currentTime >= openingTime && currentTime < closingTime);

  let effectiveStatus = 'OPEN';
  if (setting?.isManualOverride) {
    effectiveStatus = setting.operatingStatus || setting.manualStatus || 'OPEN';
  } else {
    effectiveStatus = isWithinHours ? 'OPEN' : 'CLOSED';
  }

  return {
    effectiveStatus,
    isWorkingDay,
    isWithinHours,
    currentTime,
    currentDayName,
    openingTime,
    closingTime,
    workingDays,
    isManualOverride: !!setting?.isManualOverride,
    recipientPolicy: setting?.recipientPolicy || 'APPOINTMENT_PATIENTS'
  };
}

/**
 * Execute Clinic Closure Notification Event (Manual or Automatic)
 * Handles recipient selection, opt-in checks, duplicate prevention, and persistent audit logs.
 */
export async function processClinicClosureEvent({
  closureType = 'MANUAL',
  closedBy = 'Admin',
  reason = 'Clinic is currently closed',
  forceEmail = false,
  overridePolicy = null
}) {
  let setting = await Setting.findOne({});
  if (!setting) {
    setting = await Setting.create({
      name: 'SmileCare Speciality Dental Clinic & Implant Centre',
      phone: '+91 44 2621 8899',
      address: 'No. 42, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu 600040',
      operatingStatus: 'OPEN',
      openingTime: '09:00',
      closingTime: '20:00',
      recipientPolicy: 'APPOINTMENT_PATIENTS'
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const policy = overridePolicy || setting.recipientPolicy || 'APPOINTMENT_PATIENTS';

  // 1. Generate unique cycle key
  let cycleId = '';
  if (closureType === 'AUTOMATIC') {
    cycleId = `AUTO_${todayStr}_${setting.closingTime || '20:00'}`;
  } else {
    cycleId = `MANUAL_${Date.now()}`;
  }

  // 2. Duplicate Prevention Rule: Check if already sent for this cycle
  if (!forceEmail && closureType === 'AUTOMATIC') {
    const existingNotification = await ClosureNotification.findOne({
      cycleId,
      status: 'SENT'
    });

    if (existingNotification || setting.lastClosureNotificationCycle === cycleId) {
      console.log(`[ClosureScheduler] Notice already sent for cycle ${cycleId}. Skipping duplicate emails.`);
      return {
        success: true,
        alreadyNotified: true,
        cycleId,
        message: 'Closure notice has already been dispatched for this cycle. Duplicate prevented.'
      };
    }
  }

  // 3. Resolve eligible recipients according to policy
  let eligiblePatients = [];

  if (policy === 'ALL_OPTED_IN') {
    // Policy A: All registered patients with valid email & opt-in
    const allPatients = await Patient.find({}).lean();
    eligiblePatients = allPatients.filter(p => {
      const hasEmail = p.email && p.email.includes('@');
      const isOptedIn = p.emailOptIn !== false && p.emailNotificationsOptIn !== false;
      return hasEmail && isOptedIn;
    });
  } else {
    // Policy B (Default & Recommended): Patients with scheduled appointments during the closure period
    const activeAppointments = await Appointment.find({
      date: todayStr,
      status: { $nin: ['Cancelled', 'Completed'] }
    }).lean();

    const patientIds = Array.from(new Set(activeAppointments.map(a => a.patientId).filter(Boolean)));
    const aptPatients = await Patient.find({ id: { $in: patientIds } }).lean();
    const patientMap = new Map();
    aptPatients.forEach(p => patientMap.set(p.id, p));

    const candidateMap = new Map();
    activeAppointments.forEach(apt => {
      const pat = patientMap.get(apt.patientId);
      const email = pat?.email || apt.patientEmail;
      const isOptedIn = pat ? (pat.emailOptIn !== false && pat.emailNotificationsOptIn !== false) : true;

      if (email && email.includes('@') && isOptedIn && !candidateMap.has(email.toLowerCase())) {
        candidateMap.set(email.toLowerCase(), {
          id: apt.patientId || `pat_${Date.now()}`,
          name: apt.patientName || pat?.name || 'Valued Patient',
          email: email
        });
      }
    });

    eligiblePatients = Array.from(candidateMap.values());
  }

  console.log(`[ClosureScheduler] Processing ${closureType} closure. Eligible recipients (${policy}): ${eligiblePatients.length}`);

  // 4. Dispatch official notification email to each eligible patient
  const deliveryResults = [];
  const clinicPhone = setting.phone || '+91 44 2621 8899';
  const clinicAddress = setting.address || 'No. 42, 2nd Avenue, Anna Nagar West, Chennai';

  for (const patient of eligiblePatients) {
    try {
      const sendRes = await sendOfficialClosureNoticeEmail({
        to: patient.email,
        patientName: patient.name,
        clinicPhone,
        clinicAddress
      });

      deliveryResults.push({
        patientId: patient.id,
        patientName: patient.name,
        email: patient.email,
        status: sendRes.success ? 'DELIVERED' : 'FAILED',
        messageId: sendRes.messageId || null,
        sentAt: new Date()
      });
    } catch (sendErr) {
      deliveryResults.push({
        patientId: patient.id,
        patientName: patient.name,
        email: patient.email,
        status: 'FAILED',
        errorMessage: sendErr.message,
        sentAt: new Date()
      });
    }
  }

  const sentCount = deliveryResults.filter(r => r.status === 'DELIVERED').length;

  // 5. Persist persistent record in ClosureNotification collection
  try {
    await ClosureNotification.create({
      cycleId,
      closureType,
      status: eligiblePatients.length === 0 ? 'NO_RECIPIENTS' : (sentCount > 0 ? 'SENT' : 'FAILED'),
      recipientPolicy: policy,
      recipientsCount: sentCount,
      recipients: deliveryResults,
      closedAt: new Date(),
      closedBy,
      reason
    });
  } catch (dbErr) {
    console.warn('[ClosureScheduler] Could not save ClosureNotification log:', dbErr.message);
  }

  // 6. Update Setting state
  try {
    const updateFields = {
      operatingStatus: 'CLOSED',
      clinicStatus: 'Closed',
      closedReason: reason,
      lastStatusChange: new Date(),
      lastStatusChangedBy: closedBy,
      lastClosureNotificationCycle: cycleId,
      lastClosureNotificationSentAt: new Date()
    };
    if (closureType === 'MANUAL') {
      updateFields.isManualOverride = true;
      updateFields.manualClosedAt = new Date();
      updateFields.manualClosedBy = closedBy;
    }
    await Setting.updateOne({ _id: setting._id }, { $set: updateFields }, { upsert: true });
  } catch (setErr) {
    console.warn('[ClosureScheduler] Setting update warning:', setErr.message);
  }

  // 7. Audit Log in ActivityLog
  try {
    await ActivityLog.create({
      id: `ACT-${Date.now()}`,
      user: closedBy || 'SmileCare System',
      role: 'System',
      action: `Clinic CLOSED (${closureType}): Dispatched automated closure notification to ${sentCount} patient(s) [Policy: ${policy}]`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: todayStr,
      isStaff: false
    });
  } catch (actErr) {}

  return {
    success: true,
    closureType,
    cycleId,
    recipientPolicy: policy,
    totalEligible: eligiblePatients.length,
    sentCount,
    deliveryResults,
    results: deliveryResults
  };
}

/**
 * Periodic Scheduler Job
 * Checks working hours every minute and handles automatic transition
 */
let schedulerInterval = null;
let isJobRunning = false;

export function startClosureScheduler(intervalMs = 60000) {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  console.log(`[ClosureScheduler] Initialized automated working-hours monitor (Interval: ${intervalMs / 1000}s)`);

  schedulerInterval = setInterval(async () => {
    if (isJobRunning) return;
    isJobRunning = true;

    try {
      const setting = await Setting.findOne({});
      if (!setting) {
        isJobRunning = false;
        return;
      }

      // If manual override is active, do not auto-toggle
      if (setting.isManualOverride) {
        isJobRunning = false;
        return;
      }

      const statusInfo = calculateWorkingHoursStatus(setting);

      // Case 1: Operating hours ended (Clinic should be CLOSED)
      if (statusInfo.effectiveStatus === 'CLOSED') {
        const todayStr = new Date().toISOString().split('T')[0];
        const cycleId = `AUTO_${todayStr}_${statusInfo.closingTime}`;

        // Check if we need to transition and dispatch
        if (setting.operatingStatus === 'OPEN' || setting.lastClosureNotificationCycle !== cycleId) {
          console.log(`[ClosureScheduler] Working hours ended. Triggering automatic clinic closure.`);
          await processClinicClosureEvent({
            closureType: 'AUTOMATIC',
            closedBy: 'Automated Scheduler',
            reason: `Configured closing time reached (${statusInfo.closingTime})`
          });
        }
      }
      // Case 2: In working hours (Clinic should be OPEN)
      else if (statusInfo.effectiveStatus === 'OPEN' && setting.operatingStatus === 'CLOSED') {
        console.log(`[ClosureScheduler] Working hours began (${statusInfo.openingTime}). Reopening clinic.`);
        setting.operatingStatus = 'OPEN';
        setting.clinicStatus = 'Open';
        setting.closedReason = '';
        setting.lastStatusChange = new Date();
        setting.lastStatusChangedBy = 'Automated Scheduler';
        await setting.save();

        try {
          await ActivityLog.create({
            id: `ACT-${Date.now()}`,
            user: 'Automated Scheduler',
            role: 'System',
            action: `Clinic automatically reopened for morning operations (${statusInfo.openingTime})`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toISOString().split('T')[0],
            isStaff: false
          });
        } catch (e) {}
      }
    } catch (err) {
      console.warn('[ClosureScheduler] Job execution note:', err.message);
    } finally {
      isJobRunning = false;
    }
  }, intervalMs);

  return schedulerInterval;
}
