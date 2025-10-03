import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UploadUrlPayload {
  @Field()
  uploadUrl: string; // presigned URL to PUT

  @Field()
  key: string; // object key in S3

  @Field()
  publicUrl: string; // a stable public URL you can store in DB

  @Field(() => Int)
  expiresIn: number; // seconds
}
