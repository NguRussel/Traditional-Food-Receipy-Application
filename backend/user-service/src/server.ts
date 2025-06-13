import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes'; // Import user routes
import adminUserRoutes from './routes/adminUserRoutes'; // Import admin user routes
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';
import { redisClient } from './config/redis'; // Import Redis client

dotenv.config();

const app: Express = express();
const port = process.env.USER_SERVICE_PORT || 8002;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Database Connection
const MONGODB_URI = process.env.USER_SERVICE_DB_URI || 'mongodb://localhost:27017/user-service';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB for User Service'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Redis Connection
const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ User Service Redis connection established');
  } catch (error) {
    console.error('❌ User Service Redis connection failed:', error);
    // Don't exit process, allow service to run without Redis
  }
};

// Initialize Redis connection
initializeRedis();

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'User Service',
    status: 'running',
    version: '1.0.0',
    features: [
      'User Profile Management',
      'Preferences & Settings',
      'Favorites Management',
      'Meal Planning',
      'Activity Tracking',
      'Social Features',
      'Redis Caching'
    ]
  });
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'User Service',
    version: '1.0.0',
    uptime: process.uptime(),
    database: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    },
    cache: {
      redis: 'unknown'
    }
  };

  // Check Redis connection
  try {
    await redisClient.ping();
    health.cache.redis = 'connected';
  } catch (error) {
    health.cache.redis = 'disconnected';
  }

  const statusCode = health.database.mongodb === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Mount Routes
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/users/admin', adminUserRoutes); // Mount admin user routes

// Swagger UI Setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler
interface HttpError extends Error {
  status?: number;
  // Add a property for Mongoose validation errors if you plan to handle them specifically
  errors?: any; // For mongoose ValidationError
}

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.stack);
  let status = err.status || 500;
  let message = err.message || 'Something went wrong!';

  // Mongoose Bad ObjectId Error (CastError)
  if (err.name === 'CastError' && (err as any).kind === 'ObjectId') {
    status = 400; // Bad Request
    message = 'Invalid ID format';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    status = 400;
    // Collect messages from all validation errors
    const validationErrors = Object.values((err as any).errors).map((val: any) => val.message);
    message = `Validation Error: ${validationErrors.join(', ')}`;
  }
  
  // Mongoose Duplicate Key Error
  if ((err as any).code === 11000) {
    status = 400;
    // Extract field and value from the error message if possible
    const field = Object.keys((err as any).keyValue)[0];
    const value = (err as any).keyValue[field];
    message = `Duplicate field value: ${field} must be unique. Value: ${value}`;
  }

  // AuthError (from authMiddleware)
  if (err.name === 'AuthError') {
    status = (err as any).status || 401; // Use status from AuthError or default to 401
    message = err.message;
  }

  // Redis connection errors
  if (err.message && err.message.includes('Redis')) {
    console.warn('⚠️ Redis error (service will continue without caching):', err.message);
    // Don't return error to client for Redis issues, just log them
    return next();
  }

  res.status(status).json({ 
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }

  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
  }

  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }

  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
  }

  process.exit(0);
});

app.listen(port, () => {
  console.log(`🚀 User Service listening on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
  console.log(`🏥 Health check available at http://localhost:${port}/health`);
});

export default app; 