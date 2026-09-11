import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const InvoiceModal = ({ patients = [], isOpen, onClose, onCreateInvoice }) => {
  const { patients: contextPatients } = useData();
  const patientList = (patients && patients.length > 0) ? patients : (contextPatients || []);

  const [patientId, setPatientId] = useState(patientList[0]?.id || 'WALKIN');
  const [customPatientName, setCustomPatientName] = useState('Walk-in Patient');
  const [items, setItems] = useState([
    { description: 'General Oral Examination', amount: 500 },
    { description: 'Root Canal Treatment (Upper Molar)', amount: 4500 }
  ]);
  const [discount, setDiscount] = useState(500);
  const [tax, setTax] = useState(0);
  const [paidAmount, setPaidAmount] = useState(4500);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  useEffect(() => {
    if ((!patientId || patientId === 'WALKIN') && patientList.length > 0) {
      setPatientId(patientList[0].id);
    }
  }, [patientList]);

  const addItem = () => {
    setItems([...items, { description: 'Scaling & Polishing', amount: 1500 }]);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = field === 'amount' ? parseFloat(value) || 0 : value;
    setItems(updated);
  };

  const subtotal = items.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalAmount = Math.max(0, subtotal - parseFloat(discount || 0) + parseFloat(tax || 0));
  const balanceDue = Math.max(0, totalAmount - parseFloat(paidAmount || 0));
  const paymentStatus = balanceDue === 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Pending');

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundPatient = patientList.find(p => p.id === patientId);
    const resolvedPatientName = foundPatient ? foundPatient.name : (customPatientName || 'Walk-in Patient');
    const resolvedPatientId = foundPatient ? foundPatient.id : `PAT-${Date.now()}`;

    onCreateInvoice({
      patientId: resolvedPatientId,
      patientName: resolvedPatientName,
      items,
      subtotal,
      discount: parseFloat(discount) || 0,
      tax: parseFloat(tax) || 0,
      totalAmount,
      paidAmount: parseFloat(paidAmount) || 0,
      balanceDue,
      paymentStatus,
      paymentMethod
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Patient Invoice & Billing Receipt"
      subtitle="Add consultation fees, procedure costs, discounts, and payment status"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Patient Name
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
            required
          >
            {patientList.length > 0 ? (
              patientList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) • {p.phone}
                </option>
              ))
            ) : (
              <option value="WALKIN">Walk-in Patient (No registered patient)</option>
            )}
          </select>
          {patientId === 'WALKIN' && (
            <input
              type="text"
              placeholder="Enter Walk-in Patient Name"
              value={customPatientName}
              onChange={(e) => setCustomPatientName(e.target.value)}
              className="mt-2 w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              required
            />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Itemized Charges / Procedures
            </label>
            <button
              type="button"
              onClick={addItem}
              className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold border border-brand-200 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Service description"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  className="flex-1 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                  className="w-28 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between font-bold text-slate-700">
            <span>Subtotal:</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Discount (₹)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Amount Paid Now (₹)</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
            <div>
              <span className="font-extrabold text-slate-900 block">Total Due: ₹{totalAmount.toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-medium">Balance Remaining: <strong className="text-rose-600">₹{balanceDue.toLocaleString()}</strong></span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
              paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
              paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-800 border-amber-300' :
              'bg-rose-100 text-rose-800 border-rose-300'
            }`}>
              Status: {paymentStatus}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
          >
            <option value="Credit Card">Credit / Debit Card</option>
            <option value="Cash">Cash</option>
            <option value="UPI / GPay">UPI / Digital Wallet</option>
            <option value="Insurance Claim">Insurance Claim</option>
          </select>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 shadow-md flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" /> Issue Invoice & Save
          </button>
        </div>
      </form>
    </Modal>
  );
};
