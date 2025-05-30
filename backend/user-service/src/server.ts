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
  .then(() => console.log('Successfully connected to MongoDB for User Service'))
  .catch(err => {
    console.error('Connection error', err);
    process.exit(1);
  });

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('User Service is running!');
});

// Mount Routes
app.use('/api/v1/users', userRoutes); // Mount user routes
app.use('/api/v1/users/admin', adminUserRoutes); // Mount admin user routes

// Swagger UI Setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler
interface HttpError extends Error {
  status?: number;
  // Add a property for Mongoose validation errors if you plan to handle them specifically
  errors?: any; // For mongoose ValidationError
}

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
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

  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`User Service listening on port ${port}`);
});

export default app; 