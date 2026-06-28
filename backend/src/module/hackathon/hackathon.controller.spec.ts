jest.mock('@thallesp/nestjs-better-auth', () => ({
  Roles: () => () => {},
  AllowAnonymous: () => () => {},
  Session: () => (target: any, key: string, index: number) => {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { HackathonController } from './hackathon.controller';
import { HackathonService } from './hackathon.service';
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonController],
      providers: [
        {
          provide: HackathonService,
          useValue: mockHackathonService,
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
      const result = await controller.update('hackathon-1', dto);
      expect(result).toEqual(mockHackathon);
      expect(service.update).toHaveBeenCalledWith('hackathon-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a hackathon', async () => {
      const result = await controller.remove('hackathon-1');
      expect(result).toEqual(mockHackathon);
      expect(service.remove).toHaveBeenCalledWith('hackathon-1');
    });
  });
});
