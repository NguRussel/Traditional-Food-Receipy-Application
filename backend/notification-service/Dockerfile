# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Start a new stage for a lean production image
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json again for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules # To ensure all necessary modules are present, though npm ci --only=production should handle it.

# Expose the port the app runs on
EXPOSE 8008

# Define the command to run the application
# This assumes you have a "start" script in your package.json, e.g., "node dist/server.js"
CMD ["npm", "start"] 