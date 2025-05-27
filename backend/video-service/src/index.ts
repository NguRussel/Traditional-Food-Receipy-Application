import app from './server';
import { connectDB } from './config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get port from environment variables or use default
const PORT = process.env.PORT || 5003;

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start the server
    app.listen(PORT, () => {
      console.log(`Video service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application should continue running, but we log the error
});
