import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
export const s3BucketName = process.env.S3_BUCKET_NAME;

if (!awsRegion || !awsAccessKeyId || !awsSecretAccessKey || !s3BucketName) {
  console.error(
    'AWS configuration error: Missing one or more required environment variables (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME)'
  );
  // Depending on the application's needs, you might throw an error here
  // or allow the app to start with a non-functional S3 client.
  // For now, we'll log an error and let the s3Client be potentially uninitialized if used without vars.
}

let s3Client: S3Client | undefined;

if (awsRegion && awsAccessKeyId && awsSecretAccessKey) {
  s3Client = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    },
  });
} else {
  console.error(
    'S3 client not initialized due to missing AWS credentials or region.'
  );
}

export { s3Client }; 