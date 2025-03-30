import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';


const s3Endpoint = import.meta.env.SECRET_S3_ENDPOINT!;
const r2AccessKeyId = import.meta.env.SECRET_R2_ACCESS_ID!;
const r2SecretAccessKey = import.meta.env.SECRET_R2_SECRET_ACCESS_KEY!;
const bucket = import.meta.env.SECRET_R2_BUCKET_BLOG_NAME!;

export const s3Client = new S3Client({
  endpoint: s3Endpoint,
  region: 'auto',
  credentials: { accessKeyId: r2AccessKeyId, secretAccessKey: r2SecretAccessKey },
  forcePathStyle: true,
});

// A helper to convert a stream to a Buffer, useful for getFile.
export async function streamToBuffer(
  stream: ReadableStream|ReadableStream<Uint8Array>
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

export async function getFile(key: string): Promise<{
  mimeType: string;
  file: Uint8Array<ArrayBufferLike>,
}> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  console.log("COMMAND", command);
  const response = await s3Client.send(command);
  console.log("RESPONSE", response);
  const body = response.Body;
  if (!body) {
    throw new Error('File not found');
  }
  const stream = body as ReadableStream;
  console.log("STREAM", stream);
  const buffer = await streamToBuffer(stream);
  console.log("BUFFER", buffer);
  return {
    mimeType: response.ContentType || 'application/octet-stream',
    file: buffer,
  }
}

export async function setFile(key: string, mimeType: string, file: File): Promise<void> {
  // Convert File to a Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType });
  await s3Client.send(command);
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await s3Client.send(command);
}