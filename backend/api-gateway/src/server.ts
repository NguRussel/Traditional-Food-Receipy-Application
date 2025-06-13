import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { ServiceConfig, ApiError } from './types';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 8000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:19006',
    'exp://localhost:19000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'API Gateway',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Gateway status
app.get('/api/v1/status', (req: Request, res: Response) => {
  const services: Record<string, ServiceConfig> = {
    'user-service': {
      url: process.env.USER_SERVICE_URL || 'http://localhost:8002',
      status: 'unknown',
      description: 'User management and authentication'
    },
    'recipe-service': {
      url: process.env.RECIPE_SERVICE_URL || 'http://localhost:8001',
      status: 'unknown',
      description: 'Recipe CRUD and search operations'
    },
    'chef-service': {
      url: process.env.CHEF_SERVICE_URL || 'http://localhost:8003',
      status: 'unknown',
      description: 'Chef profiles and verification'
    },
    'review-service': {
      url: process.env.REVIEW_SERVICE_URL || 'http://localhost:8004',
      status: 'unknown',
      description: 'Recipe reviews and ratings'
    },
    'media-service': {
      url: process.env.MEDIA_SERVICE_URL || 'http://localhost:8005',
      status: 'unknown',
      description: 'File upload and media management'
    },
    'recommendation-service': {
      url: process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:8006',
      status: 'unknown',
      description: 'AI-powered recipe recommendations'
    },
    'regional-service': {
      url: process.env.REGIONAL_SERVICE_URL || 'http://localhost:8007',
      status: 'unknown',
      description: 'Regional and cultural content'
    },
    'notification-service': {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8008',
      status: 'unknown',
      description: 'Push notifications and alerts'
    },
    'scanner-service': {
      url: process.env.SCANNER_SERVICE_URL || 'http://localhost:8009',
      status: 'unknown',
      description: 'Ingredient recognition and scanning'
    },
    'ai-assistant-service': {
      url: process.env.AI_ASSISTANT_SERVICE_URL || 'http://localhost:8010',
      status: 'unknown',
      description: 'VAPI AI voice assistant'
    },
    'analytics-service': {
      url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8011',
      status: 'unknown',
      description: 'Usage analytics and reporting'
    },
    'admin-service': {
      url: process.env.ADMIN_SERVICE_URL || 'http://localhost:8012',
      status: 'unknown',
      description: 'Admin panel and content moderation'
    }
  };

  res.json({
    message: 'AFRI-PLATES API Gateway is running!',
    services,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Microservice proxy configurations
const createProxyOptions = (target: string, pathRewrite: Record<string, string>): Options => ({
  target,
  changeOrigin: true,
  pathRewrite,
  timeout: 30000,
  proxyTimeout: 30000,
  onError: (err: Error, req: Request, res: Response) => {
    console.error(`Proxy error for ${req.url}:`, err.message);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'The requested service is currently unavailable',
      service: target,
      timestamp: new Date().toISOString()
    });
  },
  onProxyReq: (proxyReq, req: Request) => {
    console.log(`Proxying ${req.method} ${req.url} to ${target}`);
  }
});

// Define service routes
const serviceRoutes = [
  {
    path: '/api/v1/users',
    target: process.env.USER_SERVICE_URL || 'http://localhost:8002',
    pathRewrite: { '^/api/v1/users': '/api/users' }
  },
  {
    path: '/api/v1/recipes',
    target: process.env.RECIPE_SERVICE_URL || 'http://localhost:8001',
    pathRewrite: { '^/api/v1/recipes': '/api/recipes' }
  },
  {
    path: '/api/v1/chefs',
    target: process.env.CHEF_SERVICE_URL || 'http://localhost:8003',
    pathRewrite: { '^/api/v1/chefs': '/api/chefs' }
  },
  {
    path: '/api/v1/reviews',
    target: process.env.REVIEW_SERVICE_URL || 'http://localhost:8004',
    pathRewrite: { '^/api/v1/reviews': '/api/reviews' }
  },
  {
    path: '/api/v1/media',
    target: process.env.MEDIA_SERVICE_URL || 'http://localhost:8005',
    pathRewrite: { '^/api/v1/media': '/api/media' }
  },
  {
    path: '/api/v1/recommendations',
    target: process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:8006',
    pathRewrite: { '^/api/v1/recommendations': '/api/recommendations' }
  },
  {
    path: '/api/v1/regional',
    target: process.env.REGIONAL_SERVICE_URL || 'http://localhost:8007',
    pathRewrite: { '^/api/v1/regional': '/api/regional' }
  },
  {
    path: '/api/v1/notifications',
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8008',
    pathRewrite: { '^/api/v1/notifications': '/api/notifications' }
  },
  {
    path: '/api/v1/scanner',
    target: process.env.SCANNER_SERVICE_URL || 'http://localhost:8009',
    pathRewrite: { '^/api/v1/scanner': '/api/scanner' }
  },
  {
    path: '/api/v1/ai-assistant',
    target: process.env.AI_ASSISTANT_SERVICE_URL || 'http://localhost:8010',
    pathRewrite: { '^/api/v1/ai-assistant': '/api/ai-assistant' }
  },
  {
    path: '/api/v1/analytics',
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8011',
    pathRewrite: { '^/api/v1/analytics': '/api/analytics' }
  },
  {
    path: '/api/v1/admin',
    target: process.env.ADMIN_SERVICE_URL || 'http://localhost:8012',
    pathRewrite: { '^/api/v1/admin': '/api/admin' }
  }
];

// Apply proxy middleware for each service
serviceRoutes.forEach(({ path, target, pathRewrite }) => {
  app.use(path, createProxyMiddleware(createProxyOptions(target, pathRewrite)));
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    message: 'The requested endpoint does not exist',
    availableRoutes: serviceRoutes.map(route => route.path),
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log('🚀 AFRI-PLATES API Gateway Started');
  console.log('=====================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 Status: http://localhost:${PORT}/api/v1/status`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📡 Proxying requests to microservices...');
  console.log('=====================================');
}); 