import { Client } from 'minio';

// Check if environment variables are set
const endPoint = process.env.S3_ENDPOINT || 'localhost';
const port = parseInt(process.env.S3_PORT || '9000', 10);
const useSSL = process.env.S3_USE_SSL === 'true';
const accessKey = process.env.S3_ACCESS_KEY || 'minioadmin';
const secretKey = process.env.S3_SECRET_KEY || 'minioadmin';
const bucketName = process.env.S3_BUCKET || 'rag-documents';

// Initialize MinIO client
export const minioClient = new Client({
  endPoint,
  port,
  useSSL,
  accessKey,
  secretKey,
});

export const BUCKET_NAME = bucketName;

/**
 * Ensures that the bucket exists. If not, it creates it.
 */
export async function ensureBucketExists() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
    console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
  }
}

/**
 * Uploads a buffer to MinIO.
 * @param objectName The name of the object in the bucket
 * @param buffer The file content as a buffer
 * @param metaData Optional metadata for the object
 * @returns The etag of the uploaded object
 */
export async function uploadFile(
  objectName: string,
  buffer: Buffer,
  metaData: Record<string, string | number> = {}
) {
  await ensureBucketExists();
  const result = await minioClient.putObject(BUCKET_NAME, objectName, buffer, undefined, metaData);
  return result;
}

/**
 * Generates a presigned URL for reading an object.
 * @param objectName The name of the object
 * @param expiry Expiry time in seconds (default: 24 hours)
 */
export async function getPresignedUrl(objectName: string, expiry = 24 * 60 * 60) {
  return await minioClient.presignedGetObject(BUCKET_NAME, objectName, expiry);
}

/**
 * Lists all files in the bucket with their metadata.
 */
export async function listFiles() {
  await ensureBucketExists();
  const objects: any[] = [];
  const stream = minioClient.listObjectsV2(BUCKET_NAME, '', true);

  return new Promise<any[]>((resolve, reject) => {
    stream.on('data', (obj) => objects.push(obj));
    stream.on('end', async () => {
      try {
        const filesWithMetadata = await Promise.all(
          objects.map(async (obj) => {
            try {
              const stat = await minioClient.statObject(BUCKET_NAME, obj.name);
              return {
                ...obj,
                metaData: stat.metaData,
                lastModified: stat.lastModified,
                size: stat.size,
              };
            } catch (e) {
              console.error(`Error getting metadata for ${obj.name}`, e);
              return obj;
            }
          })
        );
        resolve(filesWithMetadata);
      } catch (err) {
        reject(err);
      }
    });
    stream.on('error', (err) => reject(err));
  });
}

/**
 * Deletes a file from the bucket.
 * @param objectName The name of the object to delete
 */
export async function deleteFile(objectName: string) {
  await ensureBucketExists();
  await minioClient.removeObject(BUCKET_NAME, objectName);
}
