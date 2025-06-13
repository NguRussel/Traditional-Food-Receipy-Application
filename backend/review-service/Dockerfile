# Use an official Node.js runtime as a parent image
FROM node:18-alpine As development

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Transpile TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:18-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built assets from development stage
COPY --from=development /app/dist ./dist

# Expose the port the app runs on
EXPOSE ${REVIEW_SERVICE_PORT:-8004}

# Define the command to run the app
CMD ["node", "dist/server.js"] 