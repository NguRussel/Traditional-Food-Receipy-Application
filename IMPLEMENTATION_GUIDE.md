# 🚀 AFRI-PLATES Implementation Guide

## 📋 **CURRENT STATUS**
✅ **All microservices exist** in `/backend/` directory  
✅ **Frontend interfaces ready** on branches  
✅ **TypeScript API Gateway created**  
🔄 **Ready for integration**

## 🎯 **IMMEDIATE NEXT STEPS**

### **Step 1: Install API Gateway Dependencies**
```bash
# Navigate to API Gateway
cd backend/api-gateway

# Install dependencies (when network is available)
npm install express cors helmet morgan dotenv http-proxy-middleware rate-limiter-flexible
npm install -D @types/node @types/express @types/cors @types/morgan typescript ts-node nodemon
```

### **Step 2: Start API Gateway**
```bash
# Build TypeScript
npm run build

# Start in development mode
npm run dev

# Or start built version
npm start
```

### **Step 3: Test API Gateway**
```bash
# Health check
curl http://localhost:8000/health

# Service status
curl http://localhost:8000/api/v1/status
```

## 🔧 **MICROSERVICE INTEGRATION PLAN**

### **Phase 1: Core Services (Week 1)**

#### **1.1 USER-SERVICE Integration**
```bash
cd backend/user-service

# Check if service has proper structure
ls src/

# Expected structure:
# src/
#   ├── controllers/
#   ├── models/
#   ├── routes/
#   ├── middleware/
#   └── server.ts (or app.js)
```

**Required endpoints for USER-SERVICE:**
```typescript
// Expected API endpoints at http://localhost:8002
GET    /api/users/profile
POST   /api/users/register
POST   /api/users/login
PUT    /api/users/profile
GET    /api/users/favorites
POST   /api/users/favorites/:recipeId
DELETE /api/users/favorites/:recipeId
```

#### **1.2 RECIPE-SERVICE Integration**
```bash
cd backend/recipe-service

# Start recipe service on port 8001
npm run dev
```

**Required endpoints for RECIPE-SERVICE:**
```typescript
// Expected API endpoints at http://localhost:8001
GET    /api/recipes
GET    /api/recipes/:id
POST   /api/recipes
PUT    /api/recipes/:id
DELETE /api/recipes/:id
GET    /api/recipes/search?q=ndole
GET    /api/recipes/chef/:chefId
```

#### **1.3 CHEF-SERVICE Integration**
```bash
cd backend/chef-service

# Start chef service on port 8003
npm run dev
```

**Required endpoints for CHEF-SERVICE:**
```typescript
// Expected API endpoints at http://localhost:8003
GET    /api/chefs/:id
PUT    /api/chefs/profile
GET    /api/chefs/popular
POST   /api/chefs/:id/follow
DELETE /api/chefs/:id/unfollow
```

### **Phase 2: Frontend Integration (Week 2)**

#### **2.1 Update Frontend API Configuration**

**For Chef Dashboard:**
```typescript
// clients/chef-dashboard/lib/api.ts
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  recipes: {
    getAll: () => fetch(`${API_BASE_URL}/recipes`),
    getById: (id: string) => fetch(`${API_BASE_URL}/recipes/${id}`),
    create: (data: any) => fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  },
  chef: {
    getProfile: () => fetch(`${API_BASE_URL}/chefs/profile`),
    updateProfile: (data: any) => fetch(`${API_BASE_URL}/chefs/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }
};
```

**For Mobile App:**
```typescript
// clients/mobile-users/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken(); // Implement this
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**For Admin Panel:**
```typescript
// clients/admin-users/lib/api.ts
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const adminApi = {
  users: {
    getAll: () => fetch(`${API_BASE_URL}/admin/users`),
    updateStatus: (id: string, status: string) => 
      fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
  },
  recipes: {
    getPending: () => fetch(`${API_BASE_URL}/admin/recipes/pending`),
    approve: (id: string) => fetch(`${API_BASE_URL}/admin/recipes/${id}/approve`, {
      method: 'PUT'
    })
  }
};
```

## 🗄️ **DATABASE SETUP**

