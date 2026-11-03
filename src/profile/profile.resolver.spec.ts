import { describe, expect, it, vi } from 'vitest';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

describe('ProfileResolver', () => {
  it('delegates profile lookup to the service', async () => {
    const getProfile = vi.fn().mockResolvedValue(null);
    const resolver = new ProfileResolver({ getProfile } as unknown as ProfileService);

    await expect(resolver.profile()).resolves.toBeNull();
    expect(getProfile).toHaveBeenCalledTimes(1);
  });
});
