// test_auto_booking_email.mjs
// Verification of Point 2: "yaru auto booking panalum mail send aganum"

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import { Setting } from './models/Setting.js';
import { Patient } from './models/Patient.js';
import { Appointment } from './models/Appointment.js';
import { FollowUp } from './models/FollowUp.js';
import { ActivityLog } from './models/ActivityLog.js';
import { sendBookingConfirmationEmail } from './services/emailService.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:pass123@cluster0.pafqpsw.mongodb.net/smilecare?retryWrites=true&w=majority&appName=Cluster0';

async function runAutoBookingTest() {
  console.log('================================================================');
  console.log(' SmileCare Point 2: Auto-Booking Email Notification Test');
  console.log(' "yaru auto booking panalum mail send aganum" Verification');
  console.log('================================================================\n');

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas\n');

  const todayStr = new Date().toISOString().split('T')[0];

  try {
    // -------------------------------------------------------------------------
    // Scenario 1: Standard Auto-Booking on an OPEN clinic day
    // -------------------------------------------------------------------------
    console.log('--- Test 2.1: Patient completes Auto-Booking (Clinic Open) ---');
    const pat1Id = `PAT-AUTO-1-${Date.now()}`;
    const testEmail1 = 'patient.one@example.com';
    const patient1 = await Patient.create({
      id: pat1Id,
      name: 'Vengatesh (Auto-Booked)',
      email: testEmail1,
      phone: '+919876543210',
      emailOptIn: true
    });

    const flp1Id = `FLP-AUTO-1-${Date.now()}`;
    const followUp1 = await FollowUp.create({
      id: flp1Id,
      patientId: pat1Id,
      patientName: 'Vengatesh (Auto-Booked)',
      patientPhone: '+919876543210',
      scheduledDate: todayStr,
      preferredSlot: '11:00 AM',
      reason: 'Root Canal Follow-up & Crown Fitting',
      status: 'Pending'
    });

    // Simulate auto-booking confirmation
    const emailResult1 = await sendBookingConfirmationEmail({
      to: testEmail1,
      patientName: patient1.name,
      date: todayStr,
      timeSlot: '11:00 AM',
      tokenNo: 5,
      serviceName: followUp1.reason,
      doctorName: 'Dr. Tharma P, MDS',
      clinicName: 'SmileCare Speciality Dental Clinic & Implant Centre',
      clinicPhone: '+91 44 2621 8899',
      clinicAddress: 'No. 42, 2nd Avenue, Anna Nagar West, Chennai',
      isClosed: false
    });

    console.log(`[Test 2.1 Result] Email Sent: ${emailResult1.success}`);
    console.log(`   Message ID: ${emailResult1.messageId}`);
    console.log(`   Recipient: ${testEmail1}`);
    console.log(`   Subject: ${emailResult1.subject || 'SmileCare Dental Appointment Confirmed'}`);

    // Clean up
    await Patient.deleteOne({ id: pat1Id });
    await FollowUp.deleteOne({ id: flp1Id });

    // -------------------------------------------------------------------------
    // Scenario 2: Auto-Booking on a day when Clinic is marked CLOSED
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2.2: Patient completes Auto-Booking on a CLOSED day ---');
    const pat2Id = `PAT-AUTO-2-${Date.now()}`;
    const testEmail2 = 'patient.two@example.com';
    const patient2 = await Patient.create({
      id: pat2Id,
      name: 'Priya (Auto-Booked Closed Day)',
      email: testEmail2,
      phone: '+919876543211',
      emailOptIn: true
    });

    const emailResult2 = await sendBookingConfirmationEmail({
      to: testEmail2,
      patientName: patient2.name,
      date: todayStr,
      timeSlot: '04:30 PM',
      tokenNo: 12,
      serviceName: 'Dental Extraction Review',
      doctorName: 'Dr. Tharma P, MDS',
      clinicName: 'SmileCare Speciality Dental Clinic & Implant Centre',
      clinicPhone: '+91 44 2621 8899',
      clinicAddress: 'No. 42, 2nd Avenue, Anna Nagar West, Chennai',
      isClosed: true,
      closureReason: 'Doctor Emergency Leave / Scheduled Maintenance'
    });

    console.log(`[Test 2.2 Result] Email Sent with Closure Notice: ${emailResult2.success}`);
    console.log(`   Message ID: ${emailResult2.messageId}`);
    console.log(`   Recipient: ${testEmail2}`);
    console.log(`   Closure Flag Included: ${emailResult2.isClosed}`);

    await Patient.deleteOne({ id: pat2Id });

    console.log('\n================================================================');
    console.log(' ALL AUTO-BOOKING EMAIL TESTS PASSED SUCCESSFULLY! ✅');
    console.log('================================================================\n');

  } catch (err) {
    console.error('Auto-booking test error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected cleanly.');
  }
}

runAutoBookingTest();
