import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Experience } from './experience.types';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfileIds(profileIds: readonly string[]): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ startDate: 'desc' }, { company: 'asc' }],
    });
  }
}
