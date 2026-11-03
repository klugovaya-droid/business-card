import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Skill {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  category?: string | null;

  @Field(() => Int, { nullable: true })
  level?: number | null;

  profileId!: string;
}
