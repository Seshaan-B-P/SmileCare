import React, { useState } from 'react';
import { Search, Printer, IndianRupee } from 'lucide-react';
import { useData } from '../context/DataContext';
import { InvoiceModal } from '../components/billing/InvoiceModal';
import { triggerPrint } from '../utils/exportUtils';

export const Billing = ({ patients, onOpenNewInvoice }) => {
  const { invoices, recordPayment, createInvoice, patients: contextPatients } = useData();
  const patientList = (patients && patients.length > 0) ? patients : (contextPatients || []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activePrintInvoice, setActivePrintInvoice] = useState(null);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI / GPay');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.patientName.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const totalPending = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    recordPayment(selectedInvoice.id, payAmount, payMethod);
    setSelectedInvoice(null);
  };

  const handleIssueInvoiceClick = () => {
    if (onOpenNewInvoice) {
      onOpenNewInvoice();
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Billing, Invoices & Financial Ledger</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Track consultation fees, procedure invoices, and payment receipts</p>
        </div>

        <button
          onClick={handleIssueInvoiceClick}
          className="px-5 py-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-tealbrand-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 self-start sm:self-auto active:scale-[0.99]"
        >
          <IndianRupee className="w-4 h-4" /> Issue New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-lg transition-all duration-300">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Revenue Collected</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 tracking-tight">₹{totalCollected.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-lg transition-all duration-300">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Outstanding Balance Due</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 tracking-tight">₹{totalPending.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-lg transition-all duration-300">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Invoices Issued</span>
          <div className="text-2xl sm:text-3xl font-black text-brand-600 mt-1 tracking-tight">{invoices.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice # (INV-9001) or patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
        >
          <option value="All">All Payment Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                <th className="p-4 pl-6">Invoice #</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 font-black text-slate-900">{inv.id}</td>
                  <td className="p-4 font-black text-brand-700">{inv.patientName}</td>
                  <td className="p-4 text-slate-500 font-medium">{inv.date}</td>
                  <td className="p-4 font-black text-slate-900">₹{inv.totalAmount}</td>
                  <td className="p-4 font-black text-emerald-700">₹{inv.paidAmount}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${inv.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      inv.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    {inv.paymentStatus !== 'Paid' && (
                      <button
                        onClick={() => { setSelectedInvoice(inv); setPayAmount(inv.balanceDue); }}
                        className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-extrabold border border-emerald-200 shadow-2xs transition-colors"
                      >
                        Record Payment
                      </button>
                    )}
                    <button
                      onClick={() => setActivePrintInvoice(inv)}
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-extrabold border border-slate-200 inline-flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <InvoiceModal
          patients={patients}
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          onCreateInvoice={createInvoice}
        />
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl animate-fade-in space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Record Payment for {selectedInvoice.id}</h3>
            <p className="text-xs text-slate-500">Patient: <strong>{selectedInvoice.patientName}</strong> • Balance Due: <strong>₹{selectedInvoice.balanceDue}</strong></p>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Amount to Pay (₹)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold text-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                >
                  <option value="UPI / GPay">UPI / Digital Wallet</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activePrintInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-slate-200 printable-area space-y-6">
            <div className="border-b-2 border-brand-600 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-slate-900">SmileCare Dental Clinic</h2>
                <p className="text-xs text-slate-500">Suite 402, HealthCare Avenue, Medical Hub</p>
                <p className="text-[10px] text-brand-600 font-bold">Ph: +1 (800) 555-SMILE</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500">Receipt #{activePrintInvoice.receiptNo}</div>
                <div className="text-xs text-slate-500">Date: {activePrintInvoice.date}</div>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <div><strong>Billed To:</strong> {activePrintInvoice.patientName}</div>
              <div><strong>Invoice ID:</strong> {activePrintInvoice.id}</div>
              <div><strong>Payment Method:</strong> {activePrintInvoice.paymentMethod || 'Credit Card'}</div>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activePrintInvoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2">{it.description}</td>
                    <td className="py-2 text-right font-bold">₹{it.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-slate-200 pt-3 text-xs font-bold space-y-1 text-right">
              <div>Subtotal: ₹{activePrintInvoice.subtotal}</div>
              <div>Discount: -₹{activePrintInvoice.discount}</div>
              <div className="text-sm font-black text-slate-900">Total Paid: ₹{activePrintInvoice.paidAmount}</div>
            </div>

            <div className="no-print flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setActivePrintInvoice(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={triggerPrint}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <InvoiceModal
          patients={patientList}
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          onCreateInvoice={(inv) => {
            createInvoice(inv);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};
