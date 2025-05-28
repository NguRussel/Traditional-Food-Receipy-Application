import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { clerkAuth } from './middleware/clerkAuth';

// Extend Express Request interface to include 'auth'
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId?: string;
        [key: string]: any;
      };
    }
  }
}

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// Clerk middleware (must come before your routes)
app.use(clerkAuth);

// Example protected route
app.get('/protected', (req, res) => {
  // req.auth is available here
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.send(`Hello, user ${req.auth.userId}`);
});

// Example public route
app.get('/', (_req, res) => {
  res.send('Authentication Service Running');
});

// TODO: Import and use your auth routes here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});