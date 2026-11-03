import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { createOneToManyLoader } from '../common/dataloaders/create-one-to-many-loader';
import { ProjectService } from '../project/project.service';
import { Project } from '../project/project.types';
import { SkillService } from '../skill/skill.service';
import { Skill } from '../skill/skill.types';

@Injectable({ scope: Scope.REQUEST })
export class ProfileLoaders {
  readonly skills: DataLoader<string, Skill[]>;
  readonly projects: DataLoader<string, Project[]>;

  constructor(skillService: SkillService, projectService: ProjectService) {
    this.skills = createOneToManyLoader(
      (profileIds) => skillService.findByProfileIds(profileIds),
      (skill) => skill.profileId,
    );
    this.projects = createOneToManyLoader(
      (profileIds) => projectService.findByProfileIds(profileIds),
      (project) => project.profileId,
    );
  }
}
