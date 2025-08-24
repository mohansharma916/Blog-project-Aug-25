import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field(() => String)
  @IsString()
  postId: string;

  @Field()
  @IsString()
  content: string;
}
