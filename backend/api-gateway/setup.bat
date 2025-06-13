@echo off
echo 🚀 AFRI-PLATES API Gateway Setup
echo ================================

echo 📦 Installing dependencies...
call npm install express cors helmet morgan dotenv http-proxy-middleware rate-limiter-flexible

echo 📦 Installing dev dependencies...
call npm install -D @types/node @types/express @types/cors @types/morgan typescript ts-node nodemon @types/jest jest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser rimraf

echo ✅ Dependencies installed!

echo 🔨 Building TypeScript...
call npm run build

echo ✅ Build complete!

echo 🚀 Starting API Gateway in development mode...
echo 📡 API Gateway will be available at http://localhost:8000
echo 📊 Health check: http://localhost:8000/health
echo 🔗 Service status: http://localhost:8000/api/v1/status
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev 