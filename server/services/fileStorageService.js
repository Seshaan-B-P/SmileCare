import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_DIRS = {
  avatars: path.join(__dirname, '../uploads/avatars'),
  documents: path.join(__dirname, '../uploads/documents')
};

// Ensure directories exist
Object.values(UPLOAD_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Format bytes to readable string (e.g. 1.2 MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Sanitize filename to prevent directory traversal or unsafe chars
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'unnamed_file';
  // Strip paths and dangerous chars
  const base = path.basename(filename);
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Detect MIME type from buffer magic bytes
 */
export function detectMimeType(buffer) {
  if (!buffer || buffer.length < 4) return null;

  // PDF: %PDF (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf';
  }

  // PNG: \x89PNG (0x89 0x50 0x4E 0x47)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }

  // JPEG: \xFF\xD8\xFF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }

  // WEBP: RIFF....WEBP (0x52 0x49 0x46 0x46 ... 0x57 0x45 0x42 0x50)
  if (buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'image/webp';
  }

  return null;
}

/**
 * Convert base64 data string to Buffer
 */
export function parseBase64Data(base64String) {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid file data payload');
  }

  let pureBase64 = base64String;
  let declaredMime = null;

  // Check data URL format: data:application/pdf;base64,...
  if (base64String.startsWith('data:')) {
    const matches = base64String.match(/^data:([a-zA-Z0-9\/\-+.]+);base64,(.+)$/s);
    if (matches && matches.length === 3) {
      declaredMime = matches[1];
      pureBase64 = matches[2];
    }
  }

  const buffer = Buffer.from(pureBase64, 'base64');
  return { buffer, declaredMime };
}

/**
 * Save Avatar Image (Validation: JPG, PNG, WEBP, <= 5MB)
 */
export async function saveAvatarFile({ base64Data, targetId, originalName = 'avatar.png' }) {
  const { buffer, declaredMime } = parseBase64Data(base64Data);

  const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
  if (buffer.length > MAX_AVATAR_SIZE) {
    throw new Error(`Profile image exceeds maximum size limit of 5MB (Actual size: ${formatBytes(buffer.length)})`);
  }

  const detectedMime = detectMimeType(buffer);
  const isPdf = detectedMime === 'application/pdf' || 
                (buffer.length > 4 && buffer.slice(0, 10).toString().includes('%PDF')) ||
                (declaredMime && declaredMime.toLowerCase().includes('pdf')) ||
                (originalName && /\.pdf$/i.test(originalName));

  const resolvedMime = isPdf ? 'application/pdf' : (detectedMime || declaredMime);
  const ALLOWED_AVATAR_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];

  if (!resolvedMime || !ALLOWED_AVATAR_MIMES.includes(resolvedMime.toLowerCase())) {
    throw new Error('Invalid file format. Supported formats are JPG, JPEG, PNG, WEBP, and PDF.');
  }

  const extMap = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf'
  };
  const ext = isPdf ? '.pdf' : (extMap[resolvedMime.toLowerCase()] || '.png');
  const cleanId = sanitizeFilename(targetId || 'user');
  const storedName = `avatar_${cleanId}_${Date.now()}${ext}`;
  const diskPath = path.join(UPLOAD_DIRS.avatars, storedName);

  fs.writeFileSync(diskPath, buffer);

  return {
    storedName,
    diskPath,
    fileSize: buffer.length,
    fileSizeFormatted: formatBytes(buffer.length),
    mimeType: resolvedMime,
    isPdf: Boolean(isPdf),
    avatarUrl: `/api/uploads/avatars/${storedName}`
  };
}

/**
 * Save PDF Document (Validation: PDF magic bytes, <= 15MB)
 */
export async function savePdfDocument({ base64Data, patientId, originalName = 'document.pdf' }) {
  const { buffer, declaredMime } = parseBase64Data(base64Data);

  const MAX_PDF_SIZE = 15 * 1024 * 1024; // 15 MB
  if (buffer.length > MAX_PDF_SIZE) {
    throw new Error(`Document exceeds maximum size limit of 15MB (Actual size: ${formatBytes(buffer.length)})`);
  }

  const detectedMime = detectMimeType(buffer);
  const isPdf = detectedMime === 'application/pdf' || 
                (buffer.length > 4 && buffer.slice(0, 10).toString().includes('%PDF'));

  if (!isPdf) {
    throw new Error('Invalid document format. Only valid PDF files are supported.');
  }

  const cleanName = sanitizeFilename(originalName).replace(/\.pdf$/i, '');
  const cleanPatientId = sanitizeFilename(patientId || 'patient');
  const storedName = `doc_${cleanPatientId}_${Date.now()}_${cleanName}.pdf`;
  const diskPath = path.join(UPLOAD_DIRS.documents, storedName);

  fs.writeFileSync(diskPath, buffer);

  return {
    storedName,
    diskPath,
    fileSize: buffer.length,
    fileSizeFormatted: formatBytes(buffer.length),
    mimeType: 'application/pdf',
    relativeUrl: `/api/documents/stream/${storedName}`
  };
}

/**
 * Remove an uploaded file safely
 */
export function removeFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.warn('Error removing file:', err.message);
  }
  return false;
}
