# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Install application dependencies
# Using ci for reproducible builds, and --only=production if you build assets separately
RUN npm ci

# Copy the rest of the application code into the container
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 8007

# Define the command to run the application
CMD [ "npm", "start" ] 