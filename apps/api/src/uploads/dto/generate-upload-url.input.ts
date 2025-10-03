import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

@InputType()
export class GenerateUploadUrlInput {
  @Field()
  @IsString()
  filename: string;

  @Field()
  @IsString()
  contentType: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  size?: number; // optional client-provided size in bytes (useful for server-side checks)
}
