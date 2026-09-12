// Seed Data for Server API - Clean Initial Dataset (No Mock Patient Data)

export const MOCK_SEED_DATA = {
  currentUser: {
    id: 'usr_doc_1',
    name: 'Dr. Tharma P, MDS',
    email: 'doctor@smilecare.com',
    role: 'Doctor',
    title: 'Senior Endodontist & Medical Director',
    regNo: 'TNDC-REG-48291',
    phone: '+91 98401 23456',

  },
  users: [
    {
      id: 'usr_doc_1',
      name: 'Dr. Tharma P, MDS',
      email: 'doctor@smilecare.com',
      password: 'Doctor@123',
      role: 'Doctor',
      title: 'Senior Endodontist (MDS)',
      regNo: 'TNDC-REG-48291',
      phone: '+91 98401 23456',
      permissions: { patients: true, consultations: true, billing: true, reports: true, settings: true, staff: true }
    }
  ],
  clinicProfile: {
    name: 'SmileCare Speciality Dental Clinic & Implant Centre',
    tagline: 'Precision Dental Care & Advanced Odontogram Technology',
    address: 'No. 42, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu 600040',
    phone: '+91 44 2621 8899',
    email: 'chennai@smilecare.in',
    website: 'https://smilecare-tn.in',
    registrationNo: 'TN-MOH-2024-884',
    taxId: '33AAACS9948M1Z2',
    workingHours: 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 9:30 AM - 1:30 PM',
    slotDurationMinutes: 30,
    defaultConsultationFee: 500,
    whatsAppApiStatus: 'Connected (Meta WhatsApp Business India API)',
    whatsAppPhoneNumber: '+919840123456'
  },
  patients: [],
  appointments: [],
  dentalCharts: {},
  consultations: [],
  invoices: [],
  followUps: [],
  activityLog: []
};
