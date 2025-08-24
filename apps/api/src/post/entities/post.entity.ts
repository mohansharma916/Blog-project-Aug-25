import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CommentEntity } from 'src/comment/entities/comment.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class Count {
  @Field(() => Int)
  likes: number;

  @Field(() => Int)
  comments: number;
}

@ObjectType()
export class Post {
  @Field(() => String)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field()
  content: string;

  @Field(() => Boolean)
  published: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User)
  author: User;

  @Field(() => [Tag], { nullable: true })
  tags: Tag[] | [];

  @Field(() => [CommentEntity])
  comments: CommentEntity[];

  @Field(() => Count)
  _count: Count;
}
