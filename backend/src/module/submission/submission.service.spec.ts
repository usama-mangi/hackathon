import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

describe('SubmissionService', () => {
  let service: SubmissionService;

  const mockTeam = {
    id: 'team-1',
    name: 'Team 1',
    inviteCode: 'INVITE1',
    hackathonId: 'hackathon-1',
    leaderId: 'user-leader',
    submissionUpdates: 0,
    members: [
      { id: 'm1', teamId: 'team-1', userId: 'user-leader' },
      { id: 'm2', teamId: 'team-1', userId: 'user-member' },
    ],
    submission: null,
  };

  const mockSubmission = {
    id: 'submission-1',
    teamId: 'team-1',
    title: 'Submission 1',
    description: 'A great project',
    repoUrl: 'https://github.com/test/repo',
    demoUrl: 'https://demo.com',
    videoUrl: 'https://video.com',
  };

  const mockPrismaService = {
    team: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    submission: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    hackathonParticipant: {
      findUnique: jest.fn(),
    },
    hackathon: {
      findUnique: jest.fn(),
    },
    $transaction: jest
      .fn()
      .mockImplementation((actions) => Promise.all(actions)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubmissionService>(SubmissionService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSubmissionDto = {
      title: 'Project Title',
      description: 'Project Description',
      repoUrl: 'https://github.com/project/repo',
    };

    it('should create a submission successfully', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.hackathonParticipant.findUnique.mockResolvedValue({
        id: 'p-1',
      });
      mockPrismaService.submission.create.mockResolvedValue(mockSubmission);

      const result = await service.create('team-1', 'user-member', createDto);

      expect(result).toEqual(mockSubmission);
      expect(mockPrismaService.team.findUnique).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        include: { members: true, submission: true },
      });
      expect(mockPrismaService.submission.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if team not found', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(null);

      await expect(
        service.create('team-invalid', 'user-member', createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a member or leader of the team', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);

      await expect(
        service.create('team-1', 'user-stranger', createDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is not a hackathon participant', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.hackathonParticipant.findUnique.mockResolvedValue(null);

      await expect(
        service.create('team-1', 'user-member', createDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if team already has a submission', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({
        ...mockTeam,
        submission: mockSubmission,
      });
      mockPrismaService.hackathonParticipant.findUnique.mockResolvedValue({
        id: 'p-1',
      });

      await expect(
        service.create('team-1', 'user-member', createDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSubmissionDto = {
      title: 'Updated Title',
    };

    it('should update a submission successfully if under the limit', async () => {
      const teamWithSub = {
        ...mockTeam,
        submission: mockSubmission,
        submissionUpdates: 1,
      };
      mockPrismaService.team.findUnique.mockResolvedValue(teamWithSub);
      mockPrismaService.submission.update.mockResolvedValue({
        ...mockSubmission,
        title: 'Updated Title',
      });
      mockPrismaService.team.update.mockResolvedValue({
        ...teamWithSub,
        submissionUpdates: 2,
      });

      const result = await service.update('team-1', 'user-member', updateDto);

      expect(result.title).toEqual('Updated Title');
      expect(mockPrismaService.team.update).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        data: { submissionUpdates: { increment: 1 } },
      });
    });

    it('should throw BadRequestException if update limit reached (2 updates already)', async () => {
      const teamWithSubLimit = {
        ...mockTeam,
        submission: mockSubmission,
        submissionUpdates: 2,
      };
      mockPrismaService.team.findUnique.mockResolvedValue(teamWithSubLimit);

      await expect(
        service.update('team-1', 'user-member', updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if submission does not exist', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue({
        ...mockTeam,
        submission: null,
      });

      await expect(
        service.update('team-1', 'user-member', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a submission successfully if under the limit and increment updates', async () => {
      const submissionWithTeam = {
        ...mockSubmission,
        team: { ...mockTeam, submissionUpdates: 1 },
      };
      mockPrismaService.submission.findUnique.mockResolvedValue(
        submissionWithTeam,
      );
      mockPrismaService.submission.delete.mockResolvedValue(mockSubmission);
      mockPrismaService.team.update.mockResolvedValue({
        ...mockTeam,
        submissionUpdates: 2,
      });

      const result = await service.delete('submission-1', 'user-member');

      expect(result).toEqual({ message: 'Submission deleted successfully' });
      expect(mockPrismaService.submission.delete).toHaveBeenCalledWith({
        where: { id: 'submission-1' },
      });
      expect(mockPrismaService.team.update).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        data: { submissionUpdates: { increment: 1 } },
      });
    });

    it('should throw BadRequestException if update limit reached when deleting', async () => {
      const submissionWithTeam = {
        ...mockSubmission,
        team: { ...mockTeam, submissionUpdates: 2 },
      };
      mockPrismaService.submission.findUnique.mockResolvedValue(
        submissionWithTeam,
      );

      await expect(
        service.delete('submission-1', 'user-member'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
