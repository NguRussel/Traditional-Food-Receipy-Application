import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Define a file filter function to allow only specific image types
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.')); // Reject file
  }
};

// Configure multer for in-memory storage
// This is useful if the file is processed immediately (e.g., sent to an external API)
// and doesn't need to be saved to the server's disk.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
  fileFilter: imageFileFilter,
});

export default upload; 