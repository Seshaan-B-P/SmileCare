import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

/**
 * Configure Nodemailer Transporter
 * If SMTP credentials exist in env, use them;
 * Otherwise, initialize test / ethereal / simulated transporter with rich logging.
 */
export function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      }),
      isSimulated: false,
      sender: process.env.EMAIL_FROM || `SmileCare Dental Clinic <${user}>`
    };
  }

  // Simulated transporter fallback
  return {
    transporter: {
      sendMail: async (mailOptions) => {
        const messageId = `<simulated_${Date.now()}@smilecare.in>`;
        console.log('----------------------------------------------------');
        console.log('📧 [SmileCare EMAIL DISPATCH - SIMULATED / READY]');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`From: ${mailOptions.from || 'chennai@smilecare.in'}`);
        console.log(`MessageId: ${messageId}`);
        console.log('Preview Text:\n' + (mailOptions.text || mailOptions.html?.replace(/<[^>]*>?/gm, '').slice(0, 300)));
        console.log('----------------------------------------------------');
        return {
          messageId,
          accepted: [mailOptions.to],
          rejected: [],
          response: '250 OK Simulated Message Delivered'
        };
      }
    },
    isSimulated: true,
    sender: process.env.EMAIL_FROM || 'SmileCare Dental Clinic <chennai@smilecare.in>'
  };
}

/**
 * Generate Responsive HTML Email Template for Clinic Closure Notice
 */
