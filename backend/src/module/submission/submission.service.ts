import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { VoteSubmissionDto } from './dto/vote-submission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hackathonAuth: HackathonAuthService,
  ) {}

  async create(teamId: string, userId: string, dto: CreateSubmissionDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        submission: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const isMember = team.members.some((member) => member.userId === userId);
    const isLeader = team.leaderId === userId;
    if (!isMember && !isLeader) {
      throw new ForbiddenException(
        'Only team members or the team leader can create a submission',
      );
    }

    // Verify that the user is a participant of the hackathon associated with the team
    const isParticipant = await this.prisma.hackathonParticipant.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: team.hackathonId,
          userId,
        },
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('Only hackathon participants can submit');
    }

    if (team.submission) {
      throw new ConflictException('Team already has a submission');
    }

    return this.prisma.submission.create({
      data: {
        teamId,
        title: dto.title,
        description: dto.description,
        repoUrl: dto.repoUrl,
        demoUrl: dto.demoUrl,
        videoUrl: dto.videoUrl,
      },
    });
  }

  async update(teamId: string, userId: string, dto: UpdateSubmissionDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        submission: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const isMember = team.members.some((member) => member.userId === userId);
    const isLeader = team.leaderId === userId;
    if (!isMember && !isLeader) {
      throw new ForbiddenException(
        'Only team members or the team leader can update the submission',
      );
    }

    if (!team.submission) {
      throw new NotFoundException('Submission not found');
    }

    if (team.submissionUpdates >= 2) {
      throw new BadRequestException(
        'Update limit reached (only 2 updates allowed)',
      );
    }

    const [updatedSubmission] = await this.prisma.$transaction([
      this.prisma.submission.update({
        where: { teamId },
        data: {
          title: dto.title,
          description: dto.description,
          repoUrl: dto.repoUrl,
          demoUrl: dto.demoUrl,
          videoUrl: dto.videoUrl,
        },
      }),
      this.prisma.team.update({
        where: { id: teamId },
        data: {
          submissionUpdates: {
            increment: 1,
          },
        },
      }),
    ]);

    return updatedSubmission;
  }

  async delete(submissionId: string, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const team = submission.team;
    const isMember = team.members.some((member) => member.userId === userId);
    const isLeader = team.leaderId === userId;
    if (!isMember && !isLeader) {
      throw new ForbiddenException(
        'Only team members or the team leader can delete the submission',
      );
    }

    if (team.submissionUpdates >= 2) {
      throw new BadRequestException(
        'Update limit reached (only 2 updates allowed)',
      );
    }

    await this.prisma.$transaction([
      this.prisma.submission.delete({
        where: { id: submissionId },
      }),
      this.prisma.team.update({
        where: { id: team.id },
        data: {
          submissionUpdates: {
            increment: 1,
          },
        },
      }),
    ]);

    return { message: 'Submission deleted successfully' };
  }

  async findOne(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        team: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  async findSubmissionsByHackathon(hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return this.prisma.submission.findMany({
      where: {
        team: {
          hackathonId,
        },
      },
      include: {
        team: true,
      },
    });
  }

  async vote(submissionId: string, userId: string, userRole: string, dto: VoteSubmissionDto) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { team: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Only ADMIN or a confirmed hackathon Judge may vote
    await this.hackathonAuth.assertJudgeOrganizerOrAdmin(
      submission.team.hackathonId,
      userId,
      userRole,
    );

    try {
      return await this.prisma.vote.create({
        data: {
          submissionId,
          userId,
          score: dto.score,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('You have already voted for this submission');
      }
      throw error;
    }
  }
}
