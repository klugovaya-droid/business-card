import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Profile {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field()
  description!: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  location?: string | null;

  @Field(() => String, { nullable: true })
  githubUrl?: string | null;

  @Field(() => String, { nullable: true })
  linkedinUrl?: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
}
