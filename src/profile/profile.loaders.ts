import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { createOneToManyLoader } from '../common/dataloaders/create-one-to-many-loader';
import { AchievementService } from '../experience/achievement.service';
import { Achievement } from '../experience/achievement.types';
import { ExperienceService } from '../experience/experience.service';
import { Experience } from '../experience/experience.types';
import { ProjectService } from '../project/project.service';
import { Project } from '../project/project.types';
import { SkillService } from '../skill/skill.service';
import { Skill } from '../skill/skill.types';

@Injectable({ scope: Scope.REQUEST })
export class ProfileLoaders {
  readonly skills: DataLoader<string, Skill[]>;
  readonly projects: DataLoader<string, Project[]>;
  readonly experience: DataLoader<string, Experience[]>;
  readonly achievements: DataLoader<string, Achievement[]>;

  constructor(
    skillService: SkillService,
    projectService: ProjectService,
    experienceService: ExperienceService,
    achievementService: AchievementService,
  ) {
    this.skills = createOneToManyLoader(
      (profileIds) => skillService.findByProfileIds(profileIds),
      (skill) => skill.profileId,
    );
    this.projects = createOneToManyLoader(
      (profileIds) => projectService.findByProfileIds(profileIds),
      (project) => project.profileId,
    );
    this.experience = createOneToManyLoader(
      (profileIds) => experienceService.findByProfileIds(profileIds),
      (experience) => experience.profileId,
    );
    this.achievements = createOneToManyLoader(
      (experienceIds) => achievementService.findByExperienceIds(experienceIds),
      (achievement) => achievement.experienceId,
    );
  }
}
