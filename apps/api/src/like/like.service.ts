import { BadRequestException, Injectable } from '@nestjs/common';
// import { CreateLikeInput } from './dto/create-like.input';
// import { UpdateLikeInput } from './dto/update-like.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}
  async likePost({ postId, userId }: { postId: string; userId: string }) {
    try {
      return !!(await this.prisma.like.create({
        data: {
          userId,
          postId,
        },
      }));
    } catch (err) {
      throw new BadRequestException('You have already liked this post');
    }
  }

  async unlikePost({ postId, userId }: { postId: string; userId: string }) {
    try {
      await this.prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return true;
    } catch (err) {
      throw new BadRequestException('Like not found');
    }
  }

  async getPostLikesCount(postId: string) {
    return await this.prisma.like.count({
      where: {
        postId,
      },
    });
  }

  async userLikedPost({ postId, userId }: { postId: string; userId: string }) {
    const like = await this.prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });
    return !!like;
  }
}
