import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

// Recipe Routes (to be implemented)
// import recipeRoutes from './routes/recipes';
// app.use('/api/v1/recipes', recipeRoutes);

app.listen(PORT, () => {
  console.log(`Recipe Service listening on port ${PORT}`);
}); 