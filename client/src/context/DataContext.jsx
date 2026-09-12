import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MOCK_SEED_DATA } from '../utils/dentalData';
import { fetchApi } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

function mergeRecords(cloudList, localList, idKey = 'id') {
  const map = new Map();
  (localList || []).forEach(item => {
    if (item) {
      const key = item[idKey] || item._id;
      if (key) map.set(String(key).toLowerCase(), item);
    }
  });
  (cloudList || []).forEach(item => {
    if (item) {
      const key = item[idKey] || item._id;
      if (key) map.set(String(key).toLowerCase(), item);
    }
  });
  return Array.from(map.values());
}

export const DataProvider = ({ children }) => {
  const { currentUser, isDoctor, activeRole, updateCurrentUser } = useAuth();
  const isCloudLoaded = useRef(false);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('smilecare_db_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleanUsers = (parsed.users || []).filter(u => u.name !== 'Mark Davis');
        const doctorExists = cleanUsers.some(u => u.role === 'Doctor' || u.email === 'doctor@smilecare.com');
        if (!doctorExists) {
          cleanUsers.unshift(MOCK_SEED_DATA.users[0]);
        }
        return {
          ...parsed,
          users: cleanUsers
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      ...MOCK_SEED_DATA,
      patients: [],
      appointments: [],
      dentalCharts: {},
      consultations: [],
      invoices: [],
      followUps: [],
      activityLog: []
    };
  });

  const [toast, setToast] = useState(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState({
    connected: false,
    loading: true,
    isAtlas: false,
    dbName: 'smilecare',
    lastSync: null
  });

  const syncToCloud = async (overrideData = null) => {
    let payload = overrideData || data;
    try {
      const saved = localStorage.getItem('smilecare_db_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.patients) && parsed.patients.length > (payload.patients?.length || 0)) {
          payload = { ...payload, patients: parsed.patients };
        }
      }
    } catch (e) {}

    try {
      const res = await fetchApi('/sync', 'POST', payload);
      if (res && res.success) {
        setCloudSyncStatus(prev => ({
          ...prev,
          connected: true,
          lastSync: new Date().toLocaleTimeString()
        }));
        return { success: true };
      }
      return { success: false, error: res?.error || 'Sync failed' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  useEffect(() => {
    // Check MongoDB Atlas health status
    fetchApi('/health', 'GET').then(h => {
      if (h && h.status === 'OK') {
        setCloudSyncStatus({
          connected: !!h.mongoConnected,
          loading: false,
          isAtlas: !!h.isAtlas,
          dbName: h.database || 'smilecare',
          lastSync: new Date().toLocaleTimeString()
        });
      } else {
        setCloudSyncStatus(prev => ({ ...prev, connected: false, loading: false }));
      }
    }).catch(() => {
      setCloudSyncStatus(prev => ({ ...prev, connected: false, loading: false }));
    });

    // Fetch live data from MongoDB Atlas
    fetchApi('/data', 'GET').then(res => {
      isCloudLoaded.current = true;
      if (res && res.success && res.data) {
        setData(prev => {
          const rawUsers = (res.data.users || []).filter(u => u.name !== 'Mark Davis');
          const userMap = new Map();
          rawUsers.forEach(u => {
            const key = u.id || (u.email && u.email.trim() !== '' ? u.email.toLowerCase() : `usr_${Math.random()}`);
            if (u.email === 'doctor@smilecare.com' || u.id === 'usr_doc_1') {
              u.role = 'Doctor';
            }
            userMap.set(key, u);
          });
          const uniqueUsers = Array.from(userMap.values());

          const mergedPatients = mergeRecords(res.data.patients, prev.patients, 'id');
          const mergedAppointments = mergeRecords(res.data.appointments, prev.appointments, 'id');
          const mergedConsultations = mergeRecords(res.data.consultations, prev.consultations, 'id');
          const mergedInvoices = mergeRecords(res.data.invoices, prev.invoices, 'id');
          const mergedUsers = uniqueUsers.length > 0 ? uniqueUsers : prev.users;
          const mergedCharts = { ...(prev.dentalCharts || {}), ...(res.data.dentalCharts || {}) };
          const mergedFollowUps = mergeRecords(res.data.followUps, prev.followUps, 'id');
          const mergedActivity = mergeRecords(res.data.activityLog, prev.activityLog, 'id');

          const merged = {
            ...prev,
            patients: mergedPatients,
            appointments: mergedAppointments,
            consultations: mergedConsultations,
            invoices: mergedInvoices,
            users: mergedUsers,
            dentalCharts: mergedCharts,
            followUps: mergedFollowUps,
            activityLog: mergedActivity,
            clinicProfile: res.data.clinicProfile || prev.clinicProfile
          };

          // If local records exist that were not yet in cloud, push merged state up to Atlas!
          const cloudPatientCount = Array.isArray(res.data.patients) ? res.data.patients.length : 0;
          if (mergedPatients.length > cloudPatientCount) {
            fetchApi('/sync', 'POST', merged).then(() => {
              setCloudSyncStatus(s => ({ ...s, connected: true, lastSync: new Date().toLocaleTimeString() }));
            }).catch(console.warn);
          }

          // Sync doctor and user credentials from MongoDB Atlas cloud directly to AuthContext ONLY IF currently logged-in as Doctor
          const savedUser = localStorage.getItem('smilecare_user');
          let currentSession = null;
          try { currentSession = savedUser ? JSON.parse(savedUser) : null; } catch (e) {}
          const isCurrentSessionDoctor = currentSession?.role === 'Doctor' || currentSession?.email === 'doctor@smilecare.com';

          const cloudDoc = res.data.currentUser || (uniqueUsers || []).find(u => u.role === 'Doctor' || u.id === 'usr_doc_1');
          if (isCurrentSessionDoctor && cloudDoc && cloudDoc.avatar && updateCurrentUser) {
            updateCurrentUser(cloudDoc);
          }

          return merged;
        });
      }
    }).catch(err => {
      isCloudLoaded.current = true;
      console.warn('Fetch from MongoDB Atlas failed, using local storage:', err);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('smilecare_db_v2', JSON.stringify(data));
    // Guard against auto-syncing uninitialized empty state on initial mount
    if (!isCloudLoaded.current) return;
    fetchApi('/sync', 'POST', data).then(res => {
      if (res && res.success) {
        setCloudSyncStatus(prev => ({ ...prev, connected: true, lastSync: new Date().toLocaleTimeString() }));
      }
    }).catch(err => console.warn('MongoDB Atlas sync error:', err));
  }, [data]);

  // Helper to log all user and staff activities consistently
  const logActivity = (actionText, customActor = null, isStaffOverride = null) => {
    const isDoc = isDoctor || activeRole === 'Doctor' || currentUser?.role === 'Doctor';
    const isStaff = isStaffOverride !== null ? isStaffOverride : !isDoc;
    const userName = customActor || currentUser?.name || (isDoc ? 'Dr. Tharma P' : 'Staff');
    const userRole = isDoc ? 'Doctor' : 'Staff';

    return {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      time: 'Just now',
      timestamp: Date.now(),
      user: userName,
      role: userRole,
      isStaff,
      action: actionText
    };
  };

  // Cross-tab synchronization: notify Doctor when Staff performs an action in another tab/window
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'smilecare_db_v2' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setData(prev => {
            const isDoc = isDoctor || activeRole === 'Doctor' || currentUser?.role === 'Doctor';
            if (isDoc && updated.activityLog && updated.activityLog.length > (prev.activityLog?.length || 0)) {
              const latest = updated.activityLog[0];
              if (latest && (latest.isStaff || latest.role === 'Staff')) {
                showToast(`🔔 Staff Alert: ${latest.user} - ${latest.action}`, 'info');
              }
            }
            return {
              ...prev,
              ...updated
            };
          });
        } catch (err) {
          console.error('Storage sync error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isDoctor, activeRole, currentUser]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  const addPatient = (patientObj) => {
    const newId = `PAT-${1000 + data.patients.length + 1}`;
    const newPatient = {
      id: newId,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      medicalHistory: patientObj.medicalHistory || [],
      dentalHistory: patientObj.dentalHistory || [],
      allergies: patientObj.allergies || [],
      documents: [],
      ...patientObj
    };

    const newLog = logActivity(`Added new patient: ${newPatient.name} (${newId})`);
    setData(prev => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast(`Patient ${newPatient.name} created successfully!`);
    return newPatient;
  };

  const updatePatient = (id, updatedFields) => {
    const targetPatient = data.patients.find(p => p.id === id);
    const newLog = logActivity(`Updated record for patient: ${targetPatient?.name || id}`);
    setData(prev => {
      const nextPatients = prev.patients.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      const nextData = {
        ...prev,
        patients: nextPatients,
        activityLog: [newLog, ...prev.activityLog]
      };
      fetchApi('/sync', 'POST', nextData).then(res => {
        if (res && res.success) {
          setCloudSyncStatus(s => ({ ...s, connected: true, lastSync: new Date().toLocaleTimeString() }));
        }
      }).catch(console.warn);
      return nextData;
    });
    showToast('Patient record updated');
  };

  const addPatientDocument = (patientId, docObj) => {
    const targetPatient = data.patients.find(p => p.id === patientId);
    const newLog = logActivity(`Uploaded document "${docObj.name}" for patient ${targetPatient?.name || patientId}`);
    setData(prev => ({
      ...prev,
      patients: prev.patients.map(p => {
        if (p.id === patientId) {
          const docs = p.documents || [];
          return { ...p, documents: [docObj, ...docs] };
        }
        return p;
      }),
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast(`Uploaded document: ${docObj.name}`);
  };

  const bookAppointment = (aptObj) => {
    const newId = `APT-${800 + data.appointments.length + 1}`;
    const tokenNo = data.appointments.filter(a => a.date === aptObj.date).length + 1;
    const newApt = {
      id: newId,
      status: 'Scheduled',
      tokenNo,
      ...aptObj
    };

    const newLog = logActivity(`Booked appointment for ${newApt.patientName} (Token #${tokenNo}, ${newApt.timeSlot || 'Scheduled'})`);
    setData(prev => ({
      ...prev,
      appointments: [newApt, ...prev.appointments],
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast(`Appointment booked for ${newApt.patientName} (Token #${tokenNo})`);
    return newApt;
  };

  const updateAppointmentStatus = (aptId, newStatus) => {
    const targetApt = data.appointments.find(a => a.id === aptId);
    const newLog = logActivity(`Changed appointment status to "${newStatus}" for ${targetApt?.patientName || aptId}`);
    setData(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === aptId ? { ...a, status: newStatus } : a),
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast(`Appointment status updated to ${newStatus}`);
  };

  const rescheduleAppointment = (aptId, newDate, newTimeSlot) => {
    const targetApt = data.appointments.find(a => a.id === aptId);
    const newLog = logActivity(`Rescheduled appointment for ${targetApt?.patientName || aptId} to ${newDate} at ${newTimeSlot}`);
    setData(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === aptId ? { ...a, date: newDate, timeSlot: newTimeSlot, status: 'Scheduled' } : a),
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast('Appointment rescheduled successfully');
  };

  const updateToothCondition = (patientId, toothId, condition, status, notes) => {
    const targetPatient = data.patients.find(p => p.id === patientId);
    const newLog = logActivity(`Updated tooth #${toothId} condition to ${condition} for ${targetPatient?.name || patientId}`, null, false);
    setData(prev => {
      const patientCharts = prev.dentalCharts[patientId] || {};
      const updatedChart = {
        ...patientCharts,
        [toothId]: {
          toothId,
          condition,
          status: status || 'Planned',
          notes: notes || '',
          updatedBy: currentUser?.name || 'Dr. Tharma P',
          updatedAt: new Date().toISOString().split('T')[0]
        }
      };

      return {
        ...prev,
        dentalCharts: {
          ...prev.dentalCharts,
          [patientId]: updatedChart
        },
        activityLog: [newLog, ...prev.activityLog]
      };
    });
    showToast(`Tooth #${toothId} condition updated`);
  };

  const saveConsultation = (consultationObj) => {
    const newId = `CNS-${500 + data.consultations.length + 1}`;
    const newConsultation = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      ...consultationObj
    };

    let newFollowUp = null;
    if (consultationObj.followUpDate) {
      newFollowUp = {
        id: `FLP-${300 + data.followUps.length + 1}`,
        patientId: consultationObj.patientId,
        patientName: consultationObj.patientName,
        patientPhone: consultationObj.patientPhone || '+1 (555) 321-7890',
        reason: consultationObj.treatmentPlan || 'Post-procedure checkup',
        scheduledDate: consultationObj.followUpDate,
        status: 'Pending',
        whatsAppSent: false,
        autoAssignedSlot: `${consultationObj.followUpDate} at 10:00 AM`
      };
    }

    const newLog = logActivity(`Saved clinical consultation for ${newConsultation.patientName}`, null, false);
    setData(prev => ({
      ...prev,
      consultations: [newConsultation, ...prev.consultations],
      followUps: newFollowUp ? [newFollowUp, ...prev.followUps] : prev.followUps,
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast('Consultation saved successfully');
    return newConsultation;
  };

  const createInvoice = (invoiceObj) => {
    const newId = `INV-${9000 + data.invoices.length + 1}`;
    const receiptNo = `RCP-${new Date().getFullYear()}-${100 + data.invoices.length + 1}`;
    const newInv = {
      id: newId,
      receiptNo,
      date: new Date().toISOString().split('T')[0],
      ...invoiceObj
    };

    const newLog = logActivity(`Generated Invoice ${newId} (₹${newInv.totalAmount}) for ${newInv.patientName || 'Patient'}`);
    setData(prev => ({
      ...prev,
      invoices: [newInv, ...prev.invoices],
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast(`Invoice ${newId} created (₹${newInv.totalAmount})`);
    return newInv;
  };

  const recordPayment = (invoiceId, amountPaid, paymentMethod) => {
    const targetInv = data.invoices.find(i => i.id === invoiceId);
    const newLog = logActivity(`Recorded payment of ₹${amountPaid} via ${paymentMethod} for Invoice #${targetInv?.receiptNo || invoiceId}`);
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => {
        if (inv.id === invoiceId) {
          const updatedPaid = (inv.paidAmount || 0) + parseFloat(amountPaid);
          const balance = inv.totalAmount - updatedPaid;
          const status = balance <= 0 ? 'Paid' : 'Partial';
          return { ...inv, paidAmount: updatedPaid, balanceDue: Math.max(0, balance), paymentStatus: status, paymentMethod };
        }
        return inv;
      }),
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast('Payment recorded successfully');
  };

  const sendWhatsAppReminder = (followUpId) => {
    const targetFollowUp = data.followUps.find(f => f.id === followUpId);
    const newLog = logActivity(`Sent WhatsApp reminder to ${targetFollowUp?.patientName || 'Patient'}`);
    setData(prev => ({
      ...prev,
      followUps: prev.followUps.map(f => f.id === followUpId ? { ...f, whatsAppSent: true, whatsAppSentDate: new Date().toLocaleString() } : f),
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast('WhatsApp reminder sent with direct appointment booking link!');
  };

  const confirmWhatsAppAutoBooking = (followUpId) => {
    const targetFollowUp = data.followUps.find(f => f.id === followUpId);
    if (!targetFollowUp) return;

    const newApt = {
      id: `APT-${800 + data.appointments.length + 1}`,
      patientId: targetFollowUp.patientId,
      patientName: targetFollowUp.patientName,
      patientPhone: targetFollowUp.patientPhone,
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Tharma P',
      date: targetFollowUp.scheduledDate,
      timeSlot: '10:00 AM',
      serviceName: targetFollowUp.reason,
      status: 'Scheduled',
      tokenNo: data.appointments.filter(a => a.date === targetFollowUp.scheduledDate).length + 1,
      type: 'Follow-up',
      notes: 'Auto-assigned & confirmed via WhatsApp Reminder link'
    };

    const newLog = logActivity(`Auto-booked & confirmed slot for ${targetFollowUp.patientName} on ${targetFollowUp.scheduledDate}`, 'WhatsApp Bot', true);
    setData(prev => ({
      ...prev,
      followUps: prev.followUps.map(f => f.id === followUpId ? { ...f, status: 'Confirmed via WhatsApp' } : f),
      appointments: [newApt, ...prev.appointments],
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast(`Appointment auto-booked & confirmed for ${targetFollowUp.patientName}!`);
  };

  const addStaffMember = (staffObj) => {
    const newStaff = {
      id: `usr_staff_${Date.now()}`,
      role: 'Staff',
      status: 'Active',
      joiningDate: staffObj.joiningDate || new Date().toISOString().split('T')[0],
      workShift: staffObj.workShift || 'Morning (9:00 AM - 3:00 PM)',
      qualification: staffObj.qualification || 'Diploma in Dental Hygiene',
      salary: staffObj.salary ? parseFloat(staffObj.salary) : 25000,
      emergencyContact: staffObj.emergencyContact || '',
      idProofNo: staffObj.idProofNo || '',
      permissions: {
        patients: true,
        consultations: false,
        billing: true,
        reports: false,
        settings: false,
        staff: false,
        allowDiscounts: false,
        exportReports: false,
        deleteRecords: false,
        ...(staffObj.permissions || {})
      },
      ...staffObj
    };
    const newLog = logActivity(`Registered staff member: ${newStaff.name} (${newStaff.title})`, null, false);
    setData(prev => ({
      ...prev,
      users: [...(prev.users || []), newStaff],
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast(`Staff member ${newStaff.name} registered successfully!`);
  };

  const updateStaffPermissions = (staffId, permissions) => {
    const targetStaff = data.users?.find(u => u.id === staffId);
    const newLog = logActivity(`Updated module permissions for staff: ${targetStaff?.name || staffId}`, null, false);
    
    setData(prev => {
      const nextUsers = prev.users.map(u => u.id === staffId ? { ...u, permissions } : u);
      const nextData = {
        ...prev,
        users: nextUsers,
        activityLog: [newLog, ...prev.activityLog]
      };
      
      try {
        localStorage.setItem('smilecare_db_v2', JSON.stringify(nextData));
      } catch (e) {}

      fetchApi('/sync', 'POST', nextData).then(res => {
        if (res && res.success) {
          setCloudSyncStatus(s => ({ ...s, connected: true, lastSync: new Date().toLocaleTimeString() }));
        }
      }).catch(console.warn);

      return nextData;
    });

    if (currentUser && (currentUser.id === staffId || (targetStaff && currentUser.email?.toLowerCase() === targetStaff.email?.toLowerCase()))) {
      if (updateCurrentUser) {
        updateCurrentUser({ permissions });
      }
    }

    showToast(`Permissions updated for ${targetStaff?.name || 'Staff'}`);
  };

  const updateClinicProfile = (profileObj) => {
    const newLog = logActivity(`Updated clinic profile & settings`);
    setData(prev => ({
      ...prev,
      clinicProfile: { ...prev.clinicProfile, ...profileObj },
      activityLog: [newLog, ...prev.activityLog]
    }));
    showToast('Clinic settings saved');
  };

  const updateDoctorProfile = (doctorId, updatedFields) => {
    setData(prev => {
      const updatedUsers = (prev.users || []).map(u => {
        if (u.id === doctorId || u.role === 'Doctor' || u.email === 'doctor@smilecare.com') {
          return { ...u, ...updatedFields };
        }
        return u;
      });

      const updatedProfile = updatedFields.consultationFee
        ? { ...prev.clinicProfile, defaultConsultationFee: parseFloat(updatedFields.consultationFee) }
        : prev.clinicProfile;

      const updatedDoc = { ...(prev.currentUser || {}), ...updatedFields };
      localStorage.setItem('smilecare_user', JSON.stringify(updatedDoc));

      const nextData = {
        ...prev,
        users: updatedUsers,
        clinicProfile: updatedProfile,
        currentUser: updatedDoc,
        activityLog: [
          { id: `act_${Date.now()}`, time: 'Just now', user: 'Doctor', action: `Updated doctor profile details` },
          ...prev.activityLog
        ]
      };

      fetchApi('/sync', 'POST', nextData).then(res => {
        if (res && res.success) {
          setCloudSyncStatus(s => ({ ...s, connected: true, lastSync: new Date().toLocaleTimeString() }));
        }
      }).catch(console.warn);

      return nextData;
    });
    showToast('Doctor profile updated successfully!');
  };

  const restoreDatabase = (backupData) => {
    setData(backupData);
    showToast('Database restored successfully');
  };

  const clearAllData = () => {
    const emptyState = {
      ...MOCK_SEED_DATA,
      patients: [],
      appointments: [],
      dentalCharts: {},
      consultations: [],
      invoices: [],
      followUps: [],
      activityLog: []
    };
    setData(emptyState);
    localStorage.setItem('smilecare_db_v2', JSON.stringify(emptyState));
    localStorage.removeItem('smilecare_db_v1');
    fetchApi('/sync', 'POST', { ...emptyState, forceClear: true }).catch(console.warn);
    showToast('All system records cleared successfully', 'info');
  };

  const resetToSeed = () => {
    clearAllData();
  };

  return (
    <DataContext.Provider value={{
      patients: data.patients,
      appointments: data.appointments,
      dentalCharts: data.dentalCharts,
      consultations: data.consultations,
      invoices: data.invoices,
      followUps: data.followUps,
      users: data.users,
      clinicProfile: data.clinicProfile,
      activityLog: data.activityLog,
      toast,
      showToast,
      addPatient,
      updatePatient,
      addPatientDocument,
      bookAppointment,
      updateAppointmentStatus,
      rescheduleAppointment,
      updateToothCondition,
      saveConsultation,
      createInvoice,
      recordPayment,
      sendWhatsAppReminder,
      confirmWhatsAppAutoBooking,
      addStaffMember,
      updateStaffPermissions,
      updateClinicProfile,
      updateDoctorProfile,
      restoreDatabase,
      resetToSeed,
      clearAllData,
      cloudSyncStatus,
      syncToCloud,
      rawDb: data
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
