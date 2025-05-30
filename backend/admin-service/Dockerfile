# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port (as defined in your .env or server.ts, defaulting to 8000)
EXPOSE 8000

# Define the command to run the application
# Make sure you have a "start" script in your package.json, e.g., "start": "node dist/server.js"
CMD ["npm", "start"] 