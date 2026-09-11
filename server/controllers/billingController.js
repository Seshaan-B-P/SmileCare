// Controller: Billing, Invoices & Financial Receipts

export const getInvoices = (db) => db.invoices;

export const createInvoice = (invData, db) => {
  const newInvoice = {
    id: `INV-${9000 + db.invoices.length + 1}`,
    receiptNo: `RCP-${new Date().getFullYear()}-${100 + db.invoices.length + 1}`,
    date: new Date().toISOString().split('T')[0],
    ...invData
  };
  db.invoices.unshift(newInvoice);
  return newInvoice;
};
