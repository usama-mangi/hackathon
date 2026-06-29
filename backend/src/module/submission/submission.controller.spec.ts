jest.mock('@thallesp/nestjs-better-auth', () => ({
  Roles: () => () => {},
  AllowAnonymous: () => () => {},
  Session: () => (_target: any, _key: string, _index: number) => {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';

describe('SubmissionController', () => {
  let controller: SubmissionController;
  let service: SubmissionService;

  const mockSubmission = {
    id: 'submission-1',
    teamId: 'team-1',
    title: 'Test Sub',
    description: 'Test Desc',
  };

  const mockSubmissionService = {
    findOne: jest.fn().mockResolvedValue(mockSubmission),
    delete: jest
      .fn()
      .mockResolvedValue({ message: 'Submission deleted successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        {
          provide: SubmissionService,
          useValue: mockSubmissionService,
        },
      ],
    }).compile();

    controller = module.get<SubmissionController>(SubmissionController);
    service = module.get<SubmissionService>(SubmissionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should retrieve a submission', async () => {
      const result = await controller.findOne('submission-1');
      expect(result).toEqual(mockSubmission);
      expect(service.findOne).toHaveBeenCalledWith('submission-1');
    });
  });

  describe('remove', () => {
    it('should delete a submission', async () => {
      const session = { user: { id: 'user-member' } } as any;
      const result = await controller.remove('submission-1', session);
      expect(result).toEqual({ message: 'Submission deleted successfully' });
      expect(service.delete).toHaveBeenCalledWith(
        'submission-1',
        'user-member',
      );
    });
  });
});
