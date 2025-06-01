# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json) to leverage Docker cache
COPY package*.json ./

# Install dependencies
# Using ci for production to ensure clean install from package-lock.json
# If you have native modules that need building, you might need build-tools like python, make, g++
# RUN apk add --no-cache --virtual .build-depsમmake g++ python3 && npm ci --only=production && apk del .build-deps
RUN npm ci --only=production

# Copy the rest of the application code into the container
COPY . .

# Transpile TypeScript to JavaScript (if not already done in a build step before Dockerizing)
# Ensure your tsconfig.json has outDir set, e.g., to "./dist"
RUN npm run build

# Expose the port the app runs on (as defined in your .env or server.ts)
# This should match the port your application listens on (e.g., 8005 for media-service)
EXPOSE 8005

# Define the command to run your app using PM2 or node
# Using node directly for simplicity here. For production, PM2 is recommended.
# The main in package.json should point to the compiled server file (e.g., dist/server.js)
CMD [ "npm", "start" ] 