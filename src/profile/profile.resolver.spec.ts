import { describe, expect, it, vi } from 'vitest';
import { ProfileLoaders } from './profile.loaders';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { Profile } from './profile.types';

const parent = { id: 'profile-1' } as Profile;

describe('ProfileResolver', () => {
  const getProfile = vi.fn().mockResolvedValue(null);
  const loaders = {
    skills: { load: vi.fn().mockResolvedValue([]) },
    projects: { load: vi.fn().mockResolvedValue([]) },
    experience: { load: vi.fn().mockResolvedValue([]) },
  } as unknown as ProfileLoaders;
  const resolver = new ProfileResolver({ getProfile } as unknown as ProfileService, loaders);

  it('delegates profile lookup to the service', async () => {
    await expect(resolver.profile()).resolves.toBeNull();
    expect(getProfile).toHaveBeenCalledTimes(1);
  });

  it('loads skills through the request-scoped loader', async () => {
    await expect(resolver.skills(parent)).resolves.toEqual([]);
    expect(loaders.skills.load).toHaveBeenCalledWith('profile-1');
  });

  it('loads projects through the request-scoped loader', async () => {
    await expect(resolver.projects(parent)).resolves.toEqual([]);
    expect(loaders.projects.load).toHaveBeenCalledWith('profile-1');
  });

  it('loads experience through the request-scoped loader', async () => {
    await expect(resolver.experience(parent)).resolves.toEqual([]);
    expect(loaders.experience.load).toHaveBeenCalledWith('profile-1');
  });
});
