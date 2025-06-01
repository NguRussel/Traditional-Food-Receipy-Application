# Stage 1: Build stage - Compile TypeScript to JavaScript
FROM node:18 AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install all dependencies, including devDependencies for TypeScript compilation
RUN npm install

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript
# Ensure your tsconfig.json has "outDir": "./dist" or similar
RUN npm run build

# Stage 2: Production stage - Create a lean image with only production dependencies
FROM node:18-alpine

WORKDIR /app

# Set Node environment to production
ENV NODE_ENV production

# Copy package.json and package-lock.json for production dependencies installation
COPY package*.json ./

# Install only production dependencies
# This command prunes devDependencies. Alternatively, copy from builder stage if complex.
RUN npm ci --only=production 

# Copy the compiled JavaScript code from the builder stage
COPY --from=builder /app/dist ./dist

# Copy other necessary files if any (e.g., .env.example, public assets)
# COPY .env.example .

# Expose the port the app runs on
# Ensure this matches the AI_ASSISTANT_SERVICE_PORT in your .env or default (8010)
EXPOSE 8010

# Command to run the application
# This assumes your package.json has a "start" script like "node dist/server.js"
# Or you can directly use: CMD ["node", "dist/server.js"]
CMD ["npm", "start"] 