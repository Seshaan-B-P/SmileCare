import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Award, 
  Clock, 
  Phone, 
  Mail, 
  FileText, 
  Save, 
  Edit3, 
  Stethoscope, 
  IndianRupee, 
  Calendar, 
  Briefcase, 
  Star, 
  CheckCircle2, 
  Activity, 
  Sparkles,
  Camera,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const DoctorProfile = () => {
  const { currentUser, updateCurrentUser, isDoctor } = useAuth();
  const { updateDoctorProfile, consultations, patients, clinicProfile } = useData();

  const doctorData = currentUser || {};

  const [isEditing, setIsEditing] = useState(false);

  // Form States
  const [name, setName] = useState(doctorData.name || 'Dr. Tharama, MDS');
  const [title, setTitle] = useState(doctorData.title || 'Senior Endodontist & Medical Director');
  const [qualification, setQualification] = useState(doctorData.qualification || 'MDS - Endodontics & Conservative Dentistry');
  const [regNo, setRegNo] = useState(doctorData.regNo || 'TNDC-REG-48291');
  const [phone, setPhone] = useState(doctorData.phone || '+91 98401 23456');
  const [email, setEmail] = useState(doctorData.email || 'doctor@smilecare.com');
  const [emergencyContact, setEmergencyContact] = useState(doctorData.emergencyContact || '+91 98401 99999');
  const [workShift, setWorkShift] = useState(doctorData.workShift || 'Mon-Sat (9:00 AM - 8:00 PM)');
  const [experienceYears, setExperienceYears] = useState(doctorData.experienceYears || 14);
  const [consultationFee, setConsultationFee] = useState(doctorData.consultationFee || clinicProfile?.defaultConsultationFee || 500);
  const [bio, setBio] = useState(doctorData.bio || 'Specialist in Painless Single-Visit Root Canal Treatment, Digital Odontography, Cosmetic Smile Design, and Laser Dentistry with over 14 years of clinical experience.');
  const [specialtiesText, setSpecialtiesText] = useState((doctorData.specialties || ['Endodontics', 'Root Canal Treatment', 'Cosmetic Dentistry', 'Dental Implants', 'Smile Design']).join(', '));
  const [avatar, setAvatar] = useState(doctorData.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || (isDoctor ? 'Dr. Tharama, MDS' : 'Clinic Staff Member'));
      setTitle(currentUser.title || (isDoctor ? 'Senior Endodontist & Medical Director' : 'Dental Hygienist'));
      setQualification(currentUser.qualification || (isDoctor ? 'MDS - Endodontics & Conservative Dentistry' : 'Diploma in Dental Hygiene'));
      setRegNo(currentUser.regNo || currentUser.idProofNo || currentUser.id || (isDoctor ? 'TNDC-REG-48291' : 'STF-ID-1001'));
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setEmergencyContact(currentUser.emergencyContact || '');
      setWorkShift(currentUser.workShift || 'Morning (9:00 AM - 3:00 PM)');
      setExperienceYears(currentUser.experienceYears || 5);
      setConsultationFee(currentUser.consultationFee || clinicProfile?.defaultConsultationFee || 500);
      setBio(currentUser.bio || (isDoctor ? 'Specialist in Painless Single-Visit Root Canal Treatment, Digital Odontography, Cosmetic Smile Design, and Laser Dentistry with over 14 years of clinical experience.' : 'Dedicated dental clinic staff member managing patient intake, appointments, billing, and clinical support.'));
      if (currentUser.specialties) setSpecialtiesText(currentUser.specialties.join(', '));
      if (currentUser.avatar) setAvatar(currentUser.avatar);
    }
  }, [currentUser, clinicProfile, isDoctor]);

  const specialtiesList = specialtiesText.split(',').map(s => s.trim()).filter(Boolean);

  const handleSave = (e) => {
    e.preventDefault();

    const updatedDoctor = {
      name,
      title,
      qualification,
      regNo,
      phone,
      email,
      emergencyContact,
      workShift,
      experienceYears: parseInt(experienceYears) || 0,
      consultationFee: parseFloat(consultationFee) || 500,
      bio,
      specialties: specialtiesList,
      avatar
    };

    // Update in AuthContext & DataContext
    updateCurrentUser(updatedDoctor);
    updateDoctorProfile(doctorData.id || 'usr_doc_1', updatedDoctor);

    setIsEditing(false);
  };

  const totalConsultationsCount = consultations.length;
  const totalPatientsCount = patients.length;

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert image to optimized WebP format
        const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
        setAvatar(webpDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-fade-in">
      {/* Header Banner & Profile Card */}
      <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        {/* Decorative Top Gradient */}
        <div className={`h-32 sm:h-36 relative ${isDoctor ? 'bg-gradient-to-r from-slate-900 via-brand-900 to-tealbrand-900' : 'bg-gradient-to-r from-slate-900 via-tealbrand-950 to-slate-900'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-tealbrand-400/20 via-transparent to-transparent opacity-70"></div>
          <div className="absolute right-6 top-5 flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {isDoctor ? 'Medical Director & Lead Consultant' : 'Authorized Clinic Staff Member'}
            </span>
          </div>
        </div>

        {/* Profile Body Container */}
        <div className="px-6 sm:px-8 pb-6 relative">
          {/* Avatar & Action Button Row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="relative group">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                alt={name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full ring-4 ring-white flex items-center justify-center text-white" title={isDoctor ? "Active Doctor" : "Active Staff"}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 ${
                  isEditing
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                    : 'bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 text-white shadow-brand-500/20'
                }`}
              >
                {isEditing ? (
                  <>
                    <EyeIcon className="w-4 h-4" /> {isDoctor ? 'View Doctor Profile' : 'View Staff Profile'}
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" /> Update Profile Details
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User Info Details */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{name}</h1>
              <span className={`px-2.5 py-0.5 border rounded-full text-xs font-black uppercase ${isDoctor ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-tealbrand-50 text-tealbrand-700 border-tealbrand-200'}`}>
                {regNo}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-700 flex items-center justify-center sm:justify-start gap-2">
              {isDoctor ? <Stethoscope className="w-4 h-4 text-brand-600" /> : <Briefcase className="w-4 h-4 text-tealbrand-600" />} {title}
            </p>
            <p className="text-xs text-slate-500 font-medium">{qualification}</p>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-100 divide-x divide-slate-100 bg-slate-50/50">
          {isDoctor ? (
            <>
              <div className="p-4 text-center">
                <div className="text-xs uppercase font-bold text-slate-400">Clinical Experience</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">{experienceYears} Years+</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs uppercase font-bold text-slate-400">Consultation Fee</div>
                <div className="text-lg font-black text-brand-600 mt-0.5">₹{consultationFee}</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs uppercase font-bold text-slate-400">Consultations Done</div>
                <div className="text-lg font-black text-tealbrand-600 mt-0.5">{totalConsultationsCount}</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs uppercase font-bold text-slate-400">Active Patients</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">{totalPatientsCount}</div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 text-center">
                <div className="text-xs uppercase font-bold text-slate-400">Work Shift</div>
                <div className="text-sm font-extrabold text-slate-800 mt-1">{workShift}</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs uppercase font-bold text-slate-400">Remuneration</div>
                <div className="text-sm font-black text-tealbrand-600 mt-1">₹{currentUser?.salary || 25000} / mo</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs uppercase font-bold text-slate-400">Joining Date</div>
                <div className="text-sm font-extrabold text-slate-800 mt-1">{currentUser?.joiningDate || '2026-08-21'}</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs uppercase font-bold text-slate-400">Staff Status</div>
                <div className="text-sm font-black text-emerald-600 mt-1">Active Staff</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isEditing ? (
        /* Edit Profile Form */
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-brand-600" /> Edit Profile Information
                </h3>
                <p className="text-xs text-slate-500">Update your contact information, profile picture, and bio</p>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
                Edit Mode
              </span>
            </div>

            {/* Profile Avatar & Basic Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">1. Basic Info & Avatar</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">{isDoctor ? 'Dental Council Reg #' : 'Staff ID / Registration #'}</label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">2. Contact Info & Shifts</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Emergency Contact Line</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Work Shift Timing</label>
                  <input
                    type="text"
                    value={workShift}
                    onChange={(e) => setWorkShift(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Profile Summary & Bio */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">3. Profile Summary & Bio</h4>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Profile Summary</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed focus:bg-white"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-7 py-3 bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Profile Details
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Read-Only Overview Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Columns: Bio & Permissions */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" /> {isDoctor ? 'Doctor Biography & Expertise Summary' : 'Staff Profile & Summary'}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                {bio}
              </p>
            </div>

            {isDoctor ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-tealbrand-600" /> Clinical Specialities & Procedures
                </h3>
                <div className="flex flex-wrap gap-2">
                  {specialtiesList.map((spec, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-tealbrand-500" /> {spec}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-tealbrand-600" /> Assigned Module Permissions & System Access
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries({
                    patients: 'Patients Directory',
                    billing: 'Billing & Invoicing',
                    consultations: 'Clinical Consultations',
                    reports: 'Financial Reports',
                    staff: 'Staff Management',
                    allowDiscounts: 'Apply Patient Discounts',
                    exportReports: 'Export Reports Data',
                    deleteRecords: 'Delete Medical Records'
                  }).map(([key, label]) => {
                    const isGranted = currentUser?.permissions ? currentUser.permissions[key] : false;
                    return (
                      <div key={key} className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${isGranted ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        <span>{label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isGranted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {isGranted ? 'Granted' : 'Restricted'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right 1 Column: Contact & Verification Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-600" /> Contact Details
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                    <span className="font-bold text-slate-800">{phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                    <span className="font-bold text-slate-800">{email}</span>
                  </div>
                </div>

                {emergencyContact && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency Line</span>
                      <span className="font-bold text-slate-800">{emergencyContact}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Shift</span>
                    <span className="font-bold text-slate-800">{workShift}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" /> Identification & Verification
              </h3>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{isDoctor ? 'Council Reg #:' : 'Staff ID:'}</span>
                  <span className="font-extrabold text-slate-900">{regNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Role Access:</span>
                  <span className={`font-extrabold ${isDoctor ? 'text-brand-600' : 'text-tealbrand-600'}`}>
                    {isDoctor ? 'Doctor (Admin)' : 'Staff Member'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Verification Status:</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    {isDoctor ? 'Verified Doctor' : 'Active Staff'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function EyeIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
