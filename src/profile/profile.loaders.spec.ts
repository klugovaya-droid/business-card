import { describe, expect, it, vi } from 'vitest';
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

describe('ProfileLoaders', () => {
  it('batches skills for multiple profiles into one call', async () => {
    const findByProfileIds = vi
      .fn()
      .mockResolvedValue([skill('s1', 'p1', 'TypeScript'), skill('s2', 'p2', 'Node.js')]);
    const skillService = { findByProfileIds } as unknown as SkillService;
    const projectService = {
      findByProfileIds: vi.fn().mockResolvedValue([]),
    } as unknown as ProjectService;
    const loaders = new ProfileLoaders(skillService, projectService);

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
    const projectService = {
      findByProfileIds: vi.fn().mockResolvedValue([]),
    } as unknown as ProjectService;
    const skillService = {
      findByProfileIds: vi.fn().mockResolvedValue([]),
    } as unknown as SkillService;
    const loaders = new ProfileLoaders(skillService, projectService);

    await expect(loaders.projects.load('p1')).resolves.toEqual([]);
  });

  it('deduplicates repeated keys within one loader', async () => {
    const findByProfileIds = vi.fn().mockResolvedValue([skill('s1', 'p1', 'NestJS')]);
    const skillService = { findByProfileIds } as unknown as SkillService;
    const projectService = {
      findByProfileIds: vi.fn().mockResolvedValue([]),
    } as unknown as ProjectService;
    const loaders = new ProfileLoaders(skillService, projectService);

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
    };
    const serviceB = {
      findByProfileIds: vi.fn().mockResolvedValue([skill('s2', 'p1', 'B')]),
    };
    const projectService = {
      findByProfileIds: vi.fn().mockResolvedValue([]),
    } as unknown as ProjectService;

    const loadersA = new ProfileLoaders(serviceA as unknown as SkillService, projectService);
    const loadersB = new ProfileLoaders(serviceB as unknown as SkillService, projectService);

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
    const projectService = {
      findByProfileIds: vi
        .fn()
        .mockResolvedValue([project('pr1', 'p1', 'Alpha'), project('pr2', 'p2', 'Beta')]),
    } as unknown as ProjectService;
    const skillService = {
      findByProfileIds: vi.fn().mockResolvedValue([]),
    } as unknown as SkillService;
    const loaders = new ProfileLoaders(skillService, projectService);

    const [first, second] = await Promise.all([
      loaders.projects.load('p1'),
      loaders.projects.load('p2'),
    ]);

    expect(first.map((item) => item.name)).toEqual(['Alpha']);
    expect(second.map((item) => item.name)).toEqual(['Beta']);
  });
});
