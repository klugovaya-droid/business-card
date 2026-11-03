import { describe, expect, it } from 'vitest';
import { seedData } from './seed-data';

describe('seedData', () => {
  it('contains a complete profile', () => {
    expect(seedData.slug).toBeTruthy();
    expect(seedData.name).toBeTruthy();
    expect(seedData.description.length).toBeGreaterThan(20);
    expect(seedData.skills.length).toBeGreaterThanOrEqual(8);
    expect(seedData.projects.length).toBeGreaterThanOrEqual(2);
  });

  it('contains at least two experiences with achievements', () => {
    expect(seedData.experience.length).toBeGreaterThanOrEqual(2);

    for (const experience of seedData.experience) {
      expect(experience.company).toBeTruthy();
      expect(experience.position).toBeTruthy();
      expect(experience.startDate).toBeTruthy();
      expect(experience.achievements.length).toBeGreaterThan(0);
    }
  });

  it('uses valid HTTP(S) links', () => {
    const urls = [
      seedData.githubUrl,
      seedData.linkedinUrl,
      ...seedData.projects.flatMap((project) => [project.url, project.repositoryUrl]),
    ].filter((url): url is string => Boolean(url));

    for (const url of urls) {
      expect(() => new URL(url)).not.toThrow();
      expect(url.startsWith('http://') || url.startsWith('https://')).toBe(true);
    }
  });
});
