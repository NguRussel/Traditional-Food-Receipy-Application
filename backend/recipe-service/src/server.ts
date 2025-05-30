import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { AuthError } from './middleware/authMiddleware'; // Import AuthError

dotenv.config();

const app: Express = express();
const PORT: string | number = process.env.PORT || 8001;

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MongoDB URI not found in .env file');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully to Recipe-Service'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  });

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Recipe Service is running with TypeScript!');
});

// Recipe Routes
import recipeRoutes from './routes/recipeRoutes';
import adminRecipeRoutes from './routes/adminRecipeRoutes'; // Import admin routes

app.use('/api/v1/recipes', recipeRoutes); // General recipe routes
app.use('/api/v1/recipes/admin', adminRecipeRoutes); // Admin-specific recipe routes

// Global Error Handler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Error caught by global error handler:', err.stack);

  // Handle AuthError specifically
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    res.status(400).json({ success: false, message: 'Invalid ID format' });
    return;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    // Ensure err.errors is treated as a record of MongooseError types
    const validationErrors = err.errors as { [path: string]: mongoose.Error.ValidatorError | mongoose.Error.CastError };
    const messages = Object.values(validationErrors || {}).map((val) => val.message);
    res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
    return;
  }

  // Default to 500 server error if status code is not set
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Optional: include stack in dev
  });
  // No explicit next(err) here as this is intended to be the final error handler
};

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Recipe Service listening on port ${PORT}`);
}); 