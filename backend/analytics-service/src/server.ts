import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpecObject } from './swaggerConfig'; // Import the swaggerSpec

// Import routes
import analyticsRoutes from './routes/analyticsRoutes';
import adminAnalyticsRoutes from './routes/adminAnalyticsRoutes';

// TODO: Import routes when created
// import analyticsRoutes from './routes/analyticsRoutes';
// import adminAnalyticsRoutes from './routes/adminAnalyticsRoutes';

dotenv.config({ path: path.resolve(__dirname, `../../.env`) });

const app: Express = express();
const PORT = process.env.ANALYTICS_SERVICE_PORT || 8011;

// Middleware
app.use(cors());
app.use(helmet()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Database Connection
const MONGO_URI = process.env.ANALYTICS_DB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/analytics-service-db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB for Analytics Service');
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error for Analytics Service:', err);
  });

// Root Route for Health Check
app.get('/', (req: Request, res: Response) => {
  res.send('Analytics Service is alive and running!');
});

// Swagger API Documentation Route
// Serve Swagger UI at /api-docs/analytics-service
app.use('/api-docs/analytics-service', swaggerUi.serve, swaggerUi.setup(swaggerSpecObject, { 
    explorer: true,
    customSiteTitle: "Analytics Service API Docs"
}));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Analytics Service',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Mount API Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics/admin', adminAnalyticsRoutes);

// Not Found Middleware
interface IError extends Error {
  status?: number;
}
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: IError = new Error('Not Found - The resource you are looking for does not exist on this server.');
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use((err: IError, req: Request, res: Response, next: NextFunction) => {
  console.error('[Analytics Service Global Error Handler]:', err);
  const status = err.status || 500;
  res.status(status).json({ 
    message: err.message || 'An unexpected error occurred in the Analytics Service',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Analytics Service is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

process.on('unhandledRejection', (err: Error, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`, err);
  // server.close(() => process.exit(1));
});

export default app; 