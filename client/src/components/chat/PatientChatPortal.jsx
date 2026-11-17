import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  Paperclip, 
  FileText, 
  AlertTriangle, 
  Check, 
  CheckCheck, 
  Clock, 
  Phone, 
  X, 
  Download, 
  Eye, 
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { 
  verifyChatToken, 
  verifyChatIdentity, 
  getPatientChatMessages, 
  sendPatientChatMessage,
  uploadPdfDocument 
} from '../../services/api';

export const PatientChatPortal = ({ token, onClose }) => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [tokenError, setTokenError] = useState(null);

  // Identity Verification
  const [isVerified, setIsVerified] = useState(false);
  const [verificationInput, setVerificationInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // PDF Attachment State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const sseRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Verify Token on Mount
  useEffect(() => {
    let isMounted = true;
    const checkToken = async () => {
      setLoadingToken(true);
      try {
        const res = await verifyChatToken(token);
        if (!isMounted) return;

        if (res && res.success) {
          setTokenInfo(res);
          if (res.isVerified) {
            setIsVerified(true);
          }
        } else {
          setTokenError(res?.error || 'Invalid or expired patient chat link.');
        }
      } catch (err) {
        if (isMounted) setTokenError(err.message || 'Failed to verify communication link.');
      } finally {
        if (isMounted) setLoadingToken(false);
      }
    };

    if (token) {
      checkToken();
    } else {
      setTokenError('No patient chat token provided in URL.');
      setLoadingToken(false);
    }

    return () => { isMounted = false; };
  }, [token]);

  // Load Messages once Verified
  const loadMessages = async () => {
    if (!token || !isVerified) return;
    try {
      const res = await getPatientChatMessages(token);
      if (res && res.success) {
        setMessages(res.messages || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isVerified) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isVerified, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-Time SSE Listener
  useEffect(() => {
    if (!isVerified || !token) return;

    try {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const streamBase = isLocal ? 'http://localhost:5000' : (import.meta.env.VITE_API_URL || 'https://smilecare-2bik.onrender.com');
      const cleanBase = streamBase.replace(/\/api\/?$/, '');
      const sseUrl = `${cleanBase}/api/patient-chat/stream?token=${encodeURIComponent(token)}`;

      const es = new EventSource(sseUrl);
      sseRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_MESSAGE' && payload.message) {
            setMessages(prev => {
              if (prev.some(m => m.id === payload.message.id)) return prev;
              return [...prev, payload.message];
            });
          }
        } catch (e) {}
      };

      return () => {
        es.close();
      };
    } catch (err) {}
  }, [isVerified, token]);

  // Handle Identity Verification
  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    if (!verificationInput.trim()) {
      setVerifyError('Please enter verification code or last 4 digits of phone.');
      return;
    }
    setVerifying(true);
    setVerifyError('');
    try {
      const res = await verifyChatIdentity(token, verificationInput.trim(), verificationInput.trim());
      if (res && res.success) {
        setIsVerified(true);
        setTokenInfo(prev => ({ ...prev, isVerified: true, patientName: res.patientName }));
      } else {
        setVerifyError(res?.error || 'Verification failed. Please check your input.');
      }
    } catch (err) {
      setVerifyError(err.message || 'Verification connection failed.');
    } finally {
      setVerifying(false);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputText.trim() && !selectedFile) || sending) return;

    setSending(true);
    let attachmentPayload = null;

    try {
      // If PDF file selected, upload or prepare attachment
      if (selectedFile) {
        setIsUploadingFile(true);
        attachmentPayload = {
          documentId: `DOC-${Date.now()}`,
          fileName: selectedFile.name,
          fileSizeFormatted: `${(selectedFile.size / 1024).toFixed(1)} KB`,
          mimeType: 'application/pdf',
          category: 'Medical Report',
          base64Data: selectedFile.base64
        };
      }

      const res = await sendPatientChatMessage({
        token,
        content: inputText.trim(),
        attachment: attachmentPayload
      });

      if (res && res.success) {
        setMessages(prev => {
          if (prev.some(m => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
        setInputText('');
        setSelectedFile(null);
      }
    } catch (err) {
      console.warn('Error sending message:', err.message);
    } finally {
      setSending(false);
      setIsUploadingFile(false);
    }
  };

  // Handle PDF file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF documents (medical reports, X-rays, prescriptions) are supported.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds the maximum limit of 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: file.size,
        base64: reader.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  // 1. Loading State
  if (loadingToken) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 text-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-700 animate-fade-in">
          <div className="w-14 h-14 bg-tealbrand-500/20 text-tealbrand-400 rounded-2xl mx-auto flex items-center justify-center">
            <RefreshCw className="w-7 h-7 animate-spin" />
          </div>
          <h3 className="text-lg font-bold">Connecting to SmileCare Secure Consultation...</h3>
          <p className="text-xs text-slate-400">Verifying secure doctor communication link</p>
        </div>
      </div>
    );
  }

  // 2. Token Error State (Expired, Revoked, or Invalid)
  if (tokenError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 text-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-rose-500/30">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl mx-auto flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-rose-400">Communication Link Unavailable</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{tokenError}</p>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 text-left space-y-2">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-tealbrand-400" /> Need Assistance?
            </p>
            <p>For your patient privacy, consultation links are time-limited. Please contact SmileCare Dental Clinic directly to request an updated consultation link or schedule an in-clinic visit.</p>
          </div>
          <a
            href="tel:+914426218899"
            className="w-full py-3 bg-tealbrand-600 hover:bg-tealbrand-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Phone className="w-4 h-4" /> Call Clinic (+91 44 2621 8899)
          </a>
        </div>
      </div>
    );
  }

  // 3. Identity Verification Gate
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-tealbrand-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-800 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-tealbrand-500/20 text-tealbrand-400 border border-tealbrand-500/30 mb-1">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Patient Identity Verification</h2>
            <p className="text-xs text-slate-400">
              SmileCare Secure Consultation Channel
            </p>
          </div>

          {/* Consultation Context Banner */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Assigned Doctor:</span>
              <strong className="text-tealbrand-300">{tokenInfo?.doctorName || 'Dr. Tharma P, MDS'}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Follow-up Reason:</span>
              <strong className="text-slate-200">{tokenInfo?.contextReason || 'Post-procedure Checkup'}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Registered Mobile:</span>
              <strong className="text-slate-200 font-mono">{tokenInfo?.maskedPhone || '******'}</strong>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleVerifyIdentity} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Verification Code / Registered Phone Digits:
              </label>
              <input
                type="text"
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
                placeholder="Enter last 4 digits of phone or 6-digit code"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-tealbrand-500"
                autoFocus
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                💡 Enter the last 4 digits of your mobile number or 6-digit verification code. (Demo bypass: <strong>1234</strong>)
              </p>
            </div>

            {verifyError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium">
                {verifyError}
              </div>
            )}

            <button
              type="submit"
              disabled={verifying || !verificationInput.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-tealbrand-600 to-tealbrand-500 hover:from-tealbrand-500 hover:to-tealbrand-400 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Identity...
                </>
              ) : (
                <>
                  Enter Secure Consultation Room <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="pt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-tealbrand-400" /> End-to-end clinical privacy protection
          </div>
        </div>
      </div>
    );
  }

  // 4. Active Patient Consultation Chat Room
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-2xl w-full h-[92vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Chat Room Header */}
        <div className="bg-gradient-to-r from-tealbrand-900 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-tealbrand-800 shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tealbrand-500/30 border border-tealbrand-400/40 flex items-center justify-center text-tealbrand-300 font-black text-sm shadow">
              SC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white leading-tight">
                  {tokenInfo?.doctorName || 'Dr. Tharma P, MDS'}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Doctor Live Channel"></span>
              </div>
              <p className="text-[11px] text-tealbrand-300 font-medium">
                Follow-up: <span className="text-slate-200">{tokenInfo?.contextReason}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded-full text-[10px] font-bold text-tealbrand-300 border border-white/10">
              <ShieldCheck className="w-3 h-3 text-tealbrand-300" /> Verified Patient
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Clinical Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Non-Emergency Follow-up Chat:</strong> This channel is monitored for clinical follow-ups. In case of acute pain or urgent medical emergency, call <strong>108</strong> or visit SmileCare Clinic directly.
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-tealbrand-50 text-tealbrand-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">Welcome to your Consultation Room</p>
              <p className="text-xs max-w-sm">
                You can write your post-treatment questions or attach PDF diagnostic reports. Your doctor will review and reply directly.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isPatient = m.senderRole === 'Patient';
              const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <div key={m.id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div
                    className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm space-y-1.5 ${
                      isPatient
                        ? 'bg-tealbrand-700 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold opacity-80">
                      <span>{isPatient ? 'You' : m.senderName || 'Doctor'}</span>
                      <span className="font-normal text-[9px] flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {timeStr}
                      </span>
                    </div>

                    {m.content && (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    )}

                    {/* PDF Attachment Card */}
                    {m.attachment && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                          isPatient
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <div className="overflow-hidden">
                            <p className="font-bold truncate text-[11px]">{m.attachment.fileName || 'Document.pdf'}</p>
                            <p className="text-[10px] opacity-75">{m.attachment.category || 'PDF Document'} • {m.attachment.fileSizeFormatted || ''}</p>
                          </div>
                        </div>
                        {m.attachment.documentId && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <a
                              href={`/api/documents/download/${m.attachment.documentId}`}
                              target="_blank"
                              rel="noreferrer"
                              className={`p-1.5 rounded-lg transition-colors ${
                                isPatient ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 text-slate-700'
                              }`}
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {isPatient && (
                      <div className="text-right text-[10px] opacity-75 flex items-center justify-end gap-0.5">
                        {m.isRead ? <CheckCheck className="w-3.5 h-3.5 text-tealbrand-200" /> : <Check className="w-3 h-3" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected File Preview Badge */}
        {selectedFile && (
          <div className="px-4 py-2 bg-tealbrand-50 border-t border-tealbrand-100 flex items-center justify-between text-xs text-tealbrand-900">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-red-500" />
              <span className="font-bold truncate">{selectedFile.name}</span>
              <span className="text-[10px] text-tealbrand-700">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="application/pdf"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-500 hover:text-tealbrand-700 hover:bg-slate-100 rounded-xl transition-all"
              title="Attach PDF report or prescription"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message to the doctor..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tealbrand-500 focus:bg-white"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedFile) || sending}
              className="px-4 py-2.5 bg-tealbrand-700 hover:bg-tealbrand-800 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              {sending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PatientChatPortal;
