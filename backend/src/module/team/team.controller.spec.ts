jest.mock('@thallesp/nestjs-better-auth', () => ({
  Roles: () => () => {},
  AllowAnonymous: () => () => {},
  Session: () => (_target: any, _key: string, _index: number) => {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { SubmissionService } from '../submission/submission.service';

describe('TeamController', () => {
  let controller: TeamController;

  const mockTeamService = {
    joinTeam: jest.fn(),
    findTeamById: jest.fn(),
    removeMember: jest.fn(),
  };

  const mockSubmissionService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
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

    controller = module.get<TeamController>(TeamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
