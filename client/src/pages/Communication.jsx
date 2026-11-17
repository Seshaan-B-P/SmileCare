import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  FileText, 
  Clock, 
  Check, 
  CheckCheck, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  X, 
  Download, 
  Eye, 
  ArrowLeft,
  Sparkles,
  Phone,
  Calendar,
  Info
} from 'lucide-react';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  createOrGetConversation, 
  getPatientDocuments,
  uploadPdfDocument 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const Communication = ({ initialPatientId = null }) => {
  const { currentUser, isDoctor } = useAuth();
  const { patients } = useData();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Attachment Modal state
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [patientDocs, setPatientDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [isUploadingAttach, setIsUploadingAttach] = useState(false);
  const attachFileInputRef = useRef(null);

  // Mobile layout toggle
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef(null);
  const sseRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations
  const loadConversations = async () => {
    setLoadingConv(true);
    try {
      const res = await getConversations(currentUser?.id, currentUser?.role);
      if (res && res.success) {
        const convList = res.conversations || [];
        setConversations(convList);

        if (initialPatientId) {
          const match = convList.find(c => c.patientId === initialPatientId);
          if (match) {
            setActiveConversation(match);
            setShowMobileChat(true);
          } else {
            // Create conversation with initialPatient
            const createRes = await createOrGetConversation(
              isDoctor ? currentUser?.id : 'usr_doc_1',
              initialPatientId,
              currentUser?.id,
              currentUser?.role
            );
            if (createRes && createRes.success) {
              setConversations(prev => [createRes.conversation, ...prev]);
              setActiveConversation(createRes.conversation);
              setShowMobileChat(true);
            }
          }
        } else if (convList.length > 0 && !activeConversation) {
          setActiveConversation(convList[0]);
        }
      }
    } catch (err) {
      console.warn('Error loading conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [currentUser]);

  // Load messages whenever activeConversation changes
  const loadMessages = async (convId) => {
    if (!convId) return;
    setLoadingMessages(true);
    try {
      const res = await getMessages(convId, currentUser?.id, currentUser?.role);
      if (res && res.success) {
        setMessages(res.messages || []);
        // Reset unread count locally in conversation list
        setConversations(prev => prev.map(c => {
          if (c.id === convId) {
            return isDoctor 
              ? { ...c, unreadCountDoctor: 0 } 
              : { ...c, unreadCountPatient: 0 };
          }
          return c;
        }));
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.warn('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeConversation?.id) {
      loadMessages(activeConversation.id);

      // Connect to Real-Time SSE stream for instant message delivery
      if (sseRef.current) {
        sseRef.current.close();
      }

      try {
        const sse = new EventSource(`/api/messages/stream?conversationId=${activeConversation.id}&userId=${currentUser?.id}`);
        sse.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_MESSAGE' && data.message) {
              setMessages(prev => {
                // Avoid duplicate append
                if (prev.some(m => m.id === data.message.id)) return prev;
                return [...prev, data.message];
              });
              setTimeout(scrollToBottom, 50);
            }
          } catch (e) {}
        };

        sse.onerror = () => {
          // If SSE fails or disconnects, fallback to silent retry
          sse.close();
        };

        sseRef.current = sse;
      } catch (err) {
        console.warn('SSE initialization note:', err);
      }
    }

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [activeConversation?.id]);

  // Polling fallback to guarantee zero missed messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConversation?.id && !loadingMessages) {
        getMessages(activeConversation.id, currentUser?.id, currentUser?.role).then(res => {
          if (res && res.success && res.messages) {
            setMessages(prev => {
              if (res.messages.length !== prev.length) {
                setTimeout(scrollToBottom, 50);
                return res.messages;
              }
              return prev;
            });
          }
        }).catch(() => {});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConversation?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedAttachment) || sending || !activeConversation) return;

    setSending(true);
    const contentToSend = inputText.trim();
    const attachmentToSend = selectedAttachment;

    const payload = {
      conversationId: activeConversation.id,
      senderId: currentUser?.id,
      senderName: currentUser?.name || (isDoctor ? 'Dr. Tharma P' : 'Patient'),
      senderRole: isDoctor ? 'Doctor' : 'Patient',
      recipientId: isDoctor ? activeConversation.patientId : activeConversation.doctorId,
      recipientName: isDoctor ? activeConversation.patientName : activeConversation.doctorName,
      recipientRole: isDoctor ? 'Patient' : 'Doctor',
      content: contentToSend,
      attachment: attachmentToSend
    };

    setInputText('');
    setSelectedAttachment(null);

    try {
      const res = await sendMessage(payload);
      if (res && res.success && res.message) {
        setMessages(prev => [...prev, res.message]);
        setTimeout(scrollToBottom, 50);
        // Update active conversation's last message snippet
        setConversations(prev => prev.map(c => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              lastMessage: contentToSend || `📎 [PDF: ${attachmentToSend?.fileName || 'Document'}]`,
              lastMessageAt: new Date()
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.warn('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleOpenAttachModal = async () => {
    if (!activeConversation) return;
    setShowAttachModal(true);
    setLoadingDocs(true);
    try {
      const res = await getPatientDocuments(activeConversation.patientId, currentUser?.id, currentUser?.role);
      if (res && res.success) {
        setPatientDocs(res.documents || []);
      }
    } catch (err) {
      console.warn('Failed to load documents for attachment:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleSelectExistingDoc = (doc) => {
    setSelectedAttachment({
      documentId: doc.id,
      fileName: doc.fileName || doc.name,
      fileUrl: `/api/documents/view/${doc.id}`,
      downloadUrl: `/api/documents/download/${doc.id}`,
      fileSizeFormatted: doc.fileSizeFormatted || doc.fileSize,
      mimeType: 'application/pdf',
      category: doc.category || doc.type
    });
    setShowAttachModal(false);
  };

  const handleUploadNewAttach = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name || '')) {
      alert('Only PDF files can be attached.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Attachment exceeds 15MB limit.');
      return;
    }

    setIsUploadingAttach(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      const res = await uploadPdfDocument({
        base64Data,
        originalName: file.name,
        fileName: file.name,
        category: 'Medical Report',
        notes: 'Attached via doctor-patient clinical chat',
        patientId: activeConversation.patientId,
        uploaderId: currentUser?.id,
        uploaderRole: currentUser?.role || 'Doctor',
        uploaderName: currentUser?.name || 'SmileCare Team'
      });

      if (res && res.success && res.document) {
        setSelectedAttachment({
          documentId: res.document.id,
          fileName: res.document.fileName,
          fileUrl: `/api/documents/view/${res.document.id}`,
          downloadUrl: `/api/documents/download/${res.document.id}`,
          fileSizeFormatted: res.document.fileSizeFormatted,
          mimeType: 'application/pdf',
          category: res.document.category
        });
        setShowAttachModal(false);
      } else {
        alert('Failed to upload PDF attachment');
      }
      setIsUploadingAttach(false);
    };
    reader.readAsDataURL(file);
  };

  const filteredConversations = conversations.filter(c => {
    const nameMatch = (c.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (c.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden h-[82vh] flex flex-col">
      {/* Top Clinical Communication Banner */}
      <div className="px-6 py-3.5 bg-gradient-to-r from-slate-900 via-brand-950 to-tealbrand-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/10 text-tealbrand-300">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
              SmileCare Doctor–Patient Clinical Messaging
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                Encrypted & HIPAA Compliant
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 font-medium">
              Direct communication between treating dental surgeons and verified patients
            </p>
          </div>
        </div>

        <button
          onClick={loadConversations}
          title="Refresh Conversations"
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loadingConv ? 'animate-spin text-tealbrand-300' : ''}`} />
        </button>
      </div>

      {/* Main Split Layout: Sidebar (Left) + Chat Window (Right) */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Column: Conversations Directory */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/60 ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isDoctor ? 'Search patient conversation...' : 'Search doctor messages...'}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-100 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConv ? (
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Loading messages...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active conversations found.
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = activeConversation?.id === conv.id;
                const unreadCount = isDoctor ? (conv.unreadCountDoctor || 0) : (conv.unreadCountPatient || 0);
                const displayName = isDoctor ? conv.patientName : conv.doctorName;
                const displayAvatar = isDoctor ? conv.patientAvatar : conv.doctorAvatar;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      setShowMobileChat(true);
                    }}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-50/80 border-l-4 border-l-brand-600'
                        : 'hover:bg-white bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {displayAvatar ? (
                        <img
                          src={displayAvatar}
                          alt={displayName}
                          className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-2 ring-white shadow-xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-tealbrand-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {displayName?.slice(0, 2).toUpperCase() || 'SC'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {displayName}
                          </span>
                          {!isDoctor && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-100 text-brand-700 font-bold shrink-0">
                              Surgeon
                            </span>
                          )}
                          {(conv.followUpReason || conv.followUpId || conv.source === 'WhatsApp Follow-up') && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shrink-0">
                              WhatsApp Follow-up
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                          {conv.lastMessage || 'Open thread'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white font-black text-[10px] shadow-xs animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Pane */}
        {activeConversation ? (
          <div className={`flex-1 flex flex-col bg-white ${
            showMobileChat ? 'flex' : 'hidden md:flex'
          }`}>
            {/* Chat Pane Header */}
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 md:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {isDoctor ? (
                  activeConversation.patientAvatar ? (
                    <img
                      src={activeConversation.patientAvatar}
                      alt={activeConversation.patientName}
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-brand-500/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-tealbrand-100 text-tealbrand-800 font-black flex items-center justify-center text-xs">
                      {activeConversation.patientName?.slice(0, 2).toUpperCase()}
                    </div>
                  )
                ) : (
                  activeConversation.doctorAvatar ? (
                    <img
                      src={activeConversation.doctorAvatar}
                      alt={activeConversation.doctorName}
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-brand-500/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-800 font-black flex items-center justify-center text-xs">
                      DR
                    </div>
                  )
                )}

                <div>
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    {isDoctor ? activeConversation.patientName : activeConversation.doctorName}
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isDoctor 
                      ? `Patient ID: ${activeConversation.patientId} • ${activeConversation.patientPhone || 'Verified Record'}` 
                      : 'Consultant Endodontist & Medical Director'}
                  </p>
                  {(activeConversation.followUpReason || activeConversation.followUpId) && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 inline-flex">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp Follow-up: {activeConversation.followUpReason || 'Procedure Checkup'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAttachModal}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                  title="Share Patient PDF Document"
                >
                  <Paperclip className="w-3.5 h-3.5" /> Share PDF Document
                </button>
              </div>
            </div>

            {/* Non-Emergency Medical Disclaimer Banner */}
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/80 text-[11px] text-amber-900 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Non-Emergency Notice:</strong> SmileCare clinical messaging is for routine appointment queries and post-treatment follow-ups. For urgent medical emergencies, call emergency services (108) or visit our clinic directly.
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/40">
              {loadingMessages ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Loading conversation history...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-700">Start of Clinical Consultation History</p>
                  <p className="text-[11px] text-slate-400">Send a greeting, ask a question, or attach diagnostic X-rays & scan reports.</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = isDoctor 
                    ? msg.senderRole === 'Doctor' 
                    : msg.senderRole === 'Patient';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                        {msg.senderName} ({msg.senderRole})
                      </span>

                      <div className={`max-w-md sm:max-w-lg rounded-2xl p-3.5 text-xs shadow-xs space-y-2 ${
                        isMine
                          ? 'bg-slate-900 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                      }`}>
                        {/* Text Content */}
                        {msg.content && (
                          <p className="whitespace-pre-wrap leading-relaxed font-medium">
                            {msg.content}
                          </p>
                        )}

                        {/* PDF Attachment Card */}
                        {msg.attachment && (
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                            isMine
                              ? 'bg-white/10 border-white/20 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-rose-500" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-extrabold text-[11px] truncate">
                                  {msg.attachment.fileName}
                                </div>
                                <div className={`text-[10px] ${isMine ? 'text-slate-300' : 'text-slate-500'}`}>
                                  {msg.attachment.category || 'PDF Document'} • {msg.attachment.fileSizeFormatted || 'PDF'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={`/api/documents/view/${msg.attachment.documentId}?requesterId=${currentUser?.id}&requesterRole=${currentUser?.role}`}
                                target="_blank"
                                rel="noreferrer"
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  isMine ? 'border-white/20 hover:bg-white/20 text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                                }`}
                                title="Preview PDF"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`/api/documents/download/${msg.attachment.documentId}?requesterId=${currentUser?.id}&requesterRole=${currentUser?.role}`}
                                download
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  isMine ? 'border-white/20 hover:bg-white/20 text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                                }`}
                                title="Download PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Timestamp & Read Indicator */}
                        <div className={`flex items-center justify-end gap-1.5 text-[10px] pt-1 ${
                          isMine ? 'text-slate-400' : 'text-slate-400'
                        }`}>
                          <span>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          {isMine && (
                            msg.isRead 
                              ? <CheckCheck className="w-3.5 h-3.5 text-tealbrand-400" /> 
                              : <Check className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Selected Attachment Preview Box */}
            {selectedAttachment && (
              <div className="px-4 py-2.5 bg-brand-50 border-t border-brand-200 flex items-center justify-between gap-3 text-xs text-brand-900">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-extrabold truncate">Attachment ready: {selectedAttachment.fileName}</span>
                  <span className="text-[10px] text-brand-700 bg-brand-200 px-2 py-0.5 rounded-full shrink-0">
                    {selectedAttachment.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAttachment(null)}
                  className="p-1 rounded-lg text-brand-700 hover:bg-brand-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
              <button
                type="button"
                onClick={handleOpenAttachModal}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-brand-600 transition-colors cursor-pointer"
                title="Attach PDF Document"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your clinical query or message..."
                className="flex-1 text-xs px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />

              <button
                type="submit"
                disabled={(!inputText.trim() && !selectedAttachment) || sending}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Select a conversation to start messaging</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Communicate securely regarding treatment plans, prescription inquiries, and diagnostic imaging.
            </p>
          </div>
        )}
      </div>

      {/* SHARE PDF DOCUMENT MODAL */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Attach Patient PDF Document</h4>
                  <p className="text-xs text-slate-500">Select an existing clinical report or upload a new scan</p>
                </div>
              </div>
              <button
                onClick={() => setShowAttachModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Upload New PDF */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-2">Upload a new PDF to share:</span>
              <input
                ref={attachFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleUploadNewAttach}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => attachFileInputRef.current?.click()}
                disabled={isUploadingAttach}
                className="w-full py-2.5 px-4 rounded-xl border border-brand-300 bg-white hover:bg-brand-50 text-brand-700 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                {isUploadingAttach ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Choose & Attach New PDF File
              </button>
            </div>

            {/* Or Select From Existing Records */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Or select from existing patient files:
              </span>

              {loadingDocs ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading records...</div>
              ) : patientDocs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No existing PDF records found for this patient.
                </div>
              ) : (
                patientDocs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectExistingDoc(doc)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{doc.fileName}</div>
                        <div className="text-[10px] text-slate-500">{doc.category} • {doc.fileSizeFormatted}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-brand-600 text-white font-extrabold text-[10px] shrink-0"
                    >
                      Attach
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAttachModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