### **MongoDB Setup**
```bash
# Start MongoDB (if not using Docker)
mongod --dbpath /path/to/your/db

# Or use Docker
docker run -d -p 27017:27017 --name afri-plates-mongo \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:7.0
```

### **Database Schema Implementation**
Each service should connect to MongoDB with collections:

**USER-SERVICE Collections:**
- `users` - User profiles and preferences
- `user_sessions` - Active user sessions

**RECIPE-SERVICE Collections:**
- `recipes` - Recipe data with ingredients and instructions
- `recipe_categories` - Recipe categorization

**CHEF-SERVICE Collections:**
- `chefs` - Chef profiles and verification status
- `chef_followers` - Following relationships

## 🔄 **SERVICE COMMUNICATION FLOW**

### **Request Flow:**
```
Frontend App → API Gateway (8000) → Microservice (800X) → Database → Response
```

### **Example Request:**
```bash
# Frontend makes request
POST http://localhost:8000/api/v1/recipes

# API Gateway routes to
POST http://localhost:8001/api/recipes

# Recipe service processes and returns data
```

## 🧪 **TESTING STRATEGY**

### **1. Test API Gateway**
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test service routing
curl http://localhost:8000/api/v1/status
```

### **2. Test Individual Services**
```bash
# Test user service directly
curl http://localhost:8002/api/users/health

# Test recipe service directly  
curl http://localhost:8001/api/recipes/health
```

### **3. Test End-to-End Flow**
```bash
# Test through API Gateway
curl http://localhost:8000/api/v1/recipes
curl http://localhost:8000/api/v1/users/profile
```

## 📊 **MONITORING & DEBUGGING**

### **API Gateway Logs**
```bash
# Watch API Gateway logs
cd backend/api-gateway
npm run dev

# Logs will show:
# - Incoming requests
# - Proxy routing
# - Service responses
# - Errors
```

### **Service Health Checks**
```bash
# Check all services status
curl http://localhost:8000/api/v1/status | jq
```

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: Service Not Responding**
```bash
# Check if service is running
curl http://localhost:8001/health

# Check service logs
cd backend/recipe-service
npm run dev
```

### **Issue 2: CORS Errors**
Update API Gateway CORS configuration:
```typescript
// In src/server.ts
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true
}));
```

### **Issue 3: Port Conflicts**
Check and update port configurations:
```bash
# Check what's running on ports
netstat -an | findstr :8000
netstat -an | findstr :8001
```

## 📋 **WEEKLY MILESTONES**

### **Week 1: Foundation**
- [ ] API Gateway running and routing
- [ ] USER-SERVICE connected and working
- [ ] RECIPE-SERVICE connected and working
- [ ] Basic authentication flow

### **Week 2: Core Features**
- [ ] CHEF-SERVICE integrated
- [ ] REVIEW-SERVICE integrated
- [ ] Frontend apps connected to API Gateway
- [ ] Basic CRUD operations working

### **Week 3: Advanced Features**
- [ ] MEDIA-SERVICE for file uploads
- [ ] NOTIFICATION-SERVICE for alerts
- [ ] Search and filtering working
- [ ] User authentication complete

### **Week 4: Polish & Deploy**
- [ ] All services integrated
- [ ] Error handling complete
- [ ] Performance optimization
- [ ] Ready for production deployment

## 🎯 **SUCCESS CRITERIA**

### **Technical Success:**
- [ ] All API endpoints responding correctly
- [ ] Frontend apps can perform CRUD operations
- [ ] Authentication working end-to-end
- [ ] File uploads working
- [ ] Search functionality working

### **User Experience Success:**
- [ ] Users can register and login
- [ ] Chefs can create and manage recipes
- [ ] Users can browse and save recipes
- [ ] Admins can moderate content
- [ ] Mobile app fully functional

## 🚀 **NEXT IMMEDIATE ACTIONS**

1. **Install API Gateway dependencies** (when network available)
2. **Start API Gateway** on port 8000
3. **Check existing services** and start them on their respective ports
4. **Test service communication** through API Gateway
5. **Update frontend API configurations** to use API Gateway
6. **Test end-to-end user flows**

**Ready to implement? Start with the API Gateway and let's get your app fully functional!** 