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

connectDB();

const PORT = process.env.PORT || 5000;

const DEFAULT_SEED_DATA = {
  currentUser: {
    id: 'usr_doc_1',
    name: 'Dr. Tharma, MDS',
    email: 'doctor@smilecare.com',
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
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  },
  users: [
    {
      id: 'usr_doc_1',
      name: 'Dr. Tharma, MDS',
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
    whatsAppApiStatus: 'Connected',
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

let dbState = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));

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
          if (Array.isArray(payload.patients)) {
            const cleanPatients = sanitizeDocs(payload.patients, 'id');
            await Patient.deleteMany({});
            if (cleanPatients.length > 0) await Patient.insertMany(cleanPatients, { ordered: false });
          }
          if (Array.isArray(payload.appointments)) {
            const cleanAppointments = sanitizeDocs(payload.appointments, 'id');
            await Appointment.deleteMany({});
            if (cleanAppointments.length > 0) await Appointment.insertMany(cleanAppointments, { ordered: false });
          }
          if (Array.isArray(payload.consultations)) {
            const cleanConsultations = sanitizeDocs(payload.consultations, 'id');
            await Consultation.deleteMany({});
            if (cleanConsultations.length > 0) await Consultation.insertMany(cleanConsultations, { ordered: false });
          }
          if (Array.isArray(payload.invoices)) {
            const cleanInvoices = sanitizeDocs(payload.invoices, 'id');
            await Invoice.deleteMany({});
            if (cleanInvoices.length > 0) await Invoice.insertMany(cleanInvoices, { ordered: false });
          }
          if (Array.isArray(payload.users)) {
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
            await DentalChart.deleteMany({});
            if (chartEntries.length > 0) await DentalChart.insertMany(chartEntries, { ordered: false });
          }
          if (Array.isArray(payload.followUps)) {
            const cleanFollowUps = sanitizeDocs(payload.followUps, 'id');
            await FollowUp.deleteMany({});
            if (cleanFollowUps.length > 0) await FollowUp.insertMany(cleanFollowUps, { ordered: false });
          }
          if (Array.isArray(payload.activityLog)) {
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

        if (mongoPatients.length > 0) dbState.patients = mongoPatients;
        if (mongoAppointments.length > 0) dbState.appointments = mongoAppointments;
        if (mongoConsultations.length > 0) dbState.consultations = mongoConsultations;
        if (mongoInvoices.length > 0) dbState.invoices = mongoInvoices;
        if (mongoUsers.length > 0) {
          dbState.users = mongoUsers;
          const docUser = mongoUsers.find(u => u.role === 'Doctor' || u.id === 'usr_doc_1');
          if (docUser) dbState.currentUser = { ...docUser };
        }
        if (mongoProfile) dbState.clinicProfile = mongoProfile;
        if (Object.keys(reconstructedCharts).length > 0) dbState.dentalCharts = reconstructedCharts;
        if (mongoFollowUps.length > 0) dbState.followUps = mongoFollowUps;
        if (mongoActivity.length > 0) dbState.activityLog = mongoActivity;
      } catch (e) {
        console.warn('Fallback to in-memory dbState:', e.message);
      }

      return sendJSON(res, 200, { success: true, data: dbState });
    }

    return sendJSON(res, 404, { error: 'Route not found' });
  } catch (err) {
    return sendJSON(res, 500, { error: 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`SmileCare REST API Backend Server running on port ${PORT}`);
});
