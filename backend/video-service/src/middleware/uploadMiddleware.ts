import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { bucket } from '../config/firebas';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Filter to only allow video files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only video files
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'));
  }
};

// Configure multer upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // Limit file size to 100MB
  },
});

// Middleware to upload file to Firebase Storage
export const uploadToFirebase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create a unique filename
    const filename = `${uuidv4()}${path.extname(req.file.originalname)}`;
    
    // Create a reference to the file in Firebase Storage
    const file = bucket.file(`videos/${filename}`);
    
    // Create a write stream and upload the file
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });
    
    // Handle errors during upload
    stream.on('error', (error) => {
      console.error('Error uploading to Firebase:', error);
      return res.status(500).json({ message: 'Error uploading file' });
    });
    
    // When upload is complete, make the file publicly accessible
    stream.on('finish', async () => {
      try {
        // Make the file publicly accessible
        await file.makePublic();
        
        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        
        // Add the URL to the request object
        req.fileUrl = publicUrl;
        next();
      } catch (error) {
        console.error('Error making file public:', error);
        return res.status(500).json({ message: 'Error processing file' });
      }
    });
    
    // Write the file buffer to the stream
    stream.end(req.file.buffer);
  } catch (error) {
    console.error('Error in uploadToFirebase middleware:', error);
    return res.status(500).json({ message: 'Server error during file upload' });
  }
};

// Extend Express Request interface to include file URL
declare global {
  namespace Express {
    interface Request {
      fileUrl?: string;
    }
  }
}