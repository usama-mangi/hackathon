import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';

@Injectable()
export class HackathonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hackathonAuth: HackathonAuthService,
  ) {}

  async create(createHackathonDto: CreateHackathonDto, authorId: string) {
    return this.prisma.hackathon.create({
      data: {
        name: createHackathonDto.name,
        description: createHackathonDto.description,
        startsAt: createHackathonDto.startsAt,
        endsAt: createHackathonDto.endsAt,
        isActive: createHackathonDto.isActive ?? true,
        authorId: authorId,
      },
    });
  }

  async findAll() {
    return this.prisma.hackathon.findMany({
      include: {
        _count: {
          select: {
            participants: true,
            teams: true,
          },
        },
      },
    });
  }

  async findJoined(userId: string) {
    return this.prisma.hackathon.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            participants: true,
            teams: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participants: true,
            teams: true,
          },
        },
      },
    });
    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${id} not found`);
    }
    return hackathon;
  }

  async update(
    id: string,
    updateHackathonDto: UpdateHackathonDto,
    userId: string,
    userRole: string,
  ) {
    // ORGANIZER may only update their own hackathon; ADMIN may update any.
    await this.hackathonAuth.assertOrganizerOrAdmin(id, userId, userRole);

    return this.prisma.hackathon.update({
      where: { id },
      data: {
        name: updateHackathonDto.name,
        description: updateHackathonDto.description,
        startsAt: updateHackathonDto.startsAt,
        endsAt: updateHackathonDto.endsAt,
        isActive: updateHackathonDto.isActive,
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    // ORGANIZER may only delete their own hackathon; ADMIN may delete any.
    await this.hackathonAuth.assertOrganizerOrAdmin(id, userId, userRole);

    return this.prisma.hackathon.delete({
      where: { id },
    });
  }

  async join(hackathonId: string, userId: string) {
    const hackathon = await this.findOne(hackathonId);

    if (!hackathon.isActive) {
      throw new BadRequestException('This hackathon is no longer active');
    }

    try {
      await this.prisma.hackathonParticipant.create({
        data: {
          hackathonId,
          userId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('You have already joined this hackathon');
      }
      throw error;
    }
  }

  async getResults(id: string) {
    // Check if hackathon exists
    await this.findOne(id);

    const submissions = await this.prisma.submission.findMany({
      where: {
        team: {
          hackathonId: id,
        },
      },
      include: {
        team: true,
        votes: true,
      },
    });

    const leaderboard = submissions.map((sub) => {
      const totalScore = sub.votes.reduce((sum, vote) => sum + (vote.score || 0), 0);
      const { votes, ...rest } = sub;
      return {
        ...rest,
        totalScore,
        voteCount: votes.length,
      };
    });

    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    return leaderboard;
  }

  /**
   * Returns the calling user's relationship to a specific hackathon.
   * Used by the frontend to gate UI (e.g. VotingPanel) without a full RBAC check on each render.
   */
  async getMyRole(
    hackathonId: string,
    userId: string,
    userRole: string,
  ): Promise<{
    isMentor: boolean;
    isJudge: boolean;
    isOrganizer: boolean;
    isParticipant: boolean;
  }> {
    // Verify hackathon exists
    await this.hackathonAuth.getHackathonOrThrow(hackathonId);

    const [isMentor, isJudge, isOrganizer, participant] = await Promise.all([
      this.hackathonAuth.isHackathonMentor(hackathonId, userId),
      this.hackathonAuth.isHackathonJudge(hackathonId, userId),
      this.hackathonAuth.isOrganizerOrAdmin(hackathonId, userId, userRole),
      this.prisma.hackathonParticipant.findUnique({
        where: { hackathonId_userId: { hackathonId, userId } },
        select: { id: true },
      }),
    ]);

    return {
      isMentor,
      isJudge,
      isOrganizer,
      isParticipant: !!participant,
    };
  }
}
