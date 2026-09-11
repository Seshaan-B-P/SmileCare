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
  if (!dataArray || !dataArray.length) return;
  const headers = Object.keys(dataArray[0]);
  const rows = dataArray.map(obj => 
    headers.map(header => {
      let val = obj[header] || '';
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
};

export const triggerPrint = () => {
  window.print();
};
