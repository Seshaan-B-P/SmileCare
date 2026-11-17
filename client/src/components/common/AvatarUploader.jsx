import React, { useState, useRef } from 'react';
import { Camera, Trash2, User, RefreshCw, AlertCircle, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import { uploadAvatar, removeAvatar } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AvatarUploader = ({
  avatarUrl = '',
  name = 'User',
  targetType = 'user', // 'user' | 'patient'
  targetId,
  canEdit = true,
  size = 'lg', // 'sm' | 'md' | 'lg' | 'xl'
  onAvatarChange,
  className = ''
}) => {
  const { currentUser, isDoctor } = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-base',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-4xl'
  };

  const getInitials = (n) => {
    if (!n) return 'SC';
    const parts = n.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError('');

    // 1. Client-Side Format Validation: JPG, JPEG, PNG, WEBP, and PDF
    const allowedExtensions = /\.(jpe?g|png|webp|pdf)$/i;
    const isAllowedMime = file.type 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type.toLowerCase()) 
      : false;
    const isExtensionValid = allowedExtensions.test(file.name || '');

    if (!isAllowedMime && !isExtensionValid) {
      setError('Please select a valid file (JPG, JPEG, PNG, WEBP, or PDF).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Client-Side Size Validation (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`Image size must be under 5MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result;

        const res = await uploadAvatar({
          base64Data,
          targetType,
          targetId: targetId || currentUser?.id,
          requesterId: currentUser?.id,
          requesterRole: currentUser?.role || 'Doctor',
          originalName: file.name
        });

        if (res && res.success) {
          setImgError(false);
          if (onAvatarChange) onAvatarChange(res.avatarUrl);
        } else {
          setError(res?.error || 'Failed to upload profile photo');
        }
        setIsUploading(false);
      };

      reader.onerror = () => {
        setError('Error reading image file');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setIsUploading(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this profile photo?')) return;
    setError('');
    setIsUploading(true);

    try {
      const res = await removeAvatar({
        targetType,
        targetId: targetId || currentUser?.id,
        requesterId: currentUser?.id,
        requesterRole: currentUser?.role || 'Doctor'
      });

      if (res && res.success) {
        setImgError(false);
        if (onAvatarChange) onAvatarChange('');
      } else {
        setError(res?.error || 'Failed to remove photo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const isPdf = Boolean(avatarUrl && (avatarUrl.toLowerCase().endsWith('.pdf') || avatarUrl.includes('.pdf?')));
  const hasValidAvatar = Boolean(avatarUrl && !imgError);

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className={`${sizeClasses[size] || sizeClasses.lg} rounded-2xl overflow-hidden relative border-2 border-white shadow-md bg-gradient-to-br from-brand-600 to-tealbrand-700 text-white flex items-center justify-center font-black select-none group`}
      >
        {isPdf ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 text-rose-300 p-2 text-center group-hover:scale-105 transition-transform">
            <FileText className="w-7 h-7 text-rose-400 mb-0.5" />
            <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500/20 px-1.5 py-0.2 rounded text-rose-300 border border-rose-500/30">
              PDF Doc
            </span>
          </div>
        ) : hasValidAvatar ? (
          <img
            src={avatarUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top transition-transform group-hover:scale-105 duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-brand-900 to-tealbrand-900 text-tealbrand-200">
            <span>{getInitials(name)}</span>
          </div>
        )}

        {/* Loading Spinner Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-white z-20">
            <RefreshCw className="w-6 h-6 animate-spin text-tealbrand-300" />
          </div>
        )}

        {/* Interactive Hover Actions */}
        {canEdit && !isUploading && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer gap-2"
            title="Click to change photo or document"
          >
            <span className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white" title="Upload new image or PDF">
              <Camera className="w-4 h-4" />
            </span>

            {isPdf && (
              <a
                href={avatarUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-xl bg-tealbrand-600/80 hover:bg-tealbrand-600 text-white"
                title="Open PDF Document"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {(hasValidAvatar || isPdf) && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white"
                title="Remove photo/document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      {canEdit && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      {/* Inline Validation Error */}
      {error && (
        <div className="absolute top-full left-0 mt-1.5 w-64 p-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-bold text-rose-700 shadow-md z-30 flex items-center gap-1.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
