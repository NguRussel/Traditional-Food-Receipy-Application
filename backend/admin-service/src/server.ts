import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { AuthError } from './middleware/authMiddleware';
import authRoutes from './routes/authRoutes'; // Import authRoutes
import adminRoutes from './routes/adminRoutes'; // Import adminRoutes
import swaggerOptions from './config/swaggerConfig'; // Import swaggerOptions

dotenv.config(); // Load environment variables from .env file

const app: Express = express();
const PORT = process.env.ADMIN_SERVICE_PORT || 8000; // Using a different port for admin service

// Initialize Swagger
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors()); // Enable CORS
app.use(helmet()); // Set security-related HTTP headers
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/admin-service-db';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB for Admin Service');

        // Swagger UI setup - To be added later
        app.use('/api-docs/admin', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
        console.log(`Admin Service Swagger docs available at http://localhost:${PORT}/api-docs/admin`);

        app.listen(PORT, () => {
            console.log(`Admin service is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Admin Service: Database connection error:', err);
        process.exit(1);
    });

// Mount Routers
app.use('/api/v1/auth', authRoutes); 
app.use('/api/v1/admins', adminRoutes); // Mount adminRoutes under /api/v1/admins

// Simple base route
app.get('/', (req: Request, res: Response) => {
    res.send('Admin Service is running!');
});

// Global Error Handler
interface CustomError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
    path?: string; 
    value?: any; 
    errors?: any; 
    code?: number; 
    errmsg?: string;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let responseError: any = {
        status: err.status,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    };

    // Mongoose CastError (Invalid ObjectId)
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}.`;
        return res.status(400).json({
            status: 'fail',
            message: message
        });
    }

    // Mongoose ValidationError
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el: any) => el.message);
        const message = `Invalid input data. ${errors.join('. ')}`;
        return res.status(400).json({
            status: 'fail',
            message: message
        });
    }
    
    // Mongoose Duplicate Key Error (code 11000)
    if (err.code === 11000) {
        const valueMatch = err.errmsg?.match(/dup key: { [^:]*: "([^"]*)" }/);
        const value = valueMatch ? valueMatch[1] : 'Unknown field value';
        const message = `Duplicate field value: "${value}". Please use another value!`;
        return res.status(400).json({
            status: 'fail',
            message: message
        });
    }

    // Handle other specific errors if needed

    res.status(err.statusCode).json(responseError);
});

export default app; 