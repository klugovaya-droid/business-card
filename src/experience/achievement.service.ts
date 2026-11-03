import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Achievement } from './achievement.types';

@Injectable()
export class AchievementService {
  constructor(private readonly prisma: PrismaService) {}

  async findByExperienceIds(experienceIds: readonly string[]): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({
      where: { experienceId: { in: [...experienceIds] } },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
