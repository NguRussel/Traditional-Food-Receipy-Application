import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import { Bucket } from '@google-cloud/storage';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
const storageBucketUrl = process.env.FIREBASE_STORAGE_BUCKET_URL;

if (!serviceAccountPath) {
  console.error('Error: FIREBASE_SERVICE_ACCOUNT_KEY_PATH is not defined in .env file.');
  console.error('Firebase Admin SDK will not be initialized. File uploads will not work.');
  // process.exit(1); // Optionally exit if Firebase is critical
}

if (!storageBucketUrl) {
  console.error('Error: FIREBASE_STORAGE_BUCKET_URL is not defined in .env file.');
  console.error('Firebase Admin SDK will not be initialized correctly. File uploads may not work as expected.');
  // process.exit(1); // Optionally exit if Firebase is critical
}

let bucket: Bucket | undefined;

if (serviceAccountPath && storageBucketUrl) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucketUrl,
    });

    bucket = admin.storage().bucket();
    console.log('✅ Firebase Admin SDK initialized successfully.');

  } catch (error: any) {
    console.error('💥 Firebase Admin SDK initialization error:', error.message);
    console.error('Please ensure the service account key path is correct and the file is valid JSON.');
    // process.exit(1); // Optionally exit if Firebase is critical
  }
} else {
  console.warn('⚠️ Firebase Admin SDK not initialized due to missing environment variables.');
}

export { admin, bucket }; 