import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Request help — only a hackathon participant (team member) can create a ticket.
   */
  async createTicket(
    teamId: string,
    userId: string,
    createTicketDto: CreateTicketDto,
  ) {
    // Verify team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { hackathon: true, members: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Only team members can request help
    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException(
        'Only team members can request help for this team',
      );
    }

    // Verify the user is a registered hackathon participant
    const isParticipant = await this.prisma.hackathonParticipant.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: team.hackathonId,
          userId,
        },
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException(
        'Only hackathon participants can request help',
      );
    }

    return this.prisma.ticket.create({
      data: {
        issue: createTicketDto.issue,
        hackathonId: team.hackathonId,
        teamId,
      },
      include: {
        team: { select: { id: true, name: true } },
        hackathon: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * View all open tickets for a hackathon — Admin only.
   */
  async getTicketsByHackathon(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return this.prisma.ticket.findMany({
      where: { hackathonId, status: 'OPEN' },
      include: {
        team: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Admin claims a ticket — only one user can claim at a time.
   */
  async claimTicket(ticketId: string, adminId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === 'RESOLVED') {
      throw new ConflictException('This ticket has already been resolved');
    }

    if (ticket.status === 'CLAIMED') {
      throw new ConflictException(
        'This ticket has already been claimed by another admin',
      );
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'CLAIMED',
        mentorId: adminId,
      },
      include: {
        team: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Mark a ticket as resolved — Admin or team member.
   */
  async resolveTicket(ticketId: string, userId: string, isAdmin: boolean) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        team: { include: { members: true } },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === 'RESOLVED') {
      throw new ConflictException('This ticket is already resolved');
    }

    // Check authorization: admin OR a member of the ticket's team
    if (!isAdmin) {
      const isMember = ticket.team.members.some((m) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenException(
          'Only admins or team members can resolve this ticket',
        );
      }
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'RESOLVED' },
      include: {
        team: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
