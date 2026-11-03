import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Experience } from '../experience/experience.types';
import { Project } from '../project/project.types';
import { Skill } from '../skill/skill.types';
import { ProfileLoaders } from './profile.loaders';
import { ProfileService } from './profile.service';
import { Profile } from './profile.types';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly loaders: ProfileLoaders,
  ) {}

  @Query(() => Profile, { nullable: true, description: 'Returns the business card profile' })
  profile(): Promise<Profile | null> {
    return this.profileService.getProfile();
  }

  @ResolveField(() => [Skill])
  skills(@Parent() profile: Profile): Promise<Skill[]> {
    return this.loaders.skills.load(profile.id);
  }

  @ResolveField(() => [Project])
  projects(@Parent() profile: Profile): Promise<Project[]> {
    return this.loaders.projects.load(profile.id);
  }

  @ResolveField(() => [Experience])
  experience(@Parent() profile: Profile): Promise<Experience[]> {
    return this.loaders.experience.load(profile.id);
  }
}
