# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
# Using --only=production can reduce image size if devDependencies aren't needed for build
# However, TypeScript compilation often needs devDependencies like 'typescript' and 'ts-node'
RUN npm install

# Copy the rest of the application code from your workspace to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json again for production dependencies
COPY package*.json ./

# Install only production dependencies to keep the image lean
RUN npm install --only=production

# Copy the built application (dist folder) and other necessary files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
# If you have other assets or static files that are part of the runtime and not in dist, copy them too.
# e.g. COPY --from=builder /usr/src/app/public ./public

# Expose the port the app runs on
# This should ideally be set by an environment variable in production
EXPOSE ${PORT:-8001}

# Define environment variables (defaults, can be overridden at runtime)
ENV NODE_ENV=production
# MONGODB_URI will need to be provided when running the container
# PORT can also be provided to override the default 8001

# Define the command to run your app
CMD ["node", "dist/server.js"] 