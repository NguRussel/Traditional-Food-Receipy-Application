import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';

// Import routes
import scannerRoutes from './routes/scannerRoutes';
import adminScannerRoutes from './routes/adminScannerRoutes';

// Import Swagger setup
import { setupSwagger } from './swaggerConfig';

dotenv.config({ path: path.resolve(__dirname, `../../.env`) });

const app: Express = express();
const PORT = process.env.PORT || process.env.SCANNER_SERVICE_PORT || 8009;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// TEMPORARY DEBUGGING MIDDLEWARE
app.use('/api/scanner', (req, res, next) => {
  console.log(`>>>> DEBUG: Path: ${req.path}, Method: ${req.method}`);
  next();
});

// Setup Swagger Docs before routes if it modifies app behavior, or after if just informational
// For swagger-ui-express, it serves new routes, so order relative to API routes is flexible.
if (process.env.NODE_ENV !== 'production') { // Optionally, only run Swagger in non-production
  setupSwagger(app);
}

// Database Connection
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/scanner-service-db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB for Scanner Service');
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error for Scanner Service:', err);
    process.exit(1);
  });

// Basic Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Scanner Service is running!');
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Scanner Service',
    version: '1.0.0',
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Mount Routes (Admin routes first to avoid conflicts)
app.use('/api/scanner/admin', adminScannerRoutes);
app.use('/api/scanner', scannerRoutes);

// Global Error Handler
interface IError extends Error {
  status?: number;
}

app.use((err: IError, req: Request, res: Response, next: NextFunction) => {
  console.error('Scanner Service Error:', err.stack);
  const status = err.status || 500;
  res.status(status).json({ 
    error: true,
    message: err.message || 'Something went wrong in Scanner Service',
    service: 'Scanner Service',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for unmatched routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: true,
    message: 'Route not found in Scanner Service',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🔍 Scanner Service is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
