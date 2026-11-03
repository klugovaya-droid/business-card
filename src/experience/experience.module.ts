import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { ExperienceService } from './experience.service';

@Module({
  providers: [ExperienceService, AchievementService],
  exports: [ExperienceService, AchievementService],
})
export class ExperienceModule {}
