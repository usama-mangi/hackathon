jest.mock('@thallesp/nestjs-better-auth', () => ({
  Roles: () => () => {},
  AllowAnonymous: () => () => {},
  Session: () => (target: any, key: string, index: number) => {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { HackathonController } from './hackathon.controller';
import { HackathonService } from './hackathon.service';
import { TeamService } from '../team/team.service';
import { SubmissionService } from '../submission/submission.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';

describe('HackathonController', () => {
  let controller: HackathonController;
  let service: HackathonService;

  const mockHackathon = {
    id: 'hackathon-1',
    name: 'Hackathon One',
    description: 'This is a description',
    startsAt: new Date(),
    endsAt: new Date(),
    isActive: true,
    authorId: 'admin-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHackathonService = {
    create: jest.fn().mockResolvedValue(mockHackathon),
    findAll: jest.fn().mockResolvedValue([mockHackathon]),
    findOne: jest.fn().mockResolvedValue(mockHackathon),
    update: jest.fn().mockResolvedValue(mockHackathon),
    remove: jest.fn().mockResolvedValue(mockHackathon),
  };

  const mockTeamService = {
    createTeam: jest.fn(),
    findTeamsByHackathon: jest.fn(),
    joinTeam: jest.fn(),
    findTeamById: jest.fn(),
    removeMember: jest.fn(),
  };

  const mockSubmissionService = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
    findSubmissionsByHackathon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonController],
      providers: [
        {
          provide: HackathonService,
          useValue: mockHackathonService,
        },
        {
          provide: TeamService,
          useValue: mockTeamService,
        },
        {
          provide: SubmissionService,
          useValue: mockSubmissionService,
        },
      ],
    }).compile();

    controller = module.get<HackathonController>(HackathonController);
    service = module.get<HackathonService>(HackathonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a hackathon', async () => {
      const dto: CreateHackathonDto = {
        name: 'New Hack',
        description: 'Valid description of 10 chars',
        startsAt: new Date(),
        endsAt: new Date(),
        isActive: true,
      };
      const session = { user: { id: 'admin-1' } } as any;

      const result = await controller.create(dto, session);
      expect(result).toEqual(mockHackathon);
      expect(service.create).toHaveBeenCalledWith(dto, 'admin-1');
    });
  });

  describe('findAll', () => {
    it('should return all hackathons', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockHackathon]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a hackathon', async () => {
      const result = await controller.findOne('hackathon-1');
      expect(result).toEqual(mockHackathon);
      expect(service.findOne).toHaveBeenCalledWith('hackathon-1');
    });
  });

  describe('update', () => {
    it('should update a hackathon', async () => {
      const dto: UpdateHackathonDto = {
        name: 'Updated Hack',
      };
      const session = { user: { id: 'admin-1', role: 'ADMIN' } } as any;
      const result = await controller.update('hackathon-1', dto, session);
      expect(result).toEqual(mockHackathon);
      expect(service.update).toHaveBeenCalledWith('hackathon-1', dto, 'admin-1', 'ADMIN');
    });
  });

  describe('remove', () => {
    it('should remove a hackathon', async () => {
      const session = { user: { id: 'admin-1', role: 'ADMIN' } } as any;
      const result = await controller.remove('hackathon-1', session);
      expect(result).toEqual(mockHackathon);
      expect(service.remove).toHaveBeenCalledWith('hackathon-1', 'admin-1', 'ADMIN');
    });
  });

  describe('getSubmissions', () => {
    it('should return all submissions for a hackathon', async () => {
      const mockSubmissions = [{ id: 'sub-1', title: 'Title' }];
      mockSubmissionService.findSubmissionsByHackathon.mockResolvedValue(
        mockSubmissions,
      );
      const result = await controller.getSubmissions('hackathon-1');
      expect(result).toEqual(mockSubmissions);
      expect(
        mockSubmissionService.findSubmissionsByHackathon,
      ).toHaveBeenCalledWith('hackathon-1');
    });
  });
});
