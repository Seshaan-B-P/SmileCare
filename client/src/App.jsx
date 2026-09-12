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

import { BookingModal } from './components/appointments/BookingModal';
import { InvoiceModal } from './components/billing/InvoiceModal';
import { AutoBookingPortal } from './components/appointments/AutoBookingPortal';

const AppContent = () => {
  const { currentUser, isDoctor } = useAuth();
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
    // Prevent duplicate entries if nothing changed
    if (newTab === activeTab && (!patient || patient?.id === selectedPatient?.id)) {
      if (patient !== selectedPatient) setSelectedPatient(patient);
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
            <PatientProfile
              patient={patients.find(p => p.id === selectedPatient?.id) || selectedPatient}
              onBack={handleBack}
              onBookAppointment={handleBookForPatient}
              onStartConsultation={handleStartConsultation}
              onCreateInvoice={() => setShowGlobalBilling(true)}
            />
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
                <Patients
                  onSelectPatient={handleSelectPatient}
                  onBookAppointmentForPatient={handleBookForPatient}
                />
              )}

              {activeTab === 'appointments' && (
                <Appointments
                  onStartConsultation={(apt) => {
                    const p = patients.find(pat => pat.id === apt.patientId);
                    handleNavigate('consultation', p || null);
                  }}
                />
              )}

              {activeTab === 'consultation' && (
                <Consultation
                  selectedPatient={selectedPatient}
                  onFinishedConsultation={() => handleNavigate('appointments', null)}
                />
              )}

              {activeTab === 'billing' && (
                <Billing
                  patients={patients}
                  onOpenNewInvoice={() => setShowGlobalBilling(true)}
                />
              )}

              {activeTab === 'whatsapp' && (
                <FollowUps />
              )}

              {activeTab === 'staff' && (
                isDoctor ? <StaffManagement /> : <div className="text-center py-12 text-slate-500 font-bold text-sm">Access Restricted to Doctor (Admin) Role</div>
              )}

              {activeTab === 'reports' && (
                isDoctor ? <Reports /> : <div className="text-center py-12 text-slate-500 font-bold text-sm">Access Restricted to Doctor (Admin) Role</div>
              )}

              {activeTab === 'settings' && (
                <Settings />
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
