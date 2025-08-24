import { ObjectType, Field } from '@nestjs/graphql';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class CommentEntity {
  @Field(() => String)
  id: string;

  @Field()
  content: string;

  @Field(() => Post)
  post: Post;

  @Field(() => User)
  author: User;

  @Field()
  createdAt: Date;
}
