import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { Achievement } from './achievement.types';

@ObjectType()
export class Experience {
  @Field(() => ID)
  id!: string;

  @Field()
  company!: string;

  @Field()
  position!: string;

  @Field(() => String, { nullable: true })
  location?: string | null;

  @Field(() => GraphQLISODateTime)
  startDate!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate?: Date | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  achievements?: Achievement[];

  profileId!: string;
}
