// Controller: Financial & Clinical Reports

export const getReportsSummary = (db) => {
  const totalRevenue = db.invoices.reduce((a, b) => a + (b.paidAmount || 0), 0);
  const totalPending = db.invoices.reduce((a, b) => a + (b.balanceDue || 0), 0);
  return {
    patientCount: db.patients.length,
    appointmentCount: db.appointments.length,
    totalRevenue,
    totalPending,
    activityLog: db.activityLog
  };
};
