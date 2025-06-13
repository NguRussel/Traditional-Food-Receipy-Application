import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

if (!serviceAccountKeyPath) {
    console.warn(
        '⚠️ FIREBASE_SERVICE_ACCOUNT_KEY_PATH is not defined in .env file. ' +
        'Push notifications will not be sent.'
    );
} else {
    try {
        const absolutePath = path.resolve(serviceAccountKeyPath);
        
        if (!fs.existsSync(absolutePath)) {
            console.error(
                `💥 Error: Firebase service account key file not found at path: ${absolutePath}. ` +
                `Please check the FIREBASE_SERVICE_ACCOUNT_KEY_PATH in your .env file.`
            );
        } else {
            const serviceAccountFileContent = fs.readFileSync(absolutePath, 'utf8');
            const serviceAccount = JSON.parse(serviceAccountFileContent);
            
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin SDK initialized successfully for notifications using key from path.');
        }
    } catch (error: any) {
        console.error(
            '💥 Error initializing Firebase Admin SDK for notifications: ', error.message,
            `Ensure FIREBASE_SERVICE_ACCOUNT_KEY_PATH in .env points to a valid JSON service account key file. Current path: ${serviceAccountKeyPath}`
        );
        // Depending on policy, you might want to prevent startup if Firebase is critical
        // process.exit(1);
    }
}

export default admin; 