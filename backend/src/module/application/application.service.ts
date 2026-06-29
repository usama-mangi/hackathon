import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hackathonAuth: HackathonAuthService,
  ) {}

  /**
   * Submit a MENTOR or JUDGE application for a hackathon.
   * Any authenticated user can apply; one application per role per hackathon.
   */
  async submitApplication(
    hackathonId: string,
    userId: string,
    dto: CreateApplicationDto,
  ) {
    await this.hackathonAuth.getHackathonOrThrow(hackathonId);

    // Prevent team members from applying as JUDGE (conflict of interest)
    if (dto.roleType === 'JUDGE') {
      const isTeamMember = await this.prisma.teamMember.findFirst({
        where: {
          userId,
          team: { hackathonId },
        },
      });
      if (isTeamMember) {
        throw new ForbiddenException(
          'Team members cannot apply as a judge for the same hackathon',
        );
      }
    }

    try {
      return await this.prisma.hackathonRoleApplication.create({
        data: {
          hackathonId,
          userId,
          roleType: dto.roleType,
          bio: dto.bio,
          motivation: dto.motivation,
          experience: dto.experience,
          skills: dto.skills,
          linkedinUrl: dto.linkedinUrl,
          githubUrl: dto.githubUrl,
          availability: dto.availability,
          expertiseArea: dto.expertiseArea,
          priorJudgingExp: dto.priorJudgingExp,
          conflictStatement: dto.conflictStatement,
        },
        include: {
          hackathon: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `You have already submitted a ${dto.roleType} application for this hackathon`,
        );
      }
      throw error;
    }
  }

  /**
   * List applications for a hackathon.
   * Filterable by roleType and status via query params.
   * Only the hackathon organizer or ADMIN can access.
   */
  async getApplications(
    hackathonId: string,
    userId: string,
    userRole: string,
    filters: { role?: string; status?: string },
  ) {
    await this.hackathonAuth.assertOrganizerOrAdmin(hackathonId, userId, userRole);

    return this.prisma.hackathonRoleApplication.findMany({
      where: {
        hackathonId,
        ...(filters.role ? { roleType: filters.role } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Accept an application — creates the corresponding HackathonMentor or HackathonJudge row.
   * Only organizer or ADMIN.
   */
  async acceptApplication(
    hackathonId: string,
    applicationId: string,
    userId: string,
    userRole: string,
  ) {
    await this.hackathonAuth.assertOrganizerOrAdmin(hackathonId, userId, userRole);

    const application = await this.prisma.hackathonRoleApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.hackathonId !== hackathonId) {
      throw new BadRequestException('Application does not belong to this hackathon');
    }
    if (application.status === 'ACCEPTED') {
      throw new ConflictException('This application has already been accepted');
    }
    if (application.status === 'REJECTED') {
      throw new ConflictException('Cannot accept a previously rejected application');
    }

    // Atomically update status and create the scoped role record
    const [updatedApplication] = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.hackathonRoleApplication.update({
        where: { id: applicationId },
        data: { status: 'ACCEPTED' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      if (application.roleType === 'MENTOR') {
        await tx.hackathonMentor.create({
          data: {
            hackathonId,
            userId: application.userId,
            applicationId,
          },
        });
      } else {
        await tx.hackathonJudge.create({
          data: {
            hackathonId,
            userId: application.userId,
            applicationId,
          },
        });
      }

      return [updated];
    });

    return updatedApplication;
  }

  /**
   * Reject an application.
   * Only organizer or ADMIN.
   */
  async rejectApplication(
    hackathonId: string,
    applicationId: string,
    userId: string,
    userRole: string,
  ) {
    await this.hackathonAuth.assertOrganizerOrAdmin(hackathonId, userId, userRole);

    const application = await this.prisma.hackathonRoleApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.hackathonId !== hackathonId) {
      throw new BadRequestException('Application does not belong to this hackathon');
    }
    if (application.status === 'ACCEPTED') {
      throw new ConflictException('Cannot reject an already accepted application');
    }
    if (application.status === 'REJECTED') {
      throw new ConflictException('This application is already rejected');
    }

    return this.prisma.hackathonRoleApplication.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
