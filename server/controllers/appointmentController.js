// Controller: Appointments & Live Queue Token System

export const getAppointments = (db) => db.appointments;

export const createAppointment = (aptData, db) => {
  const tokenNo = db.appointments.filter(a => a.date === aptData.date).length + 1;
  const newApt = {
    id: `APT-${800 + db.appointments.length + 1}`,
    status: 'Scheduled',
    tokenNo,
    ...aptData
  };
  db.appointments.unshift(newApt);
  return newApt;
};
