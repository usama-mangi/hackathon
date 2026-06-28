jest.mock('@thallesp/nestjs-better-auth', () => ({
  Roles: () => () => {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'user',
    banned: null,
    banReason: null,
    banExpires: null,
  };

  const mockAdmin = {
    ...mockUser,
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  };

  const mockUserService = {
    findAll: jest.fn().mockResolvedValue([mockUser, mockAdmin]),
    findById: jest.fn().mockImplementation((id: string) => {
      if (id === 'user-1') return Promise.resolve(mockUser);
      if (id === 'admin-1') return Promise.resolve(mockAdmin);
      throw new NotFoundException(`User with ID ${id} not found`);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const result = await controller.getAllUsers();
      expect(result).toEqual([mockUser, mockAdmin]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user by id if user exists', async () => {
      const result = await controller.getUserById('user-1');
      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      await expect(controller.getUserById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
