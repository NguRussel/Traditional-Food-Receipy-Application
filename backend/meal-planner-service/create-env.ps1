# PowerShell script to create .env file for Meal Planner Service
# Run this script in PowerShell: .\create-env.ps1

$envContent = @'
# Meal Planner Service Environment Configuration
# ================================================

# Server Configuration
NODE_ENV=development
PORT=8013
MEAL_PLANNER_SERVICE_PORT=8013

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/meal-planner-service
MONGO_URI=mongodb://localhost:27017/meal-planner-service

# For Docker/Production (uncomment when using Docker)
# MONGODB_URI=mongodb://admin:password123@mongodb:27017/afri_plates?authSource=admin

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication & Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# API Keys for Nutrition Analysis (add your actual keys)
NUTRITIONIX_APP_ID=your-nutritionix-app-id
NUTRITIONIX_API_KEY=your-nutritionix-api-key
SPOONACULAR_API_KEY=your-spoonacular-api-key

# OpenAI for AI-powered meal planning (optional)
OPENAI_API_KEY=your-openai-api-key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:19006,exp://localhost:19000

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Logging
LOG_LEVEL=info

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email Configuration (for meal plan sharing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# External Service URLs (for development)
USER_SERVICE_URL=http://localhost:8002
RECIPE_SERVICE_URL=http://localhost:8001
RECOMMENDATION_SERVICE_URL=http://localhost:8006
ANALYTICS_SERVICE_URL=http://localhost:8011

# API Gateway Configuration
API_GATEWAY_URL=http://localhost:8000
'@

# Create the .env file
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host "📍 Location: $(Get-Location)\.env" -ForegroundColor Cyan
Write-Host "📝 Please update the API keys and secrets with your actual values" -ForegroundColor Yellow 