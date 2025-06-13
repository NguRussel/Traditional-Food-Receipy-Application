import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import recommendationRoutes from './routes/recommendationRoutes';
import { AuthError, IAuthRequest } from './middleware/authMiddleware'; // Import AuthError and IAuthRequest
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';

dotenv.config();

const app: Express = express();
const PORT: string | number = process.env.PORT || 8006; // Port for Recommendation Service

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MongoDB URI not found in .env file for Recommendation-Service');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully to Recommendation-Service'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Recommendation Service is running with TypeScript!');
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Recommendation Service',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Recommendation Routes
app.use('/api/recommendations', recommendationRoutes);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // const authReq = req as IAuthRequest; // req is already base Request here from ErrorRequestHandler

  if (err instanceof AuthError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return; // Explicitly return to satisfy void promise for this path
  }
  
  console.error("Global Error Handler caught:", err.stack);
  
  if (res.headersSent) {
    // If headers are already sent, delegate to the default Express error handler
    // to close the connection and clean up.
    return next(err);
  } else {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    return; // Explicitly return
  }
  // If we wanted to ensure next is always called for unhandled cases by this logic:
  // next(err); // But above logic should cover sending a response or calling next(err)
};
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Recommendation Service listening on port ${PORT}`);
}); 