import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';


export const s3Client = ()=>{
  const s3Endpoint = import.meta.env.SECRET_S3_ENDPOINT;
  const r2AccessKeyId = import.meta.env.SECRET_R2_ACCESS_ID;
  const r2SecretAccessKey = import.meta.env.SECRET_R2_SECRET_ACCESS_KEY;

  const s3 = new S3Client({
    endpoint: s3Endpoint,
    region: 'auto',
    credentials: { accessKeyId: r2AccessKeyId, secretAccessKey: r2SecretAccessKey },
    forcePathStyle: true,
  });

  return s3;
}

// A helper to convert a stream to a Buffer, useful for getFile.
export async function streamToBuffer(
  stream: NodeJS.ReadableStream|ReadableStream|ReadableStream<Uint8Array>
): Promise<Uint8Array> {
  let reader: ReadableStreamDefaultReader<Uint8Array>;
  if (typeof (stream as any).getReader === 'function') {
    // Handle web streams (ReadableStream or ReadableStream<Uint8Array>)
    reader = (stream as ReadableStream).getReader();
  } else {
    // Handle NodeJS.ReadableStream by converting it to a Web ReadableStream
    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        (stream as NodeJS.ReadableStream).on('data', (chunk: any) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        (stream as NodeJS.ReadableStream).on('error', (err: Error) => controller.error(err));
        (stream as NodeJS.ReadableStream).on('end', () => controller.close());
      }
    });
    reader = webStream.getReader();
  }
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
  const bucket = import.meta.env.SECRET_R2_BUCKET_BLOG_NAME;
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client().send(command);
  const body = response.Body;
  if (!body) {
    throw new Error('File not found');
  }
  const stream = body as ReadableStream;
  const buffer = await streamToBuffer(stream);
  return {
    mimeType: response.ContentType || 'application/octet-stream',
    file: buffer,
  }
}

export async function setFile(key: string, mimeType: string, file: File): Promise<void> {
  const bucket = import.meta.env.SECRET_R2_BUCKET_BLOG_NAME;
  // Convert File to a Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType });
  await s3Client().send(command);
}

export async function deleteFile(key: string): Promise<void> {
  const bucket = import.meta.env.SECRET_R2_BUCKET_BLOG_NAME;
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await s3Client().send(command);
}