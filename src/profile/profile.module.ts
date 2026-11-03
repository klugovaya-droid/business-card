import { Module } from '@nestjs/common';
import { ExperienceModule } from '../experience/experience.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectModule } from '../project/project.module';
import { SkillModule } from '../skill/skill.module';
import { ExperienceResolver } from './experience.resolver';
import { ProfileLoaders } from './profile.loaders';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  imports: [PrismaModule, SkillModule, ProjectModule, ExperienceModule],
  providers: [ProfileResolver, ExperienceResolver, ProfileService, ProfileLoaders],
})
export class ProfileModule {}
