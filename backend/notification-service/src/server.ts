import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig';
import notificationRoutes from './routes/notificationRoutes';
import CustomError from './utils/CustomError';
import { AuthError } from './middleware/authMiddleware';
import { MongoServerError } from 'mongodb';

dotenv.config();

const app: Express = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 8008;

app.use(express.json());

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Notification Service',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Mount routes
app.use('/api/notifications', notificationRoutes);

// Global error handler
interface GlobalError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
    code?: number; // For MongoServerError
    keyValue?: any; // For MongoServerError duplicate key
}

app.use((err: GlobalError, req: Request, res: Response, next: NextFunction): void => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let errorResponse: {
        statusCode: number;
        status: string;
        message: string;
        error?: GlobalError | { name: string; message?: string };
        stack?: string;
    } = {
        statusCode: err.statusCode,
        status: err.status,
        message: err.message,
        error: { ...err }, // Clone error
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    };

    if (err instanceof CustomError) {
        errorResponse.status = err.status;
        errorResponse.message = err.message;
        errorResponse.error = { name: err.name, message: err.message }; // Keep it simple for CustomError
    } else if (err instanceof AuthError) {
        errorResponse.status = 'fail';
        errorResponse.message = err.message;
        errorResponse.error = { name: err.name, message: err.message }; // Keep it simple for AuthError
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        const value = Object.values(err.keyValue || {})[0];
        errorResponse.statusCode = 400;
        errorResponse.status = 'fail';
        errorResponse.message = `Duplicate field value: ${field} (${value}). Please use another value.`;
        errorResponse.error = { name: err.name, message: errorResponse.message };
    } else if (err.name === 'ValidationError') { // Mongoose validation error
        errorResponse.statusCode = 400;
        errorResponse.status = 'fail';
        errorResponse.message = err.message; // Using the main message from Mongoose
        errorResponse.error = { name: err.name, message: err.message };
    } else {
        console.error('ERROR 💥', err); 
        errorResponse.message = 'Something went very wrong!';
        if (process.env.NODE_ENV !== 'development') {
            errorResponse.error = { name: err.name || 'Error', message: 'Internal Server Error' }; // Generic error for prod
        } else {
            // In dev, errorResponse.error is already the cloned full error
        }
    }
    
    // For production, ensure stack is not sent unless it's an operational error we want to expose
    if (process.env.NODE_ENV !== 'development') {
        delete errorResponse.stack; // Remove stack in production
        // Further simplify the error object if it's not a controlled error (CustomError/AuthError)
        if (!(err instanceof CustomError) && !(err instanceof AuthError)){
             errorResponse.error = { name: err.name || 'InternalServerError', message: 'An unexpected error occurred.'} 
        }
    }

    res.status(errorResponse.statusCode).json(errorResponse);
});

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('💥 MONGODB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Notification service running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('💥 MongoDB connection error:', err);
        process.exit(1);
    }); 