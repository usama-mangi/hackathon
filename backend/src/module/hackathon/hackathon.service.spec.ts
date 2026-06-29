import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('HackathonService', () => {
  let service: HackathonService;
  let prisma: PrismaService;

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

  const mockPrismaService = {
    hackathon: {
      create: jest.fn().mockResolvedValue(mockHackathon),
      findMany: jest.fn().mockResolvedValue([mockHackathon]),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === 'hackathon-1') {
          return Promise.resolve(mockHackathon);
        }
        return Promise.resolve(null);
      }),
      update: jest
        .fn()
        .mockResolvedValue({ ...mockHackathon, name: 'Updated' }),
      delete: jest.fn().mockResolvedValue(mockHackathon),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackathonService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HackathonService>(HackathonService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a hackathon', async () => {
      const dto = {
        name: 'New Hack',
        description: 'Valid description of 10 chars',
        startsAt: new Date(),
        endsAt: new Date(),
        isActive: true,
      };
      const result = await service.create(dto, 'admin-1');
      expect(result).toEqual(mockHackathon);
      expect(prisma.hackathon.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: dto.description,
          startsAt: dto.startsAt,
          endsAt: dto.endsAt,
          isActive: dto.isActive,
          authorId: 'admin-1',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all hackathons', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockHackathon]);
      expect(prisma.hackathon.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a hackathon if found', async () => {
      const result = await service.findOne('hackathon-1');
      expect(result).toEqual(mockHackathon);
      expect(prisma.hackathon.findUnique).toHaveBeenCalledWith({
        where: { id: 'hackathon-1' },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a hackathon if found', async () => {
      const dto = {
        name: 'Updated',
      };
      const result = await service.update('hackathon-1', dto);
      expect(result.name).toBe('Updated');
      expect(prisma.hackathon.update).toHaveBeenCalledWith({
        where: { id: 'hackathon-1' },
        data: {
          name: dto.name,
          description: undefined,
          startsAt: undefined,
          endsAt: undefined,
          isActive: undefined,
        },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a hackathon if found', async () => {
      const result = await service.remove('hackathon-1');
      expect(result).toEqual(mockHackathon);
      expect(prisma.hackathon.delete).toHaveBeenCalledWith({
        where: { id: 'hackathon-1' },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
