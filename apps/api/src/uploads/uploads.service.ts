import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private s3: S3Client;
  private bucket: string;
  private region: string;
  private defaultExpiry = 60 * 5; // 5 minutes

  constructor() {
    this.region = process.env.AWS_REGION!;
    this.bucket = process.env.S3_BUCKET!;
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  // Allowed content types and max size — adjust as needed
  private allowedContentTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  private maxFileSizeBytes = Number(
    process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024,
  ); // 5MB default

  async generatePresignedPutUrl(params: {
    filename: string;
    contentType: string;
    size?: number;
    userId?: string;
  }) {
    const { filename, contentType, size, userId } = params;

    // Basic server-side validation
    if (!contentType || !filename)
      throw new BadRequestException('filename and contentType required');

    // Validate content-type if you require it
    if (!this.allowedContentTypes.includes(contentType)) {
      throw new BadRequestException('Unsupported file type');
    }

    // Validate size if provided
    if (size && size > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `File too large. Max ${this.maxFileSizeBytes} bytes`,
      );
    }

    // Build a sanitized key. Organize by date and user if available.
    const ext = (() => {
      const m = filename.split('.').pop();
      return m ? `.${m}` : '';
    })();
    const datePath = new Date().toISOString().slice(0, 10);
    const key = `uploads/posts/${userId ?? 'anon'}/${datePath}/${randomUUID()}${ext}`;

    // PutObjectCommand for presigning (we don't actually execute it)
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      // DO NOT set ACL to public-read here if your bucket is private. Prefer private bucket + CloudFront.
      // Metadata/CacheControl can be set if needed:
      // CacheControl: 'public, max-age=31536000'
    });

    const expiresIn = this.defaultExpiry;
    const uploadUrl = await getSignedUrl(this.s3, cmd, { expiresIn });

    // publicUrl: if your bucket is public or you use CloudFront, construct the accessible URL.
    // If bucket is private, return a key and let backend create the public URL (e.g. via CloudFront)
    const publicUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return {
      uploadUrl,
      key,
      publicUrl,
      expiresIn,
    };
  }
}
