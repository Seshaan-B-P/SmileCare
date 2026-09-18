// Controller: Financial & Clinical Reports

export const getReportsSummary = (db) => {
  const invoices = Array.isArray(db.invoices) ? db.invoices : [];
  const patients = Array.isArray(db.patients) ? db.patients : [];
  const appointments = Array.isArray(db.appointments) ? db.appointments : [];
  const consultations = Array.isArray(db.consultations) ? db.consultations : [];

  const totalGrossInvoiced = invoices.reduce((a, b) => a + (Number(b.totalAmount) || 0), 0);
  const totalRevenue = invoices.reduce((a, b) => a + (Number(b.paidAmount) || 0), 0);
  const totalPending = invoices.reduce((a, b) => a + (Number(b.balanceDue) || 0), 0);

  // Demographics calculation
  let femaleCount = 0;
  let maleCount = 0;
  let otherCount = 0;
  let totalAge = 0;
  let ageCount = 0;

  patients.forEach(p => {
    const g = (p.gender || '').toLowerCase();
    if (g === 'female') femaleCount++;
    else if (g === 'male') maleCount++;
    else otherCount++;

    const age = Number(p.age);
    if (!isNaN(age) && age > 0) {
      totalAge += age;
      ageCount++;
    }
  });

  const avgAge = ageCount > 0 ? (totalAge / ageCount).toFixed(1) : 0;

  return {
    patientCount: patients.length,
    appointmentCount: appointments.length,
    consultationCount: consultations.length,
    invoiceCount: invoices.length,
    totalGrossInvoiced,
    totalRevenue,
    totalPending,
    demographics: {
      femaleCount,
      maleCount,
      otherCount,
      femalePercent: patients.length > 0 ? Math.round((femaleCount / patients.length) * 100) : 0,
      malePercent: patients.length > 0 ? Math.round((maleCount / patients.length) * 100) : 0,
      averageAge: avgAge
    },
    activityLog: db.activityLog || []
  };
};
