import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Like } from './entities/like.entity';
import { LikeService } from './like.service';

@Resolver(() => Like)
export class LikeResolver {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async likePost(
    @Context() context,
    @Args('postId', { type: () => String! }) postId: string,
  ) {
    const userId = context.req.user.id;
    return await this.likeService.likePost({ postId, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async unlikePost(
    @Context() context,
    @Args('postId', { type: () => String! }) postId: string,
  ) {
    const userId = context.req.user.id;
    return await this.likeService.unlikePost({ postId, userId });
  }

  @Query(() => Int)
  postLikesCount(@Args('postId', { type: () => String! }) postId: string) {
    return this.likeService.getPostLikesCount(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  userLikedPost(
    @Context() context,
    @Args('postId', { type: () => String! }) postId: string,
  ) {
    const userId = context.req.user.id;
    return this.likeService.userLikedPost({ postId, userId });
  }
}
