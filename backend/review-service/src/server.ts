import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes'; // Will be added later
import { AuthError } from './middleware/authMiddleware'; // Will be added later
import CustomError from './utils/CustomError'; // Import CustomError
import swaggerUi from 'swagger-ui-express'; // Import swaggerUi
import swaggerSpec from './config/swaggerConfig'; // Import swaggerSpec

dotenv.config();

const app: Express = express();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/review_service_db';
const PORT = process.env.REVIEW_SERVICE_PORT || 8004;

// Middleware
app.use(express.json());

// Swagger UI Setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully to Review-Service'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Review Service is running with TypeScript!');
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Review Service',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Review Routes (will be uncommented and used later)
app.use('/api/reviews', reviewRoutes);

// Global Error Handler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Global Error Handler caught:", err.stack);
  
  if (err instanceof AuthError) { // Handle AuthError
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  if (err instanceof CustomError) { // Handle CustomError
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  
  // Handle Mongoose validation errors (e.g. unique index violation)
  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, message: err.message, errors: err.errors });
    return;
  }
  if (err.code && err.code === 11000) { // Mongoose duplicate key error
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    res.status(409).json({ 
        success: false, 
        message: `Duplicate key error: An entry with ${field} '${value}' already exists.`, 
        field 
    });
    return;
  }

  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({ success: false, message: 'Internal Server Error' });
};
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Review Service listening on port ${PORT}`);
}); 