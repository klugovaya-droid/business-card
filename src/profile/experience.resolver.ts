import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Achievement } from '../experience/achievement.types';
import { Experience } from '../experience/experience.types';
import { ProfileLoaders } from './profile.loaders';

@Resolver(() => Experience)
export class ExperienceResolver {
  constructor(private readonly loaders: ProfileLoaders) {}

  @ResolveField(() => [Achievement])
  achievements(@Parent() experience: Experience): Promise<Achievement[]> {
    return this.loaders.achievements.load(experience.id);
  }
}
