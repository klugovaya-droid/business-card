import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Achievement {
  @Field(() => ID)
  id!: string;

  @Field()
  text!: string;

  experienceId!: string;
}