export function buildClinicClosedHtml({
  patientName = 'Valued Patient',
  date = '',
  timeSlot = '',
  reason = 'Weekly Holiday / Clinic Maintenance',
  reopenDate = 'Tomorrow 9:00 AM',
  doctorName = 'Dr. Tharma P, MDS',
  clinicName = 'SmileCare Speciality Dental Clinic & Implant Centre',
  clinicPhone = '+91 44 2621 8899',
  clinicAddress = 'No. 42, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu 600040',
  customNote = ''
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notice: SmileCare Clinic is Closed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .header-logo { font-size: 32px; line-height: 1; margin-bottom: 8px; }
    .header-title { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .header-subtitle { font-size: 13px; color: #99f6e4; margin-top: 4px; font-weight: 500; }
    .content { padding: 32px 28px; }
    .badge-closed { display: inline-block; background-color: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #fca5a5; margin-bottom: 16px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .notice-box { background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .notice-title { font-weight: 800; color: #991b1b; font-size: 14px; margin-bottom: 6px; }
    .notice-text { font-size: 13px; color: #7f1d1d; line-height: 1.5; margin: 0; }
    .details-table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 20px 0; background: #f8fafc; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; }
    .details-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #edf2f7; }
    .details-table tr:last-child td { border-bottom: none; }
    .details-label { font-weight: 700; color: #64748b; width: 40%; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .details-value { font-weight: 700; color: #0f172a; }
    .tamil-box { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 12px; color: #0f766e; line-height: 1.6; }
    .tamil-heading { font-weight: 800; color: #115e59; font-size: 13px; margin-bottom: 4px; }
    .cta-button { display: inline-block; background: #0d9488; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 13px; padding: 14px 28px; border-radius: 12px; margin-top: 8px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25); }
    .footer { background: #f1f5f9; padding: 24px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer-address { margin: 6px 0; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">🦷</div>
      <h1 class="header-title">${clinicName}</h1>
      <div class="header-subtitle">Advanced Dentistry & Patient Care Excellence</div>
    </div>
    
    <div class="content">
      <div style="text-align: center;">
        <span class="badge-closed">⚠️ CLINIC TEMPORARILY CLOSED NOTICE</span>
      </div>

      <div class="greeting">Dear ${patientName},</div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Please be informed that <strong>${clinicName}</strong> will be <strong>CLOSED</strong> on <strong>${date}</strong>.
      </p>

      <div class="notice-box">
        <div class="notice-title">Reason for Closure:</div>
        <p class="notice-text">
          ${reason || 'Scheduled Holiday / Doctor on Leave / Emergency Maintenance'}
        </p>
      </div>

      <table class="details-table">
        <tr>
          <td class="details-label">Date of Closure</td>
          <td class="details-value">${date}</td>
        </tr>
        ${timeSlot ? `<tr>
          <td class="details-label">Your Scheduled Slot</td>
          <td class="details-value" style="color: #ef4444;">${timeSlot} (Needs Rescheduling)</td>
        </tr>` : ''}
        <tr>
          <td class="details-label">Attending Doctor</td>
          <td class="details-value">${doctorName}</td>
        </tr>
        <tr>
          <td class="details-label">Expected Reopening</td>
          <td class="details-value" style="color: #0d9488;">${reopenDate || 'Next working day at 9:00 AM'}</td>
        </tr>
      </table>

      ${customNote ? `
      <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 12px 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #334155;">
        <strong>Special Note from Doctor:</strong> ${customNote}
      </div>` : ''}

      <!-- Tamil Notice Section -->
      <div class="tamil-box">
        <div class="tamil-heading">📌 மருத்துவமனை விடுமுறை அறிவிப்பு:</div>
        அன்பார்ந்த <strong>${patientName}</strong> அவர்களுக்கு,<br>
        <strong>${date}</strong> அன்று SmileCare பல் மருத்துவமனை விடுமுறை / செயல்படாது என்பதைத் தெரிவித்துக் கொள்கிறோம்.<br>
        தங்களுடைய சிகிச்சையை மாற்றுத் தேதியில் முன்பதிவு செய்ய மருத்துவமனையின் தொலைபேசி எண் <strong>${clinicPhone}</strong> வழியாக தொடர்பு கொள்ளவும். சிரமத்திற்கு மன்னிக்கவும்.
      </div>

      <div style="text-align: center; margin: 24px 0 10px 0;">
        <a href="tel:${clinicPhone.replace(/[^0-9+]/g, '')}" class="cta-button">
          📞 Call Clinic: ${clinicPhone}
        </a>
      </div>
    </div>

    <div class="footer">
      <strong>${clinicName}</strong>
      <div class="footer-address">${clinicAddress}</div>
      <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
        This is an automated notification from SmileCare Dental Clinic System.
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatch Clinic Closed Email
 */
export async function sendClinicClosedEmail({
  to,
  patientName = 'Valued Patient',
  date = new Date().toISOString().split('T')[0],
  timeSlot = '',
  reason = 'Clinic Holiday / Medical Leave',
  reopenDate = 'Tomorrow 9:00 AM',
  doctorName = 'Dr. Tharma P, MDS',
  clinicName = 'SmileCare Speciality Dental Clinic & Implant Centre',
  clinicPhone = '+91 44 2621 8899',
  clinicAddress = 'No. 42, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu 600040',
  customNote = ''
}) {
  if (!to || !to.includes('@')) {
    return {
      success: false,
      error: 'Invalid recipient email address provided.'
    };
  }

  const { transporter, isSimulated, sender } = getTransporter();

  const subject = `⚠️ Notice: SmileCare Clinic is Closed on ${date} – Appointment Update`;

  const html = buildClinicClosedHtml({
    patientName,
    date,
    timeSlot,
    reason,
    reopenDate,
    doctorName,
    clinicName,
    clinicPhone,
    clinicAddress,
    customNote
  });

  const text = `
Dear ${patientName},

Please be informed that SmileCare Speciality Dental Clinic is CLOSED on ${date}.
Reason: ${reason}
${timeSlot ? `Your scheduled slot: ${timeSlot}\n` : ''}
Expected Reopening: ${reopenDate}

Tamil Notice:
அன்பார்ந்த ${patientName} அவர்களுக்கு, ${date} அன்று SmileCare பல் மருத்துவமனை விடுமுறை. மாற்றுத் தேதியில் முன்பதிவு செய்ய ${clinicPhone} என்ற எண்ணில் தொடர்பு கொள்ளவும்.

Clinic Contact: ${clinicPhone}
Address: ${clinicAddress}
`;

  try {
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      text,
      html
    });

    return {
      success: true,
      messageId: info.messageId,
      delivered: true,
      isSimulated,
      to,
      subject,
      preview: text.slice(0, 150)
    };
  } catch (error) {
    console.error('Error dispatching clinic closed email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate Responsive HTML Email Template for Auto-Booking Confirmation
 */
export function buildBookingConfirmationHtml({
  patientName = 'Valued Patient',
  date = '',
  timeSlot = '',
  tokenNo = 1,
  serviceName = 'Routine Dental Consultation',
  doctorName = 'Dr. Tharma P, MDS',
  clinicName = 'SmileCare Speciality Dental Clinic & Implant Centre',
  clinicPhone = '+91 44 2621 8899',
  clinicAddress = 'No. 42, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu 600040',
  isClosed = false,
  closureReason = '',
  notes = ''
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed – SmileCare Dental Clinic</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .header-logo { font-size: 34px; line-height: 1; margin-bottom: 8px; }
    .header-title { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .header-subtitle { font-size: 13px; color: #99f6e4; margin-top: 4px; font-weight: 500; }
    .content { padding: 32px 28px; }
    .badge-confirmed { display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #86efac; margin-bottom: 16px; }
    .token-card { background: #f0fdf4; border: 2px dashed #86efac; border-radius: 14px; padding: 16px; text-align: center; margin: 20px 0; }
    .token-number { font-size: 28px; font-weight: 900; color: #15803d; letter-spacing: -0.5px; }
    .token-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 1px; }
    .details-table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 20px 0; background: #f8fafc; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; }
    .details-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #edf2f7; }
    .details-table tr:last-child td { border-bottom: none; }
    .details-label { font-weight: 700; color: #64748b; width: 38%; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .details-value { font-weight: 700; color: #0f172a; }
    .tamil-box { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 12px; color: #0f766e; line-height: 1.6; }
    .tamil-heading { font-weight: 800; color: #115e59; font-size: 13px; margin-bottom: 4px; }
    .warning-box { background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 12px; padding: 14px; margin: 18px 0; font-size: 12px; color: #991b1b; line-height: 1.5; }
    .guidelines { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 12px; color: #475569; }
    .guidelines-title { font-weight: 800; color: #1e293b; margin-bottom: 8px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .cta-button { display: inline-block; background: #0d9488; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 13px; padding: 14px 28px; border-radius: 12px; margin-top: 8px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25); }
    .footer { background: #f1f5f9; padding: 24px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer-address { margin: 6px 0; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">🦷</div>
      <h1 class="header-title">${clinicName}</h1>
      <div class="header-subtitle">Online Auto-Booking Confirmation & Token Receipt</div>
    </div>
    
    <div class="content">
      <div style="text-align: center;">
        <span class="badge-confirmed">✅ APPOINTMENT CONFIRMED (AUTO-BOOKING)</span>
      </div>

      <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
        Dear ${patientName},
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0;">
        Thank you for booking with <strong>${clinicName}</strong>. Your dental appointment has been successfully confirmed through our Online Auto-Booking system.
      </p>

      <div class="token-card">
        <div class="token-label">Live Queue Token Number</div>
        <div class="token-number">Token #${tokenNo}</div>
        <div style="font-size: 11px; color: #15803d; margin-top: 2px;">Assigned for: ${date} at ${timeSlot}</div>
      </div>

      ${isClosed ? `
      <div class="warning-box">
        <strong>⚠️ Clinic Closed Notice for this Date:</strong><br>
        Please note that the clinic is marked as closed/holiday on ${date} (${closureReason || 'Leave / Holiday'}). Our medical coordinator will contact you to confirm or reschedule your visit.
      </div>` : ''}

      <table class="details-table">
        <tr>
          <td class="details-label">Patient Name</td>
          <td class="details-value">${patientName}</td>
        </tr>
        <tr>
          <td class="details-label">Appointment Date</td>
          <td class="details-value" style="color: #0d9488;">${date}</td>
        </tr>
        <tr>
          <td class="details-label">Time Slot</td>
          <td class="details-value" style="color: #0d9488;">${timeSlot}</td>
        </tr>
        <tr>
          <td class="details-label">Procedure / Reason</td>
          <td class="details-value">${serviceName}</td>
        </tr>
        <tr>
          <td class="details-label">Attending Doctor</td>
          <td class="details-value">${doctorName}</td>
        </tr>
        <tr>
          <td class="details-label">Booking Mode</td>
          <td class="details-value"><span style="color: #15803d;">WhatsApp / Web Auto-Booking</span></td>
        </tr>
      </table>

      <!-- Tamil Confirmation Section -->
      <div class="tamil-box">
        <div class="tamil-heading">📌 முன்பதிவு உறுதிப்படுத்தல் விபரம்:</div>
        அன்பார்ந்த <strong>${patientName}</strong> அவர்களுக்கு,<br>
        SmileCare பல் மருத்துவமனையில் தங்களின் பரிசோதனை முன்பதிவு வெற்றிகரமாக உறுதி செய்யப்பட்டுள்ளது!<br>
        • <strong>தேதி:</strong> ${date}<br>
        • <strong>நேரம்:</strong> ${timeSlot} (டோக்கன் எண்: #${tokenNo})<br>
        • <strong>சிகிச்சை:</strong> ${serviceName}<br>
        • <strong>மருத்துவர்:</strong> ${doctorName}<br>
        மருத்துவமனைக்கு வரும் முன் கவனிக்க வேண்டியவை: தயவுசெய்து தங்களின் முன்பதிவு நேரத்திற்கு 10 நிமிடங்களுக்கு முன்னதாக மருத்துவமனைக்கு வரவும்.
      </div>

      <div class="guidelines">
        <div class="guidelines-title">📋 Pre-visit Guidelines:</div>
        <ul style="margin: 0; padding-left: 18px; line-height: 1.6;">
          <li>Please arrive 10 minutes prior to your allocated slot time.</li>
          <li>If you are taking any regular medication, please bring your existing prescription.</li>
          <li>For rescheduling or immediate assistance, contact our reception at ${clinicPhone}.</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 24px 0 10px 0;">
        <a href="tel:${clinicPhone.replace(/[^0-9+]/g, '')}" class="cta-button">
          📞 Contact Clinic: ${clinicPhone}
        </a>
      </div>
    </div>

    <div class="footer">
      <strong>${clinicName}</strong>
      <div class="footer-address">${clinicAddress}</div>
      <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
        This is an automated confirmation from SmileCare Online Booking System.
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatch Auto-Booking Confirmation Email
 */
export async function sendBookingConfirmationEmail({
  to,
  patientName = 'Valued Patient',
  date = '',
  timeSlot = '',
  tokenNo = 1,
  serviceName = 'Routine Dental Consultation',
  doctorName = 'Dr. Tharma P, MDS',
  clinicName = 'SmileCare Speciality Dental Clinic & Implant Centre',
  clinicPhone = '+91 44 2621 8899',
  clinicAddress = 'No. 42, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu 600040',
  isClosed = false,
  closureReason = '',
  notes = ''
}) {
  if (!to || !to.includes('@')) {
    return {
      success: false,
      error: 'Invalid recipient email address provided.'
    };
  }

  const { transporter, isSimulated, sender } = getTransporter();

  const subject = `✅ SmileCare Appointment Confirmed: ${patientName} on ${date} (${timeSlot}) – Token #${tokenNo}`;

  const html = buildBookingConfirmationHtml({
    patientName,
    date,
    timeSlot,
    tokenNo,
    serviceName,
    doctorName,
    clinicName,
    clinicPhone,
    clinicAddress,
    isClosed,
    closureReason,
    notes
  });

  const text = `
Dear ${patientName},

Your dental appointment has been successfully CONFIRMED via SmileCare Online Auto-Booking.

Appointment Details:
- Date: ${date}
- Time Slot: ${timeSlot}
- Queue Token: #${tokenNo}
- Reason / Procedure: ${serviceName}
- Doctor: ${doctorName}
- Clinic: ${clinicName}
- Address: ${clinicAddress}
- Phone: ${clinicPhone}

${isClosed ? `Notice: The clinic is marked as closed on this date (${closureReason}). Our team will reach out to you.\n` : ''}

Tamil Notice:
அன்பார்ந்த ${patientName} அவர்களுக்கு, தங்களின் பல் மருத்துவ பரிசோதனை முன்பதிவு உறுதி செய்யப்பட்டது.
தேதி: ${date} | நேரம்: ${timeSlot} | டோக்கன் எண்: #${tokenNo}

Thank you,
${clinicName}
`;

  try {
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      text,
      html
    });

    return {
      success: true,
      messageId: info.messageId,
      delivered: true,
      isSimulated,
      to,
      subject,
      preview: text.slice(0, 160)
    };
  } catch (error) {
    console.error('Error dispatching auto-booking confirmation email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Dispatch Official Clinic Closure Notice Email (Standard Format)
 * Subject: Important Notice – SmileCare Clinic is Currently Closed
 */
export async function sendOfficialClosureNoticeEmail({
  to,
  patientName = 'Patient',
  clinicPhone = '+91 44 2621 8899',
  clinicAddress = 'No. 42, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu 600040'
}) {
  if (!to || !to.includes('@')) {
    return {
      success: false,
      error: 'Invalid recipient email address provided.'
    };
  }

  const { transporter, isSimulated, sender } = getTransporter();

  const subject = 'Important Notice – SmileCare Clinic is Currently Closed';

  const text = `Dear ${patientName || 'Patient'},

We would like to inform you that SmileCare Dental Clinic is currently closed.

We apologize for any inconvenience caused.

For appointment-related queries or further assistance, please contact our clinic during working hours.

Thank you for choosing SmileCare.

Regards,  
SmileCare Dental Clinic
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Important Notice – SmileCare Clinic is Currently Closed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 580px; margin: 24px auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
    .content { padding: 32px 28px; line-height: 1.65; color: #334155; font-size: 14px; }
    .badge { display: inline-block; background-color: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 12px; border-radius: 9999px; border: 1px solid #fca5a5; margin-bottom: 16px; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 30px;">🦷</div>
      <h2 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">SmileCare Dental Clinic</h2>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="badge">Notice: Clinic Closed</span>
      </div>

      <p>Dear ${patientName || 'Patient'},</p>
      <p>We would like to inform you that SmileCare Dental Clinic is currently closed.</p>
      <p>We apologize for any inconvenience caused.</p>
      <p>For appointment-related queries or further assistance, please contact our clinic during working hours.</p>
      <p>Thank you for choosing SmileCare.</p>
      
      <p style="margin-top: 24px;">
        Regards,<br>
        <strong>SmileCare Dental Clinic</strong>
      </p>
    </div>
    <div class="footer">
      <strong>SmileCare Speciality Dental Clinic & Implant Centre</strong>
      <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">${clinicAddress} • Helpline: ${clinicPhone}</div>
    </div>
  </div>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      text,
      html
    });

    return {
      success: true,
      messageId: info.messageId,
      delivered: true,
      isSimulated,
      to,
      subject,
      preview: text.slice(0, 160)
    };
  } catch (error) {
    console.error('Error dispatching official clinic closure notice email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check email system health / configuration
 */
export function getEmailServiceStatus() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || '587';
  const user = process.env.SMTP_USER || '';
  const isConfigured = !!(user && process.env.SMTP_PASS);

  return {
    isConfigured,
    mode: isConfigured ? 'Live SMTP Transport' : 'Automated Simulator & Logger',
    host,
    port,
    sender: process.env.EMAIL_FROM || (user ? `SmileCare <${user}>` : 'SmileCare <chennai@smilecare.in>')
  };
}
