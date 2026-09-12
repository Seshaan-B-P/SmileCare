// Controller: WhatsApp Follow-ups & Automated Slot Booking

export const confirmWhatsAppAutoBooking = (followUpId, db) => {
  const followUp = db.followUps.find(f => f.id === followUpId);
  if (!followUp) return null;

  followUp.status = 'Confirmed via WhatsApp';
  const newApt = {
    id: `APT-${800 + db.appointments.length + 1}`,
    patientId: followUp.patientId,
    patientName: followUp.patientName,
    patientPhone: followUp.patientPhone,
    doctorId: 'usr_doc_1',
    doctorName: 'Dr. Tharma P',
    date: followUp.scheduledDate,
    timeSlot: '10:00 AM',
    serviceName: followUp.reason,
    status: 'Scheduled',
    tokenNo: db.appointments.filter(a => a.date === followUp.scheduledDate).length + 1,
    type: 'Follow-up',
    notes: 'Auto-assigned via WhatsApp Reminder link'
  };

  db.appointments.unshift(newApt);
  return { followUp, appointment: newApt };
};
