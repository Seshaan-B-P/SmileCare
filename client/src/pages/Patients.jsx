import React, { useState } from 'react';
import { Search, UserPlus, Eye, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/common/Modal';

const getPatientRegistrationMessage = (p) => {
  const patientName = p.name || '';
  const patientId = p.id || p.patientId || p._id || '';

  return [
    `வணக்கம் ${patientName} அவர்களே! 👋`,
    ``,
    `🦷 SmileCare Dental Clinic-க்கு உங்களை வரவேற்கிறோம்!`,
    ``,
    `உங்கள் patient registration வெற்றிகரமாக முடிந்துவிட்டது. ✅`,
    ``,
    `📋 Patient ID: ${patientId}`,
    ``,
    `உங்கள் dental care-ஐ சிறப்பாக கவனித்துக்கொள்ள SmileCare குழு எப்போதும் தயாராக உள்ளது. 💙`,
    ``,
    `SmileCare Dental Clinic`,
    `Your Smile, Our Care!`
  ].join('\n');
};

export const Patients = ({ onSelectPatient, onBookAppointmentForPatient }) => {
  const { patients, addPatient } = useData();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');
  const [medicalAlerts, setMedicalAlerts] = useState('');

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search);
    const matchesGender = genderFilter === 'All' || p.gender === genderFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesGender && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const alertsArr = medicalAlerts ? medicalAlerts.split(',').map(s => s.trim()) : [];
    addPatient({
      name,
      age: parseInt(age) || 30,
      gender,
      phone,
      email,
      bloodGroup,
      emergencyContact,
      address,
      medicalHistory: alertsArr,
      dentalHistory: [],
      allergies: alertsArr.filter(a => a.toLowerCase().includes('allerg')),
      notes: medicalAlerts
    });

    setName('');
    setAge('');
    setPhone('');
    setEmail('');
    setMedicalAlerts('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Patient Directory & Medical Records</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage dental medical records, allergies, and treatment histories</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-brand-600 via-brand-700 to-tealbrand-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-brand-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 self-start sm:self-auto active:scale-[0.99]"
        >
          <UserPlus className="w-4 h-4" /> Register New Patient
        </button>
      </div>

      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient name, ID (PAT-1001), or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Genders</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                <th className="p-4 pl-6">Patient Info</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Blood Group</th>
                <th className="p-4">Medical History / Alerts</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPatients.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      {p.avatar ? (
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-10 h-10 rounded-2xl object-cover shadow-sm ring-1 ring-brand-500/30 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-tealbrand-500 text-white font-black flex items-center justify-center text-xs shadow-sm shrink-0">
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <div className="font-black text-slate-900 text-sm">{p.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">{p.id} • {p.gender}, {p.age}y</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-900 font-extrabold flex items-center gap-1.5">
                      <span>{p.phone}</span>
                      <a
                        href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getPatientRegistrationMessage(p))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Chat on WhatsApp"
                      >
                        💬
                      </a>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{p.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 font-black text-xs">
                      {p.bloodGroup}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {p.medicalHistory && p.medicalHistory.length > 0 ? (
                        p.medicalHistory.map((m, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200/80">
                            {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 font-medium">No medical alerts</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">
                    {p.joinedDate}
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button
                      onClick={() => onSelectPatient(p)}
                      className="px-3.5 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 font-extrabold text-xs rounded-xl border border-brand-200 transition-colors inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> Profile
                    </button>
                    <button
                      onClick={() => onBookAppointmentForPatient(p)}
                      className="px-3.5 py-1.5 bg-tealbrand-50 text-tealbrand-700 hover:bg-tealbrand-100 font-extrabold text-xs rounded-xl border border-tealbrand-200 transition-colors inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Register New Dental Patient"
          subtitle="Enter personal information, emergency contact, and medical background"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="E.g., Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Age</label>
                <input
                  type="number"
                  placeholder="35"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  placeholder="Name (+1 phone)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Medical Alerts / Allergies (Comma Separated)</label>
              <input
                type="text"
                placeholder="Penicillin Allergy, Hypertension, Diabetes..."
                value={medicalAlerts}
                onChange={(e) => setMedicalAlerts(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              />
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
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md"
              >
                Save Patient Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
