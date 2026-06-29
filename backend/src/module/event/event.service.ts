import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hackathonAuth: HackathonAuthService,
  ) {}

  async createEvent(hackathonId: string, createEventDto: CreateEventDto) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return this.prisma.event.create({
      data: {
        ...createEventDto,
        hackathonId,
      },
    });
  }

  async getEventsByHackathon(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return this.prisma.event.findMany({
      where: { hackathonId },
      orderBy: { startsAt: 'asc' },
    });
  }

  async updateEvent(
    eventId: string,
    updateEventDto: UpdateEventDto,
    userId: string,
    userRole: string,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // ORGANIZER must own the hackathon this event belongs to
    await this.hackathonAuth.assertOrganizerOrAdmin(
      event.hackathonId,
      userId,
      userRole,
    );

    return this.prisma.event.update({
      where: { id: eventId },
      data: updateEventDto,
    });
  }

  async deleteEvent(eventId: string, userId: string, userRole: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // ORGANIZER must own the hackathon this event belongs to
    await this.hackathonAuth.assertOrganizerOrAdmin(
      event.hackathonId,
      userId,
      userRole,
    );

    return this.prisma.event.delete({
      where: { id: eventId },
    });
  }
}
