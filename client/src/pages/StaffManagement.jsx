import React, { useState } from 'react';
import { UserCog, Plus, Activity, Clock, Award, DollarSign, ShieldAlert, Phone, FileText, CheckSquare, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/common/Modal';

export const StaffManagement = () => {
  const { users, addStaffMember, updateStaffPermissions, activityLog } = useData();
  const [showAddModal, setShowAddModal] = useState(false);

  // Staff Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('Dental Hygienist');
  const [qualification, setQualification] = useState('Diploma in Dental Hygiene');
  const [phone, setPhone] = useState('');
  const [workShift, setWorkShift] = useState('Morning (9:00 AM - 3:00 PM)');
  const [salary, setSalary] = useState('25000');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [idProofNo, setIdProofNo] = useState('');

  // Initial permissions state
  const [permissions, setPermissions] = useState({
    patients: true,
    consultations: false,
    billing: true,
    reports: false,
    settings: false,
    staff: false,
    allowDiscounts: false,
    exportReports: false,
    deleteRecords: false
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addStaffMember({
      name,
      email,
      password: password || 'Staff@123',
      title,
      qualification,
      phone,
      workShift,
      salary: parseFloat(salary) || 25000,
      joiningDate,
      emergencyContact,
      idProofNo: idProofNo || `STF-ID-${Math.floor(1000 + Math.random() * 9000)}`,
      permissions
    });

    // Reset Form
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setEmergencyContact('');
    setIdProofNo('');
    setShowAddModal(false);
  };

  const togglePermission = (user, permKey) => {
    const updated = { ...user.permissions, [permKey]: !user.permissions[permKey] };
    updateStaffPermissions(user.id, updated);
  };

  const displayUsers = Array.from(
    new Map(
      (users || [])
        .filter(u => u.name !== 'Mark Davis')
        .map(u => [u.id || (u.email ? u.email.toLowerCase() : u.name), u])
    ).values()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-brand-600" /> Clinic Staff Roster & RBAC Management
          </h2>
          <p className="text-xs text-slate-500">Configure Doctor (Admin) & Staff profiles, work shifts, remuneration, and module permissions</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-tealbrand-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayUsers.map(u => (
          <div key={u.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-2xl object-cover shadow ring-1 ring-brand-500/20 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-brand-950 text-white font-extrabold flex items-center justify-center text-sm shadow shrink-0">
                    {u.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    {u.name}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${u.role === 'Doctor' ? 'bg-brand-100 text-brand-700' : 'bg-tealbrand-100 text-tealbrand-700'}`}>
                      {u.role}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{u.title} • {u.email}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-extrabold uppercase px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  {u.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Badges Info Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-tealbrand-600" /> Work Shift
                </span>
                <span className="font-extrabold text-slate-800 text-[11px] truncate block mt-0.5">
                  {u.workShift || 'Morning Shift'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                  <Award className="w-3 h-3 text-brand-600" /> Qualification
                </span>
                <span className="font-extrabold text-slate-800 text-[11px] truncate block mt-0.5">
                  {u.qualification || 'BDS / Hygienist'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-600" /> Monthly Salary
                </span>
                <span className="font-black text-slate-900 text-[11px] block mt-0.5">
                  ₹{u.salary ? u.salary.toLocaleString('en-IN') : '25,000'} / mo
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Joining Date</span>
                <span className="font-bold text-slate-700 text-[11px] block mt-0.5">{u.joiningDate || '2024-01-15'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Phone</span>
                <span className="font-bold text-slate-700 text-[11px] block mt-0.5">{u.phone || '+91 98401 23456'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Emergency Contact</span>
                <span className="font-bold text-slate-700 text-[11px] block mt-0.5">{u.emergencyContact || 'Family (+91)'}</span>
              </div>
            </div>

            {/* RBAC Module Access Permissions */}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                1. Module Access Permissions:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'patients', label: 'Patient Directory' },
                  { key: 'consultations', label: 'Clinical Exam & Rx' },
                  { key: 'billing', label: 'Billing & Invoices' },
                  { key: 'reports', label: 'Reports & Financials' },
                  { key: 'settings', label: 'Clinic Config & Backup' },
                  { key: 'staff', label: 'Staff Management' }
                ].map(p => {
                  const hasAccess = u.role === 'Doctor' || (u.permissions && u.permissions[p.key]);
                  return (
                    <label key={p.key} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAccess}
                        disabled={u.role === 'Doctor'}
                        onChange={() => togglePermission(u, p.key)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span className="font-semibold text-slate-700">{p.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Advanced RBAC Action Rights */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-tealbrand-600" /> 2. Advanced Security Action Rights:
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { key: 'allowDiscounts', label: 'Apply Discounts' },
                  { key: 'exportReports', label: 'Export Reports' },
                  { key: 'deleteRecords', label: 'Delete Records' }
                ].map(p => {
                  const hasAccess = u.role === 'Doctor' || (u.permissions && u.permissions[p.key]);
                  return (
                    <label key={p.key} className="flex items-center gap-2 p-2 bg-tealbrand-50/50 rounded-xl border border-tealbrand-200/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAccess}
                        disabled={u.role === 'Doctor'}
                        onChange={() => togglePermission(u, p.key)}
                        className="rounded text-tealbrand-600 focus:ring-tealbrand-500"
                      />
                      <span className="font-bold text-tealbrand-900 text-[11px]">{p.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Audit Trail */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-600" /> Staff System Audit Trail & Access Logs
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          {activityLog.map(act => (
            <div key={act.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">{act.user}</span>: <span className="text-slate-700">{act.action}</span>
              </div>
              <span className="text-slate-400 font-medium">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Add Staff Modal */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Add Clinic Staff Member"
          subtitle="Enter staff credentials, shift, compensation, and access rights"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Staff Name *</label>
                <input
                  type="text"
                  placeholder="E.g., Dr. Robert Chen / Mark Davis"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="robert@smilecare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Login Password *</label>
                <input
                  type="password"
                  placeholder="Set password (e.g. Staff@123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98401 23456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Title / Designation *</label>
                <input
                  type="text"
                  placeholder="Head Receptionist / Associate Hygienist"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Qualification / Specialization</label>
                <input
                  type="text"
                  placeholder="BDS / Diploma in Dental Hygiene"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Work Shift & Timings</label>
                <select
                  value={workShift}
                  onChange={(e) => setWorkShift(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                >
                  <option value="Morning (9:00 AM - 3:00 PM)">Morning (9:00 AM - 3:00 PM)</option>
                  <option value="Evening (2:00 PM - 8:00 PM)">Evening (2:00 PM - 8:00 PM)</option>
                  <option value="Full-Day (9:00 AM - 8:00 PM)">Full-Day (9:00 AM - 8:00 PM)</option>
                  <option value="Night / On-Call">Night / On-Call Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Monthly Salary (₹)</label>
                <input
                  type="number"
                  placeholder="25000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Date of Joining</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  placeholder="Spouse / Parent (+91)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Aadhaar / ID Proof No.</label>
                <input
                  type="text"
                  placeholder="ABCD1234E or Aadhaar No."
                  value={idProofNo}
                  onChange={(e) => setIdProofNo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border text-xs font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 shadow-md"
              >
                Create Complete Staff Profile
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
