import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hackathonAuth: HackathonAuthService,
  ) {}

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
   * Retrieve a single ticket by ID with full relations.
   */
  async findOne(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, image: true },
                },
              },
            },
          },
        },
        mentor: { select: { id: true, name: true, email: true, image: true } },
        hackathon: { select: { id: true, name: true } },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  /**
   * View all open tickets for a hackathon — ADMIN, ORGANIZER, or hackathon Mentor.
   */
  async getTicketsByHackathon(
    hackathonId: string,
    userId: string,
    userRole: string,
  ) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Allow ADMIN, ORGANIZER (own hackathon), or confirmed hackathon mentor
    await this.hackathonAuth.assertMentorOrAbove(hackathonId, userId, userRole);

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
   * Claim a ticket — ADMIN, ORGANIZER (own hackathon), or hackathon Mentor.
   */
  async claimTicket(
    ticketId: string,
    claimantId: string,
    userRole: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check claimant is authorized for this hackathon
    await this.hackathonAuth.assertMentorOrAbove(
      ticket.hackathonId,
      claimantId,
      userRole,
    );

    if (ticket.status === 'RESOLVED') {
      throw new ConflictException('This ticket has already been resolved');
    }

    if (ticket.status === 'CLAIMED') {
      throw new ConflictException(
        'This ticket has already been claimed by another mentor',
      );
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'CLAIMED',
        mentorId: claimantId,
      },
      include: {
        team: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Mark a ticket as resolved — ADMIN, ORGANIZER, hackathon Mentor, or team member.
   */
  async resolveTicket(
    ticketId: string,
    userId: string,
    userRole: string,
  ) {
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

    // Allow ADMIN / ORGANIZER / Mentor OR a member of the ticket's own team
    const isMember = ticket.team.members.some((m) => m.userId === userId);
    if (!isMember) {
      // Not a team member — must be privileged staff
      await this.hackathonAuth.assertMentorOrAbove(
        ticket.hackathonId,
        userId,
        userRole,
      );
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
