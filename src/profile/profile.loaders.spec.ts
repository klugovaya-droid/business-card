import { describe, expect, it, vi } from 'vitest';
import { AchievementService } from '../experience/achievement.service';
import { Achievement } from '../experience/achievement.types';
import { ExperienceService } from '../experience/experience.service';
import { Experience } from '../experience/experience.types';
import { ProjectService } from '../project/project.service';
import { Project } from '../project/project.types';
import { SkillService } from '../skill/skill.service';
import { Skill } from '../skill/skill.types';
import { ProfileLoaders } from './profile.loaders';

const skill = (id: string, profileId: string, name: string): Skill => ({
  id,
  profileId,
  name,
  category: 'Backend',
  level: 4,
});

const project = (id: string, profileId: string, name: string): Project => ({
  id,
  profileId,
  name,
  description: null,
  url: null,
  repositoryUrl: null,
  technologies: [],
});

const experience = (id: string, profileId: string, company: string): Experience => ({
  id,
  profileId,
  company,
  position: 'Developer',
  location: null,
  startDate: new Date('2023-01-01'),
  endDate: null,
  description: null,
  achievements: [],
});

const achievement = (id: string, experienceId: string, text: string): Achievement => ({
  id,
  experienceId,
  text,
});

const emptySkills = (): SkillService =>
  ({ findByProfileIds: vi.fn().mockResolvedValue([]) }) as unknown as SkillService;
const emptyProjects = (): ProjectService =>
  ({ findByProfileIds: vi.fn().mockResolvedValue([]) }) as unknown as ProjectService;
const emptyExperience = (): ExperienceService =>
  ({ findByProfileIds: vi.fn().mockResolvedValue([]) }) as unknown as ExperienceService;
const emptyAchievements = (): AchievementService =>
  ({ findByExperienceIds: vi.fn().mockResolvedValue([]) }) as unknown as AchievementService;

function createLoaders(
  overrides: {
    skill?: SkillService;
    project?: ProjectService;
    experience?: ExperienceService;
    achievement?: AchievementService;
  } = {},
): ProfileLoaders {
  return new ProfileLoaders(
    overrides.skill ?? emptySkills(),
    overrides.project ?? emptyProjects(),
    overrides.experience ?? emptyExperience(),
    overrides.achievement ?? emptyAchievements(),
  );
}

describe('ProfileLoaders', () => {
  it('batches skills for multiple profiles into one call', async () => {
    const findByProfileIds = vi
      .fn()
      .mockResolvedValue([skill('s1', 'p1', 'TypeScript'), skill('s2', 'p2', 'Node.js')]);
    const loaders = createLoaders({
      skill: { findByProfileIds } as unknown as SkillService,
    });

    const [first, second] = await Promise.all([
      loaders.skills.load('p1'),
      loaders.skills.load('p2'),
    ]);

    expect(findByProfileIds).toHaveBeenCalledTimes(1);
    expect(findByProfileIds).toHaveBeenCalledWith(['p1', 'p2']);
    expect(first.map((item) => item.name)).toEqual(['TypeScript']);
    expect(second.map((item) => item.name)).toEqual(['Node.js']);
  });

  it('returns empty arrays for profiles without projects', async () => {
    const loaders = createLoaders();

    await expect(loaders.projects.load('p1')).resolves.toEqual([]);
  });

  it('deduplicates repeated keys within one loader', async () => {
    const findByProfileIds = vi.fn().mockResolvedValue([skill('s1', 'p1', 'NestJS')]);
    const loaders = createLoaders({
      skill: { findByProfileIds } as unknown as SkillService,
    });

    const [first, second] = await Promise.all([
      loaders.skills.load('p1'),
      loaders.skills.load('p1'),
    ]);

    expect(findByProfileIds).toHaveBeenCalledWith(['p1']);
    expect(first).toEqual(second);
  });

  it('keeps loader caches isolated between instances', async () => {
    const serviceA = {
      findByProfileIds: vi.fn().mockResolvedValue([skill('s1', 'p1', 'A')]),
    } as unknown as SkillService;
    const serviceB = {
      findByProfileIds: vi.fn().mockResolvedValue([skill('s2', 'p1', 'B')]),
    } as unknown as SkillService;

    const loadersA = createLoaders({ skill: serviceA });
    const loadersB = createLoaders({ skill: serviceB });

    const [first, second] = await Promise.all([
      loadersA.skills.load('p1'),
      loadersB.skills.load('p1'),
    ]);

    expect(serviceA.findByProfileIds).toHaveBeenCalledTimes(1);
    expect(serviceB.findByProfileIds).toHaveBeenCalledTimes(1);
    expect(first[0].name).toBe('A');
    expect(second[0].name).toBe('B');
  });

  it('groups projects by profile id', async () => {
    const findByProfileIds = vi
      .fn()
      .mockResolvedValue([project('pr1', 'p1', 'Alpha'), project('pr2', 'p2', 'Beta')]);
    const loaders = createLoaders({
      project: { findByProfileIds } as unknown as ProjectService,
    });

    const [first, second] = await Promise.all([
      loaders.projects.load('p1'),
      loaders.projects.load('p2'),
    ]);

    expect(first.map((item) => item.name)).toEqual(['Alpha']);
    expect(second.map((item) => item.name)).toEqual(['Beta']);
  });

  it('batches experiences for multiple profiles into one call', async () => {
    const findByProfileIds = vi
      .fn()
      .mockResolvedValue([experience('e1', 'p1', 'Acme'), experience('e2', 'p2', 'Studio')]);
    const loaders = createLoaders({
      experience: { findByProfileIds } as unknown as ExperienceService,
    });

    const [first, second] = await Promise.all([
      loaders.experience.load('p1'),
      loaders.experience.load('p2'),
    ]);

    expect(findByProfileIds).toHaveBeenCalledTimes(1);
    expect(findByProfileIds).toHaveBeenCalledWith(['p1', 'p2']);
    expect(first.map((item) => item.company)).toEqual(['Acme']);
    expect(second.map((item) => item.company)).toEqual(['Studio']);
  });

  it('batches achievements for multiple experiences into one call', async () => {
    const findByExperienceIds = vi
      .fn()
      .mockResolvedValue([achievement('a1', 'e1', 'First'), achievement('a2', 'e2', 'Second')]);
    const loaders = createLoaders({
      achievement: { findByExperienceIds } as unknown as AchievementService,
    });

    const [first, second] = await Promise.all([
      loaders.achievements.load('e1'),
      loaders.achievements.load('e2'),
    ]);

    expect(findByExperienceIds).toHaveBeenCalledTimes(1);
    expect(findByExperienceIds).toHaveBeenCalledWith(['e1', 'e2']);
    expect(first.map((item) => item.text)).toEqual(['First']);
    expect(second.map((item) => item.text)).toEqual(['Second']);
  });

  it('returns empty arrays for experiences without achievements', async () => {
    const loaders = createLoaders();

    await expect(loaders.achievements.load('e1')).resolves.toEqual([]);
  });
});
