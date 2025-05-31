import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import CustomError from '../utils/CustomError';

// Define allowed MIME types for different categories
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo']; // AVI
const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']; // PDF, DOC, DOCX

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

// Generic file filter function
const fileFilter = (
  allowedMimeTypes: string[],
  maxSize: number,
  fileTypeDescription: string
) => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new CustomError(`Invalid file type. Only ${fileTypeDescription} are allowed.`, 400));
    }
    // The size check is better handled by multer's limits option directly for clarity
    cb(null, true);
  };
};

// Configure multer for different file types
// Using memoryStorage as we will process files and upload to Firebase directly
const storage = multer.memoryStorage();

export const imageUpload = multer({
  storage: storage,
  fileFilter: fileFilter(allowedImageTypes, MAX_IMAGE_SIZE, 'images (JPEG, PNG, GIF, WEBP)'),
  limits: { fileSize: MAX_IMAGE_SIZE },
});

export const videoUpload = multer({
  storage: storage,
  fileFilter: fileFilter(allowedVideoTypes, MAX_VIDEO_SIZE, 'videos (MP4, MPEG, MOV, AVI)'),
  limits: { fileSize: MAX_VIDEO_SIZE },
});

export const documentUpload = multer({
  storage: storage,
  fileFilter: fileFilter(allowedDocumentTypes, MAX_DOCUMENT_SIZE, 'documents (PDF, DOC, DOCX)'),
  limits: { fileSize: MAX_DOCUMENT_SIZE },
});

// Generic uploader if type is not known beforehand or mixed types are allowed in one field
// This might be useful for a generic 'file' upload endpoint if ever needed.
// For specific routes like /images/upload, /videos/upload, it's better to use typed uploaders.
export const genericFileUpload = multer({
  storage: storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes];
    if (!allAllowedTypes.includes(file.mimetype)) {
      return cb(new CustomError('Invalid file type. Only images, videos, and documents are allowed.', 400));
    }
    cb(null, true);
  },
  limits: { fileSize: MAX_VIDEO_SIZE }, // Set to the largest possible type, e.g., video
}); 