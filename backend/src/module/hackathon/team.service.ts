import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import * as crypto from 'crypto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeam(hackathonId: string, leaderId: string, createTeamDto: CreateTeamDto) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });
    
    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    if (!hackathon.isActive) {
      throw new BadRequestException('This hackathon is no longer active');
    }

    // Check if user is already leading a team in this hackathon
    const existingTeam = await this.prisma.team.findFirst({
      where: {
        hackathonId,
        leaderId,
      },
    });

    if (existingTeam) {
      throw new ConflictException('You are already leading a team for this hackathon');
    }

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const team = await this.prisma.team.create({
      data: {
        name: createTeamDto.name,
        inviteCode,
        hackathonId,
        leaderId,
        members: {
          create: {
            userId: leaderId,
          },
        },
      },
    });

    return team;
  }

  async joinTeam(teamId: string, userId: string, joinTeamDto: JoinTeamDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { hackathon: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.hackathon.isActive) {
      throw new BadRequestException('The associated hackathon is no longer active');
    }

    if (team.inviteCode !== joinTeamDto.inviteCode) {
      throw new BadRequestException('Invalid invite code');
    }

    try {
      await this.prisma.teamMember.create({
        data: {
          teamId,
          userId,
        },
      });
      return { message: 'Successfully joined team' };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('You are already a member of this team');
      }
      throw error;
    }
  }

  async findTeamsByHackathon(hackathonId: string) {
    return this.prisma.team.findMany({
      where: { hackathonId },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async findTeamById(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const isMember = team.members.some((member) => member.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Only team members can view team details');
    }

    return team;
  }

  async removeMember(teamId: string, leaderId: string, memberUserId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.leaderId !== leaderId) {
      throw new ForbiddenException('Only the team leader can remove members');
    }

    if (leaderId === memberUserId) {
      throw new BadRequestException('The leader cannot remove themselves. Delete the team instead.');
    }

    const member = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this team');
    }

    await this.prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }
}
