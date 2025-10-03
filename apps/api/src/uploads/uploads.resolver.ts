import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { GenerateUploadUrlInput } from './dto/generate-upload-url.input';
import { UploadUrlPayload } from './dto/upload-url.payload';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Resolver()
export class UploadsResolver {
  constructor(private readonly uploadsService: UploadsService) {}

  // Require auth — optional depending on your app
  @UseGuards(JwtAuthGuard)
  @Mutation(() => UploadUrlPayload)
  async generateUploadUrl(
    @Args('input') input: GenerateUploadUrlInput,
    @Context() context,
  ): Promise<UploadUrlPayload> {
    // user id from JWT guard-attached request
    const userId = context.req.user?.id;
    const { filename, contentType, size } = input;

    // server-side business checks can go here (rate limits, quota, roles etc.)
    return await this.uploadsService.generatePresignedPutUrl({
      filename,
      contentType,
      size,
      userId,
    });
  }
}
