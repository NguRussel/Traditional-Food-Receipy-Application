import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import mediaRoutes from './routes/mediaRoutes';
import CustomError from './utils/CustomError';
import { AuthError } from './middleware/authMiddleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.MEDIA_SERVICE_PORT || 8005;

app.use(express.json());

// Mount Routers
app.use('/api/v1/media', mediaRoutes);

// Global Error Handler
interface GlobalError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  // Adding properties that might exist on Mongoose errors
  name: string;
  code?: number;
  keyValue?: Record<string, any>;
}

app.use((err: GlobalError, req: Request, res: Response, next: NextFunction): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error('ERROR 💥', err);

  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    return; 
  }

  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    return; 
  }

  if (err.name === 'MongoServerError' && err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: '${err.keyValue[field]}' for field '${field}'. Please use another value.`;
    const customError = new CustomError(message, 400);
    res.status(customError.statusCode).json({
        status: customError.status,
        message: customError.message,
        stack: process.env.NODE_ENV === 'development' ? customError.stack : undefined,
    });
    return;
  }

  // Generic server error
  res.status(err.statusCode || 500).json({ // Ensure statusCode is always a number
    status: err.status,
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
  // No return here, as this is the final response
});

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('💥 MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully to Media Service');
    app.listen(PORT, () => {
      console.log(`🚀 Media Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('💥 MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
