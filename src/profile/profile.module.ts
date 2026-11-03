import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectModule } from '../project/project.module';
import { SkillModule } from '../skill/skill.module';
import { ProfileLoaders } from './profile.loaders';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  imports: [PrismaModule, SkillModule, ProjectModule],
  providers: [ProfileResolver, ProfileService, ProfileLoaders],
})
export class ProfileModule {}
