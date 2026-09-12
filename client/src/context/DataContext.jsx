import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_SEED_DATA } from '../utils/dentalData';
import { fetchApi } from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
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
    const payload = overrideData || data;
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

          const hasMongoPatients = Array.isArray(res.data.patients) && res.data.patients.length > 0;
          const hasMongoAppointments = Array.isArray(res.data.appointments) && res.data.appointments.length > 0;
          const hasMongoConsultations = Array.isArray(res.data.consultations) && res.data.consultations.length > 0;
          const hasMongoInvoices = Array.isArray(res.data.invoices) && res.data.invoices.length > 0;
          const hasMongoUsers = uniqueUsers.length > 0;
          const hasMongoCharts = res.data.dentalCharts && Object.keys(res.data.dentalCharts).length > 0;
          const hasMongoFollowUps = Array.isArray(res.data.followUps) && res.data.followUps.length > 0;
          const hasMongoActivity = Array.isArray(res.data.activityLog) && res.data.activityLog.length > 0;

          const merged = {
            ...prev,
            patients: hasMongoPatients ? res.data.patients : prev.patients,
            appointments: hasMongoAppointments ? res.data.appointments : prev.appointments,
            consultations: hasMongoConsultations ? res.data.consultations : prev.consultations,
            invoices: hasMongoInvoices ? res.data.invoices : prev.invoices,
            users: hasMongoUsers ? uniqueUsers : prev.users,
            dentalCharts: hasMongoCharts ? res.data.dentalCharts : prev.dentalCharts,
            followUps: hasMongoFollowUps ? res.data.followUps : prev.followUps,
            activityLog: hasMongoActivity ? res.data.activityLog : prev.activityLog,
            clinicProfile: res.data.clinicProfile || prev.clinicProfile
          };

          // If MongoDB Atlas database was just initialized and empty, push local records up to Atlas!
          if (!hasMongoPatients && prev.patients.length > 0) {
            fetchApi('/sync', 'POST', merged).then(() => {
              setCloudSyncStatus(s => ({ ...s, connected: true, lastSync: new Date().toLocaleTimeString() }));
            }).catch(console.warn);
          }

          return merged;
        });
      }
    }).catch(err => console.warn('Fetch from MongoDB Atlas failed, using local storage:', err));
  }, []);

  useEffect(() => {
    localStorage.setItem('smilecare_db_v2', JSON.stringify(data));
    fetchApi('/sync', 'POST', data).then(res => {
      if (res && res.success) {
        setCloudSyncStatus(prev => ({ ...prev, connected: true, lastSync: new Date().toLocaleTimeString() }));
      }
    }).catch(err => console.warn('MongoDB Atlas sync error:', err));
  }, [data]);

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

    setData(prev => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
      activityLog: [
        { id: `act_${Date.now()}`, time: 'Just now', user: 'Staff', action: `Added new patient: ${newPatient.name}` },
        ...prev.activityLog
      ]
    }));
    showToast(`Patient ${newPatient.name} created successfully!`);
    return newPatient;
  };

  const updatePatient = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      patients: prev.patients.map(p => p.id === id ? { ...p, ...updatedFields } : p)
    }));
    showToast('Patient record updated');
  };

  const addPatientDocument = (patientId, docObj) => {
    setData(prev => ({
      ...prev,
      patients: prev.patients.map(p => {
        if (p.id === patientId) {
          const docs = p.documents || [];
          return { ...p, documents: [docObj, ...docs] };
        }
        return p;
      })
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

    setData(prev => ({
      ...prev,
      appointments: [newApt, ...prev.appointments],
      activityLog: [
        { id: `act_${Date.now()}`, time: 'Just now', user: 'Staff', action: `Booked appointment for ${newApt.patientName} (Token #${tokenNo})` },
        ...prev.activityLog
      ]
    }));
    showToast(`Appointment booked for ${newApt.patientName} (Token #${tokenNo})`);
    return newApt;
  };

  const updateAppointmentStatus = (aptId, newStatus) => {
    setData(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === aptId ? { ...a, status: newStatus } : a)
    }));
    showToast(`Appointment status updated to ${newStatus}`);
  };

  const rescheduleAppointment = (aptId, newDate, newTimeSlot) => {
    setData(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === aptId ? { ...a, date: newDate, timeSlot: newTimeSlot, status: 'Scheduled' } : a)
    }));
    showToast('Appointment rescheduled successfully');
  };

  const updateToothCondition = (patientId, toothId, condition, status, notes) => {
    setData(prev => {
      const patientCharts = prev.dentalCharts[patientId] || {};
      const updatedChart = {
        ...patientCharts,
        [toothId]: {
          toothId,
          condition,
          status: status || 'Planned',
          notes: notes || '',
          updatedBy: 'Dr. Tharma',
          updatedAt: new Date().toISOString().split('T')[0]
        }
      };

      return {
        ...prev,
        dentalCharts: {
          ...prev.dentalCharts,
          [patientId]: updatedChart
        },
        activityLog: [
          { id: `act_${Date.now()}`, time: 'Just now', user: 'Dr. Tharma', action: `Updated tooth #${toothId} condition to ${condition}` },
          ...prev.activityLog
        ]
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

    setData(prev => ({
      ...prev,
      consultations: [newConsultation, ...prev.consultations],
      followUps: newFollowUp ? [newFollowUp, ...prev.followUps] : prev.followUps,
      activityLog: [
        { id: `act_${Date.now()}`, time: 'Just now', user: 'Dr. Tharma', action: `Saved consultation for ${newConsultation.patientName}` },
        ...prev.activityLog
      ]
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

    setData(prev => ({
      ...prev,
      invoices: [newInv, ...prev.invoices],
      activityLog: [
        { id: `act_${Date.now()}`, time: 'Just now', user: 'Staff', action: `Generated Invoice ${newId} (₹${newInv.totalAmount})` },
        ...prev.activityLog
      ]
    }));
    showToast(`Invoice ${newId} created (₹${newInv.totalAmount})`);
    return newInv;
  };

  const recordPayment = (invoiceId, amountPaid, paymentMethod) => {
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
      })
    }));
    showToast('Payment recorded successfully');
  };

  const sendWhatsAppReminder = (followUpId) => {
    setData(prev => ({
      ...prev,
      followUps: prev.followUps.map(f => f.id === followUpId ? { ...f, whatsAppSent: true, whatsAppSentDate: new Date().toLocaleString() } : f)
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
      doctorName: 'Dr. Tharma',
      date: targetFollowUp.scheduledDate,
      timeSlot: '10:00 AM',
      serviceName: targetFollowUp.reason,
      status: 'Scheduled',
      tokenNo: data.appointments.filter(a => a.date === targetFollowUp.scheduledDate).length + 1,
      type: 'Follow-up',
      notes: 'Auto-assigned & confirmed via WhatsApp Reminder link'
    };

    setData(prev => ({
      ...prev,
      followUps: prev.followUps.map(f => f.id === followUpId ? { ...f, status: 'Confirmed via WhatsApp' } : f),
      appointments: [newApt, ...prev.appointments],
      activityLog: [
        { id: `act_${Date.now()}`, time: 'Just now', user: 'WhatsApp Bot', action: `Auto-booked & confirmed slot for ${targetFollowUp.patientName} on ${targetFollowUp.scheduledDate}` },
        ...prev.activityLog
      ]
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
    setData(prev => ({
      ...prev,
      users: [...(prev.users || []), newStaff],
      activityLog: [
        { id: `act_${Date.now()}`, time: 'Just now', user: 'Doctor', action: `Added staff: ${newStaff.name} (${newStaff.title} - ${newStaff.workShift})` },
        ...prev.activityLog
      ]
    }));
    showToast(`Staff member ${newStaff.name} registered successfully!`);
  };

  const updateStaffPermissions = (staffId, permissions) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === staffId ? { ...u, permissions } : u)
    }));
    showToast('Staff permissions updated');
  };

  const updateClinicProfile = (profileObj) => {
    setData(prev => ({
      ...prev,
      clinicProfile: { ...prev.clinicProfile, ...profileObj }
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

      return {
        ...prev,
        users: updatedUsers,
        clinicProfile: updatedProfile,
        currentUser: updatedDoc,
        activityLog: [
          { id: `act_${Date.now()}`, time: 'Just now', user: 'Doctor', action: `Updated doctor profile details` },
          ...prev.activityLog
        ]
      };
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
