import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

// TODO: Recommendation Routes will be added here
// import recommendationRoutes from './routes/recommendationRoutes';
// app.use('/api/v1/recommendations', recommendationRoutes);

// Global Error Handler (basic example, can be expanded)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Recommendation Service listening on port ${PORT}`);
}); 