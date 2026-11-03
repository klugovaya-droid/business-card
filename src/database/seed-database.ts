import { PrismaClient } from '../generated/prisma/client';
import { seedData } from './seed-data';

export type SeedResult = 'seeded' | 'skipped';

export async function seedDatabase(prisma: PrismaClient): Promise<SeedResult> {
  const existingProfile = await prisma.profile.findUnique({
    where: { slug: seedData.slug },
    select: { id: true },
  });

  if (existingProfile) {
    return 'skipped';
  }

  await prisma.profile.create({
    data: {
      slug: seedData.slug,
      name: seedData.name,
      title: seedData.title,
      description: seedData.description,
      email: seedData.email,
      location: seedData.location,
      githubUrl: seedData.githubUrl,
      linkedinUrl: seedData.linkedinUrl,
      skills: {
        create: seedData.skills,
      },
      experience: {
        create: seedData.experience.map((experience) => ({
          company: experience.company,
          position: experience.position,
          location: experience.location,
          startDate: new Date(experience.startDate),
          endDate: experience.endDate ? new Date(experience.endDate) : null,
          description: experience.description,
          achievements: {
            create: experience.achievements.map((text) => ({ text })),
          },
        })),
      },
      projects: {
        create: seedData.projects,
      },
    },
  });

  return 'seeded';
}
