import { Query, Resolver } from '@nestjs/graphql';
import { ProfileService } from './profile.service';
import { Profile } from './profile.types';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, { nullable: true, description: 'Returns the business card profile' })
  profile(): Promise<Profile | null> {
    return this.profileService.getProfile();
  }
}
