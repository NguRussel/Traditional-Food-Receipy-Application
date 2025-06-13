# AFRI-PLATES API Gateway

## 🎯 Overview
The API Gateway serves as the central entry point for all AFRI-PLATES microservices, providing request routing, rate limiting, CORS handling, and service orchestration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TypeScript knowledge

### Installation
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start in development mode
npm run dev

# Or use the setup script (Windows)
setup.bat
```

### Environment Variables
Create a `.env` file in the root directory:
```env
API_GATEWAY_PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Microservice URLs
USER_SERVICE_URL=http://localhost:8002
RECIPE_SERVICE_URL=http://localhost:8001
CHEF_SERVICE_URL=http://localhost:8003
REVIEW_SERVICE_URL=http://localhost:8004
MEDIA_SERVICE_URL=http://localhost:8005
```

## 📡 API Routes

### Health & Status
- `GET /health` - API Gateway health check
- `GET /api/v1/status` - All services status

### Service Routing
- `GET /api/v1/users/*` → USER-SERVICE (port 8002)
- `GET /api/v1/recipes/*` → RECIPE-SERVICE (port 8001)  
- `GET /api/v1/chefs/*` → CHEF-SERVICE (port 8003)
- `GET /api/v1/reviews/*` → REVIEW-SERVICE (port 8004)
- `GET /api/v1/media/*` → MEDIA-SERVICE (port 8005)

## 🔧 Development

### Scripts
```bash
npm run dev          # Start with nodemon + ts-node
npm run build        # Compile TypeScript
npm run start        # Start compiled JavaScript
npm run test         # Run tests
npm run lint         # Run ESLint
```

### Project Structure
```
src/
├── server.ts              # Main server file
├── types/
│   └── index.ts          # TypeScript type definitions
├── middleware/
│   ├── errorHandler.ts   # Global error handling
│   └── rateLimiter.ts    # Rate limiting middleware
└── utils/                # Utility functions
```

## 🛡️ Security Features

### Rate Limiting
- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 10 requests per minute
- IP-based rate limiting

### CORS
- Configurable origins
- Credentials support
- Preflight handling

### Headers Security
- Helmet.js integration
- Content Security Policy
- XSS protection

## 📊 Monitoring

### Logs
The API Gateway logs all:
- Incoming requests
- Proxy routing decisions
- Service responses
- Errors and exceptions

### Health Checks
```bash
# Check API Gateway health
curl http://localhost:8000/health

# Check all services status
curl http://localhost:8000/api/v1/status
```

## 🔄 Service Integration

### Adding New Services
1. Add service URL to environment variables
2. Add route configuration in `src/server.ts`
3. Update service status endpoint

### Example Service Integration
```typescript
// Add to serviceRoutes array
{
  path: '/api/v1/newservice',
  target: process.env.NEW_SERVICE_URL || 'http://localhost:8013',
  pathRewrite: { '^/api/v1/newservice': '/api/newservice' }
}
```

## 🚨 Troubleshooting

### Common Issues

**Service Not Responding**
```bash
# Check if service is running
curl http://localhost:8001/health

# Check service logs
cd ../recipe-service
npm run dev
```

**CORS Errors**
- Update `CORS_ORIGIN` environment variable
- Ensure frontend URL is included

**Port Conflicts**
```bash
# Check what's using port 8000
netstat -an | findstr :8000
```

## 📈 Performance

### Optimization Features
- Request/response compression
- Connection pooling
- Timeout handling
- Circuit breaker pattern (planned)

### Monitoring Metrics
- Request count per service
- Response times
- Error rates
- Rate limit hits

## 🔮 Future Enhancements
- [ ] Circuit breaker implementation
- [ ] Service discovery integration
- [ ] Distributed tracing
- [ ] Metrics collection (Prometheus)
- [ ] Load balancing between service instances
- [ ] JWT authentication middleware
- [ ] Request/response caching

## 📞 Support
For issues or questions, check the main project documentation or create an issue in the repository. 