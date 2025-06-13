import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';

// Import routes
import regionalRoutes from './routes/regionalRoutes';
import adminRegionalRoutes from './routes/adminRegionalRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8007;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/regional-service';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB');
        
        // Swagger UI setup
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);

        app.listen(PORT, () => {
            console.log(`Regional service is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
        process.exit(1);
    });

// Mount Routers
app.use('/api/regional', regionalRoutes);
app.use('/api/regional/admin', adminRegionalRoutes); // Prefixed for admin scope

// Simple base route
app.get('/', (req: Request, res: Response) => {
  res.send('Regional Service is running!');
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Regional Service',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Global Error Handler
interface CustomError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
    path?: string; // For CastError
    value?: any; // For CastError
    errors?: any; // For ValidationError
    code?: number; // For MongoDB errors like 11000
    errmsg?: string; // For MongoDB errors
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let responseError: any = {
        status: err.status,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    };

    // Handle Mongoose CastError (Invalid ObjectId)
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}.`;
        return res.status(400).json({
            status: 'fail',
            message: message
        });
    }

    // Handle Mongoose ValidationError
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el: any) => el.message);
        const message = `Invalid input data. ${errors.join('. ')}`;
        return res.status(400).json({
            status: 'fail',
            message: message
        });
    }
    
    // Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const valueMatch = err.errmsg?.match(/dup key: { [^:]*: "([^"]*)" }/);
        const value = valueMatch ? valueMatch[1] : 'Unknown';
        const message = `Duplicate field value: "${value}". Please use another value!`;
        return res.status(400).json({
            status: 'fail',
            message: message
        });
    }

    res.status(err.statusCode).json(responseError);
});

export default app;