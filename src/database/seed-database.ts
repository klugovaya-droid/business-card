import { PrismaClient } from '../generated/prisma/client';
import { seedData } from './seed-data';

export type SeedResult = 'created' | 'updated';

const profileData = {
  name: seedData.name,
  title: seedData.title,
  description: seedData.description,
  email: seedData.email,
  location: seedData.location,
  githubUrl: seedData.githubUrl,
  linkedinUrl: seedData.linkedinUrl,
};

function experienceData() {
  return seedData.experience.map((experience) => ({
    company: experience.company,
    position: experience.position,
    location: experience.location,
    startDate: new Date(experience.startDate),
    endDate: experience.endDate ? new Date(experience.endDate) : null,
    description: experience.description,
    achievements: {
      create: experience.achievements.map((text, sortOrder) => ({ text, sortOrder })),
    },
  }));
}

export async function seedDatabase(prisma: PrismaClient): Promise<SeedResult> {
  const existingProfile = await prisma.profile.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  if (existingProfile) {
    await prisma.profile.update({
      where: { id: existingProfile.id },
      data: {
        slug: seedData.slug,
        ...profileData,
        skills: { deleteMany: {}, create: seedData.skills },
        experience: { deleteMany: {}, create: experienceData() },
        projects: { deleteMany: {}, create: seedData.projects },
      },
    });

    return 'updated';
  }

  await prisma.profile.create({
    data: {
      slug: seedData.slug,
      ...profileData,
      skills: { create: seedData.skills },
      experience: { create: experienceData() },
      projects: { create: seedData.projects },
    },
  });

  return 'created';
}
