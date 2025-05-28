import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import profileRoutes from './routes/profileRoutes';

dotenv.config();
connectDatabase();

export const app = express();

app.use(express.json());
app.use(cors());

// Mount profile routes
app.use('/api/profile', profileRoutes);