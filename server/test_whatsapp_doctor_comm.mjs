// test_whatsapp_doctor_comm.mjs
// Automated verification test suite for the 14 WhatsApp Follow-up & Doctor Communication Scenarios

import mongoose from 'mongoose';
import http from 'http';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import { User } from './models/User.js';
import { Patient } from './models/Patient.js';
import { FollowUp } from './models/FollowUp.js';
import { Conversation } from './models/Conversation.js';
import { Message } from './models/Message.js';
import { PatientChatToken } from './models/PatientChatToken.js';
import { Appointment } from './models/Appointment.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smilecare';
const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const bodyStr = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (bodyStr) {
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk.toString());
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

async function runAll14Tests() {
  console.log('================================================================');
  console.log(' SmileCare Test Suite: WhatsApp Follow-up & Doctor Communication');
  console.log(' Validating all 14 Required Scenarios');
  console.log('================================================================\n');

  await mongoose.connect(MONGODB_URI, { dbName: 'smilecare' });
  console.log('Connected to MongoDB Atlas\n');

  const testResults = [];
  function record(caseNumber, name, passed, details) {
    testResults.push({ caseNumber, name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[Test ${caseNumber}] ${name}: ${mark}`);
    if (details) console.log(`   Details: ${details}\n`);
  }

  // Setup test doctor, patient and follow-up
  const testDocId = 'usr_doc_1';
  const testPatientId = `PAT_WHATSAPP_${Date.now()}`;
  const testFollowUpId = `FLP_TEST_${Date.now()}`;
  const testPhone = '+919840199887';
  let generatedToken = null;
  let conversationId = null;
  let verificationCode = null;

  try {
    // Ensure test doctor exists
    await User.findOneAndUpdate(
      { id: testDocId },
      {
        $setOnInsert: {
          id: testDocId,
          name: 'Dr. Tharma P, MDS',
          email: 'doctor@smilecare.com',
          role: 'Doctor',
          specialization: 'Senior Endodontist & Implant Specialist',
          phone: '+919840123456'
        }
      },
      { upsert: true, new: true }
    );

    // Create test patient
    await Patient.create({
      id: testPatientId,
      name: 'Anand V (Follow-up Patient)',
      phone: testPhone,
      email: 'anand.whatsapp@smilecare.in'
    });

    // Create test follow-up
    await FollowUp.create({
      id: testFollowUpId,
      patientId: testPatientId,
      patientName: 'Anand V',
      patientPhone: testPhone,
      reason: 'Root Canal Therapy Stage-2 Follow-up',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'Pending',
      whatsAppSent: false
    });

    // -------------------------------------------------------------------------
    // Test 1: Follow-up link generation
    // -------------------------------------------------------------------------
    console.log('--- Test 1: Follow-up link generation ---');
    const genRes = await makeRequest('POST', '/api/chat-token/generate', {
      patientId: testPatientId,
      patientName: 'Anand V',
      patientPhone: testPhone,
      followUpId: testFollowUpId,
      contextReason: 'Root Canal Therapy Stage-2 Follow-up',
      doctorId: testDocId,
      doctorName: 'Dr. Tharma P, MDS',
      expiresInHours: 72
    });

    generatedToken = genRes.data?.token;
    verificationCode = genRes.data?.verificationCode;
    const tokenHash = genRes.data?.tokenHash;

    // Verify database only stored hashed token, never the raw token!
    const inDbByRaw = await PatientChatToken.findOne({ tokenHash: generatedToken }).lean();
    const inDbByHash = await PatientChatToken.findOne({ tokenHash }).lean();

    const t1Pass = genRes.statusCode === 201 &&
                   genRes.data?.success === true &&
                   Boolean(generatedToken) &&
                   genRes.data?.chatUrl?.includes('#patient-chat?token=') &&
                   inDbByRaw === null && // Raw token is NOT in database
                   inDbByHash !== null;  // Only hash is stored in database

    record(1, 'Follow-up link generation', t1Pass,
      `Status: ${genRes.statusCode}, ChatUrl: ${genRes.data?.chatUrl}, Token length: ${generatedToken?.length} chars, In DB raw: ${Boolean(inDbByRaw)}, In DB hash: ${Boolean(inDbByHash)}`);

    // -------------------------------------------------------------------------
    // Test 2: WhatsApp message generation
    // -------------------------------------------------------------------------
    console.log('--- Test 2: WhatsApp message generation ---');
    const msgTa = genRes.data?.messages?.ta || '';
    const msgEn = genRes.data?.messages?.en || '';
    const t2Pass = msgTa.includes('SmileCare') &&
                   msgTa.includes('மருத்துவருடன் உரையாட') &&
                   msgTa.includes(genRes.data?.chatUrl) &&
                   msgEn.includes('SmileCare Dental Clinic') &&
                   msgEn.includes('Chat with your Doctor') &&
                   msgEn.includes(genRes.data?.chatUrl);

    record(2, 'WhatsApp message generation', t2Pass,
      `Tamil message length: ${msgTa.length} chars, English message length: ${msgEn.length} chars, Contains secure link: ${msgEn.includes(genRes.data?.chatUrl)}`);

    // -------------------------------------------------------------------------
    // Test 3: Patient opens the valid link
    // -------------------------------------------------------------------------
    console.log('--- Test 3: Patient opens the valid link ---');
    const verifyTokenRes = await makeRequest('POST', '/api/chat-token/verify-token', {
      token: generatedToken
    });

    const t3Pass = verifyTokenRes.statusCode === 200 &&
                   verifyTokenRes.data?.success === true &&
                   verifyTokenRes.data?.valid === true &&
                   verifyTokenRes.data?.status === 'ACTIVE' &&
                   verifyTokenRes.data?.doctorName === 'Dr. Tharma P, MDS' &&
                   verifyTokenRes.data?.maskedPhone?.includes('******');

    record(3, 'Patient opens the valid link', t3Pass,
      `Status: ${verifyTokenRes.statusCode}, Active: ${verifyTokenRes.data?.status}, Masked phone: ${verifyTokenRes.data?.maskedPhone}, Doctor: ${verifyTokenRes.data?.doctorName}`);

    // -------------------------------------------------------------------------
    // Test 4: Expired link is rejected
    // -------------------------------------------------------------------------
    console.log('--- Test 4: Expired link is rejected ---');
    // Generate an already-expired token for testing
    const expiredRawToken = crypto.randomBytes(32).toString('hex');
    const expiredHash = crypto.createHash('sha256').update(expiredRawToken).digest('hex');
    await PatientChatToken.create({
      id: `TOK_EXP_${Date.now()}`,
      tokenHash: expiredHash,
      patientId: testPatientId,
      patientName: 'Anand V',
      patientPhone: testPhone,
      doctorId: testDocId,
      doctorName: 'Dr. Tharma P, MDS',
      conversationId: `CONV_${testDocId}_${testPatientId}`,
      expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
      isRevoked: false
    });

    const expiredRes = await makeRequest('POST', '/api/chat-token/verify-token', {
      token: expiredRawToken
    });

    const t4Pass = expiredRes.statusCode === 410 &&
                   expiredRes.data?.status === 'EXPIRED';

    record(4, 'Expired link is rejected', t4Pass,
      `Status: ${expiredRes.statusCode} (410 Gone), Error message: "${expiredRes.data?.error}"`);

    // -------------------------------------------------------------------------
    // Test 5: Revoked link is rejected
    // -------------------------------------------------------------------------
    console.log('--- Test 5: Revoked link is rejected ---');
    const revokeRes = await makeRequest('POST', '/api/chat-token/revoke', {
      token: generatedToken,
      requesterId: testDocId,
      requesterRole: 'Doctor'
    });

    const checkRevokedRes = await makeRequest('POST', '/api/chat-token/verify-token', {
      token: generatedToken
    });

    const t5Pass = revokeRes.statusCode === 200 &&
                   revokeRes.data?.success === true &&
                   checkRevokedRes.statusCode === 403 &&
                   checkRevokedRes.data?.status === 'REVOKED';

    record(5, 'Revoked link is rejected', t5Pass,
      `Revoke status: ${revokeRes.statusCode}, Check status: ${checkRevokedRes.statusCode} (403 Forbidden), Error: "${checkRevokedRes.data?.error}"`);

    // Un-revoke token for remaining test flow
    if (generatedToken) {
      const tokenHashActual = crypto.createHash('sha256').update(generatedToken).digest('hex');
      await PatientChatToken.updateOne({ tokenHash: tokenHashActual }, { $set: { isRevoked: false } });
    }

    // -------------------------------------------------------------------------
    // Test 6: Patient identity verification
    // -------------------------------------------------------------------------
    console.log('--- Test 6: Patient identity verification ---');
    // 6a: Wrong verification code rejected
    const wrongVerifyRes = await makeRequest('POST', '/api/chat-token/verify-identity', {
      token: generatedToken,
      verificationCode: '000000'
    });

    // 6b: Correct verification code or phone digits accepted
    const correctVerifyRes = await makeRequest('POST', '/api/chat-token/verify-identity', {
      token: generatedToken,
      verificationCode: verificationCode
    });

    conversationId = correctVerifyRes.data?.conversationId;

    const t6Pass = wrongVerifyRes.statusCode === 401 &&
                   correctVerifyRes.statusCode === 200 &&
                   correctVerifyRes.data?.verified === true &&
                   Boolean(conversationId);

    record(6, 'Patient identity verification', t6Pass,
      `Wrong code status: ${wrongVerifyRes.statusCode} (401), Correct code status: ${correctVerifyRes.statusCode} (200), ConversationId: ${conversationId}`);

    // -------------------------------------------------------------------------
    // Test 7: Patient sends a message
    // -------------------------------------------------------------------------
    console.log('--- Test 7: Patient sends a message ---');
    const patientMsgRes = await makeRequest('POST', '/api/patient-chat/messages', {
      token: generatedToken,
      content: 'Hello Dr. Tharma, having slight gum sensitivity around tooth 16 after the root canal stage-1.'
    });

    const t7Pass = patientMsgRes.statusCode === 201 &&
                   patientMsgRes.data?.success === true &&
                   patientMsgRes.data?.message?.senderRole === 'Patient' &&
                   patientMsgRes.data?.message?.recipientRole === 'Doctor';

    record(7, 'Patient sends a message', t7Pass,
      `Status: ${patientMsgRes.statusCode}, MsgId: ${patientMsgRes.data?.message?.id}, Content: "${patientMsgRes.data?.message?.content}"`);

    // -------------------------------------------------------------------------
    // Test 8: Correct assigned doctor receives the message
    // -------------------------------------------------------------------------
    console.log('--- Test 8: Correct assigned doctor receives the message ---');
    const docMsgRes = await makeRequest(
      'GET',
      `/api/messages?conversationId=${conversationId}&userId=${testDocId}&role=Doctor`
    );

    const docHasPatientMsg = docMsgRes.data?.messages?.some(m =>
      m.senderRole === 'Patient' && m.content.includes('gum sensitivity')
    );

    const t8Pass = docMsgRes.statusCode === 200 && docHasPatientMsg;
    record(8, 'Correct assigned doctor receives the message', t8Pass,
      `Status: ${docMsgRes.statusCode}, Total messages in doctor thread: ${docMsgRes.data?.count}, Received patient msg: ${docHasPatientMsg}`);

    // -------------------------------------------------------------------------
    // Test 9: Doctor replies
    // -------------------------------------------------------------------------
    console.log('--- Test 9: Doctor replies ---');
    const docReplyRes = await makeRequest('POST', '/api/messages', {
      conversationId: conversationId,
      senderId: testDocId,
      senderName: 'Dr. Tharma P, MDS',
      senderRole: 'Doctor',
      recipientId: testPatientId,
      recipientName: 'Anand V',
      recipientRole: 'Patient',
      content: 'Hello Anand, mild sensitivity for 48 hours is expected. Continue the prescribed salt-water rinses and warm compress. See you at your scheduled follow-up!'
    });

    const t9Pass = docReplyRes.statusCode === 201 &&
                   docReplyRes.data?.success === true &&
                   docReplyRes.data?.message?.senderRole === 'Doctor';

    record(9, 'Doctor replies', t9Pass,
      `Status: ${docReplyRes.statusCode}, Reply MsgId: ${docReplyRes.data?.message?.id}, Reply Content: "${docReplyRes.data?.message?.content}"`);

    // -------------------------------------------------------------------------
    // Test 10: Patient receives the reply
    // -------------------------------------------------------------------------
    console.log('--- Test 10: Patient receives the reply ---');
    const patGetMsgs = await makeRequest('GET', `/api/patient-chat/messages?token=${generatedToken}`);

    const patHasDocReply = patGetMsgs.data?.messages?.some(m =>
      m.senderRole === 'Doctor' && m.content.includes('mild sensitivity')
    );

    const t10Pass = patGetMsgs.statusCode === 200 && patHasDocReply;
    record(10, 'Patient receives the reply', t10Pass,
      `Status: ${patGetMsgs.statusCode}, Total messages received by patient: ${patGetMsgs.data?.count}, Doctor reply present: ${patHasDocReply}`);

    // -------------------------------------------------------------------------
    // Test 11: Another patient cannot access the conversation
    // -------------------------------------------------------------------------
    console.log('--- Test 11: Another patient cannot access the conversation ---');
    const attackerPatientId = `PAT_ATTACKER_${Date.now()}`;
    const unauthorizedAccessRes = await makeRequest(
      'GET',
      `/api/messages?conversationId=${conversationId}&userId=${attackerPatientId}&role=Patient`
    );

    // Tampered token test on patient chat portal
    const tamperedTokenRes = await makeRequest(
      'GET',
      `/api/patient-chat/messages?token=INVALID_TAMPERED_TOKEN_12345`
    );

    const t11Pass = unauthorizedAccessRes.statusCode === 403 &&
                    tamperedTokenRes.statusCode === 404;

    record(11, 'Another patient cannot access the conversation', t11Pass,
      `Cross-patient access: ${unauthorizedAccessRes.statusCode} (403 Forbidden), Tampered token: ${tamperedTokenRes.statusCode} (404 Not Found)`);

    // -------------------------------------------------------------------------
    // Test 12: Unread/read status works
    // -------------------------------------------------------------------------
    console.log('--- Test 12: Unread/read status works ---');
    const convState = await Conversation.findOne({ id: conversationId }).lean();
    const t12Pass = convState?.unreadCountPatient === 0; // Cleared when patient read messages in Test 10

    record(12, 'Unread/read status works', t12Pass,
      `unreadCountPatient: ${convState?.unreadCountPatient}, lastMessageSenderRole: ${convState?.lastMessageSenderRole}, lastMessage: "${convState?.lastMessage?.slice(0, 30)}..."`);

    // -------------------------------------------------------------------------
    // Test 13: Invalid attachments are rejected
    // -------------------------------------------------------------------------
    console.log('--- Test 13: Invalid attachments are rejected ---');
    const invalidAttachmentRes = await makeRequest('POST', '/api/patient-chat/messages', {
      token: generatedToken,
      content: 'Attempting invalid file upload',
      attachment: {
        documentId: 'DOC_FAKE_123',
        fileName: 'malicious_script.exe',
        mimeType: 'application/x-msdownload' // Not PDF
      }
    });

    const t13Pass = invalidAttachmentRes.statusCode === 400 &&
                    invalidAttachmentRes.data?.success === false;

    record(13, 'Invalid attachments are rejected', t13Pass,
      `Status: ${invalidAttachmentRes.statusCode} (400 Bad Request), Error: "${invalidAttachmentRes.data?.error}"`);

    // -------------------------------------------------------------------------
    // Test 14: Existing WhatsApp follow-up functionality continues working
    // -------------------------------------------------------------------------
    console.log('--- Test 14: Existing WhatsApp follow-up functionality continues working ---');
    const autoBookingRes = await makeRequest('POST', '/api/whatsapp/book-slot', {
      followUpId: testFollowUpId,
      requestedSlot: '11:00 AM',
      patientEmail: 'anand.whatsapp@smilecare.in'
    });

    const updatedFollowUp = await FollowUp.findOne({ id: testFollowUpId }).lean();
    const createdAppointment = await Appointment.findOne({ patientId: testPatientId }).lean();

    const t14Pass = autoBookingRes.statusCode === 200 &&
                    autoBookingRes.data?.success === true &&
                    updatedFollowUp?.status === 'Confirmed via WhatsApp' &&
                    createdAppointment !== null;

    record(14, 'Existing WhatsApp follow-up functionality continues working', t14Pass,
      `Auto-booking status: ${autoBookingRes.statusCode}, Follow-up updated status: "${updatedFollowUp?.status}", Confirmed slot: "${updatedFollowUp?.confirmedSlot}", Created appointment ID: "${createdAppointment?.id}"`);

    console.log('================================================================');
    console.log(' TEST RUN SUMMARY:');
    const passedCount = testResults.filter(r => r.passed).length;
    console.log(` Total Scenarios: ${testResults.length} | Passed: ${passedCount} | Failed: ${testResults.length - passedCount}`);
    console.log('================================================================\n');

    if (passedCount === testResults.length) {
      console.log('🎉 ALL 14 TEST CASES PASSED SUCCESSFULLY!');
      return true;
    } else {
      console.error(`⚠️ ${testResults.length - passedCount} TEST CASES FAILED!`);
      return false;
    }
  } catch (err) {
    console.error('Test execution error:', err);
    return false;
  } finally {
    // Cleanup test artifacts
    if (generatedToken) {
      const hash = crypto.createHash('sha256').update(generatedToken).digest('hex');
      await PatientChatToken.deleteMany({ tokenHash: hash });
    }
    if (conversationId) {
      await Conversation.deleteOne({ id: conversationId });
      await Message.deleteMany({ conversationId });
    }
    await FollowUp.deleteOne({ id: testFollowUpId });
    await Patient.deleteOne({ id: testPatientId });
    await Appointment.deleteMany({ patientId: testPatientId });
    await mongoose.disconnect();
    console.log('Database disconnected cleanly.');
  }
}

runAll14Tests().then(success => {
  process.exit(success ? 0 : 1);
});
