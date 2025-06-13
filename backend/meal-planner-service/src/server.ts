import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mealPlannerRoutes from './routes/mealPlanner.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || process.env.MEAL_PLANNER_SERVICE_PORT || 8013;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/meal-planner-service';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully to Meal Planner Service');
  })
  .catch((err: Error) => {
    console.error('💥 MongoDB connection error for Meal Planner Service:', err);
    process.exit(1);
  });

// Basic Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Meal Planner Service is running!');
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Meal Planner Service',
    version: '1.0.0',
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Mount Routes
app.use('/api/meal-plans', mealPlannerRoutes);

// Global Error Handler
interface IError extends Error {
  status?: number;
  statusCode?: number;
}

app.use((err: IError, req: Request, res: Response, next: NextFunction) => {
  console.error('Meal Planner Service Error:', err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ 
    error: true,
    message: err.message || 'Something went wrong in Meal Planner Service',
    service: 'Meal Planner Service',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for unmatched routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: true,
    message: 'Route not found in Meal Planner Service',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🍽️ Meal Planner Service is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
