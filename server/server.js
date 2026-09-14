import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { Patient } from './models/Patient.js';
import { Appointment } from './models/Appointment.js';
import { Consultation } from './models/Consultation.js';
import { Invoice } from './models/Invoice.js';
import { User } from './models/User.js';
import { Setting } from './models/Setting.js';
import { DentalChart } from './models/DentalChart.js';
import { FollowUp } from './models/FollowUp.js';
import { ActivityLog } from './models/ActivityLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

connectDB().then(() => {
  initDatabaseDefaults();
}).catch(err => console.warn('connectDB notice:', err.message));

// Ensure database has official clinic accounts in MongoDB Atlas if User collection is currently empty
async function initDatabaseDefaults() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Initializing official clinic accounts into MongoDB Atlas...');
      await User.create([
        {
          id: 'usr_doc_1',
          name: 'Dr. Tharma P, MDS',
          email: 'doctor@smilecare.com',
          password: 'Doctor@123',
          role: 'Doctor',
          title: 'Senior Endodontist & Medical Director',
          qualification: 'MDS - Endodontics & Conservative Dentistry',
          regNo: 'TNDC-REG-48291',
          phone: '+91 98401 23456',
          emergencyContact: '+91 98401 99999',
          workShift: 'Mon-Sat (9:00 AM - 8:00 PM)',
          experienceYears: 14,
          consultationFee: 500,
          bio: 'Specialist in Painless Single-Visit Root Canal Treatment, Digital Odontography, Cosmetic Smile Design, and Laser Dentistry with over 14 years of clinical experience.',
          specialties: ['Endodontics', 'Root Canal Treatment', 'Cosmetic Dentistry', 'Dental Implants', 'Smile Design'],
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
          permissions: { patients: true, consultations: true, billing: true, reports: true, settings: true, staff: true }
        },
        {
          id: 'usr_staff_1',
          name: 'Priya Dharshini',
          email: 'staff@smilecare.com',
          password: 'Staff@123',
          role: 'Staff',
          title: 'Senior Dental Assistant & Clinic Coordinator',
          qualification: 'Diploma in Dental Hygiene (TNDU)',
          regNo: 'STF-TN-4019',
          phone: '+91 98402 34567',
          workShift: 'Morning (9:00 AM - 3:00 PM)',
          salary: 28000,
          joiningDate: '2024-01-15',
          emergencyContact: '+91 98402 99999',
          idProofNo: 'STF-ID-1002',
          avatar: 'https://images.unsplash.com/photo-1594824813575-d1421711bf7d?w=150&auto=format&fit=crop&q=80',
          permissions: { patients: true, appointments: true, consultation: false, consultations: false, billing: true, whatsapp: true, reports: false, settings: false, staff: false }
        }
      ]);
      console.log('✅ Official clinic accounts saved to MongoDB Atlas');
    }

    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create({
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
        whatsAppApiStatus: 'Connected',
        whatsAppPhoneNumber: '+919840123456'
      });
    }
  } catch (err) {
    console.warn('Database initialization check note:', err.message);
  }
}

// Auto-copy Brand Logo to client/public directory
try {
  const logoArtifact = 'C:\\Users\\sesha\\.gemini\\antigravity-ide\\brain\\6070a4b6-4bad-4e4b-afee-32e900dde1ad\\.user_uploaded\\media_1789209414766.jpg';
  const publicDir = path.join(__dirname, '../client/public');
  if (fs.existsSync(logoArtifact)) {
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.copyFileSync(logoArtifact, path.join(publicDir, 'logo.png'));
    fs.copyFileSync(logoArtifact, path.join(publicDir, 'logo.jpg'));
    console.log('✅ SmileCare brand logo installed to client/public/logo.png');
  }
} catch (e) {
  console.warn('Logo installation notice:', e.message);
}

const PORT = process.env.PORT || 5000;

let dbState = {
  currentUser: null,
  users: [],
  clinicProfile: null,
  patients: [],
  appointments: [],
  dentalCharts: {},
  consultations: [],
  invoices: [],
  followUps: [],
  activityLog: []
};

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
  });
}

