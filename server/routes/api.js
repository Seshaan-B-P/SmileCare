// Express API Routes Dispatcher

import { handleLogin } from '../controllers/authController.js';
import { getPatients, createPatient } from '../controllers/patientController.js';
import { getAppointments, createAppointment } from '../controllers/appointmentController.js';
import { saveConsultation, updateDentalChart } from '../controllers/consultationController.js';
import { getInvoices, createInvoice } from '../controllers/billingController.js';
import { getStaffMembers, createStaffMember } from '../controllers/staffController.js';
import { confirmWhatsAppAutoBooking } from '../controllers/followUpController.js';
import { getReportsSummary } from '../controllers/reportController.js';

export const handleApiRoutes = async (req, res, db, pathname, body) => {
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    return handleLogin({ body }, res, db);
  }

  if (pathname === '/api/patients' && req.method === 'GET') {
    return { success: true, data: getPatients(db) };
  }

  if (pathname === '/api/patients' && req.method === 'POST') {
    return { success: true, data: createPatient(body, db) };
  }

  if (pathname === '/api/appointments' && req.method === 'GET') {
    return { success: true, data: getAppointments(db) };
  }

  if (pathname === '/api/appointments' && req.method === 'POST') {
    return { success: true, data: createAppointment(body, db) };
  }

  if (pathname === '/api/invoices' && req.method === 'GET') {
    return { success: true, data: getInvoices(db) };
  }

  if (pathname === '/api/reports' && req.method === 'GET') {
    return { success: true, data: getReportsSummary(db) };
  }

  if (pathname === '/api/whatsapp/book-slot' && req.method === 'POST') {
    return { success: true, data: confirmWhatsAppAutoBooking(body.followUpId, db, body.requestedSlot) };
  }

  return { success: true, data: db };
};
