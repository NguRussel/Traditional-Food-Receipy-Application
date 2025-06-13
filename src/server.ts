import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app: Express = express();
const PORT = process.env.USER_SERVICE_PORT || 8002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/user_service_db';

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully to User-Service'))
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('User Service is running with TypeScript!');
});

// Global Error Handler (Basic Placeholder)
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`User Service listening on port ${PORT}`);
}); 