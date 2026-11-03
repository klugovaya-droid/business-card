import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Project } from './project.types';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfileIds(profileIds: readonly string[]): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { name: 'asc' },
    });
  }
}
