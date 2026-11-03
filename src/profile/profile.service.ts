import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Profile } from './profile.types';

const profileSelect = {
  id: true,
  name: true,
  title: true,
  description: true,
  email: true,
  location: true,
  githubUrl: true,
  linkedinUrl: true,
  avatarUrl: true,
  createdAt: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(): Promise<Profile | null> {
    return this.prisma.profile.findFirst({
      orderBy: { createdAt: 'asc' },
      select: profileSelect,
    });
  }
}
