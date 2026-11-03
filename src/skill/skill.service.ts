import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Skill } from './skill.types';

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfileIds(profileIds: readonly string[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ level: 'desc' }, { name: 'asc' }],
    });
  }
}
