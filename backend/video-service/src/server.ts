import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import videoRoutes from './routes/videoRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', videoRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'video-service' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

export default app;