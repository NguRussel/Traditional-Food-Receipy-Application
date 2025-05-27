# Video Service

This microservice handles video uploads and streaming for cooking tutorials in the Cameroonian Food Recipe application.

## Technologies Used

- Express.js
- TypeScript
- MongoDB
- Firebase Storage
- Axios

## Features

- Upload cooking tutorial videos (chefs)
- Stream recipe videos (users)
- Categorize videos by recipe type and region (chefs/admins)
- Moderate video content (admins)

## API Endpoints

### Public Endpoints

- `GET /api/videos` - Get all videos with optional filtering by region, category, or recipeId
- `GET /api/videos/:id` - Get a single video by ID
- `GET /api/chef/:chefId/videos` - Get all videos uploaded by a specific chef

### User Endpoints (Authentication Required)

- `GET /api/user/favorites` - Get user's favorite videos

### Chef Endpoints (Chef Authentication Required)

- `POST /api/videos` - Upload a new video

### Chef or Admin Endpoints (Chef or Admin Authentication Required)

- `PUT /api/videos/:id` - Update a video
- `DELETE /api/videos/:id` - Delete a video

### Admin Endpoints (Admin Authentication Required)

- `PATCH /api/videos/:id/flag` - Flag a video as inappropriate

## Setup and Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in `.env` file:
   ```
   PORT=5003
   MONGODB_URI=mongodb://localhost:27017/video-service
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   FIREBASE_PRIVATE_KEY="your-firebase-private-key"
   FIREBASE_STORAGE_BUCKET=your-firebase-bucket.appspot.com
   RECIPE_SERVICE_URL=http://localhost:5002/api
   REGIONAL_SERVICE_URL=http://localhost:5004/api
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

## Development

For development with auto-reload:
```
npm run dev
```

## Integration with Other Services

This service integrates with:

- **Recipe Service**: Links videos to specific recipes
- **Regional Service**: Categorizes videos by tribe/region

## Authentication

Authentication is handled by an API Gateway that passes user information in headers:
- `x-user-id`: The ID of the authenticated user
- `x-user-role`: The role of the user (user, chef, or admin)