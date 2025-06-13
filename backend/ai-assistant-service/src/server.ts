import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpecObject } from './swaggerConfig';

// Import routes
import aiAssistantRoutes from './routes/aiAssistantRoutes';
import adminAIAssistantRoutes from './routes/adminAIAssistantRoutes';

dotenv.config({ path: path.resolve(__dirname, `../../.env`) });

const app: Express = express();
const PORT = process.env.AI_ASSISTANT_SERVICE_PORT || 8010;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Secure Express apps by setting various HTTP headers
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger middleware

// Database Connection
const MONGO_URI = process.env.AI_ASSISTANT_DB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ai-assistant-service-db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB for AI Assistant Service');
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error for AI Assistant Service:', err);
    // Consider if the service should run if DB connection fails. For now, it will.
  });

// Root Route for Health Check
app.get('/', (req: Request, res: Response) => {
  res.send('AI Assistant Service is alive and running!');
});

// Swagger API Documentation Route
// Serve Swagger UI at /api-docs/ai-assistant-service
app.use('/api-docs/ai-assistant-service', swaggerUi.serve, swaggerUi.setup(swaggerSpecObject, { 
    explorer: true, 
    // You can add custom CSS or JS here if needed
    // customCss: '.swagger-ui .topbar { display: none }',
    // customSiteTitle: "AI Assistant Service API Docs"
}));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AI Assistant Service',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Mount API Routes
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/ai-assistant/admin', adminAIAssistantRoutes);

// Not Found Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: IError = new Error('Not Found - The resource you are looking for does not exist on this server.');
  error.status = 404;
  next(error);
});

// Global Error Handler
interface IError extends Error {
  status?: number;
}

app.use((err: IError, req: Request, res: Response, next: NextFunction) => {
  console.error('[AI Assistant Service Global Error Handler]:', err);
  const status = err.status || 500;
  res.status(status).json({ 
    message: err.message || 'An unexpected error occurred in the AI Assistant Service',
    // Provide stack trace only in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`AI Assistant Service is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`, err);
  // Close server & exit process (optional, but good for production)
  // server.close(() => process.exit(1));
});

export default app; 