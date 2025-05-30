# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Run the build script (e.g., tsc)
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

# Copy package.json and package-lock.json for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app will run on
# Make sure this matches your application's configuration (e.g., .env file or default port)
EXPOSE 8002

# Command to start the application
# This should match the "start" script in your package.json (e.g., "node dist/server.js")
CMD ["npm", "start"] 