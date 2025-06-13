const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:19006',
    'exp://localhost:19000'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'API Gateway',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// API Gateway status
app.get('/api/v1/status', (req, res) => {
  res.json({
    message: 'AFRI-PLATES API Gateway is running!',
    services: {
      'user-service': process.env.USER_SERVICE_URL || 'http://localhost:8002',
      'recipe-service': process.env.RECIPE_SERVICE_URL || 'http://localhost:8001',
      'chef-service': process.env.CHEF_SERVICE_URL || 'http://localhost:8003',
      'review-service': process.env.REVIEW_SERVICE_URL || 'http://localhost:8004',
      'media-service': process.env.MEDIA_SERVICE_URL || 'http://localhost:8005'
    },
    timestamp: new Date().toISOString()
  });
});

// Microservice proxy configurations
const serviceProxies = {
  '/api/v1/users': {
    target: process.env.USER_SERVICE_URL || 'http://localhost:8002',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/users': '/api/users'
    }
  },
  '/api/v1/recipes': {
    target: process.env.RECIPE_SERVICE_URL || 'http://localhost:8001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/recipes': '/api/recipes'
    }
  },
  '/api/v1/chefs': {
    target: process.env.CHEF_SERVICE_URL || 'http://localhost:8003',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/chefs': '/api/chefs'
    }
  },
  '/api/v1/reviews': {
    target: process.env.REVIEW_SERVICE_URL || 'http://localhost:8004',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/reviews': '/api/reviews'
    }
  },
  '/api/v1/media': {
    target: process.env.MEDIA_SERVICE_URL || 'http://localhost:8005',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/media': '/api/media'
    }
  }
};

// Apply proxy middleware for each service
Object.keys(serviceProxies).forEach(path => {
  app.use(path, createProxyMiddleware(serviceProxies[path]));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    message: 'The requested endpoint does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Gateway Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AFRI-PLATES API Gateway running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Status: http://localhost:${PORT}/api/v1/status`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📡 Proxying requests to microservices...');
}); 