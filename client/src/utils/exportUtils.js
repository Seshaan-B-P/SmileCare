// Export & Print Helpers for SmileCare Dental Management System

export const downloadJSON = (data, filename = 'SmileCare_Backup.json') => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (dataArray, filename = 'SmileCare_Report.csv') => {
  if (!dataArray || !dataArray.length) return false;
  const headers = Object.keys(dataArray[0]);
  const rows = dataArray.map(obj => 
    headers.map(header => {
      let val = obj[header] !== undefined && obj[header] !== null ? obj[header] : '';
      if (typeof val === 'object') val = JSON.stringify(val);
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
};

export const exportFinancialCSV = (invoices, filename = 'SmileCare_Financial_Ledger.csv') => {
  if (!invoices || !invoices.length) return false;
  const data = invoices.map(i => ({
    'Invoice ID': i.id || '',
    'Receipt Number': i.receiptNo || '',
    'Date': i.date || '',
    'Patient Name': i.patientName || '',
    'Total Amount (INR)': Number(i.totalAmount) || 0,
    'Paid Amount (INR)': Number(i.paidAmount) || 0,
    'Balance Due (INR)': Number(i.balanceDue) || 0,
    'Payment Status': i.paymentStatus || 'Pending',
    'Payment Method': i.paymentMethod || 'Cash',
    'Procedures / Items': Array.isArray(i.items) ? i.items.map(it => it.name || it.description || it).join('; ') : ''
  }));
  return exportToCSV(data, filename);
};

export const exportClinicalCSV = (consultations, filename = 'SmileCare_Clinical_Reports.csv') => {
  if (!consultations || !consultations.length) return false;
  const data = consultations.map(c => ({
    'Consultation ID': c.id || '',
    'Date': c.date || '',
    'Patient Name': c.patientName || '',
    'Patient Phone': c.patientPhone || '',
    'Chief Complaint': c.chiefComplaint || '',
    'Diagnosis': c.diagnosis || '',
    'Treatment Plan': c.treatmentPlan || '',
    'Procedure Notes': c.procedureNotes || '',
    'Follow-up Date': c.followUpDate || 'None'
  }));
  return exportToCSV(data, filename);
};

export const exportDemographicsCSV = (patients, filename = 'SmileCare_Patient_Demographics.csv') => {
  if (!patients || !patients.length) return false;
  const data = patients.map(p => ({
    'Patient ID': p.id || p._id || '',
    'Full Name': p.name || '',
    'Gender': p.gender || 'Unspecified',
    'Age': p.age || '',
    'Phone': p.phone || '',
    'Blood Group': p.bloodGroup || 'N/A',
    'Medical History / Alerts': Array.isArray(p.medicalHistory) ? p.medicalHistory.join('; ') : (p.medicalHistory || 'None'),
    'Registration Date': p.registeredDate || p.createdAt || ''
  }));
  return exportToCSV(data, filename);
};

export const triggerPrint = () => {
  window.print();
};
