import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import reviewRoutes from './routes/reviewRoutes'; // Will be added later
// import { AuthError } from './middleware/authMiddleware'; // Will be added later

dotenv.config();

const app: Express = express();
const PORT: string | number = process.env.REVIEW_SERVICE_PORT || 8002;

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MongoDB URI not found in .env file for Review-Service');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully to Review-Service'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Review Service is running with TypeScript!');
});

// Review Routes (will be uncommented and used later)
// app.use('/api/v1/reviews', reviewRoutes);

// Global Error Handler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Global Error Handler caught:", err.stack);
  
  // if (err instanceof AuthError) { // Will be uncommented later
  //   res.status(err.statusCode).json({ success: false, message: err.message });
  //   return;
  // }
  
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ success: false, message: 'Internal Server Error' });
};
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Review Service listening on port ${PORT}`);
}); 