# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Transpile TypeScript to JavaScript
# Ensure your package.json has a "build" script, e.g., "build": "tsc"
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist

# Install production dependencies
RUN npm install --omit=dev

# Expose the port the app runs on
# Make sure this matches the PORT in your .env file or server.ts (default is 8003)
EXPOSE 8003

# Define environment variable for Node environment
ENV NODE_ENV production

# Command to run the application
# Adjust if your entry point is different, e.g., dist/server.js
CMD [ "node", "dist/server.js" ] 