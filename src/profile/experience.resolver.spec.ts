import { describe, expect, it, vi } from 'vitest';
import { Experience } from '../experience/experience.types';
import { ExperienceResolver } from './experience.resolver';
import { ProfileLoaders } from './profile.loaders';

describe('ExperienceResolver', () => {
  it('loads achievements through the request-scoped loader', async () => {
    const load = vi.fn().mockResolvedValue([]);
    const loaders = { achievements: { load } } as unknown as ProfileLoaders;
    const resolver = new ExperienceResolver(loaders);
    const parent = { id: 'experience-1' } as Experience;

    await expect(resolver.achievements(parent)).resolves.toEqual([]);
    expect(load).toHaveBeenCalledWith('experience-1');
  });
});
