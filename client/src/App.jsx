import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Toast } from './components/common/Toast';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { PatientProfile } from './pages/PatientProfile';
import { Appointments } from './pages/Appointments';
import { Consultation } from './pages/Consultation';
import { Billing } from './pages/Billing';
import { FollowUps } from './pages/FollowUps';
import { StaffManagement } from './pages/StaffManagement';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { DoctorProfile } from './pages/DoctorProfile';

import { ShieldAlert } from 'lucide-react';
import { BookingModal } from './components/appointments/BookingModal';
import { InvoiceModal } from './components/billing/InvoiceModal';
import { AutoBookingPortal } from './components/appointments/AutoBookingPortal';

const AppContent = () => {
  const { currentUser, isDoctor, hasPermission } = useAuth();
  const { patients, bookAppointment, createInvoice } = useData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [navHistory, setNavHistory] = useState([]);

  const [showGlobalBooking, setShowGlobalBooking] = useState(false);
  const [showGlobalBilling, setShowGlobalBilling] = useState(false);

  const [patientPortalFollowUpId, setPatientPortalFollowUpId] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('#book')) {
        const query = hash.split('?')[1];
        if (query) {
          const params = new URLSearchParams(query);
          const id = params.get('id');
          if (id) setPatientPortalFollowUpId(id);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (patientPortalFollowUpId) {
    return (
      <AutoBookingPortal
        followUpId={patientPortalFollowUpId}
        onClose={() => {
          window.location.hash = '';
          setPatientPortalFollowUpId(null);
        }}
      />
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  const handleNavigate = (newTab, patient = null) => {
    const curPid = selectedPatient ? (selectedPatient.id || selectedPatient._id) : null;
    const nextPid = patient ? (patient.id || patient._id) : null;
    const isSamePatient = Boolean(patient && selectedPatient && curPid === nextPid);

    // Prevent duplicate entries if nothing changed
    if (newTab === activeTab && (!patient ? !selectedPatient : isSamePatient)) {
      if (patient && patient !== selectedPatient) setSelectedPatient(patient);
      return;
    }
    setNavHistory(prev => [...prev, { tab: activeTab, patient: selectedPatient }]);
    setActiveTab(newTab);
    setSelectedPatient(patient);
  };

  const handleBack = () => {
    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory(h => h.slice(0, -1));
      setActiveTab(prev.tab);
      setSelectedPatient(prev.patient || null);
    } else if (selectedPatient) {
      setSelectedPatient(null);
    } else if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      setSelectedPatient(null);
    }
  };

  const canGoBack = navHistory.length > 0 || !!selectedPatient || activeTab !== 'dashboard';
  const previousTab = navHistory.length > 0 
    ? navHistory[navHistory.length - 1].tab 
    : (activeTab !== 'dashboard' ? 'dashboard' : null);

  const handleSelectPatient = (patient) => {
    handleNavigate('patients', patient);
  };

  const handleStartConsultation = (patient) => {
    handleNavigate('consultation', patient);
  };

  const handleBookForPatient = (patient) => {
    setSelectedPatient(patient);
    setShowGlobalBooking(true);
  };

  const renderRestrictedNotice = (moduleName) => (
    <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200/90 shadow-sm max-w-lg mx-auto my-12 space-y-4 animate-fade-in">
      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-black text-slate-900">Module Access Restricted</h3>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">
        You do not currently have permission to access the <strong className="text-slate-800">{moduleName}</strong> module. 
        Please contact Doctor (Admin) to enable this module in Staff Management.
      </p>
      <button
        type="button"
        onClick={() => handleNavigate('dashboard')}
        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
      >
        Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => handleNavigate(tab, null)}
        onBack={handleBack}
        canGoBack={canGoBack}
        previousTab={previousTab}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => handleNavigate(tab, null)}
          onSelectPatient={(p) => handleNavigate('patients', p)}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {selectedPatient && activeTab === 'patients' ? (
            isDoctor || hasPermission('patients') ? (
              <PatientProfile
                patient={patients.find(p => {
                  const targetId = selectedPatient?.id || selectedPatient?._id;
                  return (p.id && p.id === targetId) || (p._id && p._id === targetId);
                }) || selectedPatient}
                onBack={handleBack}
                onBookAppointment={handleBookForPatient}
                onStartConsultation={handleStartConsultation}
                onCreateInvoice={() => setShowGlobalBilling(true)}
              />
            ) : renderRestrictedNotice('Patient Directory')
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  setActiveTab={(tab) => handleNavigate(tab, null)}
                  onOpenAddPatient={() => handleNavigate('patients', null)}
                  onOpenNewApt={() => setShowGlobalBooking(true)}
                  onOpenConsultation={() => handleNavigate('consultation', null)}
                  onOpenBilling={() => setShowGlobalBilling(true)}
                  onStartConsultation={(apt) => {
                    const p = patients.find(pat => pat.id === apt.patientId);
                    handleNavigate('consultation', p || null);
                  }}
                />
              )}

              {activeTab === 'doctor-profile' && (
                <DoctorProfile />
              )}

              {activeTab === 'patients' && (
                isDoctor || hasPermission('patients') ? (
                  <Patients
                    onSelectPatient={handleSelectPatient}
                    onBookAppointmentForPatient={handleBookForPatient}
                  />
                ) : renderRestrictedNotice('Patient Directory')
              )}

              {activeTab === 'appointments' && (
                isDoctor || hasPermission('appointments') ? (
                  <Appointments
                    onStartConsultation={(apt) => {
                      const p = patients.find(pat => pat.id === apt.patientId);
                      handleNavigate('consultation', p || null);
                    }}
                  />
                ) : renderRestrictedNotice('Appointments & Queue')
              )}

              {activeTab === 'consultation' && (
                isDoctor || hasPermission('consultation') ? (
                  <Consultation
                    selectedPatient={selectedPatient}
                    onFinishedConsultation={() => handleNavigate('appointments', null)}
                  />
                ) : renderRestrictedNotice('Consultation & Chart')
              )}

              {activeTab === 'billing' && (
                isDoctor || hasPermission('billing') ? (
                  <Billing
                    patients={patients}
                    onOpenNewInvoice={() => setShowGlobalBilling(true)}
                  />
                ) : renderRestrictedNotice('Billing & Payments')
              )}

              {activeTab === 'whatsapp' && (
                isDoctor || hasPermission('whatsapp') ? (
                  <FollowUps />
                ) : renderRestrictedNotice('WhatsApp Reminders')
              )}

              {activeTab === 'staff' && (
                isDoctor || hasPermission('staff') ? (
                  <StaffManagement />
                ) : renderRestrictedNotice('Staff Management')
              )}

              {activeTab === 'reports' && (
                isDoctor || hasPermission('reports') ? (
                  <Reports />
                ) : renderRestrictedNotice('Reports & Analytics')
              )}

              {activeTab === 'settings' && (
                isDoctor || hasPermission('settings') ? (
                  <Settings />
                ) : renderRestrictedNotice('Clinic Settings')
              )}
            </>
          )}
        </main>
      </div>

      {showGlobalBooking && (
        <BookingModal
          patients={patients}
          isOpen={true}
          onClose={() => setShowGlobalBooking(false)}
          onBook={(apt) => { bookAppointment(apt); setShowGlobalBooking(false); }}
        />
      )}

      {showGlobalBilling && (
        <InvoiceModal
          patients={patients}
          isOpen={true}
          onClose={() => setShowGlobalBilling(false)}
          onCreateInvoice={(inv) => { createInvoice(inv); setShowGlobalBilling(false); }}
        />
      )}

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