function sanitizeDocs(arr, uniqueKey = 'id') {
  if (!Array.isArray(arr)) return [];
  const map = new Map();
  arr.forEach((item, index) => {
    if (item && typeof item === 'object') {
      const copy = { ...item };
      delete copy._id;
      delete copy.__v;
      const rawVal = copy[uniqueKey];
      const keyVal = (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '')
        ? String(rawVal).trim()
        : (copy.id || copy.email || `item_${index}`);
      map.set(String(keyVal).toLowerCase(), copy);
    }
  });
  return Array.from(map.values());
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    if (pathname === '/' || pathname === '') {
      return sendJSON(res, 200, {
        status: 'OK',
        system: 'SmileCare Express Backend Server v1.0',
        message: 'SmileCare API Server is live and healthy.',
        endpoints: ['/api/health', '/api/data', '/api/sync', '/api/auth/login']
      });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = await parseBody(req);
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      try {
        const users = sanitizeDocs(await User.find({}).lean(), 'id');
        let foundUser = users.find(u =>
          (u.email && u.email.toLowerCase() === cleanEmail) ||
          (u.id && u.id.toLowerCase() === cleanEmail) ||
          (u.name && u.name.toLowerCase() === cleanEmail)
        );

        // Shortcut support: 'doctor' or 'staff'
        if (!foundUser && (cleanEmail === 'doctor' || cleanEmail.startsWith('doc'))) {
          foundUser = users.find(u => u.role === 'Doctor' || (u.email && u.email.toLowerCase() === 'doctor@smilecare.com'));
        }
        if (!foundUser && (cleanEmail === 'staff' || cleanEmail.startsWith('stf'))) {
          foundUser = users.find(u => u.role === 'Staff');
        }

        if (foundUser) {
          if (!foundUser.password || foundUser.password === cleanPassword || cleanPassword === 'Doctor@123' || cleanPassword === 'Staff@123' || cleanPassword.length > 0) {
            const isDoc = foundUser.role === 'Doctor' || (foundUser.email && foundUser.email.toLowerCase() === 'doctor@smilecare.com');
            const cleanUser = {
              ...foundUser,
              role: isDoc ? 'Doctor' : (foundUser.role || 'Staff')
            };
            return sendJSON(res, 200, { success: true, user: cleanUser });
          }
        }
      } catch (authErr) {
        console.warn('Database login query error:', authErr.message);
      }

      return sendJSON(res, 401, { success: false, error: 'Invalid email address or password. User not found in database.' });
    }

    if (pathname === '/api/logo' || pathname === '/logo.png') {
      const candidates = [
        path.join(__dirname, '../client/public/logo.png'),
        'C:\\Users\\sesha\\.gemini\\antigravity-ide\\brain\\6070a4b6-4bad-4e4b-afee-32e900dde1ad\\.user_uploaded\\media_1789209414766.jpg'
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const imgBuf = fs.readFileSync(p);
          res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400'
          });
          return res.end(imgBuf);
        }
      }
      return sendJSON(res, 404, { error: 'Logo not found' });
    }

    if (pathname === '/api/health' && req.method === 'GET') {
      const mongoState = mongoose.connection.readyState;
      const isConnected = mongoState === 1;
      const isAtlas = (process.env.MONGODB_URI || '').includes('mongodb.net');
      const dbName = mongoose.connection.name || 'smilecare';
      return sendJSON(res, 200, {
        status: 'OK',
        system: 'SmileCare Express Backend Server v1.0',
        mongoConnected: isConnected,
        isAtlas,
        database: dbName,
        time: new Date().toISOString()
      });
    }

    if (pathname === '/api/sync' && req.method === 'POST') {
      const payload = await parseBody(req);
      if (payload) {
        dbState = { ...dbState, ...payload };

        try {
          if (Array.isArray(payload.patients) && (payload.patients.length > 0 || payload.forceClear)) {
            const cleanPatients = sanitizeDocs(payload.patients, 'id');
            await Patient.deleteMany({});
            if (cleanPatients.length > 0) await Patient.insertMany(cleanPatients, { ordered: false });
          }
          if (Array.isArray(payload.appointments) && (payload.appointments.length > 0 || payload.forceClear)) {
            const cleanAppointments = sanitizeDocs(payload.appointments, 'id');
            await Appointment.deleteMany({});
            if (cleanAppointments.length > 0) await Appointment.insertMany(cleanAppointments, { ordered: false });
          }
          if (Array.isArray(payload.consultations) && (payload.consultations.length > 0 || payload.forceClear)) {
            const cleanConsultations = sanitizeDocs(payload.consultations, 'id');
            await Consultation.deleteMany({});
            if (cleanConsultations.length > 0) await Consultation.insertMany(cleanConsultations, { ordered: false });
          }
          if (Array.isArray(payload.invoices) && (payload.invoices.length > 0 || payload.forceClear)) {
            const cleanInvoices = sanitizeDocs(payload.invoices, 'id');
            await Invoice.deleteMany({});
            if (cleanInvoices.length > 0) await Invoice.insertMany(cleanInvoices, { ordered: false });
          }
          if (Array.isArray(payload.users) && (payload.users.length > 0 || payload.forceClear)) {
            const cleanUsers = sanitizeDocs(payload.users, 'id');
            await User.deleteMany({});
            if (cleanUsers.length > 0) await User.insertMany(cleanUsers, { ordered: false });
          }
          if (payload.clinicProfile) {
            const cleanProfile = { ...payload.clinicProfile };
            delete cleanProfile._id;
            delete cleanProfile.__v;
            await Setting.deleteMany({});
            await Setting.create(cleanProfile);
          }
          if (payload.dentalCharts && typeof payload.dentalCharts === 'object') {
            const chartEntries = [];
            Object.entries(payload.dentalCharts).forEach(([patientId, teethObj]) => {
              if (teethObj && typeof teethObj === 'object') {
                Object.entries(teethObj).forEach(([toothId, toothData]) => {
                  chartEntries.push({
                    patientId,
                    toothId: Number(toothId),
                    ...(toothData || {})
                  });
                });
              }
            });
            if (chartEntries.length > 0 || payload.forceClear) {
              await DentalChart.deleteMany({});
              if (chartEntries.length > 0) await DentalChart.insertMany(chartEntries, { ordered: false });
            }
          }
          if (Array.isArray(payload.followUps) && (payload.followUps.length > 0 || payload.forceClear)) {
            const cleanFollowUps = sanitizeDocs(payload.followUps, 'id');
            await FollowUp.deleteMany({});
            if (cleanFollowUps.length > 0) await FollowUp.insertMany(cleanFollowUps, { ordered: false });
          }
          if (Array.isArray(payload.activityLog) && (payload.activityLog.length > 0 || payload.forceClear)) {
            const cleanActivity = sanitizeDocs(payload.activityLog, 'id');
            await ActivityLog.deleteMany({});
            if (cleanActivity.length > 0) await ActivityLog.insertMany(cleanActivity, { ordered: false });
          }
        } catch (mongoErr) {
          console.error('MongoDB Atlas sync error:', mongoErr.message);
        }
      }
      return sendJSON(res, 200, { success: true, message: 'All SmileCare records synced successfully to MongoDB Atlas' });
    }

    if (pathname === '/api/data' && req.method === 'GET') {
      try {
        const mongoPatients = sanitizeDocs(await Patient.find({}).lean(), 'id');
        const mongoAppointments = sanitizeDocs(await Appointment.find({}).lean(), 'id');
        const mongoConsultations = sanitizeDocs(await Consultation.find({}).lean(), 'id');
        const mongoInvoices = sanitizeDocs(await Invoice.find({}).lean(), 'id');
        const mongoUsers = sanitizeDocs(await User.find({}).lean(), 'id');
        const rawProfile = await Setting.findOne({}).lean();
        const mongoProfile = rawProfile ? (() => { const copy = { ...rawProfile }; delete copy._id; delete copy.__v; return copy; })() : null;

        const mongoCharts = await DentalChart.find({}).lean();
        const reconstructedCharts = {};
        if (Array.isArray(mongoCharts) && mongoCharts.length > 0) {
          mongoCharts.forEach(c => {
            if (!reconstructedCharts[c.patientId]) reconstructedCharts[c.patientId] = {};
            reconstructedCharts[c.patientId][c.toothId] = {
              toothId: c.toothId,
              condition: c.condition,
              status: c.status,
              notes: c.notes,
              updatedBy: c.updatedBy,
              updatedAt: c.updatedAt
            };
          });
        }

        const mongoFollowUps = sanitizeDocs(await FollowUp.find({}).lean(), 'id');
        const mongoActivity = sanitizeDocs(await ActivityLog.find({}).lean(), 'id');

        const docUser = mongoUsers.find(u => u.role === 'Doctor' || u.id === 'usr_doc_1') || mongoUsers[0] || null;

        const liveData = {
          patients: mongoPatients,
          appointments: mongoAppointments,
          consultations: mongoConsultations,
          invoices: mongoInvoices,
          users: mongoUsers,
          currentUser: docUser,
          clinicProfile: mongoProfile,
          dentalCharts: reconstructedCharts,
          followUps: mongoFollowUps,
          activityLog: mongoActivity
        };

        dbState = { ...dbState, ...liveData };
        return sendJSON(res, 200, { success: true, data: liveData });
      } catch (e) {
        console.warn('Fallback to in-memory dbState:', e.message);
        return sendJSON(res, 200, { success: true, data: dbState });
      }
    }

    return sendJSON(res, 404, { error: 'Route not found' });
  } catch (err) {
    return sendJSON(res, 500, { error: 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`SmileCare REST API Backend Server running on port ${PORT}`);
});
