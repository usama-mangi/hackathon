import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HackathonAuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns true if the user is a confirmed mentor for the given hackathon.
   */
  async isHackathonMentor(hackathonId: string, userId: string): Promise<boolean> {
    const mentor = await this.prisma.hackathonMentor.findUnique({
      where: { hackathonId_userId: { hackathonId, userId } },
    });
    return !!mentor;
  }

  /**
   * Returns true if the user is a confirmed judge for the given hackathon.
   */
  async isHackathonJudge(hackathonId: string, userId: string): Promise<boolean> {
    const judge = await this.prisma.hackathonJudge.findUnique({
      where: { hackathonId_userId: { hackathonId, userId } },
    });
    return !!judge;
  }

  /**
   * Returns true if the user is ADMIN, or is an ORGANIZER who authored the hackathon.
   */
  async isOrganizerOrAdmin(
    hackathonId: string,
    userId: string,
    userRole: string,
  ): Promise<boolean> {
    if (userRole === 'ADMIN') return true;
    if (userRole !== 'ORGANIZER') return false;

    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { authorId: true },
    });

    return hackathon?.authorId === userId;
  }

  /**
   * Throws ForbiddenException unless user is ADMIN, ORGANIZER (own hackathon), or a hackathon Mentor.
   */
  async assertMentorOrAbove(
    hackathonId: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    if (userRole === 'ADMIN') return;

    const [isOrganizer, isMentor] = await Promise.all([
      this.isOrganizerOrAdmin(hackathonId, userId, userRole),
      this.isHackathonMentor(hackathonId, userId),
    ]);

    if (!isOrganizer && !isMentor) {
      throw new ForbiddenException(
        'Only admins, the hackathon organizer, or assigned mentors can perform this action',
      );
    }
  }

  /**
   * Throws ForbiddenException unless user is ADMIN or a hackathon Judge.
   */
  async assertJudgeOrganizerOrAdmin(
    hackathonId: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    const isJudge = await this.isHackathonJudge(hackathonId, userId);
    
    try{
      if(!isJudge) {
        await this.assertOrganizerOrAdmin(hackathonId, userId, userRole);
      }
    } catch(error) {
        throw new ForbiddenException(
          'Only admins, organizers or assigned judges can vote on submissions',
        );
    }
  }

  /**
   * Throws ForbiddenException unless user is ADMIN or ORGANIZER who owns the hackathon.
   */
  async assertOrganizerOrAdmin(
    hackathonId: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    const allowed = await this.isOrganizerOrAdmin(hackathonId, userId, userRole);
    if (!allowed) {
      throw new ForbiddenException(
        'Only admins or the hackathon organizer can perform this action',
      );
    }
  }

  /**
   * Fetches the hackathon. Throws NotFoundException if not found.
   */
  async getHackathonOrThrow(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    if (!hackathon) throw new NotFoundException('Hackathon not found');
    return hackathon;
  }
}
