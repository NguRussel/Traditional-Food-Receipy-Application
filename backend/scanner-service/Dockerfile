# 1. Select the base image with Node.js an Alpine Linux distribution
FROM node:18-alpine As development

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy package.json and package-lock.json (or yarn.lock) first for layer caching
COPY package*.json ./

# 4. Install production dependencies
RUN npm ci --only=production

# 5. Copy the rest of your application's code
COPY . .

# 6. Build TypeScript code
# First, install all dependencies (including devDependencies) to build
FROM development AS build
WORKDIR /app
COPY package*.json ./
RUN npm install 
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine As production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

# Install only production dependencies using npm ci
RUN npm ci --only=production

# Copy built assets from the build stage
COPY --from=build /app/dist ./dist

# Expose the port the app runs on (should match your .env or default port)
EXPOSE ${SCANNER_SERVICE_PORT:-8009}

# The command to run your application
CMD ["node", "dist/server.js"] 