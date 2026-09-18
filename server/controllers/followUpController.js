// Controller: WhatsApp Follow-ups & Automated Slot Booking

export const CLINIC_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

export const getAvailableSlot = (date, appointments = [], preferredSlot = '10:00 AM') => {
  if (!date) return preferredSlot;
  const bookedSlots = (appointments || [])
    .filter(a => a.date === date && a.status !== 'Cancelled')
    .map(a => a.timeSlot);

  if (!bookedSlots.includes(preferredSlot)) {
    return preferredSlot;
  }

  const nextFree = CLINIC_SLOTS.find(slot => !bookedSlots.includes(slot));
  return nextFree || '05:30 PM';
};

export const confirmWhatsAppAutoBooking = (followUpId, db, requestedSlot = null) => {
  const followUp = db.followUps.find(f => f.id === followUpId);
  if (!followUp) return null;

  const bookedAppointments = db.appointments || [];
  const bookedSlots = bookedAppointments
    .filter(a => a.date === followUp.scheduledDate && a.status !== 'Cancelled')
    .map(a => a.timeSlot);

  let chosenSlot = requestedSlot;
  if (!chosenSlot || bookedSlots.includes(chosenSlot)) {
    chosenSlot = getAvailableSlot(followUp.scheduledDate, bookedAppointments, followUp.preferredSlot || '10:00 AM');
  }

  followUp.status = 'Confirmed via WhatsApp';
  followUp.confirmedSlot = chosenSlot;

  const newApt = {
    id: `APT-${800 + db.appointments.length + 1}`,
    patientId: followUp.patientId,
    patientName: followUp.patientName,
    patientPhone: followUp.patientPhone,
    doctorId: 'usr_doc_1',
    doctorName: 'Dr. Tharma P',
    date: followUp.scheduledDate,
    timeSlot: chosenSlot,
    serviceName: followUp.reason,
    status: 'Scheduled',
    tokenNo: db.appointments.filter(a => a.date === followUp.scheduledDate).length + 1,
    type: 'Follow-up',
    notes: `Auto-assigned & confirmed via WhatsApp Reminder (${chosenSlot})`
  };

  db.appointments.unshift(newApt);
  return { followUp, appointment: newApt };
};
