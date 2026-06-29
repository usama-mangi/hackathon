import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnoucementService {
  constructor(private readonly prisma: PrismaService) {}

  async createAnnouncement(hackathonId: string, createAnnouncementDto: CreateAnnouncementDto) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return this.prisma.announcement.create({
      data: {
        ...createAnnouncementDto,
        hackathonId,
      },
    });
  }

  async getAnnouncementsByHackathon(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return this.prisma.announcement.findMany({
      where: { hackathonId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
