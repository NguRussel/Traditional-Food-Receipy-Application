#!/bin/bash

# AFRI-PLATES Quick Start Script
# This script sets up your development environment

echo "🚀 AFRI-PLATES Development Environment Setup"
echo "=============================================="

# Step 1: Create project structure
echo "📁 Creating project structure..."
mkdir -p backend/services
mkdir -p infrastructure
mkdir -p scripts
mkdir -p shared/config
mkdir -p shared/utils
mkdir -p shared/types
mkdir -p database/schemas
mkdir -p database/seeds
mkdir -p database/init

echo "✅ Project structure created!"

# Step 2: Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env.development << 'EOF'
# AFRI-PLATES Development Environment Variables

# Database Configuration
MONGODB_URI=mongodb://admin:password123@localhost:27017/afri_plates_dev?authSource=admin
MONGODB_DB_NAME=afri_plates_dev
REDIS_URL=redis://:redis123@localhost:6379

# API Gateway
API_GATEWAY_PORT=8000
NODE_ENV=development

# Microservices URLs
USER_SERVICE_PORT=8002
RECIPE_SERVICE_PORT=8001
CHEF_SERVICE_PORT=8003
REVIEW_SERVICE_PORT=8004
MEDIA_SERVICE_PORT=8005

# Security
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Logging
LOG_LEVEL=debug
EOF

echo "✅ Environment file created!"

# Step 3: Start Docker services
echo "🐳 Starting Docker services..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ Docker services started!"
    echo ""
    echo "📊 Services running:"
    echo "   - MongoDB: http://localhost:27017"
    echo "   - Redis: http://localhost:6379"
    echo "   - Mongo Express: http://localhost:8081 (admin/admin123)"
    echo "   - Redis Commander: http://localhost:8082"
else
    echo "❌ Docker Compose not found. Please install Docker first."
    exit 1
fi

# Step 4: Create API Gateway structure
echo "🌐 Setting up API Gateway..."
mkdir -p backend/services/api-gateway/src/{controllers,middleware,routes,utils,types}

# Create package.json for API Gateway
cat > backend/services/api-gateway/package.json << 'EOF'
{
  "name": "afri-plates-api-gateway",
  "version": "1.0.0",
  "description": "AFRI-PLATES API Gateway Service",
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "rate-limiter-flexible": "^3.0.8"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/express": "^4.17.20",
    "@types/cors": "^2.8.15",
    "@types/morgan": "^1.9.7",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  }
}
EOF

# Create TypeScript config
cat > backend/services/api-gateway/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

echo "✅ API Gateway structure created!"

# Step 5: Create basic API Gateway server
cat > backend/services/api-gateway/src/server.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../../.env.development' });

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
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
    version: '1.0.0'
  });
});

// API routes
app.get('/api/v1/status', (req, res) => {
  res.json({
    message: 'AFRI-PLATES API Gateway is running!',
    services: {
      'user-service': 'Not connected',
      'recipe-service': 'Not connected',
      'chef-service': 'Not connected'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Status: http://localhost:${PORT}/api/v1/status`);
});
EOF

echo "✅ Basic API Gateway server created!"

# Step 6: Install API Gateway dependencies
echo "📦 Installing API Gateway dependencies..."
cd backend/services/api-gateway
npm install
cd ../../../

echo ""
echo "🎉 SETUP COMPLETE!"
echo "==================="
echo ""
echo "🚀 Next Steps:"
echo "1. Start the API Gateway:"
echo "   cd backend/services/api-gateway"
echo "   npm run dev"
echo ""
echo "2. Test the API Gateway:"
echo "   curl http://localhost:8000/health"
echo "   curl http://localhost:8000/api/v1/status"
echo ""
echo "3. Access admin interfaces:"
echo "   - MongoDB: http://localhost:8081 (admin/admin123)"
echo "   - Redis: http://localhost:8082"
echo ""
echo "4. Check Docker services:"
echo "   docker ps"
echo ""
echo "📋 Ready to implement your first microservice!"
echo "   Follow the implementation plan in START_HERE.md" 